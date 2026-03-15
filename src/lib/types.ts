// Core types for the UK Fuel & EV Price Tracker

export interface Location {
  lat: number;
  lng: number;
}

export interface StationFacilities {
  car_wash: boolean;
  shop: boolean;
  coffee: boolean;
  air_pump: boolean;
  toilets: boolean;
  hgv_access: boolean;
  adblue: boolean;
  atm: boolean;
  open_24h: boolean;
  // Attached retailer/shop brand
  shop_brand?: string; // e.g. "Sainsbury's Local", "Tesco Express", "M&S Simply Food", "Spar", "Londis", "Costa", "Greggs"
  food_brand?: string; // e.g. "McDonald's", "Greggs", "Subway", "KFC"
  coffee_brand?: string; // e.g. "Costa Express", "Starbucks"
}

export interface FuelStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  lat: number;
  lng: number;
  petrol_pence?: number;
  diesel_pence?: number;
  super_unleaded_pence?: number;
  lpg_pence?: number;
  last_updated?: string;
  isDemoData?: boolean;
  distance_miles?: number;
  facilities?: StationFacilities;
}

export interface EVCharger {
  id: string;
  name: string;
  operator: string;
  address: string;
  lat: number;
  lng: number;
  connections: EVConnection[];
  usage_cost?: string;
  is_operational: boolean;
  distance_miles?: number;
}

export interface EVConnection {
  type: string;
  power_kw: number;
  quantity: number;
  status?: string;
}

export type StationType = 'fuel' | 'ev';

export interface StationMarker {
  type: StationType;
  station: FuelStation | EVCharger;
}

export interface PriceSnapshot {
  id?: number;
  station_id: string;
  station_name: string;
  fuel_type: string;
  price_pence: number;
  lat: number;
  lng: number;
  recorded_at: string;
}

export interface PriceHistoryPoint {
  date: string;
  price_pence: number;
  station_name: string;
}

export interface Vehicle {
  registration: string;
  make: string;
  model: string;
  colour: string;
  year_of_manufacture: number;
  engine_capacity_cc: number;
  fuel_type: string;
  co2_emissions?: number;
  estimated_mpg: number;
  is_electric: boolean;
  estimated_miles_per_kwh?: number;
}

export interface WorthItInput {
  near_station_price_pence: number;
  near_station_distance_miles: number;
  far_station_price_pence: number;
  far_station_distance_miles: number;
  planned_fill_litres: number;
  car_mpg: number;
  fuel_type?: string;
}

export interface WorthItResult {
  extra_distance_miles: number;
  fuel_for_detour_litres: number;
  cost_of_detour_gbp: number;
  savings_per_litre_pence: number;
  savings_on_fill_gbp: number;
  net_saving_gbp: number;
  time_extra_minutes: number;
  worth_it: boolean;
  verdict: string;
}

export interface FuelPricesResponse {
  stations: FuelStation[];
  isDemoData: boolean;
  fetchedAt: string;
  location: Location;
}

export interface EVChargersResponse {
  chargers: EVCharger[];
  fetchedAt: string;
  location: Location;
}

export type SortOption = 'price_petrol' | 'price_diesel' | 'distance' | 'effective_cost';
export type TabOption = 'nearby' | 'route' | 'compare' | 'stats' | 'history' | 'calculator';
export type FuelTypeFilter = 'petrol' | 'diesel' | 'super_unleaded' | 'lpg';
