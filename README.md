# UK Fuel & EV Price Tracker

A Next.js 14 web application that shows UK fuel prices and EV charging prices near you, with a "Worth It?" calculator and car registration lookup.

## Features

- **Map View** — Leaflet map showing nearby fuel stations and EV chargers with price overlays. Colour-coded markers indicate cheap (green) through expensive (red) prices.
- **Station List** — Sortable by price, distance, or fuel type. Shows petrol and diesel prices side by side.
- **EV Charger Finder** — Shows Open Charge Map data including power (kW), connector types, and pricing info.
- **Price History** — Charts showing UK average and per-station price trends over time (stored locally in SQLite).
- **"Worth It?" Calculator** — Given two stations, calculates whether the detour to the cheaper station is financially worthwhile after accounting for fuel cost of the detour and time.
- **Car Reg Lookup** — Enter a UK registration plate to get make, model, engine, fuel type and estimated MPG via the free DVLA VES API.

## Live Data Sources

| Source | What it provides | Auth required |
|--------|-----------------|---------------|
| [Open Charge Map](https://openchargemap.org) | EV charger locations, connectors, pricing | No (API key optional for higher limits) |
| [DVLA VES](https://developer-portal.driver-vehicle-licensing.agency.gov.uk/) | Vehicle make/model/fuel type/engine | Yes — free key |
| [Nominatim](https://nominatim.openstreetmap.org/) | Postcode/address geocoding | No |
| [OSRM](https://router.project-osrm.org/) | Driving distance/duration | No |
| Asda/Tesco price feeds | Live supermarket fuel prices | No (public endpoints) |

Fuel price feeds from Asda and Tesco are attempted first. If unavailable (they are undocumented public endpoints that may change), the app falls back to realistic demo data (typical UK prices ~140–153p/litre) clearly labelled as demo data. Every search stores prices in a local SQLite database to build up historical data.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone <your-repo>
cd MPG
npm install
```

### Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Free from https://developer-portal.driver-vehicle-licensing.agency.gov.uk/
DVLA_API_KEY=your_key_here

# Free from https://openchargemap.org/site/develop/api (optional)
OCM_API_KEY=your_key_here
```

**Getting a free DVLA API key:**
1. Go to https://developer-portal.driver-vehicle-licensing.agency.gov.uk/
2. Register for a free account
3. Subscribe to the "Vehicle Enquiry Service" API (free tier available)
4. Copy your API key into `DVLA_API_KEY`

Without a DVLA key the app uses demo vehicle data based on the registration format.

### Running the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database is created automatically at `./data/prices.db` on first run.

## How the "Worth It?" Calculator Works

The calculator answers: *Is it worth driving further to reach a cheaper fuel station?*

```
extra_distance = (far_station_distance - near_station_distance) × 2
                 (round trip — you go there AND come back)

fuel_for_detour = (extra_distance / car_mpg) × 4.546 litres/gallon

cost_of_detour = fuel_for_detour × near_price_pence / 100

savings_on_fill = (near_price - far_price) × planned_fill_litres / 100

net_saving = savings_on_fill - cost_of_detour

worth_it = net_saving > 0
```

**Example:** Near station at 143p (0.5 miles), cheaper station at 138p (3 miles), planning to fill 40 litres in a 38 MPG car:

- Extra distance: (3 − 0.5) × 2 = 5 miles
- Fuel for detour: (5 / 38) × 4.546 = 0.598 litres
- Cost of detour: 0.598 × 143p = £0.86
- Savings on fill: (5p / 100) × 40L = £2.00
- Net saving: £2.00 − £0.86 = **£1.14 — Worth it!**

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page — tabbed interface
│   ├── globals.css         # Global styles + Leaflet overrides
│   └── api/
│       ├── fuel-prices/    # GET /api/fuel-prices?lat=&lng=
│       ├── ev-chargers/    # GET /api/ev-chargers?lat=&lng=
│       ├── vehicle/        # GET /api/vehicle?reg=AB12CDE
│       ├── worth-it/       # POST /api/worth-it
│       └── price-history/  # GET /api/price-history?station_id=&fuel_type=
├── components/
│   ├── Map.tsx             # Leaflet map (client only, dynamic import)
│   ├── StationCard.tsx     # Fuel station + EV charger cards
│   ├── PriceChart.tsx      # Recharts price history
│   ├── WorthItCalculator.tsx
│   ├── RegLookup.tsx
│   └── Header.tsx
└── lib/
    ├── types.ts            # TypeScript types
    ├── db.ts               # SQLite via better-sqlite3
    ├── fuel-prices.ts      # Fuel price fetching + demo fallback
    ├── ev-chargers.ts      # Open Charge Map integration
    ├── vehicle.ts          # DVLA VES lookup + MPG estimation
    └── calculations.ts     # Worth-it formula + geocoding helpers
```

## MPG Estimation

When DVLA doesn't return MPG (it typically doesn't — it returns engine size and fuel type), the app estimates based on engine size:

| Type | Engine | Estimated MPG |
|------|--------|---------------|
| Petrol | 1.0–1.4L | 45 MPG |
| Petrol | 1.5–1.9L | 38 MPG |
| Petrol | 2.0L+ | 30 MPG |
| Diesel | up to 1.4L | 55 MPG |
| Diesel | 1.5–2.0L | 50 MPG |
| Diesel | 2.0L+ | 42 MPG |
| Hybrid | any | +25% over petrol |
| Electric | — | ~3.5 miles/kWh |

## Screenshots

*Coming soon — run the app locally to see it in action.*

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (dark navy theme)
- **Leaflet** (interactive map, loaded dynamically to avoid SSR issues)
- **Recharts** (price history charts)
- **better-sqlite3** (local SQLite for price history)
- **lucide-react** (icons)

## Notes on Fuel Price Data

Live supermarket fuel prices in the UK are difficult to obtain programmatically:

- **Asda** and **Tesco** have unofficial public endpoints that may work
- The **CMA Fuel Price Transparency Scheme** (https://www.gov.uk/guidance/fuel-price-transparency-scheme-data) provides official data but requires registration
- When live data is unavailable, the app shows clearly-labelled demo data at realistic prices

The app stores every price it sees into SQLite, so your history grows the more you use it.

## Licence

MIT
