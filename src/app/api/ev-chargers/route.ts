import { NextRequest, NextResponse } from 'next/server';
import { getEVChargers } from '@/lib/ev-chargers';

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

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'Invalid lat/lng coordinates' },
      { status: 400 }
    );
  }

  try {
    const result = await getEVChargers({ lat, lng }, radius);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('EV chargers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch EV chargers' },
      { status: 500 }
    );
  }
}
