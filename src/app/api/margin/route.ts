import { NextResponse } from 'next/server';
import {
  getLatestBrentCrude,
  getBrentCrudeHistory,
  calculateMargin,
  fairPumpPrice,
  getWaitOrFillRecommendation,
  UK_FUEL_DUTY_PENCE_PER_LITRE,
} from '@/lib/fuel-duty';

// Cache for 1 hour
let cache: {
  data: ReturnType<typeof buildResponse>;
  timestamp: number;
} | null = null;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Default UK average petrol price (used when no specific price is queried)
const DEFAULT_PETROL_PENCE = 142;

function buildResponse(
  crudeUsd: number,
  gbpUsd: number,
  history: Array<{ date: string; price_usd: number }> | null,
  pumpPricePence: number
) {
  const breakdown = calculateMargin(pumpPricePence, crudeUsd, gbpUsd);
  const fairPrice = fairPumpPrice(crudeUsd, gbpUsd);
  const recommendation = getWaitOrFillRecommendation(history ?? []);

  return {
    crude_price_usd: crudeUsd,
    gbp_usd_rate: gbpUsd,
    duty_pence: UK_FUEL_DUTY_PENCE_PER_LITRE,
    breakdown,
    fair_petrol_price_pence: fairPrice,
    wait_or_fill: recommendation,
    crude_history: history,
    fetched_at: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  // Allow optional pump_price query param
  const { searchParams } = new URL(request.url);
  const pumpPricePence = parseFloat(searchParams.get('pump_price') || '') || DEFAULT_PETROL_PENCE;

  // Return cached data if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    // Recalculate breakdown with requested pump price (rest is cached)
    const { crude_price_usd, gbp_usd_rate, crude_history } = cache.data;
    const breakdown = calculateMargin(pumpPricePence, crude_price_usd, gbp_usd_rate);
    const fairPrice = fairPumpPrice(crude_price_usd, gbp_usd_rate);
    const recommendation = getWaitOrFillRecommendation(crude_history ?? []);

    return NextResponse.json({
      ...cache.data,
      breakdown,
      fair_petrol_price_pence: fairPrice,
      wait_or_fill: recommendation,
    });
  }

  // Fetch fresh crude data
  const [crudeData, history] = await Promise.all([
    getLatestBrentCrude(),
    getBrentCrudeHistory(),
  ]);

  if (!crudeData) {
    // Return fallback with zero crude data
    return NextResponse.json(
      {
        error: 'Could not fetch crude price data',
        crude_price_usd: null,
        gbp_usd_rate: null,
        duty_pence: UK_FUEL_DUTY_PENCE_PER_LITRE,
      },
      { status: 503 }
    );
  }

  const response = buildResponse(
    crudeData.brent_crude_usd,
    crudeData.gbp_usd_rate,
    history,
    pumpPricePence
  );

  cache = { data: response, timestamp: Date.now() };

  return NextResponse.json(response);
}
