'use client';

import { Fuel, Zap, MapPin } from 'lucide-react';

interface HeaderProps {
  locationName?: string;
}

export default function Header({ locationName }: HeaderProps) {
  return (
    <header className="bg-navy-800 border-b border-navy-700 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Fuel className="w-6 h-6 text-fuel-amber" />
            <Zap className="w-5 h-5 text-ev-green" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">UK Fuel & EV Tracker</h1>
            <p className="text-navy-600 text-xs">Find the cheapest fuel & charging near you</p>
          </div>
        </div>

        {locationName && (
          <div className="flex items-center gap-1.5 text-navy-600 text-sm">
            <MapPin className="w-4 h-4 text-fuel-amber" />
            <span className="hidden sm:inline">{locationName}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-navy-700 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-ev-green animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </header>
  );
}
