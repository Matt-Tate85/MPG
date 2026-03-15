import { NextResponse } from 'next/server';

export interface LoyaltyScheme {
  id: string;
  brand: string;
  scheme_name: string;
  discount_pence_per_litre: number | null;
  discount_description: string;
  earn_description: string;
  redeem_description: string;
  station_brands: string[];
  last_verified: string;
  notes: string;
}

// Static data — update manually when schemes change.
const LOYALTY_SCHEMES: LoyaltyScheme[] = [
  {
    id: 'tesco_clubcard',
    brand: 'Tesco',
    scheme_name: 'Tesco Clubcard',
    discount_pence_per_litre: 4,
    discount_description: 'Typically 3–5p/L off when Clubcard offer is active',
    earn_description: 'Earn 1 Clubcard point per £2 spent on fuel (when not in offer period)',
    redeem_description: 'Clubcard offers applied automatically at pump with linked Clubcard',
    station_brands: ['Tesco'],
    last_verified: '2025-01-01',
    notes: 'Discount varies by promotion. Check Tesco app for current offer.',
  },
  {
    id: 'sainsburys_nectar',
    brand: "Sainsbury's",
    scheme_name: "Sainsbury's Nectar",
    discount_pence_per_litre: 3,
    discount_description: 'Typically 2–3p/L off with Nectar offer',
    earn_description: 'Earn 1 Nectar point per £1 spent on fuel',
    redeem_description: 'Nectar price offers applied at pump with Nectar card/app',
    station_brands: ["Sainsbury's"],
    last_verified: '2025-01-01',
    notes: 'Check Sainsbury\'s app for current personalised Nectar offers.',
  },
  {
    id: 'morrisons_more',
    brand: 'Morrisons',
    scheme_name: 'Morrisons More Card',
    discount_pence_per_litre: null,
    discount_description: 'Earn 5 More Points per litre (~1p value)',
    earn_description: '5 More Points per litre; bonus offers available',
    redeem_description: 'Convert points to money-off vouchers in-store',
    station_brands: ['Morrisons'],
    last_verified: '2025-01-01',
    notes: 'Points earned, not direct discount. 5000 points = £5.',
  },
  {
    id: 'asda_rewards',
    brand: 'ASDA',
    scheme_name: 'ASDA Rewards',
    discount_pence_per_litre: null,
    discount_description: 'Cashback via ASDA Rewards Cashpot',
    earn_description: 'Earn cashback % on fuel spend, deposited to Cashpot',
    redeem_description: 'Cashpot redeemable against ASDA shopping',
    station_brands: ['ASDA'],
    last_verified: '2025-01-01',
    notes: 'Cashback rate varies. Check ASDA Rewards app.',
  },
  {
    id: 'esso_nectar',
    brand: 'Esso',
    scheme_name: 'Esso Nectar',
    discount_pence_per_litre: null,
    discount_description: 'Earn Nectar points on fuel',
    earn_description: '2 Nectar points per litre of fuel',
    redeem_description: 'Nectar points redeemable at Sainsbury\'s and partners',
    station_brands: ['Esso'],
    last_verified: '2025-01-01',
    notes: '2 points per litre ≈ 1p value per litre.',
  },
  {
    id: 'shell_go_plus',
    brand: 'Shell',
    scheme_name: 'Shell Go+',
    discount_pence_per_litre: null,
    discount_description: 'Earn reward points; free coffees and discounts',
    earn_description: 'Points on every litre; bonus for in-store purchases',
    redeem_description: 'Free coffees, car washes, money-off fuel',
    station_brands: ['Shell'],
    last_verified: '2025-01-01',
    notes: 'After 5 fuel fills, earn a free Coffee.',
  },
  {
    id: 'bp_bpme',
    brand: 'BP',
    scheme_name: 'BP BPme Rewards',
    discount_pence_per_litre: null,
    discount_description: 'Earn cashback on fuel and in-store',
    earn_description: '1% cashback on fuel and shop purchases',
    redeem_description: 'Cashback credited to BPme wallet, redeemable at BP',
    station_brands: ['BP'],
    last_verified: '2025-01-01',
    notes: '1% cashback on fuel ≈ ~1.4p/L at current prices.',
  },
];

export async function GET() {
  return NextResponse.json({
    schemes: LOYALTY_SCHEMES,
    last_updated: '2025-01-01',
    note: 'Discount values are approximate and subject to change. Check the retailer\'s app for current promotions.',
  });
}
