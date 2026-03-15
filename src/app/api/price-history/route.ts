import { NextRequest, NextResponse } from 'next/server';
import { getPriceHistory, getUKAveragePriceHistory } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const stationId = searchParams.get('station_id');
  const fuelType = searchParams.get('fuel_type') || 'petrol';
  const daysStr = searchParams.get('days');
  const days = daysStr ? parseInt(daysStr, 10) : 30;
  const includeAverage = searchParams.get('include_average') !== 'false';

  if (isNaN(days) || days < 1 || days > 365) {
    return NextResponse.json(
      { error: 'days must be between 1 and 365' },
      { status: 400 }
    );
  }

  try {
    const result: {
      station_history?: ReturnType<typeof getPriceHistory>;
      uk_average?: ReturnType<typeof getUKAveragePriceHistory>;
      fuel_type: string;
      days: number;
    } = {
      fuel_type: fuelType,
      days,
    };

    if (stationId) {
      result.station_history = getPriceHistory(stationId, days);
    }

    if (includeAverage) {
      result.uk_average = getUKAveragePriceHistory(fuelType, days);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Price history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}
