import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'prices.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  return _db;
}

interface BrandAverage {
  brand: string;
  avg_petrol: number | null;
  avg_diesel: number | null;
  station_count: number;
}

interface StatsResponse {
  uk_avg_petrol: number | null;
  uk_avg_diesel: number | null;
  petrol_trend_7d: number | null; // pence change vs 7 days ago
  diesel_trend_7d: number | null;
  brand_averages: BrandAverage[];
  snapshot_count: number;
  last_updated: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    const db = getDb();

    // UK average for petrol and diesel from last 24h
    const avgStmt = db.prepare(`
      SELECT
        fuel_type,
        AVG(price_pence) as avg_price,
        COUNT(*) as count
      FROM price_snapshots
      WHERE recorded_at >= datetime('now', '-24 hours')
        AND fuel_type IN ('petrol', 'diesel')
      GROUP BY fuel_type
    `);

    const avgs = avgStmt.all() as Array<{
      fuel_type: string;
      avg_price: number;
      count: number;
    }>;

    const avgPetrolRow = avgs.find((r) => r.fuel_type === 'petrol');
    const avgDieselRow = avgs.find((r) => r.fuel_type === 'diesel');
    const ukAvgPetrol = avgPetrolRow ? Math.round(avgPetrolRow.avg_price * 10) / 10 : null;
    const ukAvgDiesel = avgDieselRow ? Math.round(avgDieselRow.avg_price * 10) / 10 : null;
    const snapshotCount = avgs.reduce((sum, r) => sum + r.count, 0);

    // 7-day trend: compare today's average to 7 days ago
    const trendStmt = db.prepare(`
      SELECT
        fuel_type,
        AVG(price_pence) as avg_price
      FROM price_snapshots
      WHERE recorded_at >= datetime('now', '-8 days')
        AND recorded_at < datetime('now', '-7 days')
        AND fuel_type IN ('petrol', 'diesel')
      GROUP BY fuel_type
    `);

    const weekAgoAvgs = trendStmt.all() as Array<{
      fuel_type: string;
      avg_price: number;
    }>;

    const weekAgoPetrol = weekAgoAvgs.find((r) => r.fuel_type === 'petrol');
    const weekAgoDiesel = weekAgoAvgs.find((r) => r.fuel_type === 'diesel');

    const petrolTrend =
      ukAvgPetrol !== null && weekAgoPetrol
        ? Math.round((ukAvgPetrol - weekAgoPetrol.avg_price) * 10) / 10
        : null;
    const dieselTrend =
      ukAvgDiesel !== null && weekAgoDiesel
        ? Math.round((ukAvgDiesel - weekAgoDiesel.avg_price) * 10) / 10
        : null;

    // Per-brand averages — station_name starts with brand name for our data
    // We use the first word of station_name as a brand proxy
    const brandStmt = db.prepare(`
      SELECT
        substr(station_name, 1, instr(station_name || ' ', ' ') - 1) as brand,
        fuel_type,
        AVG(price_pence) as avg_price,
        COUNT(DISTINCT station_id) as station_count
      FROM price_snapshots
      WHERE recorded_at >= datetime('now', '-24 hours')
        AND fuel_type IN ('petrol', 'diesel')
      GROUP BY brand, fuel_type
      ORDER BY brand, fuel_type
    `);

    const brandRows = brandStmt.all() as Array<{
      brand: string;
      fuel_type: string;
      avg_price: number;
      station_count: number;
    }>;

    // Merge petrol and diesel rows by brand
    const brandMap = new Map<string, BrandAverage>();
    for (const row of brandRows) {
      if (!row.brand) continue;
      const entry = brandMap.get(row.brand) ?? {
        brand: row.brand,
        avg_petrol: null,
        avg_diesel: null,
        station_count: row.station_count,
      };
      if (row.fuel_type === 'petrol') {
        entry.avg_petrol = Math.round(row.avg_price * 10) / 10;
      } else if (row.fuel_type === 'diesel') {
        entry.avg_diesel = Math.round(row.avg_price * 10) / 10;
      }
      entry.station_count = Math.max(entry.station_count, row.station_count);
      brandMap.set(row.brand, entry);
    }

    // Sort by cheapest petrol first
    const brandAverages = Array.from(brandMap.values()).sort(
      (a, b) => (a.avg_petrol ?? 999) - (b.avg_petrol ?? 999)
    );

    const response: StatsResponse = {
      uk_avg_petrol: ukAvgPetrol,
      uk_avg_diesel: ukAvgDiesel,
      petrol_trend_7d: petrolTrend,
      diesel_trend_7d: dieselTrend,
      brand_averages: brandAverages,
      snapshot_count: snapshotCount,
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json(
      { error: 'Failed to compute stats' },
      { status: 500 }
    );
  }
}
