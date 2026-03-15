import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { PriceSnapshot, PriceHistoryPoint } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'prices.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Create schema
  _db.exec(`
    CREATE TABLE IF NOT EXISTS price_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL,
      station_name TEXT NOT NULL,
      fuel_type TEXT NOT NULL,
      price_pence REAL NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_station_id ON price_snapshots(station_id);
    CREATE INDEX IF NOT EXISTS idx_recorded_at ON price_snapshots(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_fuel_type ON price_snapshots(fuel_type);

    CREATE TABLE IF NOT EXISTS uk_average_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fuel_type TEXT NOT NULL,
      price_pence REAL NOT NULL,
      source TEXT,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return _db;
}

export function savePriceSnapshot(snapshot: Omit<PriceSnapshot, 'id'>): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO price_snapshots (station_id, station_name, fuel_type, price_pence, lat, lng, recorded_at)
    VALUES (@station_id, @station_name, @fuel_type, @price_pence, @lat, @lng, @recorded_at)
  `);
  stmt.run({
    ...snapshot,
    recorded_at: snapshot.recorded_at || new Date().toISOString(),
  });
}

export function savePriceSnapshotsBatch(snapshots: Omit<PriceSnapshot, 'id'>[]): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO price_snapshots (station_id, station_name, fuel_type, price_pence, lat, lng, recorded_at)
    VALUES (@station_id, @station_name, @fuel_type, @price_pence, @lat, @lng, @recorded_at)
  `);

  const insertMany = db.transaction((items: Omit<PriceSnapshot, 'id'>[]) => {
    for (const item of items) {
      stmt.run({
        ...item,
        recorded_at: item.recorded_at || new Date().toISOString(),
      });
    }
  });

  insertMany(snapshots);
}

export function getPriceHistory(stationId: string, days: number = 30): PriceHistoryPoint[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      date(recorded_at) as date,
      AVG(price_pence) as price_pence,
      station_name
    FROM price_snapshots
    WHERE station_id = ?
      AND recorded_at >= datetime('now', ? || ' days')
    GROUP BY date(recorded_at), station_name
    ORDER BY date ASC
  `);

  const rows = stmt.all(stationId, `-${days}`) as Array<{
    date: string;
    price_pence: number;
    station_name: string;
  }>;

  return rows.map((row) => ({
    date: row.date,
    price_pence: Math.round(row.price_pence * 10) / 10,
    station_name: row.station_name,
  }));
}

export function getUKAveragePriceHistory(fuelType: string, days: number = 30): PriceHistoryPoint[] {
  const db = getDb();

  // Try uk_average_prices table first
  const avgStmt = db.prepare(`
    SELECT
      date(recorded_at) as date,
      AVG(price_pence) as price_pence,
      'UK Average' as station_name
    FROM uk_average_prices
    WHERE fuel_type = ?
      AND recorded_at >= datetime('now', ? || ' days')
    GROUP BY date(recorded_at)
    ORDER BY date ASC
  `);

  const avgRows = avgStmt.all(fuelType, `-${days}`) as Array<{
    date: string;
    price_pence: number;
    station_name: string;
  }>;

  if (avgRows.length > 0) {
    return avgRows.map((row) => ({
      date: row.date,
      price_pence: Math.round(row.price_pence * 10) / 10,
      station_name: 'UK Average',
    }));
  }

  // Fall back to computing average from all stations
  const fallbackStmt = db.prepare(`
    SELECT
      date(recorded_at) as date,
      AVG(price_pence) as price_pence,
      'UK Average' as station_name
    FROM price_snapshots
    WHERE fuel_type = ?
      AND recorded_at >= datetime('now', ? || ' days')
    GROUP BY date(recorded_at)
    ORDER BY date ASC
  `);

  const rows = fallbackStmt.all(fuelType, `-${days}`) as Array<{
    date: string;
    price_pence: number;
    station_name: string;
  }>;

  return rows.map((row) => ({
    date: row.date,
    price_pence: Math.round(row.price_pence * 10) / 10,
    station_name: 'UK Average',
  }));
}

export function saveUKAverage(fuelType: string, pricePence: number, source: string): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO uk_average_prices (fuel_type, price_pence, source, recorded_at)
    VALUES (?, ?, ?, datetime('now'))
  `);
  stmt.run(fuelType, pricePence, source);
}

export function getLatestPriceForStation(stationId: string, fuelType: string): number | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT price_pence FROM price_snapshots
    WHERE station_id = ? AND fuel_type = ?
    ORDER BY recorded_at DESC
    LIMIT 1
  `);
  const row = stmt.get(stationId, fuelType) as { price_pence: number } | undefined;
  return row ? row.price_pence : null;
}

export function getAllStationsWithRecentPrices(): Array<{
  station_id: string;
  station_name: string;
  lat: number;
  lng: number;
  latest_price: number;
  fuel_type: string;
}> {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      station_id,
      station_name,
      lat,
      lng,
      price_pence as latest_price,
      fuel_type
    FROM price_snapshots
    WHERE recorded_at = (
      SELECT MAX(recorded_at) FROM price_snapshots p2
      WHERE p2.station_id = price_snapshots.station_id
        AND p2.fuel_type = price_snapshots.fuel_type
    )
    ORDER BY station_name
  `);

  return stmt.all() as Array<{
    station_id: string;
    station_name: string;
    lat: number;
    lng: number;
    latest_price: number;
    fuel_type: string;
  }>;
}
