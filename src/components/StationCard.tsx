'use client';

import { MapPin, Fuel, Zap, TrendingDown, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { FuelStation, EVCharger } from '@/lib/types';

interface FuelStationCardProps {
  station: FuelStation;
  onSelect?: (station: FuelStation) => void;
  onWorthIt?: (station: FuelStation) => void;
  isSelected?: boolean;
  sortBy?: string;
  userMpg?: number;
}

interface EVChargerCardProps {
  charger: EVCharger;
  onSelect?: (charger: EVCharger) => void;
  isSelected?: boolean;
}

function priceColor(pence: number): string {
  if (pence < 135) return 'text-ev-green';
  if (pence < 142) return 'text-yellow-400';
  if (pence < 148) return 'text-fuel-amber';
  return 'text-red-400';
}

function priceBadgeColor(pence: number): string {
  if (pence < 135) return 'bg-green-900/40 text-ev-green border-green-700';
  if (pence < 142) return 'bg-yellow-900/40 text-yellow-400 border-yellow-700';
  if (pence < 148) return 'bg-amber-900/40 text-fuel-amber border-amber-700';
  return 'bg-red-900/40 text-red-400 border-red-700';
}

export function FuelStationCard({
  station,
  onSelect,
  onWorthIt,
  isSelected,
}: FuelStationCardProps) {
  const hasPrice = station.petrol_pence || station.diesel_pence;

  return (
    <div
      className={`relative bg-navy-800 rounded-xl border transition-all cursor-pointer hover:border-fuel-amber/50 ${
        isSelected ? 'border-fuel-amber shadow-lg shadow-fuel-amber/10' : 'border-navy-700'
      }`}
      onClick={() => onSelect?.(station)}
    >
      {station.isDemoData && (
        <div className="absolute top-2 right-2">
          <span className="text-xs px-1.5 py-0.5 rounded bg-navy-700 text-navy-600 border border-navy-600">
            Demo
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-900/30 border border-amber-700/40 flex items-center justify-center flex-shrink-0">
            <Fuel className="w-5 h-5 text-fuel-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{station.name}</h3>
            <div className="flex items-center gap-1 text-navy-600 text-xs mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{station.address}</span>
            </div>
            {station.distance_miles !== undefined && (
              <span className="text-xs text-gray-500 mt-0.5 block">
                {station.distance_miles.toFixed(1)} miles away
              </span>
            )}
          </div>
        </div>

        {hasPrice ? (
          <div className="mt-3 flex gap-2">
            {station.petrol_pence && (
              <div className={`flex-1 rounded-lg border px-3 py-2 text-center ${priceBadgeColor(station.petrol_pence)}`}>
                <div className={`text-lg font-bold ${priceColor(station.petrol_pence)}`}>
                  {station.petrol_pence.toFixed(1)}p
                </div>
                <div className="text-xs opacity-70">Petrol</div>
              </div>
            )}
            {station.diesel_pence && (
              <div className={`flex-1 rounded-lg border px-3 py-2 text-center ${priceBadgeColor(station.diesel_pence)}`}>
                <div className={`text-lg font-bold ${priceColor(station.diesel_pence)}`}>
                  {station.diesel_pence.toFixed(1)}p
                </div>
                <div className="text-xs opacity-70">Diesel</div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 py-2 px-3 rounded-lg bg-navy-700 text-navy-600 text-xs text-center">
            Price not available
          </div>
        )}

        {onWorthIt && hasPrice && (
          <button
            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-navy-700 hover:bg-navy-600 text-gray-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onWorthIt(station);
            }}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Is it worth the trip?
          </button>
        )}
      </div>
    </div>
  );
}

export function EVChargerCard({ charger, onSelect, isSelected }: EVChargerCardProps) {
  const maxPower = Math.max(...charger.connections.map((c) => c.power_kw), 0);
  const totalPoints = charger.connections.reduce((sum, c) => sum + c.quantity, 0);

  function speedLabel(kw: number): { label: string; color: string } {
    if (kw >= 100) return { label: 'Ultra-rapid', color: 'text-purple-400' };
    if (kw >= 50) return { label: 'Rapid', color: 'text-blue-400' };
    if (kw >= 22) return { label: 'Fast', color: 'text-cyan-400' };
    if (kw >= 7) return { label: 'Fast AC', color: 'text-teal-400' };
    return { label: 'Slow', color: 'text-gray-400' };
  }

  const speed = speedLabel(maxPower);

  return (
    <div
      className={`relative bg-navy-800 rounded-xl border transition-all cursor-pointer hover:border-ev-green/50 ${
        isSelected ? 'border-ev-green shadow-lg shadow-ev-green/10' : 'border-navy-700'
      }`}
      onClick={() => onSelect?.(charger)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-900/30 border border-green-700/40 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-ev-green" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{charger.name}</h3>
            <div className="flex items-center gap-1 text-navy-600 text-xs mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{charger.address}</span>
            </div>
            {charger.distance_miles !== undefined && (
              <span className="text-xs text-gray-500 mt-0.5 block">
                {charger.distance_miles.toFixed(1)} miles away
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1 flex-shrink-0 ${charger.is_operational ? 'text-ev-green' : 'text-red-400'}`}>
            {charger.is_operational ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-navy-700 px-3 py-2">
            <div className={`text-sm font-semibold ${speed.color}`}>
              {maxPower > 0 ? `${maxPower}kW` : 'Unknown'}
            </div>
            <div className="text-xs text-gray-500">{speed.label}</div>
          </div>
          <div className="rounded-lg bg-navy-700 px-3 py-2">
            <div className="text-sm font-semibold text-white">{totalPoints}</div>
            <div className="text-xs text-gray-500">
              {totalPoints === 1 ? 'point' : 'points'}
            </div>
          </div>
        </div>

        {charger.usage_cost && (
          <div className="mt-2 flex items-start gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ev-green flex-shrink-0 mt-0.5" />
            <span className="text-xs text-gray-400 leading-relaxed">{charger.usage_cost}</span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-1">
          {charger.connections.slice(0, 3).map((conn, i) => (
            <span
              key={i}
              className="text-xs px-1.5 py-0.5 rounded bg-navy-700 text-gray-400 border border-navy-600"
            >
              {conn.type}
            </span>
          ))}
          {charger.connections.length > 3 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-navy-700 text-gray-500">
              +{charger.connections.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
