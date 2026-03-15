'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Minus, AlertCircle, RefreshCw, Info } from 'lucide-react';
import type { FuelCostBreakdown, WaitOrFillRecommendation } from '@/lib/fuel-duty';

interface MarginApiResponse {
  crude_price_usd: number | null;
  gbp_usd_rate: number | null;
  duty_pence: number;
  breakdown: FuelCostBreakdown;
  fair_petrol_price_pence: number;
  wait_or_fill: WaitOrFillRecommendation;
  fetched_at: string;
  error?: string;
}

interface MarginTrackerProps {
  pumpPricePence?: number; // Optional: prefill from nearest station
}

function MarginBar({ breakdown }: { breakdown: FuelCostBreakdown }) {
  const total = breakdown.pump_price_pence;
  if (total <= 0) return null;

  const dutyPct = (breakdown.duty_pence / total) * 100;
  const vatPct = (breakdown.vat_pence / total) * 100;
  const wholesalePct = (breakdown.estimated_wholesale_pence / total) * 100;
  const marginPct = Math.max(0, (breakdown.retailer_margin_pence / total) * 100);

  const marginColor =
    breakdown.retailer_margin_pence <= 8
      ? 'bg-ev-green'
      : breakdown.retailer_margin_pence <= 12
      ? 'bg-fuel-amber'
      : 'bg-red-500';

  return (
    <div className="mt-3">
      <div className="flex h-5 rounded-lg overflow-hidden w-full">
        <div
          className="bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
          style={{ width: `${wholesalePct}%` }}
          title={`Wholesale: ${breakdown.estimated_wholesale_pence.toFixed(1)}p`}
        >
          {wholesalePct > 8 ? 'Oil' : ''}
        </div>
        <div
          className="bg-orange-500 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
          style={{ width: `${dutyPct}%` }}
          title={`Duty: ${breakdown.duty_pence.toFixed(1)}p`}
        >
          {dutyPct > 8 ? 'Duty' : ''}
        </div>
        <div
          className="bg-yellow-500 flex items-center justify-center text-[9px] font-bold text-navy-900 overflow-hidden"
          style={{ width: `${vatPct}%` }}
          title={`VAT: ${breakdown.vat_pence.toFixed(1)}p`}
        >
          {vatPct > 6 ? 'VAT' : ''}
        </div>
        <div
          className={`${marginColor} flex items-center justify-center text-[9px] font-bold text-white overflow-hidden`}
          style={{ width: `${marginPct}%` }}
          title={`Retailer margin: ${breakdown.retailer_margin_pence.toFixed(1)}p`}
        >
          {marginPct > 5 ? 'Margin' : ''}
        </div>
      </div>
      {/* Legend */}
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
          Oil {breakdown.estimated_wholesale_pence.toFixed(1)}p
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
          Duty {breakdown.duty_pence.toFixed(1)}p
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 inline-block" />
          VAT {breakdown.vat_pence.toFixed(1)}p
        </span>
        <span className={`flex items-center gap-1 font-medium ${
          breakdown.retailer_margin_pence <= 8
            ? 'text-ev-green'
            : breakdown.retailer_margin_pence <= 12
            ? 'text-fuel-amber'
            : 'text-red-400'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-sm inline-block ${
            breakdown.retailer_margin_pence <= 8
              ? 'bg-ev-green'
              : breakdown.retailer_margin_pence <= 12
              ? 'bg-fuel-amber'
              : 'bg-red-500'
          }`} />
          Margin {breakdown.retailer_margin_pence.toFixed(1)}p
        </span>
      </div>
    </div>
  );
}

function WaitOrFillCard({ rec }: { rec: WaitOrFillRecommendation }) {
  const icon =
    rec.action === 'fill_now' ? (
      <TrendingUp className="w-5 h-5 text-red-400" />
    ) : rec.action === 'wait' ? (
      <TrendingDown className="w-5 h-5 text-ev-green" />
    ) : (
      <Minus className="w-5 h-5 text-gray-400" />
    );

  const borderColor =
    rec.action === 'fill_now'
      ? 'border-red-700/60 bg-red-900/20'
      : rec.action === 'wait'
      ? 'border-green-700/60 bg-green-900/20'
      : 'border-navy-600 bg-navy-700/40';

  const headlineColor =
    rec.action === 'fill_now'
      ? 'text-red-300'
      : rec.action === 'wait'
      ? 'text-ev-green'
      : 'text-gray-300';

  return (
    <div className={`rounded-xl border p-4 ${borderColor}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className={`font-semibold text-sm ${headlineColor}`}>{rec.headline}</h4>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">{rec.detail}</p>
      {rec.crude_change_pct !== 0 && (
        <p className="text-xs text-gray-500 mt-1.5">
          Crude oil 7-day change:{' '}
          <span
            className={
              rec.crude_change_pct > 0 ? 'text-red-400' : 'text-ev-green'
            }
          >
            {rec.crude_change_pct > 0 ? '+' : ''}
            {rec.crude_change_pct.toFixed(1)}%
          </span>
        </p>
      )}
    </div>
  );
}

export default function MarginTracker({ pumpPricePence }: MarginTrackerProps) {
  const [data, setData] = useState<MarginApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<string>(
    pumpPricePence ? pumpPricePence.toFixed(1) : ''
  );

  const effectivePrice = parseFloat(customPrice) || pumpPricePence || 142;

  const fetchData = async (pricePence: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/margin?pump_price=${pricePence}`);
      if (!res.ok) throw new Error('Failed to fetch margin data');
      const json: MarginApiResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(effectivePrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate when pump price changes (debounced via button)
  const handleRecalculate = () => fetchData(effectivePrice);

  const marginColor =
    data && data.breakdown
      ? data.breakdown.retailer_margin_pence <= 8
        ? 'text-ev-green'
        : data.breakdown.retailer_margin_pence <= 12
        ? 'text-fuel-amber'
        : 'text-red-400'
      : 'text-gray-400';

  const marginLabel =
    data && data.breakdown
      ? data.breakdown.retailer_margin_pence <= 8
        ? 'Fair margin'
        : data.breakdown.retailer_margin_pence <= 12
        ? 'Elevated margin'
        : 'High margin — retailer may be profiteering'
      : '';

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-fuel-amber" />
            Is Your Retailer Ripping You Off?
          </h3>
          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="p-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-gray-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Pump price input */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-xs text-gray-500 whitespace-nowrap">Your pump price:</label>
          <div className="relative flex-1 max-w-[120px]">
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRecalculate()}
              placeholder="142.0"
              step="0.1"
              min="80"
              max="250"
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-2 py-1 text-sm text-white text-right pr-6"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">p</span>
          </div>
          <button
            onClick={handleRecalculate}
            className="px-2.5 py-1 bg-fuel-amber/20 hover:bg-fuel-amber/30 text-fuel-amber text-xs rounded-lg transition-colors"
          >
            Calculate
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-4 justify-center">
            <div className="w-5 h-5 border-2 border-fuel-amber border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Fetching crude price data...</span>
          </div>
        ) : error ? (
          <div className="py-4 text-center text-sm text-red-400">
            {error} — crude price data unavailable
          </div>
        ) : data ? (
          <>
            {/* Key stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-navy-700 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-500 mb-0.5">Brent Crude</div>
                <div className="text-sm font-bold text-white">
                  ${data.crude_price_usd?.toFixed(2) ?? '—'}
                </div>
                <div className="text-xs text-gray-500">per barrel</div>
              </div>
              <div className="bg-navy-700 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-500 mb-0.5">Est. Wholesale</div>
                <div className="text-sm font-bold text-blue-300">
                  {data.breakdown.estimated_wholesale_pence.toFixed(1)}p
                </div>
                <div className="text-xs text-gray-500">per litre</div>
              </div>
              <div className="bg-navy-700 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-500 mb-0.5">Retailer Margin</div>
                <div className={`text-sm font-bold ${marginColor}`}>
                  {data.breakdown.retailer_margin_pence.toFixed(1)}p
                </div>
                <div className="text-xs text-gray-500">per litre</div>
              </div>
            </div>

            {/* Margin label */}
            {marginLabel && (
              <div className={`text-xs font-medium mb-1 ${marginColor}`}>
                {marginLabel}
              </div>
            )}

            {/* Visual bar */}
            <MarginBar breakdown={data.breakdown} />

            {/* Fair price */}
            <div className="mt-3 px-3 py-2 rounded-lg bg-navy-700/60 border border-navy-600 text-xs text-gray-300">
              <span className="text-gray-500">Based on today&apos;s wholesale cost, </span>
              <span className="text-white font-semibold">
                fair petrol price should be ~{data.fair_petrol_price_pence.toFixed(1)}p/L
              </span>
              <span className="text-gray-500"> (including 8p fair margin)</span>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-600 mt-2 flex items-start gap-1">
              <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
              Wholesale prices take ~5–7 days to feed through to pump prices.
              Margin calculation is approximate.
            </p>
          </>
        ) : null}
      </div>

      {/* Wait or Fill card */}
      {!loading && data?.wait_or_fill && (
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-fuel-amber" />
            Should I Fill Up Now or Wait?
          </h3>
          <WaitOrFillCard rec={data.wait_or_fill} />
          <p className="text-xs text-gray-600 mt-2">
            Based on Brent crude price movement over the past 7 days.
            Oil prices typically take 5–7 days to affect pump prices.
          </p>
        </div>
      )}

      {/* Data source */}
      {!loading && data && (
        <p className="text-xs text-gray-600 text-center">
          Crude price: Brent (BZ=F) via Yahoo Finance · Updated {
            new Date(data.fetched_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          }
        </p>
      )}
    </div>
  );
}
