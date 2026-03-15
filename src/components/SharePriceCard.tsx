'use client';

import { useState } from 'react';
import { Share2, Copy, CheckCheck, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import type { FuelStation } from '@/lib/types';

interface SharePriceCardProps {
  stations: FuelStation[];
  userLocation?: { lat: number; lng: number } | null;
  fuelType?: 'petrol' | 'diesel';
}

function getPriceForType(station: FuelStation, fuelType: 'petrol' | 'diesel'): number | undefined {
  return fuelType === 'petrol' ? station.petrol_pence : station.diesel_pence;
}

export default function SharePriceCard({ stations, userLocation, fuelType = 'petrol' }: SharePriceCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState<'petrol' | 'diesel'>(fuelType);

  const withPrice = stations
    .filter((s) => getPriceForType(s, shareType) !== undefined)
    .sort((a, b) => (getPriceForType(a, shareType) ?? 999) - (getPriceForType(b, shareType) ?? 999));

  if (withPrice.length < 2) return null;

  const cheapest = withPrice[0];
  const dearest = withPrice[withPrice.length - 1];
  const cheapestPrice = getPriceForType(cheapest, shareType)!;
  const dearestPrice = getPriceForType(dearest, shareType)!;
  const priceDiff = dearestPrice - cheapestPrice;
  const savingPer50L = ((priceDiff / 100) * 50).toFixed(2);
  const avgPrice = withPrice.reduce((sum, s) => sum + (getPriceForType(s, shareType) ?? 0), 0) / withPrice.length;

  const buildShareText = () => {
    const lines = [
      `⛽ Local ${shareType} prices right now:`,
      ``,
      `✅ Cheapest: ${cheapest.name} — ${cheapestPrice.toFixed(1)}p/L`,
      `❌ Dearest: ${dearest.name} — ${dearestPrice.toFixed(1)}p/L`,
      ``,
      `💸 That's a ${priceDiff.toFixed(1)}p/L difference — £${savingPer50L} on a 50L fill-up!`,
      `📊 Local average: ${avgPrice.toFixed(1)}p/L`,
      ``,
      `Checked just now on MPG Tracker 🚗`,
    ];
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the text area
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Local ${shareType} prices — save £${savingPer50L} on your next fill-up`,
          text: buildShareText(),
        });
      } catch {
        // user cancelled or not supported
      }
    } else {
      handleCopy();
    }
  };

  // Top 5 cheapest
  const top5 = withPrice.slice(0, 5);

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-fuel-amber" />
          <h2 className="text-white font-semibold text-lg">Local Price Report</h2>
        </div>
        <div className="flex gap-1">
          {(['petrol', 'diesel'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => setShareType(ft)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                shareType === ft ? 'bg-fuel-amber text-navy-900' : 'bg-navy-700 text-gray-400 hover:text-white'
              }`}
            >
              {ft.charAt(0).toUpperCase() + ft.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight cards */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-3">
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-ev-green" />
            <span className="text-xs text-ev-green font-medium uppercase tracking-wide">Cheapest nearby</span>
          </div>
          <div className="text-2xl font-bold text-white">{cheapestPrice.toFixed(1)}<span className="text-sm font-normal text-gray-400">p/L</span></div>
          <div className="text-sm text-gray-300 mt-0.5 truncate">{cheapest.name}</div>
          {cheapest.distance_miles !== undefined && (
            <div className="text-xs text-gray-500">{cheapest.distance_miles.toFixed(1)} mi away</div>
          )}
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-400 font-medium uppercase tracking-wide">Most expensive</span>
          </div>
          <div className="text-2xl font-bold text-white">{dearestPrice.toFixed(1)}<span className="text-sm font-normal text-gray-400">p/L</span></div>
          <div className="text-sm text-gray-300 mt-0.5 truncate">{dearest.name}</div>
          {dearest.distance_miles !== undefined && (
            <div className="text-xs text-gray-500">{dearest.distance_miles.toFixed(1)} mi away</div>
          )}
        </div>
      </div>

      {/* Saving callout */}
      <div className="mx-5 mb-4 p-3 rounded-lg bg-navy-700 border border-navy-600 text-center">
        <span className="text-gray-400 text-sm">Filling 50 litres at the cheapest saves you </span>
        <span className="text-fuel-amber font-bold text-lg">£{savingPer50L}</span>
        <span className="text-gray-400 text-sm"> vs the dearest</span>
      </div>

      {/* Top 5 list */}
      <div className="px-5 pb-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">Cheapest in your area</div>
        <div className="space-y-1.5">
          {top5.map((station, i) => {
            const stationPrice = getPriceForType(station, shareType)!;
            const isAvg = Math.abs(stationPrice - avgPrice) < 0.5;
            const isCheap = stationPrice < avgPrice - 0.5;
            return (
              <div key={station.id} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? 'bg-ev-green/20 text-ev-green' : 'bg-navy-600 text-gray-400'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-200 truncate">{station.name}</div>
                  {station.distance_miles !== undefined && (
                    <div className="text-xs text-gray-600">{station.distance_miles.toFixed(1)} mi</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-sm font-semibold ${isCheap ? 'text-ev-green' : isAvg ? 'text-yellow-400' : 'text-red-400'}`}>
                    {stationPrice.toFixed(1)}p
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-navy-700 flex items-center justify-between text-xs text-gray-500">
          <span>Local average</span>
          <span className="font-semibold text-gray-400">{avgPrice.toFixed(1)}p/L</span>
        </div>
      </div>

      {/* Share buttons */}
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={handleNativeShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-fuel-amber hover:bg-fuel-amber-dark text-navy-900 font-semibold text-sm transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share to WhatsApp / Facebook
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-gray-300 text-sm transition-colors"
          title="Copy text"
        >
          {copied ? <CheckCheck className="w-4 h-4 text-ev-green" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
