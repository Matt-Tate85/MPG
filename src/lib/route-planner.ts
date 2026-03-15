// Route planner utilities using OSRM for routing and station corridor filtering

import type { FuelStation, Location } from './types';

// Haversine distance in miles between two points
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

interface OSRMStep {
  geometry?: string;
}

interface OSRMLeg {
  steps?: OSRMStep[];
}

interface OSRMRoute {
  geometry: {
    coordinates: [number, number][]; // [lng, lat]
  };
  legs?: OSRMLeg[];
  distance?: number; // metres
  duration?: number; // seconds
}

interface OSRMResponse {
  code: string;
  routes?: OSRMRoute[];
}

/**
 * Fetch the route geometry from OSRM between two points.
 * Returns an array of [lat, lng] waypoints along the route.
 */
export async function fetchRouteGeometry(
  from: Location,
  to: Location
): Promise<Location[]> {
  try {
    // Public OSRM demo server — for production use a self-hosted instance
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=false`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'UK-Fuel-EV-Tracker/1.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`OSRM returned ${response.status}`);
      return [];
    }

    const data: OSRMResponse = await response.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      console.warn('OSRM no route found');
      return [];
    }

    const coords = data.routes[0].geometry.coordinates;
    // OSRM returns [lng, lat] — convert to Location {lat, lng}
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch (err) {
    console.warn('OSRM fetch failed:', err);
    return [];
  }
}

/**
 * Given a route as an array of waypoints, find the minimum distance (in miles)
 * from a given point to any segment of the route.
 *
 * Uses a simple nearest-waypoint approach (checks distance to each waypoint).
 * Sufficient for corridor widths of 1–5 miles.
 */
function minDistanceToRoute(point: Location, routePoints: Location[]): number {
  if (routePoints.length === 0) return Infinity;

  let minDist = Infinity;
  for (const wp of routePoints) {
    const d = haversineDistance(point.lat, point.lng, wp.lat, wp.lng);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/**
 * Given a start and end location, fetch the route from OSRM and return
 * fuel stations within corridorMiles of any point on the route,
 * sorted by petrol price (cheapest first).
 */
export async function findCheapestAlongRoute(
  from: Location,
  to: Location,
  stations: FuelStation[],
  corridorMiles: number = 1
): Promise<FuelStation[]> {
  const routePoints = await fetchRouteGeometry(from, to);

  if (routePoints.length === 0) {
    // Fallback: use a straight-line bounding box if OSRM is unavailable
    const minLat = Math.min(from.lat, to.lat);
    const maxLat = Math.max(from.lat, to.lat);
    const minLng = Math.min(from.lng, to.lng);
    const maxLng = Math.max(from.lng, to.lng);

    // Add rough padding (~1 mile ≈ 0.015 degrees)
    const pad = (corridorMiles * 0.015);
    return stations
      .filter(
        (s) =>
          s.lat >= minLat - pad &&
          s.lat <= maxLat + pad &&
          s.lng >= minLng - pad &&
          s.lng <= maxLng + pad
      )
      .sort((a, b) => (a.petrol_pence ?? 999) - (b.petrol_pence ?? 999));
  }

  // Sample every Nth point to avoid O(n*m) slowness with large routes
  // Keep at most 500 sample points
  const step = Math.max(1, Math.floor(routePoints.length / 500));
  const sampledRoute = routePoints.filter((_, i) => i % step === 0);

  const nearRoute = stations
    .map((s) => ({
      ...s,
      distToRoute: minDistanceToRoute({ lat: s.lat, lng: s.lng }, sampledRoute),
    }))
    .filter((s) => s.distToRoute <= corridorMiles)
    .sort((a, b) => (a.petrol_pence ?? 999) - (b.petrol_pence ?? 999));

  return nearRoute;
}

export type { Location };
