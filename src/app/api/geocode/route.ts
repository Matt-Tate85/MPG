import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'q parameter required' }, { status: 400 });
  }

  try {
    const query = q.trim().endsWith('UK') ? q : `${q}, UK`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=gb`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'UK-Fuel-EV-Tracker/1.0' },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('Nominatim error');

    const data = await res.json();
    if (!data.length) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const result = data[0];
    return NextResponse.json({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
    });
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
