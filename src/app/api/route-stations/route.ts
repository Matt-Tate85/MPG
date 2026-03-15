import { NextRequest, NextResponse } from 'next/server';
import type { FuelStation, Location } from '@/lib/types';
import { findCheapestAlongRoute } from '@/lib/route-planner';

interface RouteStationsRequest {
  from: Location;
  to: Location;
  stations: FuelStation[];
  corridorMiles?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RouteStationsRequest = await request.json();

    const { from, to, stations, corridorMiles = 1 } = body;

    if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) {
      return NextResponse.json(
        { error: 'from and to coordinates are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(stations)) {
      return NextResponse.json({ error: 'stations must be an array' }, { status: 400 });
    }

    const routeStations = await findCheapestAlongRoute(from, to, stations, corridorMiles);

    return NextResponse.json({ stations: routeStations });
  } catch (err) {
    console.error('Route stations API error:', err);
    return NextResponse.json({ error: 'Failed to compute route stations' }, { status: 500 });
  }
}
