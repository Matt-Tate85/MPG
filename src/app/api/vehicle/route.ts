import { NextRequest, NextResponse } from 'next/server';
import { lookupVehicle } from '@/lib/vehicle';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const registration = searchParams.get('reg');

  if (!registration) {
    return NextResponse.json(
      { error: 'reg query parameter is required' },
      { status: 400 }
    );
  }

  const cleaned = registration.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (cleaned.length < 2 || cleaned.length > 8) {
    return NextResponse.json(
      { error: 'Invalid registration plate length' },
      { status: 400 }
    );
  }

  try {
    const vehicle = await lookupVehicle(cleaned);
    return NextResponse.json(vehicle);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isNotFound = message.includes('not found') || message.includes('Invalid registration');

    return NextResponse.json(
      { error: message },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
