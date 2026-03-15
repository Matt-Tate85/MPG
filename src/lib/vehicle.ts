import type { Vehicle } from './types';

const DVLA_VES_URL =
  'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles';

// Estimate MPG based on engine size and fuel type
// Based on typical real-world figures for UK vehicles
function estimateMPG(
  fuelType: string,
  engineCapacityCC: number
): { mpg: number; milesPerKwh?: number; isEV: boolean } {
  const fuel = fuelType.toUpperCase();

  // Electric vehicles
  if (fuel === 'ELECTRIC' || fuel === 'ELECTRICALLY PROPELLED') {
    return { mpg: 0, milesPerKwh: 3.5, isEV: true };
  }

  // Hydrogen fuel cell
  if (fuel === 'FUEL CELLS') {
    return { mpg: 0, milesPerKwh: 4.0, isEV: true };
  }

  const engineLitres = engineCapacityCC / 1000;

  // Hybrid vehicles - add ~25% improvement over petrol
  if (fuel === 'HYBRID ELECTRIC' || fuel.includes('HYBRID')) {
    let baseMpg: number;
    if (engineLitres <= 1.4) baseMpg = 45;
    else if (engineLitres <= 1.9) baseMpg = 38;
    else baseMpg = 30;
    return { mpg: Math.round(baseMpg * 1.25), isEV: false };
  }

  // Petrol
  if (fuel === 'PETROL' || fuel === 'PETROL/ELECTRIC' || fuel.includes('PETROL')) {
    if (engineLitres <= 1.4) return { mpg: 45, isEV: false };
    if (engineLitres <= 1.9) return { mpg: 38, isEV: false };
    return { mpg: 30, isEV: false };
  }

  // Diesel
  if (fuel === 'DIESEL' || fuel === 'DIESEL/ELECTRIC' || fuel.includes('DIESEL')) {
    if (engineLitres <= 1.4) return { mpg: 55, isEV: false };
    if (engineLitres <= 2.0) return { mpg: 50, isEV: false };
    return { mpg: 42, isEV: false };
  }

  // LPG / Gas
  if (fuel === 'GAS' || fuel === 'GAS/PETROL' || fuel.includes('GAS')) {
    return { mpg: 35, isEV: false };
  }

  // Unknown - reasonable default
  return { mpg: 38, isEV: false };
}

// Clean UK registration plate for DVLA lookup
function cleanRegistration(reg: string): string {
  return reg.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Validate basic UK registration format
function isValidUKRegistration(reg: string): boolean {
  const cleaned = cleanRegistration(reg);
  // Various UK plate formats
  const formats = [
    /^[A-Z]{2}[0-9]{2}[A-Z]{3}$/, // Current format (e.g., AB12CDE)
    /^[A-Z][0-9]{1,3}[A-Z]{3}$/, // Prefix format (e.g., A123BCD)
    /^[A-Z]{3}[0-9]{1,3}[A-Z]$/, // Suffix format (e.g., ABC123D)
    /^[0-9]{1,4}[A-Z]{1,3}$/, // Dateless format
    /^[A-Z]{1,3}[0-9]{1,4}$/, // Dateless format
    /^[A-Z]{2}[0-9]{2}[A-Z]{2,3}$/, // Northern Ireland / shortened
  ];
  return formats.some((f) => f.test(cleaned));
}

export async function lookupVehicle(registration: string): Promise<Vehicle> {
  const cleanedReg = cleanRegistration(registration);

  if (!isValidUKRegistration(cleanedReg)) {
    throw new Error(`Invalid UK registration plate format: ${registration}`);
  }

  const apiKey = process.env.DVLA_API_KEY;

  if (!apiKey) {
    // Return a demo vehicle if no API key configured
    return generateDemoVehicle(cleanedReg);
  }

  try {
    const response = await fetch(DVLA_VES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ registrationNumber: cleanedReg }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Vehicle not found: ${cleanedReg}`);
      }
      if (response.status === 400) {
        throw new Error(`Invalid registration: ${cleanedReg}`);
      }
      if (response.status === 403) {
        throw new Error('DVLA API key invalid or not authorised');
      }
      throw new Error(`DVLA API error: ${response.status}`);
    }

    const data = await response.json();

    const fuelType: string = data.fuelType || data.engineCapacity ? 'PETROL' : 'UNKNOWN';
    const engineCC: number = data.engineCapacity || 1600;
    const { mpg, milesPerKwh, isEV } = estimateMPG(fuelType, engineCC);

    return {
      registration: cleanedReg,
      make: data.make || 'Unknown',
      model: data.registrationNumber || cleanedReg,
      colour: data.colour || 'Unknown',
      year_of_manufacture: data.yearOfManufacture || 2000,
      engine_capacity_cc: engineCC,
      fuel_type: fuelType,
      co2_emissions: data.co2Emissions,
      estimated_mpg: mpg,
      is_electric: isEV,
      estimated_miles_per_kwh: milesPerKwh,
    };
  } catch (error) {
    if (error instanceof Error && (error.message.includes('not found') || error.message.includes('Invalid') || error.message.includes('API key'))) {
      throw error;
    }
    // Network error or timeout - return demo data
    console.error('DVLA lookup failed, using demo data:', error);
    return generateDemoVehicle(cleanedReg);
  }
}

function generateDemoVehicle(registration: string): Vehicle {
  // Generate plausible demo data based on registration plate
  const demos = [
    {
      make: 'Ford',
      model: 'Focus',
      fuel: 'PETROL',
      cc: 1600,
      year: 2019,
      colour: 'Blue',
    },
    {
      make: 'Volkswagen',
      model: 'Golf',
      fuel: 'DIESEL',
      cc: 2000,
      year: 2020,
      colour: 'Silver',
    },
    {
      make: 'Toyota',
      model: 'Yaris',
      fuel: 'HYBRID ELECTRIC',
      cc: 1490,
      year: 2021,
      colour: 'White',
    },
    {
      make: 'Nissan',
      model: 'Leaf',
      fuel: 'ELECTRIC',
      cc: 0,
      year: 2022,
      colour: 'Black',
    },
    {
      make: 'BMW',
      model: '3 Series',
      fuel: 'PETROL',
      cc: 2000,
      year: 2020,
      colour: 'Grey',
    },
    {
      make: 'Vauxhall',
      model: 'Astra',
      fuel: 'PETROL',
      cc: 1200,
      year: 2021,
      colour: 'Red',
    },
  ];

  // Deterministically pick based on registration chars
  const idx = registration.charCodeAt(0) % demos.length;
  const demo = demos[idx];
  const { mpg, milesPerKwh, isEV } = estimateMPG(demo.fuel, demo.cc);

  return {
    registration,
    make: demo.make,
    model: demo.model,
    colour: demo.colour,
    year_of_manufacture: demo.year,
    engine_capacity_cc: demo.cc,
    fuel_type: demo.fuel,
    estimated_mpg: mpg,
    is_electric: isEV,
    estimated_miles_per_kwh: milesPerKwh,
  };
}
