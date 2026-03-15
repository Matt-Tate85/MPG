import { NextRequest, NextResponse } from 'next/server';
import { getFuelPrices } from '@/lib/fuel-prices';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');
  const radiusStr = searchParams.get('radius');

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: 'lat and lng query parameters are required' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const radius = radiusStr ? parseFloat(radiusStr) : 10;

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: 'Invalid lat/lng coordinates' },
      { status: 400 }
    );
  }

  // Basic UK coordinate sanity check
  if (lat < 49 || lat > 61 || lng < -8 || lng > 2) {
    return NextResponse.json(
      { error: 'Coordinates appear to be outside the UK' },
      { status: 400 }
    );
  }

  try {
    const result = await getFuelPrices({ lat, lng }, radius);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Fuel prices API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fuel prices' },
      { status: 500 }
    );
  }
}
