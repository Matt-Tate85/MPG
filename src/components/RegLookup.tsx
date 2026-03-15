'use client';

import { useState } from 'react';
import { Car, Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { Vehicle } from '@/lib/types';

interface RegLookupProps {
  onVehicleFound: (vehicle: Vehicle) => void;
  currentVehicle?: Vehicle | null;
}

export default function RegLookup({ onVehicleFound, currentVehicle }: RegLookupProps) {
  const [reg, setReg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReg = reg.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanReg) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/vehicle?reg=${encodeURIComponent(cleanReg)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Vehicle not found');
        return;
      }

      onVehicleFound(data);
    } catch {
      setError('Lookup failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleLookup} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Car className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={reg}
            onChange={(e) => setReg(e.target.value.toUpperCase())}
            placeholder="e.g. AB12 CDE"
            maxLength={8}
            className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 uppercase font-mono tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !reg.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 disabled:cursor-not-allowed text-navy-900 font-semibold rounded-lg text-sm transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Lookup</span>
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm px-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {currentVehicle && (
        <div className="bg-navy-700/50 rounded-lg p-3 border border-navy-600 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                {currentVehicle.make} {currentVehicle.model}{' '}
                <span className="text-gray-400 font-normal">({currentVehicle.year_of_manufacture})</span>
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                <span className="bg-navy-700 px-2 py-0.5 rounded">
                  {currentVehicle.fuel_type}
                </span>
                {currentVehicle.engine_capacity_cc > 0 && (
                  <span className="bg-navy-700 px-2 py-0.5 rounded">
                    {(currentVehicle.engine_capacity_cc / 1000).toFixed(1)}L
                  </span>
                )}
                {currentVehicle.is_electric ? (
                  <span className="bg-green-900/40 text-green-400 px-2 py-0.5 rounded">
                    ~{currentVehicle.estimated_miles_per_kwh} mi/kWh
                  </span>
                ) : (
                  <span className="bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded">
                    ~{currentVehicle.estimated_mpg} MPG
                  </span>
                )}
                {currentVehicle.co2_emissions && (
                  <span className="bg-navy-700 px-2 py-0.5 rounded">
                    {currentVehicle.co2_emissions}g CO₂
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {currentVehicle.registration} · {currentVehicle.colour}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
