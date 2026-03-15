'use client';

import { useState, useMemo } from 'react';
import { Calculator, Zap, Leaf, TrendingDown } from 'lucide-react';

// UK average electricity cost per kWh (2024)
const UK_AVG_ELECTRICITY_PENCE_PER_KWH = 24;
// Average EV efficiency
const EV_MILES_PER_KWH = 3.5;
// CO2 per litre (kg)
const CO2_PER_LITRE_PETROL_KG = 2.31;
const CO2_PER_LITRE_DIESEL_KG = 2.68;
// Average EV price premium over equivalent ICE car
const EV_PRICE_PREMIUM_GBP = 5000;

// litres per gallon (imperial)
const LITRES_PER_GALLON = 4.54609;

interface AnnualCostCalculatorProps {
  defaultMpg?: number;
  defaultPetrolPence?: number;
  defaultFuelType?: 'petrol' | 'diesel';
}

function ResultCard({
  label,
  value,
  subValue,
  accent,
}: {
  label: string;
  value: string;
  subValue?: string;
  accent?: 'amber' | 'green' | 'blue' | 'red';
}) {
  const colorMap = {
    amber: 'text-fuel-amber',
    green: 'text-ev-green',
    blue: 'text-blue-400',
    red: 'text-red-400',
  };
  const color = accent ? colorMap[accent] : 'text-white';

  return (
    <div className="bg-navy-700 rounded-xl p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      {subValue && <div className="text-xs text-gray-500 mt-0.5">{subValue}</div>}
    </div>
  );
}

export default function AnnualCostCalculator({
  defaultMpg = 38,
  defaultPetrolPence = 142,
  defaultFuelType = 'petrol',
}: AnnualCostCalculatorProps) {
  const [annualMiles, setAnnualMiles] = useState(8000);
  const [mpg, setMpg] = useState(defaultMpg);
  const [pricePence, setPricePence] = useState(defaultPetrolPence);
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>(defaultFuelType);

  const results = useMemo(() => {
    const litresPerMile = LITRES_PER_GALLON / mpg;
    const annualLitres = annualMiles * litresPerMile;
    const annualFuelCost = (annualLitres * pricePence) / 100;
    const costPerMilePence = (pricePence / mpg) * LITRES_PER_GALLON;
    const co2PerLitre = fuelType === 'diesel' ? CO2_PER_LITRE_DIESEL_KG : CO2_PER_LITRE_PETROL_KG;
    const annualCo2Kg = annualLitres * co2PerLitre;

    // EV comparison
    const evKwhPerYear = annualMiles / EV_MILES_PER_KWH;
    const evAnnualCost = (evKwhPerYear * UK_AVG_ELECTRICITY_PENCE_PER_KWH) / 100;
    const evSavingPerYear = annualFuelCost - evAnnualCost;
    const evPaybackYears =
      evSavingPerYear > 0 ? EV_PRICE_PREMIUM_GBP / evSavingPerYear : null;

    return {
      annualLitres: Math.round(annualLitres),
      annualFuelCost: Math.round(annualFuelCost),
      costPerMilePence: Math.round(costPerMilePence * 10) / 10,
      annualCo2Kg: Math.round(annualCo2Kg),
      evAnnualCost: Math.round(evAnnualCost),
      evSavingPerYear: Math.round(evSavingPerYear),
      evPaybackYears: evPaybackYears !== null ? Math.round(evPaybackYears * 10) / 10 : null,
      evKwhPerYear: Math.round(evKwhPerYear),
    };
  }, [annualMiles, mpg, pricePence, fuelType]);

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-navy-700 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-fuel-amber" />
        <h3 className="text-white font-semibold text-sm">Annual Fuel Cost + EV Comparison</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Annual mileage</label>
            <div className="relative">
              <input
                type="number"
                value={annualMiles}
                onChange={(e) => setAnnualMiles(parseInt(e.target.value) || 8000)}
                step="500"
                min="1000"
                max="100000"
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white pr-12"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                miles
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Fuel efficiency</label>
            <div className="relative">
              <input
                type="number"
                value={mpg}
                onChange={(e) => setMpg(parseFloat(e.target.value) || 38)}
                step="1"
                min="10"
                max="150"
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white pr-12"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                MPG
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Fuel price</label>
            <div className="relative">
              <input
                type="number"
                value={pricePence}
                onChange={(e) => setPricePence(parseFloat(e.target.value) || 142)}
                step="0.1"
                min="80"
                max="250"
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white pr-6"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                p/L
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Fuel type</label>
            <div className="flex rounded-lg bg-navy-700 border border-navy-600 p-0.5">
              {(['petrol', 'diesel'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFuelType(ft)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                    fuelType === ft
                      ? 'bg-fuel-amber/20 text-fuel-amber'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Annual fuel cost results */}
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
            Your annual fuel costs
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <ResultCard
              label="Annual cost"
              value={`£${results.annualFuelCost.toLocaleString()}`}
              subValue={`${results.annualLitres}L`}
              accent="amber"
            />
            <ResultCard
              label="Cost per mile"
              value={`${results.costPerMilePence.toFixed(1)}p`}
              accent="amber"
            />
            <ResultCard
              label="CO₂ per year"
              value={`${(results.annualCo2Kg / 1000).toFixed(1)}t`}
              subValue={`${results.annualCo2Kg.toLocaleString()} kg`}
              accent="red"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-navy-700" />
          <div className="flex items-center gap-1 text-xs text-ev-green">
            <Zap className="w-3 h-3" />
            EV Comparison
          </div>
          <div className="flex-1 h-px bg-navy-700" />
        </div>

        {/* EV comparison */}
        <div className="bg-navy-700/50 rounded-xl p-3 border border-ev-green/20">
          <div className="flex items-start gap-2 mb-3">
            <Zap className="w-4 h-4 text-ev-green flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-300">
              An equivalent EV doing the same {annualMiles.toLocaleString()} miles at{' '}
              {UK_AVG_ELECTRICITY_PENCE_PER_KWH}p/kWh and {EV_MILES_PER_KWH} mi/kWh:
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ResultCard
              label="EV annual cost"
              value={`£${results.evAnnualCost.toLocaleString()}`}
              subValue={`${results.evKwhPerYear.toLocaleString()} kWh`}
              accent="green"
            />
            <ResultCard
              label="Annual saving"
              value={
                results.evSavingPerYear > 0
                  ? `£${results.evSavingPerYear.toLocaleString()}`
                  : `−£${Math.abs(results.evSavingPerYear).toLocaleString()}`
              }
              accent={results.evSavingPerYear > 0 ? 'green' : 'red'}
            />
            <ResultCard
              label="EV premium payback"
              value={
                results.evPaybackYears && results.evPaybackYears > 0
                  ? `${results.evPaybackYears} yrs`
                  : 'N/A'
              }
              subValue={
                results.evPaybackYears && results.evPaybackYears > 0
                  ? `on £${EV_PRICE_PREMIUM_GBP.toLocaleString()} premium`
                  : undefined
              }
              accent={
                results.evPaybackYears && results.evPaybackYears <= 5
                  ? 'green'
                  : results.evPaybackYears && results.evPaybackYears <= 10
                  ? 'amber'
                  : undefined
              }
            />
          </div>

          {results.evSavingPerYear > 0 && results.evPaybackYears && (
            <div className="mt-3 flex items-start gap-1.5 text-xs text-gray-400">
              <TrendingDown className="w-3.5 h-3.5 text-ev-green flex-shrink-0 mt-0.5" />
              At current prices, switching to an EV pays back the average £{EV_PRICE_PREMIUM_GBP.toLocaleString()} price
              premium in approximately{' '}
              <span className="text-ev-green font-medium">{results.evPaybackYears} years</span>.
            </div>
          )}
        </div>

        {/* CO2 context */}
        <div className="flex items-start gap-2 px-3 py-2 bg-navy-700/40 rounded-lg">
          <Leaf className="w-3.5 h-3.5 text-ev-green flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400">
            Your {fuelType} car produces ~{results.annualCo2Kg.toLocaleString()} kg CO₂/year.
            An EV produces ~{Math.round(results.evKwhPerYear * 0.233).toLocaleString()} kg CO₂ equivalent
            (at UK grid average of 233g CO₂/kWh) — saving ~
            {Math.round(
              results.annualCo2Kg - results.evKwhPerYear * 0.233
            ).toLocaleString()} kg CO₂ per year.
          </p>
        </div>

        <p className="text-xs text-gray-600 text-center">
          Assumes {UK_AVG_ELECTRICITY_PENCE_PER_KWH}p/kWh electricity · {EV_MILES_PER_KWH} mi/kWh EV efficiency ·
          {' '}£{EV_PRICE_PREMIUM_GBP.toLocaleString()} EV price premium
        </p>
      </div>
    </div>
  );
}
