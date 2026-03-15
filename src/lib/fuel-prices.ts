import type { FuelStation, Location } from './types';
import { savePriceSnapshotsBatch, saveUKAverage } from './db';

// Public price feed URLs - these are attempted first, fallback to demo data if unavailable
const ASDA_URL = (lat: number, lng: number) =>
  `https://storelocator.asda.com/storelocator/v1/stores?format=json&radius=50&lat=${lat}&lon=${lng}&unit=km`;

// Tesco location search endpoint
const TESCO_URL =
  'https://api.tesco.com/tescolocation/v3/storeLocationSearch?offset=0&limit=50&types=fuel';

// CMA fuel price transparency data - users can register at
// https://www.gov.uk/government/publications/cma-fuel-price-transparency-scheme
// OPIS UK also provides this data feed for registered users

// Haversine formula for distance calculation
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
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

// Try to fetch Asda fuel prices
async function fetchAsdaPrices(location: Location): Promise<FuelStation[] | null> {
  try {
    const url = ASDA_URL(location.lat, location.lng);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'UK-Fuel-EV-Tracker/1.0' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const stores = data?.stores || data?.results || [];

    if (!Array.isArray(stores) || stores.length === 0) return null;

    return stores
      .filter((s: Record<string, unknown>) => s.hasFuel || s.fuel)
      .map((s: Record<string, unknown>, idx: number) => {
        const coords = (s.location as Record<string, number>) || {};
        const prices = (s.fuelPrices as Record<string, number>) || (s.fuel as Record<string, number>) || {};
        return {
          id: `asda-${s.storeId || s.id || idx}`,
          name: `Asda ${s.storeName || s.name || 'Petrol Station'}`,
          brand: 'Asda',
          address: [s.address1, s.town, s.postcode].filter(Boolean).join(', '),
          lat: coords.lat || (s.lat as number) || 0,
          lng: coords.lng || coords.lon || (s.lng as number) || 0,
          petrol_pence: prices.unleaded ? Math.round(prices.unleaded * 100) : undefined,
          diesel_pence: prices.diesel ? Math.round(prices.diesel * 100) : undefined,
          last_updated: new Date().toISOString(),
          isDemoData: false,
        } as FuelStation;
      })
      .filter((s) => s.lat !== 0 && s.lng !== 0);
  } catch {
    return null;
  }
}

// Try to fetch Tesco fuel prices
async function fetchTescoPrices(location: Location): Promise<FuelStation[] | null> {
  try {
    const url = `${TESCO_URL}&near=${location.lat},${location.lng}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UK-Fuel-EV-Tracker/1.0',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const locations = data?.results || data?.stores || [];

    if (!Array.isArray(locations) || locations.length === 0) return null;

    return locations
      .map((s: Record<string, unknown>, idx: number) => {
        const loc = (s.location as Record<string, unknown>) || s;
        const coords = (loc.geo as Record<string, number>) || {};
        const prices = (s.fuelPrices as Record<string, number>) || {};
        return {
          id: `tesco-${s.id || idx}`,
          name: `Tesco ${s.name || 'Petrol Station'}`,
          brand: 'Tesco',
          address: (s.address as string) || '',
          lat: coords.lat || (s.lat as number) || 0,
          lng: coords.lng || coords.lon || (s.lng as number) || 0,
          petrol_pence: prices.unleaded ? Math.round(prices.unleaded * 100) : undefined,
          diesel_pence: prices.diesel ? Math.round(prices.diesel * 100) : undefined,
          last_updated: new Date().toISOString(),
          isDemoData: false,
        } as FuelStation;
      })
      .filter((s) => s.lat !== 0 && s.lng !== 0);
  } catch {
    return null;
  }
}

// Generate realistic demo data around a location
function generateDemoData(location: Location): FuelStation[] {
  const now = new Date().toISOString();

  // Realistic UK fuel prices as of early 2025 (pence per litre)
  const brands = [
    { brand: 'BP', petrolBase: 143, dieselBase: 150 },
    { brand: 'Shell', petrolBase: 144, dieselBase: 151 },
    { brand: 'Esso', petrolBase: 142, dieselBase: 149 },
    { brand: 'Total', petrolBase: 141, dieselBase: 148 },
    { brand: 'Jet', petrolBase: 140, dieselBase: 147 },
    { brand: 'Texaco', petrolBase: 141, dieselBase: 148 },
    { brand: 'Gulf', petrolBase: 140, dieselBase: 147 },
    { brand: 'Tesco', petrolBase: 138, dieselBase: 145 },
    { brand: 'Asda', petrolBase: 137, dieselBase: 144 },
    { brand: 'Morrisons', petrolBase: 138, dieselBase: 145 },
    { brand: 'Sainsbury\'s', petrolBase: 139, dieselBase: 146 },
    { brand: 'Costco', petrolBase: 136, dieselBase: 143 },
  ];

  // Spread stations around the given location (within ~5 mile radius)
  const offsets = [
    { dlat: 0.02, dlng: 0.03, area: 'High Street' },
    { dlat: -0.015, dlng: 0.025, area: 'Retail Park' },
    { dlat: 0.035, dlng: -0.02, area: 'Ring Road' },
    { dlat: -0.03, dlng: -0.015, area: 'Industrial Estate' },
    { dlat: 0.01, dlng: -0.04, area: 'Town Centre' },
    { dlat: 0.05, dlng: 0.01, area: 'A Road' },
    { dlat: -0.04, dlng: 0.03, area: 'Bypass' },
    { dlat: 0.025, dlng: 0.05, area: 'Superstore' },
    { dlat: -0.01, dlng: -0.05, area: 'Service Station' },
    { dlat: 0.045, dlng: -0.035, area: 'Junction' },
    { dlat: -0.055, dlng: 0.015, area: 'North Road' },
    { dlat: 0.015, dlng: 0.065, area: 'East Retail' },
  ];

  return brands.map((b, i) => {
    const offset = offsets[i % offsets.length];
    // Add slight random variation to prices (±3p)
    const petrolVariation = Math.floor((Math.sin(i * 7) * 3));
    const dieselVariation = Math.floor((Math.sin(i * 11) * 3));

    return {
      id: `demo-${b.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      name: `${b.brand} ${offset.area}`,
      brand: b.brand,
      address: `${offset.area}, Near You`,
      lat: location.lat + offset.dlat,
      lng: location.lng + offset.dlng,
      petrol_pence: b.petrolBase + petrolVariation,
      diesel_pence: b.dieselBase + dieselVariation,
      last_updated: now,
      isDemoData: true,
    };
  });
}

// Store prices in database for history tracking
async function storePricesInDb(stations: FuelStation[]): Promise<void> {
  try {
    const now = new Date().toISOString();
    const snapshots = [];

    for (const station of stations) {
      if (station.petrol_pence) {
        snapshots.push({
          station_id: station.id,
          station_name: station.name,
          fuel_type: 'petrol',
          price_pence: station.petrol_pence,
          lat: station.lat,
          lng: station.lng,
          recorded_at: now,
        });
      }
      if (station.diesel_pence) {
        snapshots.push({
          station_id: station.id,
          station_name: station.name,
          fuel_type: 'diesel',
          price_pence: station.diesel_pence,
          lat: station.lat,
          lng: station.lng,
          recorded_at: now,
        });
      }
    }

    if (snapshots.length > 0) {
      savePriceSnapshotsBatch(snapshots);
    }
  } catch (error) {
    console.error('Failed to store prices in DB:', error);
  }
}

// Calculate UK average from stations and store it
async function updateUKAverage(stations: FuelStation[]): Promise<void> {
  try {
    const petrolPrices = stations.filter((s) => s.petrol_pence).map((s) => s.petrol_pence!);
    const dieselPrices = stations.filter((s) => s.diesel_pence).map((s) => s.diesel_pence!);

    if (petrolPrices.length > 0) {
      const avgPetrol = petrolPrices.reduce((a, b) => a + b, 0) / petrolPrices.length;
      saveUKAverage('petrol', Math.round(avgPetrol * 10) / 10, 'computed');
    }

    if (dieselPrices.length > 0) {
      const avgDiesel = dieselPrices.reduce((a, b) => a + b, 0) / dieselPrices.length;
      saveUKAverage('diesel', Math.round(avgDiesel * 10) / 10, 'computed');
    }
  } catch (error) {
    console.error('Failed to update UK average:', error);
  }
}

export interface FuelPriceResult {
  stations: FuelStation[];
  isDemoData: boolean;
  fetchedAt: string;
  location: Location;
}

export async function getFuelPrices(location: Location, radius: number = 10): Promise<FuelPriceResult> {
  const fetchedAt = new Date().toISOString();
  let stations: FuelStation[] | null = null;
  let isDemoData = false;

  // Try Asda first
  try {
    stations = await fetchAsdaPrices(location);
  } catch {
    // continue
  }

  // Try Tesco if Asda failed
  if (!stations || stations.length === 0) {
    try {
      const tescoStations = await fetchTescoPrices(location);
      if (tescoStations && tescoStations.length > 0) {
        stations = tescoStations;
      }
    } catch {
      // continue
    }
  }

  // Fall back to demo data
  if (!stations || stations.length === 0) {
    stations = generateDemoData(location);
    isDemoData = true;
  }

  // Filter to radius and add distances
  const stationsWithDistance = stations
    .map((s) => ({
      ...s,
      distance_miles: haversineDistance(location.lat, location.lng, s.lat, s.lng),
    }))
    .filter((s) => s.distance_miles <= radius)
    .sort((a, b) => a.distance_miles - b.distance_miles);

  // Store in database for history (async, don't await)
  storePricesInDb(stationsWithDistance).catch(console.error);
  updateUKAverage(stationsWithDistance).catch(console.error);

  return {
    stations: stationsWithDistance,
    isDemoData,
    fetchedAt,
    location,
  };
}
