import type { EVCharger, EVConnection, Location } from './types';

const OCM_BASE_URL = 'https://api.openchargemap.io/v3/poi/';

// OCM connection type IDs to human-readable names
const CONNECTION_TYPES: Record<number, string> = {
  1: 'Type 1 (J1772)',
  2: 'CHAdeMO',
  3: 'NEMA 5-20',
  4: 'NEMA 14-30',
  5: 'NEMA 14-50',
  6: 'Type 2 (Mennekes)',
  7: 'Type 3',
  8: 'CCS (Type 1)',
  25: 'CCS (Type 2)',
  26: 'NEMA 6-20',
  27: 'NEMA 6-30',
  28: 'NEMA 10-30',
  29: 'NEMA 10-50',
  30: 'NEMA 14-20',
  31: 'Blue Commando (2P+E)',
  32: 'IEC 60309 3-phase',
  33: 'BS1363 (UK 3-Pin)',
  36: 'Tesla (Roadster)',
  37: 'Nema 5-15R',
  38: 'Tesla (Model S)',
  1000: 'Wireless (RIVE)',
  1036: 'Tesla Supercharger',
};

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

// Parse an OCM POI entry into our EVCharger format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseOCMEntry(poi: any): EVCharger | null {
  try {
    const addrInfo = poi.AddressInfo || {};
    const lat = addrInfo.Latitude;
    const lng = addrInfo.Longitude;

    if (!lat || !lng) return null;

    const connections: EVConnection[] = (poi.Connections || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => ({
        type: c.ConnectionType?.Title || CONNECTION_TYPES[c.ConnectionTypeID] || 'Unknown',
        power_kw: c.PowerKW || (c.Voltage && c.Amps ? (c.Voltage * c.Amps) / 1000 : 0),
        quantity: c.Quantity || 1,
        status: c.StatusType?.IsOperational === true ? 'operational' : c.StatusType?.IsOperational === false ? 'out_of_service' : 'unknown',
      }))
      .filter((c: EVConnection) => c.power_kw > 0 || c.type !== 'Unknown');

    const operatorName = poi.OperatorInfo?.Title || 'Unknown Operator';
    const usageCost = poi.UsageCost || '';

    // Determine operational status
    const statusTypeId = poi.StatusType?.ID;
    const isOperational = statusTypeId === 50 || poi.StatusType?.IsOperational === true;

    return {
      id: `ocm-${poi.ID}`,
      name: addrInfo.Title || `${operatorName} Charging Point`,
      operator: operatorName,
      address: [
        addrInfo.AddressLine1,
        addrInfo.AddressLine2,
        addrInfo.Town,
        addrInfo.Postcode,
      ]
        .filter(Boolean)
        .join(', '),
      lat,
      lng,
      connections: connections.length > 0 ? connections : [{ type: 'Unknown', power_kw: 0, quantity: 1 }],
      usage_cost: usageCost || undefined,
      is_operational: isOperational,
    };
  } catch {
    return null;
  }
}

// Generate demo EV charger data when OCM fails
function generateDemoEVChargers(location: Location): EVCharger[] {
  const operators = [
    { name: 'Pod Point', cost: 'Pay As You Go: from 30p/kWh' },
    { name: 'Osprey', cost: '38p/kWh' },
    { name: 'GeniePoint', cost: '35p/kWh (members), 45p/kWh (non-members)' },
    { name: 'bp pulse', cost: '37p/kWh (registered)' },
    { name: 'Gridserve', cost: 'From 24p/kWh' },
    { name: 'Zap-Map', cost: 'Varies by network' },
    { name: 'ChargePlace Scotland', cost: 'Free (some locations)' },
    { name: 'Shell Recharge', cost: '38p/kWh' },
    { name: 'Tesla Supercharger', cost: '28p/kWh (Tesla only)' },
    { name: 'Instavolt', cost: '45p/kWh' },
  ];

  const connectionTypes = [
    [{ type: 'Type 2 (Mennekes)', power_kw: 7, quantity: 2 }],
    [{ type: 'CCS (Type 2)', power_kw: 50, quantity: 1 }, { type: 'CHAdeMO', power_kw: 50, quantity: 1 }],
    [{ type: 'Type 2 (Mennekes)', power_kw: 22, quantity: 4 }],
    [{ type: 'CCS (Type 2)', power_kw: 150, quantity: 2 }],
    [{ type: 'CCS (Type 2)', power_kw: 100, quantity: 2 }, { type: 'CHAdeMO', power_kw: 100, quantity: 1 }],
    [{ type: 'Type 2 (Mennekes)', power_kw: 7, quantity: 1 }],
    [{ type: 'CCS (Type 2)', power_kw: 350, quantity: 4 }],
    [{ type: 'Type 2 (Mennekes)', power_kw: 50, quantity: 2 }],
    [{ type: 'Tesla Supercharger', power_kw: 250, quantity: 8 }],
    [{ type: 'CCS (Type 2)', power_kw: 125, quantity: 2 }],
  ];

  const offsets = [
    { dlat: 0.01, dlng: 0.02 },
    { dlat: -0.02, dlng: 0.01 },
    { dlat: 0.03, dlng: -0.01 },
    { dlat: -0.01, dlng: -0.03 },
    { dlat: 0.025, dlng: 0.025 },
    { dlat: -0.035, dlng: 0.02 },
    { dlat: 0.015, dlng: -0.04 },
    { dlat: -0.025, dlng: -0.025 },
    { dlat: 0.04, dlng: 0.015 },
    { dlat: -0.015, dlng: 0.035 },
  ];

  return operators.map((op, i) => ({
    id: `demo-ev-${i}`,
    name: `${op.name} Charging Hub`,
    operator: op.name,
    address: `Near location, UK`,
    lat: location.lat + offsets[i].dlat,
    lng: location.lng + offsets[i].dlng,
    connections: connectionTypes[i] as EVConnection[],
    usage_cost: op.cost,
    is_operational: i !== 5, // Mark one as non-operational for realism
    distance_miles: 0,
  }));
}

export interface EVChargersResult {
  chargers: EVCharger[];
  fetchedAt: string;
  location: Location;
}

export async function getEVChargers(location: Location, radius: number = 10): Promise<EVChargersResult> {
  const fetchedAt = new Date().toISOString();
  let chargers: EVCharger[] = [];
  let usedDemo = false;

  try {
    const apiKey = process.env.OCM_API_KEY;
    const url = new URL(OCM_BASE_URL);
    url.searchParams.set('output', 'json');
    url.searchParams.set('countrycode', 'GB');
    url.searchParams.set('latitude', location.lat.toString());
    url.searchParams.set('longitude', location.lng.toString());
    url.searchParams.set('distance', radius.toString());
    url.searchParams.set('distanceunit', 'miles');
    url.searchParams.set('maxresults', '50');
    url.searchParams.set('compact', 'true');
    url.searchParams.set('verbose', 'false');

    const headers: Record<string, string> = {
      'User-Agent': 'UK-Fuel-EV-Tracker/1.0 (https://github.com/example/mpg)',
    };
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const parsed = data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((poi: any) => parseOCMEntry(poi))
          .filter((c): c is EVCharger => c !== null);

        if (parsed.length > 0) {
          chargers = parsed;
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch EV chargers from OCM:', error);
  }

  if (chargers.length === 0) {
    chargers = generateDemoEVChargers(location);
    usedDemo = true;
    console.log('Using demo EV charger data');
  }

  // Add distances
  const chargersWithDistance = chargers
    .map((c) => ({
      ...c,
      distance_miles:
        c.distance_miles && c.distance_miles > 0
          ? c.distance_miles
          : haversineDistance(location.lat, location.lng, c.lat, c.lng),
    }))
    .filter((c) => c.distance_miles <= radius)
    .sort((a, b) => a.distance_miles - b.distance_miles);

  void usedDemo;

  return {
    chargers: chargersWithDistance,
    fetchedAt,
    location,
  };
}
