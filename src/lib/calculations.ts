import type { WorthItInput, WorthItResult } from './types';

/**
 * Calculate whether it's worth making a detour to a cheaper fuel station.
 *
 * Formula:
 * extra_distance_miles = (far_distance - near_distance) * 2 (round trip detour)
 * fuel_for_detour_litres = (extra_distance_miles / car_mpg) * 4.546
 * cost_of_detour_gbp = fuel_for_detour_litres * near_price_pence / 100
 * savings_per_litre_pence = near_price_pence - far_price_pence
 * savings_on_fill_gbp = (savings_per_litre_pence / 100) * planned_fill_litres
 * net_saving_gbp = savings_on_fill_gbp - cost_of_detour_gbp
 * time_extra_minutes = (extra_distance_miles / 30) * 60  // assume 30mph average
 */
export function calculateWorthIt(input: WorthItInput): WorthItResult {
  const {
    near_station_price_pence,
    near_station_distance_miles,
    far_station_price_pence,
    far_station_distance_miles,
    planned_fill_litres,
    car_mpg,
  } = input;

  // The "far" station should be cheaper, otherwise there's no reason to go
  const priceDiff = near_station_price_pence - far_station_price_pence;

  // Extra distance is the detour - driving past the near station to the far one and back
  // We assume: you'd normally go to the near station (extra = 0).
  // Going to far station = (far_distance - near_distance) extra each way = *2 for round trip
  const extraDistanceOneWay = Math.max(0, far_station_distance_miles - near_station_distance_miles);
  const extra_distance_miles = extraDistanceOneWay * 2;

  // Fuel used for the detour (in litres, using 4.546 litres per gallon)
  const LITRES_PER_GALLON = 4.546;
  const fuel_for_detour_litres =
    car_mpg > 0 ? (extra_distance_miles / car_mpg) * LITRES_PER_GALLON : 0;

  // Cost of that extra fuel at the near (cheaper so far) station's price
  const cost_of_detour_gbp = (fuel_for_detour_litres * near_station_price_pence) / 100;

  // Savings from filling at the far (cheaper) station vs near station
  const savings_per_litre_pence = Math.max(0, priceDiff);
  const savings_on_fill_gbp = (savings_per_litre_pence / 100) * planned_fill_litres;

  // Net saving = savings from cheaper price minus cost of getting there
  const net_saving_gbp = savings_on_fill_gbp - cost_of_detour_gbp;

  // Time penalty: assume 30mph average for extra distance (both ways)
  const time_extra_minutes = (extra_distance_miles / 30) * 60;

  const worth_it = net_saving_gbp > 0;

  let verdict: string;
  if (priceDiff <= 0) {
    verdict = 'The nearby station is already cheaper or the same price - no need to travel further.';
  } else if (net_saving_gbp > 5) {
    verdict = `Definitely worth it! You save £${net_saving_gbp.toFixed(2)} by driving ${extra_distance_miles.toFixed(1)} extra miles (${Math.round(time_extra_minutes)} min).`;
  } else if (net_saving_gbp > 2) {
    verdict = `Probably worth it. Net saving of £${net_saving_gbp.toFixed(2)} for ${extra_distance_miles.toFixed(1)} extra miles (${Math.round(time_extra_minutes)} min).`;
  } else if (net_saving_gbp > 0) {
    verdict = `Marginally worth it (£${net_saving_gbp.toFixed(2)} saving), but consider your time (${Math.round(time_extra_minutes)} extra min).`;
  } else if (net_saving_gbp > -1) {
    verdict = `Borderline - you'd lose £${Math.abs(net_saving_gbp).toFixed(2)} on the detour. Probably not worth it.`;
  } else {
    verdict = `Not worth it. The detour would cost you £${Math.abs(net_saving_gbp).toFixed(2)} more than you'd save.`;
  }

  return {
    extra_distance_miles: Math.round(extra_distance_miles * 100) / 100,
    fuel_for_detour_litres: Math.round(fuel_for_detour_litres * 100) / 100,
    cost_of_detour_gbp: Math.round(cost_of_detour_gbp * 100) / 100,
    savings_per_litre_pence: Math.round(savings_per_litre_pence * 10) / 10,
    savings_on_fill_gbp: Math.round(savings_on_fill_gbp * 100) / 100,
    net_saving_gbp: Math.round(net_saving_gbp * 100) / 100,
    time_extra_minutes: Math.round(time_extra_minutes),
    worth_it,
    verdict,
  };
}

/**
 * Calculate effective cost per litre factoring in travel cost to reach the station.
 * Useful for sorting stations by true value.
 */
export function effectiveCostPerLitre(
  price_pence: number,
  distance_miles: number,
  car_mpg: number,
  planned_fill_litres: number
): number {
  const LITRES_PER_GALLON = 4.546;
  const travelLitres = car_mpg > 0 ? ((distance_miles * 2) / car_mpg) * LITRES_PER_GALLON : 0;
  const travelCostPence = travelLitres * price_pence;
  const fillCostPence = price_pence * planned_fill_litres;
  const totalCostPence = fillCostPence + travelCostPence;
  return totalCostPence / planned_fill_litres;
}

/**
 * Format a price in pence as a pounds-and-pence string.
 * e.g. 14250 pence → "£142.50" (per litre displayed as "142.5p")
 */
export function formatPricePence(pence: number): string {
  return `${pence.toFixed(1)}p`;
}

export function formatPriceGBP(gbp: number): string {
  return `£${Math.abs(gbp).toFixed(2)}`;
}

/**
 * Parse a UK postcode to approximate lat/lng using Nominatim
 */
export async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const cleaned = postcode.trim().toUpperCase().replace(/\s+/, ' ');
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleaned + ', UK')}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UK-Fuel-EV-Tracker/1.0 (contact@example.com)',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

/**
 * Get driving distance between two points using OSRM
 */
export async function getDrivingDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<{ distance_miles: number; duration_minutes: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'UK-Fuel-EV-Tracker/1.0' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const route = data?.routes?.[0];
    if (!route) return null;

    const METERS_PER_MILE = 1609.34;
    return {
      distance_miles: Math.round((route.distance / METERS_PER_MILE) * 100) / 100,
      duration_minutes: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}
