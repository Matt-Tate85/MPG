'use client';

import { useState } from 'react';
import { Briefcase, TrendingUp, TrendingDown, Info, PoundSterling } from 'lucide-react';

/**
 * HMRC Mileage vs Actual Fuel Cost Calculator
 *
 * Shows tradespeople, van drivers, and self-employed people exactly how
 * HMRC's Approved Mileage Allowance Payment (AMAP) compares to their real
 * per-mile fuel costs — and whether they're better off claiming mileage rate
 * or actual fuel expenses.
 *
 * AMAP rates 2024/25:
 *   Cars/vans: 45p/mile (first 10,000 miles), 25p/mile thereafter
 *   Motorcycles: 24p/mile
 *   Advisory electric: 9p/mile
 */

const HMRC_AMAP_FIRST = 45; // pence per mile, first 10,000
const HMRC_AMAP_AFTER = 25; // pence per mile, after 10,000
const HMRC_EV_ADVISORY = 9; // pence per mile

// HMRC Advisory Fuel Rates 2024/25 (for company car drivers — different from AMAP)
const HMRC_ADVISORY: Record<string, Record<string, number>> = {
  petrol: {
    '0-1400': 14,
    '1401-2000': 16,
    '2001+': 26,
  },
  diesel: {
    '0-1600': 13,
    '1601-2000': 15,
    '2001+': 20,
  },
};

function getEngineCategory(cc: number, fuelType: string): string {
  if (fuelType === 'petrol') {
    if (cc <= 1400) return '0-1400';
    if (cc <= 2000) return '1401-2000';
    return '2001+';
  }
  if (fuelType === 'diesel') {
    if (cc <= 1600) return '0-1600';
    if (cc <= 2000) return '1601-2000';
    return '2001+';
  }
  return '';
}

export default function HMRCCalculator({ defaultPrice }: { defaultPrice?: number }) {
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'electric'>('diesel');
  const [pricePencePerLitre, setPricePencePerLitre] = useState(defaultPrice?.toString() || '142');
  const [mpg, setMpg] = useState('38');
  const [weeklyMiles, setWeeklyMiles] = useState('300');
  const [annualMiles, setAnnualMiles] = useState('15000');
  const [useWeekly, setUseWeekly] = useState(true);

  const price = parseFloat(pricePencePerLitre);
  const mpgVal = parseFloat(mpg);
  const miles = useWeekly ? parseFloat(weeklyMiles) * 52 : parseFloat(annualMiles);

  // Actual fuel cost per mile
  // 1 imperial gallon = 4.54609 litres
  const litresPerMile = fuelType === 'electric' ? 0 : 4.54609 / mpgVal;
  const actualCostPencePerMile = fuelType === 'electric'
    ? (24 / 3.5) // 24p/kWh, 3.5 mi/kWh average EV
    : litresPerMile * price;

  // HMRC AMAP total for annual mileage
  const first10k = Math.min(miles, 10000);
  const after10k = Math.max(0, miles - 10000);
  const hmrcAmapTotal = (first10k * HMRC_AMAP_FIRST + after10k * HMRC_AMAP_AFTER) / 100; // £

  // Actual fuel cost total
  const actualFuelTotal = (miles * actualCostPencePerMile) / 100; // £

  // EV advisory rate
  const evAdvisoryTotal = (miles * HMRC_EV_ADVISORY) / 100;

  // Net position: positive = you get back more than you spend on fuel (profit)
  // negative = AMAP doesn't cover your fuel costs
  const netAmap = hmrcAmapTotal - actualFuelTotal;

  // Effective pence per mile under AMAP
  const hmrcRateEffective = miles <= 10000 ? HMRC_AMAP_FIRST : (first10k * HMRC_AMAP_FIRST + after10k * HMRC_AMAP_AFTER) / miles;

  const isEvCalculator = fuelType === 'electric';

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-fuel-amber" />
        <div>
          <h2 className="text-white font-semibold text-lg">HMRC Fuel Claim Calculator</h2>
          <p className="text-xs text-gray-500">For self-employed, tradespeople &amp; van drivers</p>
        </div>
      </div>

      {/* AMAP info banner */}
      <div className="mb-4 p-3 rounded-lg bg-navy-700 border border-navy-600 text-xs text-gray-400">
        <div className="flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-fuel-amber mt-0.5 shrink-0" />
          <span>
            HMRC AMAP rates 2024/25: <strong className="text-gray-200">45p/mile</strong> (first 10,000 miles)
            then <strong className="text-gray-200">25p/mile</strong>. You can claim this from an employer
            or deduct from self-assessment. Electric: <strong className="text-gray-200">9p/mile</strong> advisory rate.
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Fuel type</label>
          <div className="flex gap-2">
            {(['petrol', 'diesel', 'electric'] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFuelType(ft)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  fuelType === ft
                    ? 'bg-fuel-amber text-navy-900'
                    : 'bg-navy-700 text-gray-400 hover:text-white'
                }`}
              >
                {ft.charAt(0).toUpperCase() + ft.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {!isEvCalculator && (
          <>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Pump price (p/L)</label>
              <input
                type="number"
                step="0.1"
                value={pricePencePerLitre}
                onChange={(e) => setPricePencePerLitre(e.target.value)}
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuel-amber"
                placeholder="e.g. 142"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Vehicle MPG</label>
              <input
                type="number"
                step="1"
                min="1"
                value={mpg}
                onChange={(e) => setMpg(e.target.value)}
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuel-amber"
                placeholder="e.g. 38"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            {useWeekly ? 'Miles per week' : 'Miles per year'}
          </label>
          <input
            type="number"
            step="10"
            min="1"
            value={useWeekly ? weeklyMiles : annualMiles}
            onChange={(e) => useWeekly ? setWeeklyMiles(e.target.value) : setAnnualMiles(e.target.value)}
            className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuel-amber"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Enter as</label>
          <div className="flex gap-1">
            <button
              onClick={() => { setUseWeekly(true); }}
              className={`flex-1 py-2 rounded-lg text-xs transition-colors ${useWeekly ? 'bg-fuel-amber text-navy-900 font-semibold' : 'bg-navy-700 text-gray-400 hover:text-white'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => { setUseWeekly(false); setAnnualMiles(Math.round(parseFloat(weeklyMiles || '0') * 52).toString()); }}
              className={`flex-1 py-2 rounded-lg text-xs transition-colors ${!useWeekly ? 'bg-fuel-amber text-navy-900 font-semibold' : 'bg-navy-700 text-gray-400 hover:text-white'}`}
            >
              Annual
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {miles > 0 && (price > 0 || isEvCalculator) && (mpgVal > 0 || isEvCalculator) && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Actual fuel cost/mile</div>
              <div className="text-white font-semibold">{actualCostPencePerMile.toFixed(1)}p</div>
              {isEvCalculator && <div className="text-xs text-gray-600">@ 24p/kWh, 3.5mi/kWh</div>}
            </div>
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">HMRC AMAP rate/mile</div>
              <div className="text-fuel-amber font-semibold">{hmrcRateEffective.toFixed(1)}p</div>
              {miles > 10000 && <div className="text-xs text-gray-600">blended rate</div>}
            </div>
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Annual fuel cost</div>
              <div className="text-white font-semibold">£{actualFuelTotal.toFixed(0)}</div>
              <div className="text-xs text-gray-600">{miles.toLocaleString()} miles</div>
            </div>
            <div className="bg-navy-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">AMAP claim total</div>
              <div className="text-fuel-amber font-semibold">£{hmrcAmapTotal.toFixed(0)}</div>
              {miles > 10000 && (
                <div className="text-xs text-gray-600">
                  £{(first10k * HMRC_AMAP_FIRST / 100).toFixed(0)} + £{(after10k * HMRC_AMAP_AFTER / 100).toFixed(0)}
                </div>
              )}
            </div>
          </div>

          {/* Net position */}
          <div className={`rounded-lg p-4 border ${netAmap > 0 ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {netAmap > 0 ? (
                  <TrendingUp className="w-4 h-4 text-ev-green" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-300 text-sm font-medium">
                  {netAmap > 0 ? 'AMAP covers your fuel + profit' : 'AMAP under-covers your fuel cost'}
                </span>
              </div>
              <span className={`text-lg font-bold ${netAmap > 0 ? 'text-ev-green' : 'text-red-400'}`}>
                {netAmap > 0 ? '+' : ''}£{netAmap.toFixed(0)}/yr
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {netAmap > 0
                ? `Claiming AMAP gives you £${netAmap.toFixed(0)} more than your actual annual fuel cost. The surplus covers wear & tear, insurance, depreciation.`
                : `Your actual fuel cost exceeds the AMAP rate by £${Math.abs(netAmap).toFixed(0)}/yr. Consider claiming actual fuel expenses instead — keep all receipts.`
              }
            </p>
          </div>

          {/* EV advisory rate note */}
          {isEvCalculator && (
            <div className="bg-navy-700/50 rounded-lg p-3 border border-navy-600">
              <div className="flex items-start gap-2">
                <PoundSterling className="w-4 h-4 text-ev-green mt-0.5 shrink-0" />
                <div className="text-xs text-gray-400">
                  <span className="text-gray-200 font-medium">EV Advisory Rate: </span>
                  HMRC allows 9p/mile for electric company cars (2024/25).
                  Annual claim: <span className="text-ev-green font-semibold">£{evAdvisoryTotal.toFixed(0)}</span>.
                  Your actual charging cost at 24p/kWh: <span className="font-semibold text-white">£{actualFuelTotal.toFixed(0)}</span>.
                  {evAdvisoryTotal >= actualFuelTotal
                    ? ' AMAP covers your charging costs.'
                    : ` Gap: £${(actualFuelTotal - evAdvisoryTotal).toFixed(0)}/yr — home charger tariff matters significantly.`}
                </div>
              </div>
            </div>
          )}

          {/* Self-assessment tip */}
          <div className="text-xs text-gray-600 px-1">
            Self-employed? Deduct AMAP on your Self Assessment (SA103 box 17). Employee? Claim
            the difference if your employer pays less than 45p/mile via a P87 form.
            <span className="text-gray-500"> Always verify with a qualified accountant.</span>
          </div>
        </div>
      )}
    </div>
  );
}
