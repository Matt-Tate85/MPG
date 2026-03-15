'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import type { PriceHistoryPoint } from '@/lib/types';

interface PriceChartProps {
  stationId?: string;
  stationName?: string;
  fuelType?: 'petrol' | 'diesel';
}

interface ChartDataPoint {
  date: string;
  station?: number;
  ukAverage?: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-2">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span style={{ color: entry.color }}>●</span>
          <span className="text-gray-300">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value?.toFixed(1)}p</span>
        </div>
      ))}
    </div>
  );
}

export default function PriceChart({ stationId, stationName, fuelType = 'petrol' }: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFuelType, setActiveFuelType] = useState<'petrol' | 'diesel'>(fuelType);
  const [days, setDays] = useState(30);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        fuel_type: activeFuelType,
        days: days.toString(),
        include_average: 'true',
      });

      if (stationId) {
        params.set('station_id', stationId);
      }

      const response = await fetch(`/api/price-history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch price history');

      const data = await response.json();

      // Merge station and UK average data by date
      const dateMap = new Map<string, ChartDataPoint>();

      if (data.station_history) {
        (data.station_history as PriceHistoryPoint[]).forEach((point) => {
          const existing = dateMap.get(point.date) || { date: formatDate(point.date) };
          dateMap.set(point.date, { ...existing, station: point.price_pence });
        });
      }

      if (data.uk_average) {
        (data.uk_average as PriceHistoryPoint[]).forEach((point) => {
          const existing = dateMap.get(point.date) || { date: formatDate(point.date) };
          dateMap.set(point.date, { ...existing, ukAverage: point.price_pence });
        });
      }

      const merged = Array.from(dateMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      setChartData(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, activeFuelType, days]);

  // Calculate trend
  const stationPoints = chartData.filter((d) => d.station !== undefined);
  const trend =
    stationPoints.length >= 2
      ? (stationPoints[stationPoints.length - 1].station || 0) - (stationPoints[0].station || 0)
      : 0;

  const latestPrice = stationPoints.length > 0 ? stationPoints[stationPoints.length - 1].station : null;
  const latestUKAvg = chartData.length > 0 ? chartData[chartData.length - 1].ukAverage : null;

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-white font-semibold">
            {stationName ? `${stationName} — Price History` : 'UK Average Price History'}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {stationId ? 'Station vs UK average' : 'UK market overview'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Fuel type toggle */}
          <div className="flex rounded-lg bg-navy-700 p-0.5">
            {(['petrol', 'diesel'] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setActiveFuelType(ft)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeFuelType === ft
                    ? 'bg-fuel-amber text-navy-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {ft.charAt(0).toUpperCase() + ft.slice(1)}
              </button>
            ))}
          </div>

          {/* Days selector */}
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-navy-700 text-gray-300 text-xs border border-navy-600 rounded-lg px-2 py-1.5"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>

          <button
            onClick={fetchHistory}
            className="p-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {(latestPrice !== null || latestUKAvg !== null) && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {latestPrice !== null && (
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">
                {stationName || 'Station'} Latest
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-fuel-amber">{latestPrice.toFixed(1)}p</span>
                <span className={`text-xs flex items-center gap-0.5 mb-0.5 ${trend > 0 ? 'text-red-400' : trend < 0 ? 'text-ev-green' : 'text-gray-500'}`}>
                  {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {trend !== 0 ? `${Math.abs(trend).toFixed(1)}p` : 'flat'}
                </span>
              </div>
            </div>
          )}
          {latestUKAvg !== null && (
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">UK Average</div>
              <div className="text-xl font-bold text-blue-400">{latestUKAvg.toFixed(1)}p</div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm text-center py-8">
          {error}
        </div>
      )}

      {!error && chartData.length === 0 && !loading && (
        <div className="text-gray-500 text-sm text-center py-8">
          <p>No price history yet.</p>
          <p className="text-xs mt-1">History builds as you use the app.</p>
        </div>
      )}

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}p`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '8px' }}
            />
            {stationId && (
              <Line
                type="monotone"
                dataKey="station"
                name={stationName || 'Station'}
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            )}
            <Line
              type="monotone"
              dataKey="ukAverage"
              name="UK Average"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
