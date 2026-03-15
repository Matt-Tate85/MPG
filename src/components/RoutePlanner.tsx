'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Search, Star, TrendingDown } from 'lucide-react';
import type { FuelStation, Location, Vehicle } from '@/lib/types';
import { FuelStationCard } from '@/components/StationCard';

const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

interface RoutePlannerProps {
  vehicle?: Vehicle | null;
  allStations?: FuelStation[];
}

interface GeocodeResult {
  lat: number;
  lng: number;
  display_name: string;
}

async function geocodeQuery(q: string): Promise<GeocodeResult | null> {
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function JourneyCostComparison({
  cheapest,
  mostExpensive,
  fillLitres = 50,
}: {
  cheapest: FuelStation;
  mostExpensive: FuelStation;
  fillLitres?: number;
}) {
  const cheapPrice = cheapest.petrol_pence ?? cheapest.diesel_pence;
  const expPrice = mostExpensive.petrol_pence ?? mostExpensive.diesel_pence;
  if (!cheapPrice || !expPrice || cheapPrice === expPrice) return null;

  const cheapCost = (cheapPrice / 100) * fillLitres;
  const expCost = (expPrice / 100) * fillLitres;
  const saving = expCost - cheapCost;

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <TrendingDown className="w-4 h-4 text-ev-green" />
        Journey Fill-up Cost Comparison ({fillLitres}L)
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-0.5">Cheapest on route</div>
          <div className="text-white font-semibold text-sm truncate">{cheapest.name}</div>
          <div className="text-ev-green font-bold text-lg">£{cheapCost.toFixed(2)}</div>
          <div className="text-xs text-gray-500">{cheapPrice.toFixed(1)}p/L</div>
        </div>
        <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-0.5">Most expensive</div>
          <div className="text-white font-semibold text-sm truncate">{mostExpensive.name}</div>
          <div className="text-red-400 font-bold text-lg">£{expCost.toFixed(2)}</div>
          <div className="text-xs text-gray-500">{expPrice.toFixed(1)}p/L</div>
        </div>
      </div>
      <div className="mt-3 p-2 rounded-lg bg-ev-green/10 border border-ev-green/30 text-center">
        <span className="text-ev-green font-semibold text-sm">
          Save £{saving.toFixed(2)} by choosing the cheapest
        </span>
      </div>
    </div>
  );
}

export default function RoutePlanner({ vehicle, allStations = [] }: RoutePlannerProps) {
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [corridorMiles, setCorridorMiles] = useState(1);

  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');

  const [routeStations, setRouteStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillLitres = 50;
  const userMpg = vehicle?.estimated_mpg || 38;

  const handleSearch = async () => {
    if (!fromInput.trim() || !toInput.trim()) {
      setError('Please enter both a start and end location.');
      return;
    }

    setLoading(true);
    setError(null);
    setRouteStations([]);

    try {
      // Geocode both locations
      const [fromGeo, toGeo] = await Promise.all([
        geocodeQuery(fromInput),
        geocodeQuery(toInput),
      ]);

      if (!fromGeo) {
        setError(`Could not find location: "${fromInput}"`);
        return;
      }
      if (!toGeo) {
        setError(`Could not find location: "${toInput}"`);
        return;
      }

      const from: Location = { lat: fromGeo.lat, lng: fromGeo.lng };
      const to: Location = { lat: toGeo.lat, lng: toGeo.lng };

      setFromLocation(from);
      setToLocation(to);
      setFromName(fromGeo.display_name.split(',')[0]);
      setToName(toGeo.display_name.split(',')[0]);

      // Call route-stations API with stations we already have loaded
      const res = await fetch('/api/route-stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, stations: allStations, corridorMiles }),
      });

      if (!res.ok) throw new Error('Route stations API failed');

      const data = await res.json();
      setRouteStations(data.stations || []);
    } catch (err) {
      console.error(err);
      setError('Failed to plan route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cheapest = routeStations[0] ?? null;
  const mostExpensive = routeStations.length > 1
    ? [...routeStations].sort(
        (a, b) =>
          (b.petrol_pence ?? b.diesel_pence ?? 0) -
          (a.petrol_pence ?? a.diesel_pence ?? 0)
      )[0]
    : null;

  return (
    <div className="space-y-4">
      {/* Route input form */}
      <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-fuel-amber" />
          Plan Your Route
        </h2>

        <div className="space-y-3">
          {/* From */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">From (postcode or place name)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ev-green" />
              <input
                type="text"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. SW1A 1AA or London"
                className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fuel-amber"
              />
            </div>
          </div>

          {/* To */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">To (postcode or place name)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
              <input
                type="text"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. M1 1AE or Manchester"
                className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fuel-amber"
              />
            </div>
          </div>

          {/* Corridor */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 whitespace-nowrap">Search within</label>
            <select
              value={corridorMiles}
              onChange={(e) => setCorridorMiles(Number(e.target.value))}
              className="bg-navy-700 border border-navy-600 text-gray-300 text-xs rounded-lg px-2 py-1.5"
            >
              <option value={0.5}>0.5 miles</option>
              <option value={1}>1 mile</option>
              <option value={2}>2 miles</option>
              <option value={5}>5 miles</option>
            </select>
            <span className="text-xs text-gray-500">of the route</span>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !fromInput.trim() || !toInput.trim()}
            className="w-full py-2 bg-fuel-amber hover:bg-fuel-amber-dark text-navy-900 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? 'Finding stations...' : 'Find Cheapest Stations'}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}
      </div>

      {/* Route info note */}
      {fromName && toName && (
        <div className="bg-navy-700/50 border border-navy-600 rounded-lg px-3 py-2 text-xs text-gray-400">
          Route: <span className="text-white">{fromName}</span> → <span className="text-white">{toName}</span>
          {routeStations.length > 0 && ` — ${routeStations.length} station${routeStations.length !== 1 ? 's' : ''} found`}
        </div>
      )}

      {/* Map showing the two points */}
      {fromLocation && toLocation && (
        <div className="h-[300px] rounded-xl overflow-hidden border border-navy-700">
          <MapComponent
            center={fromLocation}
            fuelStations={routeStations}
            evChargers={[]}
            selectedFuelStation={null}
            selectedEVCharger={null}
            onFuelStationClick={() => undefined}
            onEVChargerClick={() => undefined}
          />
        </div>
      )}

      {/* Journey cost comparison */}
      {cheapest && mostExpensive && cheapest.id !== mostExpensive.id && (
        <JourneyCostComparison
          cheapest={cheapest}
          mostExpensive={mostExpensive}
          fillLitres={fillLitres}
        />
      )}

      {/* Cheapest on route highlight */}
      {cheapest && (
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-fuel-amber" />
            Cheapest on Route
          </h3>
          <FuelStationCard
            station={cheapest}
            fillLitres={fillLitres}
            userMpg={userMpg}
            isSelected
          />
        </div>
      )}

      {/* Full sorted list */}
      {routeStations.length > 0 && (
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">
            All Stations on Route ({routeStations.length})
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {routeStations.map((station) => (
              <FuelStationCard
                key={station.id}
                station={station}
                fillLitres={fillLitres}
                userMpg={userMpg}
                isSelected={false}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && routeStations.length === 0 && fromName && toName && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No fuel stations found within {corridorMiles} mile{corridorMiles !== 1 ? 's' : ''} of your route.
          <br />
          Try increasing the corridor width or search for stations first on the Nearby tab.
        </div>
      )}

      {allStations.length === 0 && !fromName && (
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 text-sm text-gray-400">
          <p className="font-medium text-white mb-1">How it works</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Search for your location on the <strong className="text-fuel-amber">Nearby</strong> tab first to load stations</li>
            <li>Enter your start and end locations above</li>
            <li>See the cheapest stations along your route, sorted by price</li>
          </ol>
        </div>
      )}
    </div>
  );
}
