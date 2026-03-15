/**
 * UK fuel duty, VAT, and retailer margin calculations.
 * Uses Brent crude price from Yahoo Finance (free, no API key required).
 */

// Current UK fuel duty rate (Budget 2024)
export const UK_FUEL_DUTY_PENCE_PER_LITRE = 52.95;
export const VAT_RATE = 0.2; // 20%

// Approximate refining + distribution cost per litre (pence)
const REFINING_DISTRIBUTION_PENCE = 15;

// 1 barrel ≈ 159 litres
const LITRES_PER_BARREL = 159;

export interface FuelCostBreakdown {
  pump_price_pence: number;
  duty_pence: number; // Fixed: 52.95p
  vat_pence: number; // Simplified: pump_price / 1.2 * 0.2
  estimated_wholesale_pence: number; // Estimated from crude price
  retailer_margin_pence: number; // pump - duty - vat - wholesale
  is_margin_high: boolean; // margin > 10p is historically concerning
  crude_price_usd: number;
  gbp_usd_rate: number;
}

export interface CrudeData {
  brent_crude_usd: number;
  gbp_usd_rate: number;
  fetched_at: string;
}

/**
 * Estimate wholesale petrol/diesel price from crude oil price.
 * Formula: (crude_usd / 159) * (1 / gbpUsd) * 100 + refining/distribution
 * Result in pence per litre.
 */
export function estimateWholesalePricePence(
  crudePriceUSD: number,
  gbpUsdRate: number
): number {
  // Convert USD/barrel → pence/litre
  const crudePencePerLitre = (crudePriceUSD / LITRES_PER_BARREL) * (1 / gbpUsdRate) * 100;
  return Math.round((crudePencePerLitre + REFINING_DISTRIBUTION_PENCE) * 10) / 10;
}

/**
 * Calculate the full cost breakdown for a given pump price and crude price.
 */
export function calculateMargin(
  pumpPricePence: number,
  crudePriceUSD: number,
  gbpUsdRate: number
): FuelCostBreakdown {
  const duty_pence = UK_FUEL_DUTY_PENCE_PER_LITRE;

  // VAT: pump price already includes VAT, so VAT = pump_price * (VAT_RATE / (1 + VAT_RATE))
  const vat_pence = Math.round((pumpPricePence * (VAT_RATE / (1 + VAT_RATE))) * 10) / 10;

  const estimated_wholesale_pence = estimateWholesalePricePence(crudePriceUSD, gbpUsdRate);

  const retailer_margin_pence =
    Math.round((pumpPricePence - duty_pence - vat_pence - estimated_wholesale_pence) * 10) / 10;

  return {
    pump_price_pence: pumpPricePence,
    duty_pence,
    vat_pence,
    estimated_wholesale_pence,
    retailer_margin_pence,
    is_margin_high: retailer_margin_pence > 10,
    crude_price_usd: crudePriceUSD,
    gbp_usd_rate: gbpUsdRate,
  };
}

/**
 * Calculate the "fair" pump price given current crude price.
 * fair = wholesale + duty + VAT on (wholesale + duty) + typical margin (8p)
 */
export function fairPumpPrice(crudePriceUSD: number, gbpUsdRate: number): number {
  const wholesale = estimateWholesalePricePence(crudePriceUSD, gbpUsdRate);
  const TYPICAL_MARGIN = 8;
  // pre-VAT: wholesale + duty + typical margin
  const preVat = wholesale + UK_FUEL_DUTY_PENCE_PER_LITRE + TYPICAL_MARGIN;
  // Add VAT on top
  return Math.round(preVat * (1 + VAT_RATE) * 10) / 10;
}

/**
 * Fetch Brent crude price and GBP/USD rate from Yahoo Finance.
 * Returns null on failure.
 */
export async function getLatestBrentCrude(): Promise<CrudeData | null> {
  try {
    const [crudeRes, fxRes] = await Promise.all([
      fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=5d',
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UK-Fuel-Tracker/1.0)' },
          signal: AbortSignal.timeout(10_000),
        }
      ),
      fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/GBPUSD=X?interval=1d&range=5d',
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UK-Fuel-Tracker/1.0)' },
          signal: AbortSignal.timeout(10_000),
        }
      ),
    ]);

    if (!crudeRes.ok || !fxRes.ok) {
      console.warn('[fuel-duty] Yahoo Finance request failed');
      return null;
    }

    const crudeData = await crudeRes.json();
    const fxData = await fxRes.json();

    // Extract most recent closing price
    const crudeMeta = crudeData?.chart?.result?.[0]?.meta;
    const fxMeta = fxData?.chart?.result?.[0]?.meta;

    const brentCrude: number | undefined =
      crudeMeta?.regularMarketPrice ?? crudeMeta?.previousClose;
    const gbpUsd: number | undefined =
      fxMeta?.regularMarketPrice ?? fxMeta?.previousClose;

    if (!brentCrude || !gbpUsd) {
      console.warn('[fuel-duty] Could not extract prices from Yahoo Finance response');
      return null;
    }

    return {
      brent_crude_usd: Math.round(brentCrude * 100) / 100,
      gbp_usd_rate: Math.round(gbpUsd * 10000) / 10000,
      fetched_at: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[fuel-duty] Failed to fetch crude price:', err);
    return null;
  }
}

/**
 * Fetch 7 days of Brent crude price history for the "Wait or Fill?" feature.
 * Returns array of {date, price} sorted oldest-first, or null on failure.
 */
export async function getBrentCrudeHistory(): Promise<
  Array<{ date: string; price_usd: number }> | null
> {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=14d',
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UK-Fuel-Tracker/1.0)' },
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    const timestamps: number[] | undefined = result?.timestamp;
    const closes: number[] | undefined = result?.indicators?.quote?.[0]?.close;

    if (!timestamps || !closes || timestamps.length !== closes.length) return null;

    return timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        price_usd: Math.round((closes[i] ?? 0) * 100) / 100,
      }))
      .filter((p) => p.price_usd > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    console.warn('[fuel-duty] Failed to fetch crude history:', err);
    return null;
  }
}

/**
 * Generate a "Wait or Fill?" recommendation based on crude price trend.
 */
export interface WaitOrFillRecommendation {
  action: 'fill_now' | 'wait' | 'either';
  headline: string;
  detail: string;
  crude_change_pct: number;
  estimated_pump_change_pence: number | null;
}

export function getWaitOrFillRecommendation(
  history: Array<{ date: string; price_usd: number }>
): WaitOrFillRecommendation {
  if (history.length < 2) {
    return {
      action: 'either',
      headline: 'Prices stable',
      detail: 'Not enough data to assess. Fill when convenient.',
      crude_change_pct: 0,
      estimated_pump_change_pence: null,
    };
  }

  const latest = history[history.length - 1].price_usd;
  // Find the price ~7 days ago (or earliest available)
  const sevenDaysAgo = history[Math.max(0, history.length - 8)].price_usd;

  const changePct = ((latest - sevenDaysAgo) / sevenDaysAgo) * 100;

  // Each $1/barrel ≈ ~0.4p/litre pump price change (rough UK estimate)
  const barrelChangeDollars = latest - sevenDaysAgo;
  const estimatedPumpChange = Math.round(barrelChangeDollars * 0.4 * 10) / 10;

  if (changePct < -2) {
    return {
      action: 'wait',
      headline: 'Prices likely to fall',
      detail: `Oil prices fell ${Math.abs(changePct).toFixed(1)}% this week. Expect pump prices to drop ~${Math.abs(estimatedPumpChange).toFixed(1)}p/L in 5–7 days. Consider a small top-up now and fill fully next week.`,
      crude_change_pct: Math.round(changePct * 10) / 10,
      estimated_pump_change_pence: estimatedPumpChange,
    };
  }

  if (changePct > 2) {
    return {
      action: 'fill_now',
      headline: 'Fill up now',
      detail: `Oil prices rose ${changePct.toFixed(1)}% this week. Pump prices may increase ~${Math.abs(estimatedPumpChange).toFixed(1)}p/L in the coming days. Fill up before prices climb higher.`,
      crude_change_pct: Math.round(changePct * 10) / 10,
      estimated_pump_change_pence: estimatedPumpChange,
    };
  }

  return {
    action: 'either',
    headline: 'Prices stable',
    detail: 'Oil prices are relatively flat this week. No urgency — fill when convenient.',
    crude_change_pct: Math.round(changePct * 10) / 10,
    estimated_pump_change_pence: estimatedPumpChange,
  };
}
