'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react';
import type { LoyaltyScheme } from '@/app/api/loyalty/route';

interface LoyaltyCalculatorProps {
  pumpPricePence?: number;
  stationBrand?: string;
  fillLitres?: number;
  collapsed?: boolean;
}

function matchesStationBrand(scheme: LoyaltyScheme, stationBrand: string): boolean {
  if (!stationBrand) return false;
  const brand = stationBrand.toLowerCase();
  return scheme.station_brands.some((b) => b.toLowerCase() === brand);
}

export default function LoyaltyCalculator({
  pumpPricePence = 142,
  stationBrand = '',
  fillLitres = 50,
  collapsed = true,
}: LoyaltyCalculatorProps) {
  const [schemes, setSchemes] = useState<LoyaltyScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(!collapsed);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [localFillLitres, setLocalFillLitres] = useState(fillLitres);
  const [localPrice, setLocalPrice] = useState(pumpPricePence);

  useEffect(() => {
    fetch('/api/loyalty')
      .then((r) => r.json())
      .then((data) => {
        setSchemes(data.schemes || []);
        // Pre-select schemes matching station brand
        if (stationBrand) {
          const matching = (data.schemes as LoyaltyScheme[])
            .filter((s) => matchesStationBrand(s, stationBrand))
            .map((s) => s.id);
          setSelected(new Set(matching));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [stationBrand]);

  const toggleScheme = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Calculate best discount from selected schemes
  const selectedSchemes = schemes.filter((s) => selected.has(s.id));
  const bestDiscountPence = selectedSchemes.reduce((max, s) => {
    const d = s.discount_pence_per_litre ?? 0;
    return Math.max(max, d);
  }, 0);

  const effectivePricePence = Math.max(0, localPrice - bestDiscountPence);
  const grossCost = (localPrice / 100) * localFillLitres;
  const effectiveCost = (effectivePricePence / 100) * localFillLitres;
  const saving = grossCost - effectiveCost;

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-navy-700/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Tag className="w-4 h-4 text-fuel-amber" />
          Loyalty Card Discount
          {bestDiscountPence > 0 && (
            <span className="px-1.5 py-0.5 bg-ev-green/20 text-ev-green text-xs rounded-full border border-ev-green/30">
              −{bestDiscountPence}p/L
            </span>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-navy-700">
          {/* Inputs row */}
          <div className="flex gap-3 mt-3 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Pump price (p/L)</label>
              <div className="relative">
                <input
                  type="number"
                  value={localPrice}
                  onChange={(e) => setLocalPrice(parseFloat(e.target.value) || 142)}
                  step="0.1"
                  min="80"
                  max="250"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-2 py-1.5 text-sm text-white pr-6"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">p</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Fill quantity (L)</label>
              <input
                type="number"
                value={localFillLitres}
                onChange={(e) => setLocalFillLitres(parseFloat(e.target.value) || 50)}
                step="1"
                min="5"
                max="200"
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>

          {/* Scheme list */}
          {loading ? (
            <div className="text-xs text-gray-500 py-2">Loading schemes...</div>
          ) : (
            <div className="space-y-2">
              {schemes.map((scheme) => {
                const isMatch = matchesStationBrand(scheme, stationBrand);
                const isChecked = selected.has(scheme.id);
                return (
                  <label
                    key={scheme.id}
                    className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-navy-700 border border-fuel-amber/30'
                        : 'bg-navy-700/40 border border-navy-600/50 hover:bg-navy-700/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleScheme(scheme.id)}
                      className="mt-0.5 accent-fuel-amber"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-medium text-white">{scheme.scheme_name}</span>
                        {isMatch && (
                          <span className="text-[10px] px-1 py-0.5 bg-ev-green/20 text-ev-green rounded border border-ev-green/30">
                            This station
                          </span>
                        )}
                        {scheme.discount_pence_per_litre ? (
                          <span className="text-[10px] px-1 py-0.5 bg-fuel-amber/20 text-fuel-amber rounded">
                            ~{scheme.discount_pence_per_litre}p/L off
                          </span>
                        ) : (
                          <span className="text-[10px] px-1 py-0.5 bg-navy-600 text-gray-400 rounded">
                            Points/cashback
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{scheme.discount_description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Result */}
          {selectedSchemes.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-navy-700 border border-navy-600">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Standard price ({localFillLitres}L)</span>
                <span className="text-sm text-gray-300">£{grossCost.toFixed(2)}</span>
              </div>
              {bestDiscountPence > 0 && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Loyalty discount (−{bestDiscountPence}p/L)</span>
                  <span className="text-sm text-ev-green">−£{saving.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-navy-600 mt-1">
                <span className="text-xs font-medium text-white">Effective price</span>
                <div className="text-right">
                  <span className="text-base font-bold text-ev-green">
                    {effectivePricePence.toFixed(1)}p/L
                  </span>
                  {bestDiscountPence > 0 && (
                    <div className="text-xs text-ev-green">
                      Fill cost: £{effectiveCost.toFixed(2)} (save £{saving.toFixed(2)})
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedSchemes.some((s) => !s.discount_pence_per_litre) && (
            <p className="text-xs text-gray-600 mt-2">
              * Some selected schemes earn points/cashback rather than a direct discount.
              Check the retailer&apos;s app for current offers.
            </p>
          )}

          <p className="text-xs text-gray-600 mt-2">
            Discount values are approximate. Verified: Jan 2025.
          </p>
        </div>
      )}
    </div>
  );
}
