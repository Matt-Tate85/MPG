'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Search,
  Fuel,
  Zap,
  BarChart2,
  Calculator,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  ArrowUpDown,
  List,
  Navigation,
  Bell,
} from 'lucide-react';
import Header from '@/components/Header';
import { FuelStationCard, EVChargerCard } from '@/components/StationCard';
import PriceChart from '@/components/PriceChart';
import WorthItCalculator from '@/components/WorthItCalculator';
import RegLookup from '@/components/RegLookup';
import StatsPanel from '@/components/StatsPanel';
import RoutePlanner from '@/components/RoutePlanner';
import PriceAlert from '@/components/PriceAlert';
import type { FuelStation, EVCharger, Location, TabOption, SortOption, Vehicle } from '@/lib/types';
import { geocodePostcode } from '@/lib/calculations';

const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

const DEFAULT_LOCATION: Location = { lat: 51.5074, lng: -0.1278 }; // London

type StationFilter = 'all' | 'fuel' | 'ev';
type FuelTypeFilter = 'all' | 'petrol' | 'diesel' | 'super_unleaded' | 'lpg';

function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-8 h-8 border-2 border-fuel-amber border-t-transparent rounded-full animate-spin mb-3" />
      {message && <p className="text-gray-400 text-sm">{message}</p>}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabOption>('nearby');
  const [location, setLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [postcodeInput, setPostcodeInput] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [fuelStations, setFuelStations] = useState<FuelStation[]>([]);
  const [evChargers, setEvChargers] = useState<EVCharger[]>([]);
  const [loadingFuel, setLoadingFuel] = useState(false);
  const [loadingEV, setLoadingEV] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);

  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [filterBy, setFilterBy] = useState<StationFilter>('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<FuelTypeFilter>('all');
  const [showMap, setShowMap] = useState(true);

  const [selectedFuelStation, setSelectedFuelStation] = useState<FuelStation | null>(null);
  const [selectedEVCharger, setSelectedEVCharger] = useState<EVCharger | null>(null);

  // Compare tab state
  const [compareStation1, setCompareStation1] = useState<FuelStation | null>(null);
  const [compareStation2, setCompareStation2] = useState<FuelStation | null>(null);

  // History tab state
  const [historyStation, setHistoryStation] = useState<FuelStation | null>(null);

  // Vehicle / MPG
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const userMpg = vehicle?.estimated_mpg || 38;

  const fetchedLocationRef = useRef<string>('');

  const fetchData = useCallback(async (loc: Location) => {
    const key = `${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}`;
    if (fetchedLocationRef.current === key) return;
    fetchedLocationRef.current = key;

    setLoadingFuel(true);
    setLoadingEV(true);
    setFuelStations([]);
    setEvChargers([]);

    // Fetch fuel prices
    fetch(`/api/fuel-prices?lat=${loc.lat}&lng=${loc.lng}&radius=10`)
      .then((r) => r.json())
      .then((data) => {
        setFuelStations(data.stations || []);
        setIsDemoData(data.isDemoData || false);
      })
      .catch((err) => console.error('Failed to fetch fuel prices:', err))
      .finally(() => setLoadingFuel(false));

    // Fetch EV chargers
    fetch(`/api/ev-chargers?lat=${loc.lat}&lng=${loc.lng}&radius=10`)
      .then((r) => r.json())
      .then((data) => {
        setEvChargers(data.chargers || []);
      })
      .catch((err) => console.error('Failed to fetch EV chargers:', err))
      .finally(() => setLoadingEV(false));
  }, []);

  // Detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          setLocating(false);

          // Reverse geocode for display name
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`,
              { headers: { 'User-Agent': 'UK-Fuel-EV-Tracker/1.0' } }
            );
            if (res.ok) {
              const data = await res.json();
              const name =
                data.address?.suburb ||
                data.address?.town ||
                data.address?.city ||
                data.address?.county ||
                'Your location';
              setLocationName(name);
            }
          } catch {
            setLocationName('Your location');
          }
        },
        () => {
          setLocating(false);
          setLocation(DEFAULT_LOCATION);
          setLocationName('London (default)');
          setLocationError('Location access denied. Showing London. Enter a postcode to change.');
        },
        { timeout: 8000 }
      );
    } else {
      setLocation(DEFAULT_LOCATION);
      setLocationName('London (default)');
    }
  }, []);

  // Fetch data when location changes
  useEffect(() => {
    if (location) {
      fetchData(location);
    }
  }, [location, fetchData]);

  const handlePostcodeSearch = async () => {
    const pc = postcodeInput.trim();
    if (!pc) return;

    setLocating(true);
    setLocationError(null);

    try {
      const coords = await geocodePostcode(pc);
      if (!coords) {
        setLocationError(`Could not find postcode: ${pc}`);
        return;
      }
      setLocation(coords);
      setLocationName(pc.toUpperCase());
      fetchedLocationRef.current = ''; // Force re-fetch
    } catch {
      setLocationError('Failed to look up postcode');
    } finally {
      setLocating(false);
    }
  };

  const handleRefresh = () => {
    if (location) {
      fetchedLocationRef.current = '';
      fetchData(location);
    }
  };

  // Sort and filter stations
  const filteredFuelStations = fuelStations.filter((s) => {
    if (fuelTypeFilter === 'all') return true;
    if (fuelTypeFilter === 'petrol') return !!s.petrol_pence;
    if (fuelTypeFilter === 'diesel') return !!s.diesel_pence;
    if (fuelTypeFilter === 'super_unleaded') return !!s.super_unleaded_pence;
    if (fuelTypeFilter === 'lpg') return !!s.lpg_pence;
    return true;
  });

  const sortedFuelStations = [...filteredFuelStations].sort((a, b) => {
    switch (sortBy) {
      case 'price_petrol':
        return (a.petrol_pence || 999) - (b.petrol_pence || 999);
      case 'price_diesel':
        return (a.diesel_pence || 999) - (b.diesel_pence || 999);
      case 'distance':
        return (a.distance_miles || 0) - (b.distance_miles || 0);
      default:
        return (a.distance_miles || 0) - (b.distance_miles || 0);
    }
  });

  const tabs: { id: TabOption; label: string; icon: React.ReactNode }[] = [
    { id: 'nearby', label: 'Nearby', icon: <MapPin className="w-4 h-4" /> },
    { id: 'route', label: 'Route', icon: <Navigation className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <ArrowUpDown className="w-4 h-4" /> },
    { id: 'stats', label: 'Stats', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <Header locationName={locationName} />

      {/* Location bar + reg lookup */}
      <div className="bg-navy-800 border-b border-navy-700 px-4 py-3">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Postcode search */}
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={postcodeInput}
                  onChange={(e) => setPostcodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostcodeSearch()}
                  placeholder="Enter postcode (e.g. SW1A 1AA)"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fuel-amber"
                />
              </div>
              <button
                onClick={handlePostcodeSearch}
                disabled={locating || !postcodeInput.trim()}
                className="px-4 py-2 bg-fuel-amber hover:bg-fuel-amber-dark text-navy-900 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {locating ? (
                  <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loadingFuel || loadingEV}
                className="px-3 py-2 bg-navy-700 hover:bg-navy-600 text-gray-300 rounded-lg text-sm transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${(loadingFuel || loadingEV) ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Vehicle reg lookup - collapsed into the bar on desktop */}
            <div className="sm:w-64">
              <RegLookup
                onVehicleFound={(v) => setVehicle(v)}
                currentVehicle={vehicle}
              />
            </div>
          </div>

          {locationError && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              {locationError}
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-navy-800 border-b border-navy-700 px-4 sticky top-[57px] z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-fuel-amber text-fuel-amber'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo data banner */}
      {isDemoData && activeTab === 'nearby' && (
        <div className="bg-amber-900/30 border-b border-amber-700/50 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-amber-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Showing demo fuel price data — live prices from supermarket APIs were unavailable.
              Prices shown are representative of UK market (accurate as of 2025).
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-4">
        <div className="max-w-7xl mx-auto">

          {/* NEARBY TAB */}
          {activeTab === 'nearby' && (
            <div>
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Station type filter */}
                <div className="flex rounded-lg bg-navy-800 border border-navy-700 p-0.5">
                  {([
                    { id: 'all', label: 'All', icon: null },
                    { id: 'fuel', label: 'Fuel', icon: <Fuel className="w-3 h-3" /> },
                    { id: 'ev', label: 'EV', icon: <Zap className="w-3 h-3" /> },
                  ] as const).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterBy(f.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        filterBy === f.id
                          ? f.id === 'ev' ? 'bg-ev-green text-navy-900' : 'bg-fuel-amber text-navy-900'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {f.icon}
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Fuel type filter (only when showing fuel) */}
                {(filterBy === 'all' || filterBy === 'fuel') && (
                  <div className="flex rounded-lg bg-navy-800 border border-navy-700 p-0.5">
                    {([
                      { id: 'all', label: 'All fuel' },
                      { id: 'petrol', label: 'Petrol' },
                      { id: 'diesel', label: 'Diesel' },
                      { id: 'super_unleaded', label: 'Super' },
                      { id: 'lpg', label: 'LPG' },
                    ] as const).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFuelTypeFilter(f.id)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          fuelTypeFilter === f.id
                            ? 'bg-fuel-amber/20 text-fuel-amber'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sort */}
                {(filterBy === 'all' || filterBy === 'fuel') && (
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-navy-800 border border-navy-700 text-gray-300 text-xs rounded-lg px-2 py-1.5"
                    >
                      <option value="distance">Sort: Distance</option>
                      <option value="price_petrol">Sort: Petrol price</option>
                      <option value="price_diesel">Sort: Diesel price</option>
                    </select>
                  </div>
                )}

                {/* Map/List toggle */}
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 border border-navy-700 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {showMap ? (
                    <><List className="w-3.5 h-3.5" /> List only</>
                  ) : (
                    <><MapPin className="w-3.5 h-3.5" /> Show map</>
                  )}
                </button>

                {/* Counts */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {(filterBy === 'all' || filterBy === 'fuel') && (
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-fuel-amber" />
                      {filteredFuelStations.length}
                    </span>
                  )}
                  {(filterBy === 'all' || filterBy === 'ev') && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-ev-green" />
                      {evChargers.length}
                    </span>
                  )}
                </div>
              </div>

              {!location && !locating ? (
                <LoadingSpinner message="Waiting for location..." />
              ) : locating ? (
                <LoadingSpinner message="Getting your location..." />
              ) : (
                <div className={`flex gap-4 ${showMap ? 'flex-col lg:flex-row' : ''}`}>
                  {/* Map */}
                  {showMap && location && (
                    <div className="lg:flex-1 h-[400px] lg:h-[600px] flex-shrink-0">
                      <MapComponent
                        center={location}
                        fuelStations={filterBy !== 'ev' ? fuelStations : []}
                        evChargers={filterBy !== 'fuel' ? evChargers : []}
                        onFuelStationClick={(s) => {
                          setSelectedFuelStation(s);
                          setSelectedEVCharger(null);
                        }}
                        onEVChargerClick={(c) => {
                          setSelectedEVCharger(c);
                          setSelectedFuelStation(null);
                        }}
                        selectedFuelStation={selectedFuelStation}
                        selectedEVCharger={selectedEVCharger}
                      />
                    </div>
                  )}

                  {/* Station list */}
                  <div className={`${showMap ? 'lg:w-80 xl:w-96' : ''} space-y-2 overflow-y-auto max-h-[600px] pr-1`}>
                    {(filterBy === 'all' || filterBy === 'fuel') && (
                      <>
                        {loadingFuel ? (
                          <LoadingSpinner message="Finding fuel stations..." />
                        ) : sortedFuelStations.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 text-sm">
                            No fuel stations found nearby.
                          </div>
                        ) : (
                          sortedFuelStations.map((station) => (
                            <FuelStationCard
                              key={station.id}
                              station={station}
                              onSelect={setSelectedFuelStation}
                              isSelected={selectedFuelStation?.id === station.id}
                              onWorthIt={(s) => {
                                setCompareStation1(s);
                                setActiveTab('compare');
                              }}
                              userMpg={userMpg}
                              fillLitres={50}
                            />
                          ))
                        )}
                      </>
                    )}

                    {(filterBy === 'all' || filterBy === 'ev') && (
                      <>
                        {filterBy === 'all' && fuelStations.length > 0 && evChargers.length > 0 && (
                          <div className="flex items-center gap-2 py-2">
                            <div className="flex-1 h-px bg-navy-700" />
                            <span className="text-xs text-gray-600">EV Chargers</span>
                            <div className="flex-1 h-px bg-navy-700" />
                          </div>
                        )}
                        {loadingEV ? (
                          <LoadingSpinner message="Finding EV chargers..." />
                        ) : evChargers.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            No EV chargers found nearby.
                          </div>
                        ) : (
                          evChargers.map((charger) => (
                            <EVChargerCard
                              key={charger.id}
                              charger={charger}
                              onSelect={setSelectedEVCharger}
                              isSelected={selectedEVCharger?.id === charger.id}
                            />
                          ))
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Price alerts at the bottom of Nearby */}
              {fuelStations.length > 0 && (
                <div className="mt-6">
                  <PriceAlert stations={fuelStations} />
                </div>
              )}
            </div>
          )}

          {/* ROUTE TAB */}
          {activeTab === 'route' && (
            <div className="max-w-4xl mx-auto">
              <RoutePlanner vehicle={vehicle} allStations={fuelStations} />
            </div>
          )}

          {/* COMPARE TAB */}
          {activeTab === 'compare' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-fuel-amber" />
                  Select Stations to Compare
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Station 1 picker */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Your nearby station</label>
                    <select
                      value={compareStation1?.id || ''}
                      onChange={(e) => {
                        const s = fuelStations.find((st) => st.id === e.target.value) || null;
                        setCompareStation1(s);
                      }}
                      className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">— Select station —</option>
                      {[...fuelStations]
                        .sort((a, b) => (a.distance_miles || 0) - (b.distance_miles || 0))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.petrol_pence ? `${s.petrol_pence}p petrol` : s.diesel_pence ? `${s.diesel_pence}p diesel` : 'no price'} ({s.distance_miles?.toFixed(1)}mi)
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Station 2 picker */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Cheaper destination</label>
                    <select
                      value={compareStation2?.id || ''}
                      onChange={(e) => {
                        const s = fuelStations.find((st) => st.id === e.target.value) || null;
                        setCompareStation2(s);
                      }}
                      className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">— Select station —</option>
                      {[...fuelStations]
                        .sort((a, b) => (a.petrol_pence || 999) - (b.petrol_pence || 999))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.petrol_pence ? `${s.petrol_pence}p petrol` : s.diesel_pence ? `${s.diesel_pence}p diesel` : 'no price'} ({s.distance_miles?.toFixed(1)}mi)
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <WorthItCalculator
                nearStation={compareStation1}
                farStation={compareStation2}
                userMpg={userMpg}
              />
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="max-w-4xl mx-auto">
              <StatsPanel stations={fuelStations} />
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Station selector */}
              <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
                <label className="text-xs text-gray-500 mb-2 block">
                  Select a station for detailed history (optional)
                </label>
                <select
                  value={historyStation?.id || ''}
                  onChange={(e) => {
                    const s = fuelStations.find((st) => st.id === e.target.value) || null;
                    setHistoryStation(s);
                  }}
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">— UK average only —</option>
                  {fuelStations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.distance_miles?.toFixed(1)}mi)
                    </option>
                  ))}
                </select>
              </div>

              <PriceChart
                stationId={historyStation?.id}
                stationName={historyStation?.name}
                fuelType="petrol"
              />

              <PriceChart
                stationId={historyStation?.id}
                stationName={historyStation?.name}
                fuelType="diesel"
              />

              <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 text-sm text-gray-400">
                <p className="font-medium text-white mb-1">About price history</p>
                <p>Price history is stored locally in SQLite as you use the app. The more you search, the richer your history becomes. UK average is computed from all stations seen in searches.</p>
              </div>
            </div>
          )}

          {/* CALCULATOR TAB */}
          {activeTab === 'calculator' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 text-sm text-gray-400">
                <p className="font-medium text-white mb-1">Manual Calculator</p>
                <p>
                  Enter prices and distances manually to calculate whether a detour to a cheaper station is worth it.
                  Use the <strong className="text-fuel-amber">Compare</strong> tab to pull in real stations from the map.
                </p>
              </div>

              <WorthItCalculator userMpg={userMpg} />

              {/* MPG reference card */}
              <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 text-sm">Typical UK MPG Guide</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { type: 'Petrol 1.0-1.4L', mpg: 45 },
                    { type: 'Petrol 1.5-1.9L', mpg: 38 },
                    { type: 'Petrol 2.0L+', mpg: 30 },
                    { type: 'Diesel 1.5-2.0L', mpg: 50 },
                    { type: 'Diesel 2.0L+', mpg: 42 },
                    { type: 'Mild Hybrid (petrol)', mpg: 48 },
                    { type: 'Full Hybrid (petrol)', mpg: 56 },
                    { type: 'EV', mpg: 0, kwh: 3.5 },
                  ].map((item) => (
                    <div key={item.type} className="bg-navy-700 rounded-lg p-2">
                      <div className="text-gray-400">{item.type}</div>
                      <div className="font-semibold text-white">
                        {item.kwh ? `${item.kwh} mi/kWh` : `~${item.mpg} MPG`}
                      </div>
                    </div>
                  ))}
                </div>
                {vehicle && (
                  <div className="mt-3 p-2 rounded-lg bg-navy-700 border border-fuel-amber/30">
                    <p className="text-xs text-fuel-amber">
                      Your vehicle ({vehicle.registration}): ~{vehicle.estimated_mpg} MPG
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy-800 border-t border-navy-700 px-4 py-3 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <span>UK Fuel &amp; EV Tracker — prices may be delayed or estimated</span>
          <div className="flex items-center gap-3">
            <span>
              Data:{' '}
              <a href="https://openchargemap.org" target="_blank" rel="noopener noreferrer" className="text-ev-green hover:underline">
                Open Charge Map
              </a>
              {' · '}
              <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                OpenStreetMap
              </a>
              {' · '}
              <a href="https://www.gov.uk/government/collections/road-fuel-price-data-scheme" target="_blank" rel="noopener noreferrer" className="text-fuel-amber hover:underline">
                CMA Fuel Data
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
