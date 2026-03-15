'use client';

import { useEffect, useRef, useState } from 'react';
import type { FuelStation, EVCharger, Location } from '@/lib/types';

// Leaflet is loaded dynamically to avoid SSR issues
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

interface MapProps {
  center: Location;
  fuelStations: FuelStation[];
  evChargers: EVCharger[];
  onFuelStationClick?: (station: FuelStation) => void;
  onEVChargerClick?: (charger: EVCharger) => void;
  selectedFuelStation?: FuelStation | null;
  selectedEVCharger?: EVCharger | null;
}

// Create SVG icon for fuel pump
function createFuelIcon(pricePence?: number) {
  const color = !pricePence ? '#94a3b8' : pricePence < 135 ? '#22c55e' : pricePence < 142 ? '#facc15' : pricePence < 148 ? '#f59e0b' : '#ef4444';
  const label = pricePence ? `${pricePence}p` : '?';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
    </defs>
    <path d="M20 46 L8 32 Q4 26 4 20 A16 16 0 0 1 36 20 Q36 26 32 32 Z" fill="${color}" filter="url(#shadow)"/>
    <circle cx="20" cy="20" r="13" fill="#0f172a" opacity="0.9"/>
    <text x="20" y="17" text-anchor="middle" font-family="system-ui,sans-serif" font-size="7" font-weight="bold" fill="${color}">⛽</text>
    <text x="20" y="26" text-anchor="middle" font-family="system-ui,sans-serif" font-size="7" font-weight="bold" fill="white">${label}</text>
  </svg>`;

  return svg;
}

// Create SVG icon for EV charger
function createEVIcon(maxPowerKw?: number) {
  const color = !maxPowerKw ? '#94a3b8' : maxPowerKw >= 100 ? '#a855f7' : maxPowerKw >= 50 ? '#3b82f6' : maxPowerKw >= 22 ? '#22c55e' : '#6ee7b7';
  const label = maxPowerKw ? `${maxPowerKw}kW` : 'EV';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
    <defs>
      <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
    </defs>
    <path d="M20 46 L8 32 Q4 26 4 20 A16 16 0 0 1 36 20 Q36 26 32 32 Z" fill="${color}" filter="url(#shadow2)"/>
    <circle cx="20" cy="20" r="13" fill="#0f172a" opacity="0.9"/>
    <text x="20" y="17" text-anchor="middle" font-family="system-ui,sans-serif" font-size="8" font-weight="bold" fill="${color}">⚡</text>
    <text x="20" y="26" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${label.length > 4 ? '5.5' : '6'}" font-weight="bold" fill="white">${label}</text>
  </svg>`;

  return svg;
}

export default function Map({
  center,
  fuelStations,
  evChargers,
  onFuelStationClick,
  onEVChargerClick,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<{ fuel: unknown[]; ev: unknown[] }>({ fuel: [], ev: [] });
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet CSS and JS
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      // Inject Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Leaflet'));
          document.head.appendChild(script);
        });
      }

      setLeafletLoaded(true);
    };

    loadLeaflet().catch(console.error);
  }, []);

  // Initialise map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
  }, [leafletLoaded, center.lat, center.lng]);

  // Update markers when data changes
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Remove old fuel markers
    markersLayerRef.current.fuel.forEach((m) => (m as { remove: () => void }).remove());
    markersLayerRef.current.fuel = [];

    // Add fuel station markers
    fuelStations.forEach((station) => {
      const svg = createFuelIcon(station.petrol_pence || station.diesel_pence);
      const icon = L.divIcon({
        html: svg,
        iconSize: [40, 48],
        iconAnchor: [20, 46],
        popupAnchor: [0, -46],
        className: '',
      });

      const priceHtml = [
        station.petrol_pence ? `<span style="color:#f59e0b">⛽ ${station.petrol_pence.toFixed(1)}p</span>` : '',
        station.diesel_pence ? `<span style="color:#94a3b8">🚛 ${station.diesel_pence.toFixed(1)}p</span>` : '',
      ]
        .filter(Boolean)
        .join(' &nbsp; ');

      const popup = L.popup({ maxWidth: 220 }).setContent(`
        <div style="font-family:system-ui,sans-serif;background:#1e293b;color:#f1f5f9;padding:12px;border-radius:8px;min-width:180px">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px">${station.name}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">${station.address}</div>
          <div style="font-size:13px;display:flex;gap:8px;flex-wrap:wrap">${priceHtml || '<span style="color:#64748b">Price unavailable</span>'}</div>
          ${station.distance_miles !== undefined ? `<div style="font-size:11px;color:#64748b;margin-top:4px">${station.distance_miles.toFixed(1)} miles away</div>` : ''}
          ${station.isDemoData ? '<div style="font-size:10px;color:#f59e0b;margin-top:4px;opacity:0.7">⚠ Demo data</div>' : ''}
        </div>
      `);

      const marker = L.marker([station.lat, station.lng], { icon })
        .addTo(map)
        .bindPopup(popup)
        .on('click', () => {
          onFuelStationClick?.(station);
        });

      markersLayerRef.current.fuel.push(marker);
    });

    // Remove old EV markers
    markersLayerRef.current.ev.forEach((m) => (m as { remove: () => void }).remove());
    markersLayerRef.current.ev = [];

    // Add EV charger markers
    evChargers.forEach((charger) => {
      const maxPower = Math.max(...charger.connections.map((c) => c.power_kw), 0);
      const svg = createEVIcon(maxPower || undefined);
      const icon = L.divIcon({
        html: svg,
        iconSize: [40, 48],
        iconAnchor: [20, 46],
        popupAnchor: [0, -46],
        className: '',
      });

      const connHtml = charger.connections
        .slice(0, 3)
        .map((c) => `<span style="font-size:10px;background:#334155;padding:2px 5px;border-radius:4px;margin:1px;display:inline-block">${c.type} ${c.power_kw}kW</span>`)
        .join('');

      const popup = L.popup({ maxWidth: 250 }).setContent(`
        <div style="font-family:system-ui,sans-serif;background:#1e293b;color:#f1f5f9;padding:12px;border-radius:8px;min-width:200px">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px">${charger.name}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${charger.address}</div>
          <div style="font-size:12px;color:${charger.is_operational ? '#22c55e' : '#ef4444'};margin-bottom:6px">
            ${charger.is_operational ? '● Operational' : '● Out of service'}
          </div>
          ${charger.usage_cost ? `<div style="font-size:11px;color:#22c55e;margin-bottom:6px">💰 ${charger.usage_cost}</div>` : ''}
          <div style="margin-top:4px">${connHtml}</div>
          ${charger.distance_miles !== undefined ? `<div style="font-size:11px;color:#64748b;margin-top:6px">${charger.distance_miles.toFixed(1)} miles away</div>` : ''}
        </div>
      `);

      const marker = L.marker([charger.lat, charger.lng], { icon })
        .addTo(map)
        .bindPopup(popup)
        .on('click', () => {
          onEVChargerClick?.(charger);
        });

      markersLayerRef.current.ev.push(marker);
    });

    // Add user location marker
    const userIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: '',
    });

    L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(map)
      .bindTooltip('You are here', { permanent: false });
  }, [leafletLoaded, fuelStations, evChargers, center, onFuelStationClick, onEVChargerClick]);

  // Pan to new center when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded) return;
    mapInstanceRef.current.setView([center.lat, center.lng], 13, { animate: true });
  }, [center.lat, center.lng, leafletLoaded]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-navy-700">
      <div ref={mapRef} className="w-full h-full" />
      {!leafletLoaded && (
        <div className="absolute inset-0 bg-navy-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-fuel-amber border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
