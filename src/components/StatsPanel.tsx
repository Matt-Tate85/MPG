'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Star, BarChart2 } from 'lucide-react';
import type { FuelStation } from '@/lib/types';
import { FuelStationCard } from '@/components/StationCard';

interface BrandAverage {
  brand: string;
  avg_petrol: number | null;
  avg_diesel: number | null;
  station_count: number;
}

interface StatsData {
  uk_avg_petrol: number | null;
  uk_avg_diesel: number | null;
  petrol_trend_7d: number | null;
  diesel_trend_7d: number | null;
  brand_averages: BrandAverage[];
  snapshot_count: number;
  last_updated: string;
}

interface StatsPanelProps {
  stations: FuelStation[];
}

function TrendIcon({ value }: { value: number | null }) {
  if (value === null) return <Minus className="w-4 h-4 text-gray-500" />;
  if (value === 0) return <Minus className="w-4 h-4 text-gray-400" />;
  if (value > 0) return <TrendingUp className="w-4 h-4 text-red-400" />;
  return <TrendingDown className="w-4 h-4 text-ev-green" />;
}

function trendLabel(value: number | null, fuelName: string): string {
  if (value === null) return `${fuelName}: no historical data`;
  if (value === 0) return `${fuelName} is flat vs last week`;
  const dir = value > 0 ? 'up' : 'down';
  const abs = Math.abs(value);
  return `${fuelName} is ${dir} ${abs.toFixed(1)}p vs last week`;
}

// Derive live brand averages from the loaded stations list
function computeLiveBrandAverages(stations: FuelStation[]): BrandAverage[] {
  const map = new Map<string, { petrolSum: number; petrolCount: number; dieselSum: number; dieselCount: number }>();

  for (const s of stations) {
    const brand = s.brand || 'Unknown';
    const entry = map.get(brand) ?? { petrolSum: 0, petrolCount: 0, dieselSum: 0, dieselCount: 0 };
    if (s.petrol_pence) {
      entry.petrolSum += s.petrol_pence;
      entry.petrolCount += 1;
    }
    if (s.diesel_pence) {
      entry.dieselSum += s.diesel_pence;
      entry.dieselCount += 1;
    }
    map.set(brand, entry);
  }

  return Array.from(map.entries())
    .map(([brand, v]) => ({
      brand,
      avg_petrol: v.petrolCount > 0 ? Math.round((v.petrolSum / v.petrolCount) * 10) / 10 : null,
      avg_diesel: v.dieselCount > 0 ? Math.round((v.dieselSum / v.dieselCount) * 10) / 10 : null,
      station_count: Math.max(v.petrolCount, v.dieselCount),
    }))
    .sort((a, b) => (a.avg_petrol ?? 999) - (b.avg_petrol ?? 999));
}

function computeLiveAverages(stations: FuelStation[]) {
  const petrol = stations.map((s) => s.petrol_pence).filter((p): p is number => p !== undefined);
  const diesel = stations.map((s) => s.diesel_pence).filter((p): p is number => p !== undefined);
  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
  return { avgPetrol: avg(petrol), avgDiesel: avg(diesel) };
}

// Custom bar tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-xs text-white shadow-lg">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(1)}p
        </div>
      ))}
    </div>
  );
}

export default function StatsPanel({ stations }: StatsPanelProps) {
  const [dbStats, setDbStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data: StatsData) => setDbStats(data))
      .catch(() => setDbStats(null))
      .finally(() => setLoading(false));
  }, []);

  // Live computations from loaded stations
  const liveBrands = computeLiveBrandAverages(stations);
  const { avgPetrol: liveAvgPetrol, avgDiesel: liveAvgDiesel } = computeLiveAverages(stations);

  // Use DB stats for trends; use live data for current prices (more up-to-date)
  const displayPetrol = liveAvgPetrol ?? dbStats?.uk_avg_petrol ?? null;
  const displayDiesel = liveAvgDiesel ?? dbStats?.uk_avg_diesel ?? null;
  const displayBrands = liveBrands.length > 0 ? liveBrands : (dbStats?.brand_averages ?? []);

  // Cheapest stations from loaded list
  const cheapestPetrolStation = stations
    .filter((s) => s.petrol_pence)
    .sort((a, b) => (a.petrol_pence ?? 999) - (b.petrol_pence ?? 999))[0];

  const cheapestDieselStation = stations
    .filter((s) => s.diesel_pence)
    .sort((a, b) => (a.diesel_pence ?? 999) - (b.diesel_pence ?? 999))[0];

  // Chart data — top 10 brands by petrol price
  const chartData = displayBrands
    .filter((b) => b.avg_petrol !== null || b.avg_diesel !== null)
    .slice(0, 10)
    .map((b) => ({
      name: b.brand,
      Petrol: b.avg_petrol ?? 0,
      Diesel: b.avg_diesel ?? 0,
    }));

  const petrolTrend = dbStats?.petrol_trend_7d ?? null;
  const dieselTrend = dbStats?.diesel_trend_7d ?? null;

  return (
    <div className="space-y-4">
      {/* UK Average row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">UK Avg Petrol</div>
          {displayPetrol !== null ? (
            <>
              <div className="text-2xl font-bold text-fuel-amber">{displayPetrol.toFixed(1)}p</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon value={petrolTrend} />
                <span className="text-xs text-gray-400">
                  {petrolTrend !== null ? `${Math.abs(petrolTrend).toFixed(1)}p vs 7d ago` : 'no trend data'}
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 mt-1">No data yet</div>
          )}
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">UK Avg Diesel</div>
          {displayDiesel !== null ? (
            <>
              <div className="text-2xl font-bold text-blue-400">{displayDiesel.toFixed(1)}p</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon value={dieselTrend} />
                <span className="text-xs text-gray-400">
                  {dieselTrend !== null ? `${Math.abs(dieselTrend).toFixed(1)}p vs 7d ago` : 'no trend data'}
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 mt-1">No data yet</div>
          )}
        </div>
      </div>

      {/* Price trend summary */}
      {(petrolTrend !== null || dieselTrend !== null) && (
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-fuel-amber" />
            7-Day Price Trend
          </h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <TrendIcon value={petrolTrend} />
              <span className="text-gray-300">{trendLabel(petrolTrend, 'Petrol')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendIcon value={dieselTrend} />
              <span className="text-gray-300">{trendLabel(dieselTrend, 'Diesel')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Regional note */}
      <div className="bg-navy-700/50 border border-navy-600 rounded-lg px-3 py-2 text-xs text-gray-400">
        Prices shown are for stations within your current search radius.
        {stations.length > 0 && ` Based on ${stations.length} stations.`}
        {loading && ' Loading historical data...'}
      </div>

      {/* Today's cheapest highlight */}
      {(cheapestPetrolStation || cheapestDieselStation) && (
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-fuel-amber" />
            Today&apos;s Cheapest
          </h3>
          <div className="space-y-2">
            {cheapestPetrolStation && cheapestPetrolStation !== cheapestDieselStation && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Cheapest Petrol</div>
                <FuelStationCard
                  station={cheapestPetrolStation}
                  fillLitres={50}
                  isSelected={false}
                />
              </div>
            )}
            {cheapestDieselStation && cheapestDieselStation !== cheapestPetrolStation && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Cheapest Diesel</div>
                <FuelStationCard
                  station={cheapestDieselStation}
                  fillLitres={50}
                  isSelected={false}
                />
              </div>
            )}
            {cheapestPetrolStation && cheapestPetrolStation === cheapestDieselStation && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Cheapest Overall</div>
                <FuelStationCard
                  station={cheapestPetrolStation}
                  fillLitres={50}
                  isSelected={false}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Brand comparison bar chart */}
      {chartData.length > 0 && (
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-fuel-amber" />
            Brand Price Comparison (pence/litre)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3450" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={{ stroke: '#374151' }}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={40}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Petrol" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.Petrol < 135
                          ? '#22c55e'
                          : entry.Petrol < 142
                          ? '#facc15'
                          : entry.Petrol < 148
                          ? '#f59e0b'
                          : '#f87171'
                      }
                    />
                  ))}
                </Bar>
                <Bar dataKey="Diesel" fill="#60a5fa" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Brand comparison table */}
      {displayBrands.length > 0 && (
        <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-navy-700">
            <h3 className="text-white font-semibold text-sm">Brand Averages (cheapest first)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-navy-700">
                  <th className="text-left px-4 py-2">Brand</th>
                  <th className="text-right px-4 py-2">Petrol</th>
                  <th className="text-right px-4 py-2">Diesel</th>
                  <th className="text-right px-4 py-2">Stations</th>
                </tr>
              </thead>
              <tbody>
                {displayBrands.map((b, i) => (
                  <tr
                    key={b.brand}
                    className={`border-b border-navy-700/50 ${i === 0 ? 'bg-green-900/10' : ''}`}
                  >
                    <td className="px-4 py-2 text-white font-medium">
                      {i === 0 && <span className="text-ev-green text-xs mr-1">★</span>}
                      {b.brand}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {b.avg_petrol !== null ? (
                        <span className={`font-semibold ${
                          b.avg_petrol < 135
                            ? 'text-ev-green'
                            : b.avg_petrol < 142
                            ? 'text-yellow-400'
                            : b.avg_petrol < 148
                            ? 'text-fuel-amber'
                            : 'text-red-400'
                        }`}>
                          {b.avg_petrol.toFixed(1)}p
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {b.avg_diesel !== null ? (
                        <span className="text-blue-400 font-semibold">{b.avg_diesel.toFixed(1)}p</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">{b.station_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stations.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-500 text-sm">
          Search for a location to see price statistics.
        </div>
      )}
    </div>
  );
}
