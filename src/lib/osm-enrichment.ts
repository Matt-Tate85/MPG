/**
 * OSM Overpass API enrichment for fuel station shop/amenity data.
 * Enriches FuelStation records with attached retailer brands, food outlets,
 * and facility details sourced from OpenStreetMap tags.
 */

import type { FuelStation, StationFacilities } from './types';

// ---------------------------------------------------------------------------
// Brand detection lists
// ---------------------------------------------------------------------------

const SUPERMARKET_EXPRESS = [
  "Sainsbury's Local",
  'Tesco Express',
  'M&S Simply Food',
  'ASDA',
  'Morrisons Daily',
  'Waitrose',
  'Co-op',
  'Spar',
  'Londis',
  'Nisa',
  'Budgens',
  'One Stop',
  'Premier',
  "McColl's",
  'Costcutter',
];

const FOOD_BRANDS = [
  "McDonald's",
  'Greggs',
  'Subway',
  'KFC',
  'Burger King',
  'WHSmith',
  'Boots',
];

const COFFEE_BRANDS = [
  'Costa Express',
  'Costa',
  'Starbucks',
  'Caffè Nero',
  'Wild Bean Cafe',
];

// ---------------------------------------------------------------------------
// In-memory cache (24 hours)
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const enrichmentCache = new Map<string, CacheEntry<FuelStation[]>>();
const osmStationsCache = new Map<string, CacheEntry<FuelStation[]>>();

function cacheKey(lat: number, lng: number, radius?: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)},${radius ?? 0}`;
}

function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

// ---------------------------------------------------------------------------
// OSM tag parsing helpers
// ---------------------------------------------------------------------------

interface OsmTags {
  [key: string]: string | undefined;
}

function detectShopBrand(tags: OsmTags): string | undefined {
  const searchFields = [
    tags.name,
    tags.brand,
    tags.operator,
    tags['brand:name'],
    tags['operator:name'],
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const brand of SUPERMARKET_EXPRESS) {
    if (searchFields.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  // Also check the composite station name patterns like "BP Spar", "Shell Londis"
  const stationName = (tags.name || '').toLowerCase();
  for (const brand of SUPERMARKET_EXPRESS) {
    if (stationName.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return undefined;
}

function detectFoodBrand(tags: OsmTags): string | undefined {
  const searchFields = [tags.name, tags.brand, tags.operator, tags.cuisine]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const brand of FOOD_BRANDS) {
    if (searchFields.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return undefined;
}

function detectCoffeeBrand(tags: OsmTags): string | undefined {
  const searchFields = [tags.name, tags.brand, tags.operator]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const brand of COFFEE_BRANDS) {
    if (searchFields.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return undefined;
}

function parseFacilities(tags: OsmTags): Partial<StationFacilities> {
  const facilities: Partial<StationFacilities> = {};

  // Car wash
  if (tags['amenity:car_wash'] === 'yes' || tags.car_wash === 'yes') {
    facilities.car_wash = true;
  }

  // Shop
  if (tags.shop || tags['amenity:shop'] === 'yes' || tags['service:shop'] === 'yes') {
    facilities.shop = true;
  }

  // Coffee
  if (
    tags['amenity:cafe'] === 'yes' ||
    tags.cafe === 'yes' ||
    tags['service:coffee'] === 'yes' ||
    (tags.name || '').toLowerCase().includes('coffee') ||
    (tags.name || '').toLowerCase().includes('costa') ||
    (tags.name || '').toLowerCase().includes('starbucks')
  ) {
    facilities.coffee = true;
  }

  // Air pump
  if (tags['amenity:compressed_air'] === 'yes' || tags.compressed_air === 'yes') {
    facilities.air_pump = true;
  }

  // Toilets
  if (tags['amenity:toilets'] === 'yes' || tags.toilets === 'yes' || tags['service:toilet'] === 'yes') {
    facilities.toilets = true;
  }

  // HGV
  if (
    tags.hgv === 'yes' ||
    tags.hgv === 'designated' ||
    tags['hgv:lanes'] ||
    tags['service:hgv_diesel'] === 'yes'
  ) {
    facilities.hgv_access = true;
  }

  // AdBlue
  if (tags['fuel:adblue'] === 'yes' || tags.adblue === 'yes') {
    facilities.adblue = true;
  }

  // ATM
  if (tags['amenity:atm'] === 'yes' || tags.atm === 'yes') {
    facilities.atm = true;
  }

  // Open 24h
  if (
    tags.opening_hours === '24/7' ||
    tags['opening_hours:fuel'] === '24/7' ||
    tags['service:24_7'] === 'yes'
  ) {
    facilities.open_24h = true;
  }

  // Attached shop brands
  const shopBrand = detectShopBrand(tags);
  if (shopBrand) {
    facilities.shop_brand = shopBrand;
    facilities.shop = true;
  }

  const foodBrand = detectFoodBrand(tags);
  if (foodBrand) {
    facilities.food_brand = foodBrand;
  }

  const coffeeBrand = detectCoffeeBrand(tags);
  if (coffeeBrand) {
    facilities.coffee_brand = coffeeBrand;
    facilities.coffee = true;
  }

  return facilities;
}

// ---------------------------------------------------------------------------
// Distance helpers
// ---------------------------------------------------------------------------

function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000; // Earth radius in metres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// OSM API response types
// ---------------------------------------------------------------------------

interface OsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OsmTags;
}

interface OverpassResponse {
  elements: OsmElement[];
}

// ---------------------------------------------------------------------------
// Build Overpass query for multiple station locations
// ---------------------------------------------------------------------------

function buildEnrichmentQuery(stations: FuelStation[]): string {
  // Query all fuel nodes/ways within a bounding box that covers all stations
  if (stations.length === 0) return '';

  const lats = stations.map((s) => s.lat);
  const lngs = stations.map((s) => s.lng);
  const minLat = Math.min(...lats) - 0.005;
  const maxLat = Math.max(...lats) + 0.005;
  const minLng = Math.min(...lngs) - 0.005;
  const maxLng = Math.max(...lngs) + 0.005;

  return `[out:json][timeout:30];
(
  node["amenity"="fuel"](${minLat},${minLng},${maxLat},${maxLng});
  way["amenity"="fuel"](${minLat},${minLng},${maxLat},${maxLng});
);
out tags center;`;
}

// ---------------------------------------------------------------------------
// Main enrichment function
// ---------------------------------------------------------------------------

export async function enrichStationsWithOSMData(stations: FuelStation[]): Promise<FuelStation[]> {
  if (stations.length === 0) return stations;

  // Check cache using first station as representative key
  const key = cacheKey(stations[0].lat, stations[0].lng, stations.length);
  const cached = enrichmentCache.get(key);
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  const query = buildEnrichmentQuery(stations);
  if (!query) return stations;

  let osmElements: OsmElement[] = [];

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(35_000),
    });

    if (!response.ok) {
      console.warn('[OSM] Overpass API returned', response.status);
      return stations;
    }

    const data: OverpassResponse = await response.json();
    osmElements = data.elements || [];
  } catch (err) {
    console.warn('[OSM] Failed to fetch Overpass data:', err);
    return stations;
  }

  // Build a list of OSM elements with coordinates
  const osmWithCoords = osmElements
    .map((el) => ({
      el,
      lat: el.lat ?? el.center?.lat ?? null,
      lng: el.lon ?? el.center?.lon ?? null,
    }))
    .filter((e): e is { el: OsmElement; lat: number; lng: number } => e.lat !== null && e.lng !== null);

  // Match each station to the nearest OSM element within 100m
  const enriched = stations.map((station) => {
    let nearest: (typeof osmWithCoords)[number] | null = null;
    let nearestDist = Infinity;

    for (const osm of osmWithCoords) {
      const dist = haversineMetres(station.lat, station.lng, osm.lat, osm.lng);
      if (dist < nearestDist && dist <= 100) {
        nearest = osm;
        nearestDist = dist;
      }
    }

    if (!nearest || !nearest.el.tags) return station;

    const osmFacilities = parseFacilities(nearest.el.tags);
    const existingFacilities = station.facilities ?? {
      car_wash: false,
      shop: false,
      coffee: false,
      air_pump: false,
      toilets: false,
      hgv_access: false,
      adblue: false,
      atm: false,
      open_24h: false,
    };

    return {
      ...station,
      facilities: {
        ...existingFacilities,
        ...osmFacilities,
      },
    };
  });

  // Cache the result
  enrichmentCache.set(key, { data: enriched, timestamp: Date.now() });
  return enriched;
}

// ---------------------------------------------------------------------------
// Get fuel stations directly from OSM (for filling gaps in CMA data)
// ---------------------------------------------------------------------------

export async function getOSMStationsNear(
  lat: number,
  lng: number,
  radius: number
): Promise<FuelStation[]> {
  const key = cacheKey(lat, lng, radius);
  const cached = osmStationsCache.get(key);
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  const query = `[out:json][timeout:30];
(
  node["amenity"="fuel"](around:${radius},${lat},${lng});
  way["amenity"="fuel"](around:${radius},${lat},${lng});
);
out tags center;`;

  let osmElements: OsmElement[] = [];

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(35_000),
    });

    if (!response.ok) {
      console.warn('[OSM] Overpass API returned', response.status);
      return [];
    }

    const data: OverpassResponse = await response.json();
    osmElements = data.elements || [];
  } catch (err) {
    console.warn('[OSM] Failed to fetch Overpass stations:', err);
    return [];
  }

  const stations: FuelStation[] = osmElements
    .flatMap((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (!elLat || !elLng) return [];

      const tags = el.tags ?? {};
      const name =
        tags.name ||
        tags.brand ||
        tags.operator ||
        'Unknown Station';
      const brand = tags.brand || tags.operator || '';
      const address = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city'],
        tags['addr:postcode'],
      ]
        .filter(Boolean)
        .join(', ');

      const facilities = parseFacilities(tags);
      const distMetres = haversineMetres(lat, lng, elLat, elLng);
      const distMiles = distMetres / 1609.344;

      return {
        id: `osm-${el.type}-${el.id}`,
        name,
        brand,
        address: address || 'Address unknown',
        lat: elLat,
        lng: elLng,
        distance_miles: Math.round(distMiles * 10) / 10,
        facilities: {
          car_wash: false,
          shop: false,
          coffee: false,
          air_pump: false,
          toilets: false,
          hgv_access: false,
          adblue: false,
          atm: false,
          open_24h: false,
          ...facilities,
        },
      } satisfies FuelStation;
    })
    .sort((a, b) => (a.distance_miles ?? 0) - (b.distance_miles ?? 0));

  osmStationsCache.set(key, { data: stations, timestamp: Date.now() });
  return stations;
}
