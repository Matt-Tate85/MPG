import { NextRequest, NextResponse } from 'next/server';
import { calculateWorthIt } from '@/lib/calculations';
import type { WorthItInput } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      near_station_price_pence,
      near_station_distance_miles,
      far_station_price_pence,
      far_station_distance_miles,
      planned_fill_litres,
      car_mpg,
    } = body as WorthItInput;

    // Validate required inputs
    const errors: string[] = [];

    if (typeof near_station_price_pence !== 'number' || near_station_price_pence <= 0) {
      errors.push('near_station_price_pence must be a positive number');
    }
    if (typeof far_station_price_pence !== 'number' || far_station_price_pence <= 0) {
      errors.push('far_station_price_pence must be a positive number');
    }
    if (typeof near_station_distance_miles !== 'number' || near_station_distance_miles < 0) {
      errors.push('near_station_distance_miles must be a non-negative number');
    }
    if (typeof far_station_distance_miles !== 'number' || far_station_distance_miles < 0) {
      errors.push('far_station_distance_miles must be a non-negative number');
    }
    if (typeof planned_fill_litres !== 'number' || planned_fill_litres <= 0) {
      errors.push('planned_fill_litres must be a positive number');
    }
    if (typeof car_mpg !== 'number' || car_mpg <= 0) {
      errors.push('car_mpg must be a positive number');
    }

    // Sanity range checks for UK context
    if (near_station_price_pence < 50 || near_station_price_pence > 300) {
      errors.push('near_station_price_pence seems out of realistic range (50-300p)');
    }
    if (far_station_price_pence < 50 || far_station_price_pence > 300) {
      errors.push('far_station_price_pence seems out of realistic range (50-300p)');
    }
    if (planned_fill_litres > 200) {
      errors.push('planned_fill_litres seems too large (max 200L)');
    }
    if (car_mpg > 200) {
      errors.push('car_mpg seems too large (max 200)');
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const result = calculateWorthIt({
      near_station_price_pence,
      near_station_distance_miles,
      far_station_price_pence,
      far_station_distance_miles,
      planned_fill_litres,
      car_mpg,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Worth-it API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate worth-it analysis' },
      { status: 500 }
    );
  }
}

// Allow GET for simple queries via URL params too
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const nearPrice = parseFloat(searchParams.get('near_price') || '0');
  const nearDist = parseFloat(searchParams.get('near_dist') || '0');
  const farPrice = parseFloat(searchParams.get('far_price') || '0');
  const farDist = parseFloat(searchParams.get('far_dist') || '0');
  const fillLitres = parseFloat(searchParams.get('fill_litres') || '40');
  const mpg = parseFloat(searchParams.get('mpg') || '38');

  if (!nearPrice || !farPrice) {
    return NextResponse.json(
      { error: 'near_price and far_price are required' },
      { status: 400 }
    );
  }

  const result = calculateWorthIt({
    near_station_price_pence: nearPrice,
    near_station_distance_miles: nearDist,
    far_station_price_pence: farPrice,
    far_station_distance_miles: farDist,
    planned_fill_litres: fillLitres,
    car_mpg: mpg,
  });

  return NextResponse.json(result);
}
