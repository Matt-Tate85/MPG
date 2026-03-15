// CMA Fuel Finder API integration
// UK Government mandatory fuel price scheme (live Feb 2026)
// All ~8,300 forecourts must publish prices every 30 minutes
// Data aggregated by VE3 Global Ltd via api.data.gov.uk

import type { FuelStation, Location } from './types';

// The primary resource ID for the CMA fuel price transparency data
const CMA_RESOURCE_ID = 'e7a1ddef-3cf0-49f4-a023-a4b02f5e4a65';
const CMA_BASE_URL = 'https://api.data.gov.uk/v1/datastore/search';

// Haversine distance in miles
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Raw CMA record shape from the API
interface CMARecord {
  site_id?: string;
  brand?: string;
  postcode?: string;
  latitude?: string | number;
  longitude?: string | number;
  // Fuel codes
  E10?: string | number; // Petrol (E10, standard unleaded)
  B7?: string | number;  // Diesel (B7)
  E5?: string | number;  // Super unleaded (E5)
  SDV?: string | number; // Super diesel (V-Power Diesel etc.)
  // Alternative field names observed in the wild
  unleaded?: string | number;
  diesel?: string | number;
  [key: string]: unknown;
}

// Transform a CMA API record to our FuelStation type
function transformCMARecord(record: CMARecord, index: number): FuelStation | null {
  const lat = parseFloat(String(record.latitude ?? ''));
  const lng = parseFloat(String(record.longitude ?? ''));

  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

  const parsePence = (val: string | number | undefined): number | undefined => {
    if (val === undefined || val === null || val === '') return undefined;
    const n = parseFloat(String(val));
    if (isNaN(n) || n <= 0) return undefined;
    // CMA reports in pence per litre (e.g. 143.9)
    // If value looks like it's in £ (e.g. 1.439) multiply by 100
    return n < 10 ? Math.round(n * 1000) / 10 : Math.round(n * 10) / 10;
  };

  const petrol = parsePence(record.E10 ?? record.unleaded);
  const diesel = parsePence(record.B7 ?? record.diesel);
  const superUnleaded = parsePence(record.E5);
  const superDiesel = parsePence(record.SDV);

  // At least one price must be present to be useful
  if (!petrol && !diesel && !superUnleaded && !superDiesel) return null;

  const brand = String(record.brand || 'Unknown');
  const postcode = String(record.postcode || '');

  return {
    id: `cma-${record.site_id || index}`,
    name: `${brand} ${postcode}`.trim(),
    brand,
    address: postcode,
    lat,
    lng,
    petrol_pence: petrol,
    diesel_pence: diesel,
    super_unleaded_pence: superUnleaded,
    last_updated: new Date().toISOString(),
    isDemoData: false,
  };
}

interface CMAApiResponse {
  result?: {
    records?: CMARecord[];
    total?: number;
  };
  success?: boolean;
}

// Build request headers, optionally including an API key for higher rate limits
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'UK-Fuel-EV-Tracker/1.0',
    Accept: 'application/json',
  };
  const apiKey = process.env.CMA_API_KEY;
  if (apiKey) {
    headers['Authorization'] = `apikey ${apiKey}`;
  }
  return headers;
}

/**
 * Fetch CMA fuel stations near a given lat/lng within a radius (miles).
 * The CMA API doesn't support geo-filtering natively so we fetch a large
 * batch and filter client-side.
 */
export async function fetchCMAStationsNear(
  lat: number,
  lng: number,
  radius: number = 10
): Promise<FuelStation[]> {
  try {
    // Request a large batch — the API supports up to 32000 records per call
    const params = new URLSearchParams({
      resource_id: CMA_RESOURCE_ID,
      limit: '5000',
    });

    const url = `${CMA_BASE_URL}?${params.toString()}`;

    const response = await fetch(url, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 1800 }, // Cache for 30 minutes (matches CMA update frequency)
    });

    if (!response.ok) {
      console.warn(`CMA API returned ${response.status}`);
      return [];
    }

    const data: CMAApiResponse = await response.json();

    if (!data.success || !data.result?.records) {
      console.warn('CMA API response missing records');
      return [];
    }

    const records = data.result.records;

    const stations: FuelStation[] = records
      .map((r, i) => transformCMARecord(r, i))
      .filter((s): s is FuelStation => s !== null)
      .map((s) => ({
        ...s,
        distance_miles: haversineDistance(lat, lng, s.lat, s.lng),
      }))
      .filter((s) => (s.distance_miles ?? Infinity) <= radius)
      .sort((a, b) => (a.distance_miles ?? 0) - (b.distance_miles ?? 0));

    return stations;
  } catch (err) {
    console.warn('CMA API fetch failed:', err);
    return [];
  }
}

export interface CMANationalStats {
  avgPetrol: number | null;
  avgDiesel: number | null;
  avgSuperUnleaded: number | null;
  totalStations: number;
  fetchedAt: string;
}

/**
 * Fetch national average prices from the CMA API by sampling the full dataset.
 */
export async function fetchCMANationalStats(): Promise<CMANationalStats> {
  const empty: CMANationalStats = {
    avgPetrol: null,
    avgDiesel: null,
    avgSuperUnleaded: null,
    totalStations: 0,
    fetchedAt: new Date().toISOString(),
  };

  try {
    // Fetch a representative sample (first 2000 records)
    const params = new URLSearchParams({
      resource_id: CMA_RESOURCE_ID,
      limit: '2000',
    });

    const url = `${CMA_BASE_URL}?${params.toString()}`;

    const response = await fetch(url, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 1800 },
    });

    if (!response.ok) return empty;

    const data: CMAApiResponse = await response.json();
    if (!data.success || !data.result?.records) return empty;

    const records = data.result.records;
    const stations = records
      .map((r, i) => transformCMARecord(r, i))
      .filter((s): s is FuelStation => s !== null);

    const petrolPrices = stations.map((s) => s.petrol_pence).filter((p): p is number => p !== undefined);
    const dieselPrices = stations.map((s) => s.diesel_pence).filter((p): p is number => p !== undefined);
    const superPrices = stations.map((s) => s.super_unleaded_pence).filter((p): p is number => p !== undefined);

    const avg = (arr: number[]) =>
      arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

    return {
      avgPetrol: avg(petrolPrices),
      avgDiesel: avg(dieselPrices),
      avgSuperUnleaded: avg(superPrices),
      totalStations: data.result.total ?? stations.length,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('CMA national stats fetch failed:', err);
    return empty;
  }
}

// Re-export location type for convenience
export type { Location };
