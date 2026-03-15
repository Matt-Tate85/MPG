'use client';

import { useState } from 'react';
import { Calculator, TrendingDown, TrendingUp, Clock, Fuel, AlertCircle, CheckCircle, Info } from 'lucide-react';
import type { WorthItResult, FuelStation } from '@/lib/types';

interface WorthItCalculatorProps {
  nearStation?: FuelStation | null;
  farStation?: FuelStation | null;
  userMpg?: number;
  onClose?: () => void;
}

interface FormData {
  nearPrice: string;
  nearDistance: string;
  farPrice: string;
  farDistance: string;
  fillLitres: string;
  mpg: string;
}

export default function WorthItCalculator({
  nearStation,
  farStation,
  userMpg,
  onClose,
}: WorthItCalculatorProps) {
  const [formData, setFormData] = useState<FormData>({
    nearPrice: nearStation?.petrol_pence?.toString() || nearStation?.diesel_pence?.toString() || '142',
    nearDistance: nearStation?.distance_miles?.toFixed(1) || '0.5',
    farPrice: farStation?.petrol_pence?.toString() || farStation?.diesel_pence?.toString() || '138',
    farDistance: farStation?.distance_miles?.toFixed(1) || '3',
    fillLitres: '40',
    mpg: userMpg?.toString() || '38',
  });

  const [result, setResult] = useState<WorthItResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/worth-it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          near_station_price_pence: parseFloat(formData.nearPrice),
          near_station_distance_miles: parseFloat(formData.nearDistance),
          far_station_price_pence: parseFloat(formData.farPrice),
          far_station_distance_miles: parseFloat(formData.farDistance),
          planned_fill_litres: parseFloat(formData.fillLitres),
          car_mpg: parseFloat(formData.mpg),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.errors?.join(', ') || 'Calculation failed');
      }

      const data: WorthItResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-fuel-amber" />
          <h2 className="text-white font-semibold text-lg">Worth It? Calculator</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Context info if stations are pre-filled */}
      {(nearStation || farStation) && (
        <div className="mb-4 p-3 rounded-lg bg-navy-700 border border-navy-600 text-xs text-gray-400">
          <div className="flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-fuel-amber mt-0.5 flex-shrink-0" />
            <span>
              {nearStation && farStation
                ? `Comparing ${nearStation.name} vs ${farStation.name}`
                : nearStation
                ? `Based on ${nearStation.name} as your nearby station`
                : `Based on ${farStation?.name} as your destination`}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Near station */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Nearby Station {nearStation && <span className="text-fuel-amber normal-case font-normal">({nearStation.name})</span>}
          </h3>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Price (pence/litre)</label>
            <input
              type="number"
              step="0.1"
              value={formData.nearPrice}
              onChange={(e) => handleChange('nearPrice', e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuel-amber"
              placeholder="e.g. 142.9"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Distance (miles)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.nearDistance}
              onChange={(e) => handleChange('nearDistance', e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuel-amber"
              placeholder="e.g. 0.5"
            />
          </div>
        </div>

        {/* Far station */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Cheaper Station {farStation && <span className="text-fuel-amber normal-case font-normal">({farStation.name})</span>}
          </h3>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Price (pence/litre)</label>
            <input
              type="number"
              step="0.1"
              value={formData.farPrice}
              onChange={(e) => handleChange('farPrice', e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuel-amber"
              placeholder="e.g. 138.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Distance (miles)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.farDistance}
              onChange={(e) => handleChange('farDistance', e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuel-amber"
              placeholder="e.g. 3"
            />
          </div>
        </div>
      </div>

      {/* Car params */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Planned fill (litres)</label>
          <input
            type="number"
            step="1"
            min="1"
            value={formData.fillLitres}
            onChange={(e) => handleChange('fillLitres', e.target.value)}
            className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuel-amber"
            placeholder="e.g. 40"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Your car's MPG</label>
          <input
            type="number"
            step="1"
            min="1"
            value={formData.mpg}
            onChange={(e) => handleChange('mpg', e.target.value)}
            className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuel-amber"
            placeholder="e.g. 38"
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-lg bg-fuel-amber hover:bg-fuel-amber-dark text-navy-900 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4" />
            Calculate
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-900/30 border border-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          {/* Main verdict */}
          <div className={`p-4 rounded-xl border ${result.worth_it ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.worth_it ? (
                <CheckCircle className="w-5 h-5 text-ev-green" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-bold text-lg ${result.worth_it ? 'text-ev-green' : 'text-red-400'}`}>
                {result.worth_it ? 'Worth It!' : 'Not Worth It'}
              </span>
            </div>
            <p className="text-gray-300 text-sm">{result.verdict}</p>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Extra distance</div>
              <div className="text-white font-semibold">{result.extra_distance_miles.toFixed(1)} mi</div>
            </div>
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Extra time</div>
              <div className="flex items-center gap-1 text-white font-semibold">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {result.time_extra_minutes} min
              </div>
            </div>
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Detour cost</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 font-semibold">
                  £{result.cost_of_detour_gbp.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Savings on fill</div>
              <div className="flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-ev-green" />
                <span className="text-ev-green font-semibold">
                  £{result.savings_on_fill_gbp.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Net saving highlight */}
          <div className={`rounded-lg p-3 flex items-center justify-between ${result.net_saving_gbp > 0 ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'}`}>
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-fuel-amber" />
              <span className="text-gray-300 text-sm">Net saving</span>
            </div>
            <span className={`font-bold text-lg ${result.net_saving_gbp > 0 ? 'text-ev-green' : 'text-red-400'}`}>
              {result.net_saving_gbp > 0 ? '+' : ''}£{result.net_saving_gbp.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-gray-600">
            Assumes {parseFloat(formData.mpg).toFixed(0)} MPG, {parseFloat(formData.fillLitres).toFixed(0)}L fill, 30mph average for detour.
          </p>
        </div>
      )}
    </div>
  );
}
