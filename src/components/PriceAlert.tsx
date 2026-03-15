'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Trash2, Plus } from 'lucide-react';
import type { FuelStation, FuelTypeFilter } from '@/lib/types';

interface PriceAlertConfig {
  id: string;
  fuelType: FuelTypeFilter;
  thresholdPence: number;
  postcode: string;
  createdAt: string;
}

const STORAGE_KEY = 'uk-fuel-price-alerts';
const NOTIFIED_KEY = 'uk-fuel-price-alerts-notified';

function loadAlerts(): PriceAlertConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: PriceAlertConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

function loadNotified(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveNotified(keys: Set<string>): void {
  // Only keep the last 200 notification keys to avoid unbounded growth
  const arr = Array.from(keys).slice(-200);
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
}

function fuelPriceForType(station: FuelStation, fuelType: FuelTypeFilter): number | undefined {
  switch (fuelType) {
    case 'petrol': return station.petrol_pence;
    case 'diesel': return station.diesel_pence;
    case 'super_unleaded': return station.super_unleaded_pence;
    case 'lpg': return station.lpg_pence;
  }
}

function fuelTypeLabel(f: FuelTypeFilter): string {
  switch (f) {
    case 'petrol': return 'Petrol';
    case 'diesel': return 'Diesel';
    case 'super_unleaded': return 'Super Unleaded';
    case 'lpg': return 'LPG';
  }
}

interface PriceAlertProps {
  stations: FuelStation[];
}

export default function PriceAlert({ stations }: PriceAlertProps) {
  const [alerts, setAlerts] = useState<PriceAlertConfig[]>([]);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [notifSupported, setNotifSupported] = useState(false);

  // Form state
  const [fuelType, setFuelType] = useState<FuelTypeFilter>('petrol');
  const [thresholdInput, setThresholdInput] = useState('135');
  const [postcodeInput, setPostcodeInput] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    setAlerts(loadAlerts());
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifSupported(true);
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Check stations against alerts and fire notifications
  const checkAlerts = useCallback(() => {
    if (!notifSupported || notifPermission !== 'granted') return;
    if (stations.length === 0 || alerts.length === 0) return;

    const notified = loadNotified();

    for (const alert of alerts) {
      const matchingStations = stations.filter((s) => {
        const price = fuelPriceForType(s, alert.fuelType);
        if (!price) return false;
        if (price > alert.thresholdPence) return false;
        if (alert.postcode) {
          return s.address.toLowerCase().includes(alert.postcode.toLowerCase());
        }
        return true;
      });

      for (const station of matchingStations) {
        const price = fuelPriceForType(station, alert.fuelType);
        if (!price) continue;
        // Deduplicate: only notify once per alert+station per day
        const today = new Date().toISOString().slice(0, 10);
        const key = `${alert.id}-${station.id}-${today}`;
        if (notified.has(key)) continue;

        try {
          new Notification(`Fuel price alert: ${fuelTypeLabel(alert.fuelType)} at ${price.toFixed(1)}p!`, {
            body: `${station.name} (${station.address}) — ${fuelTypeLabel(alert.fuelType)} is ${price.toFixed(1)}p (your threshold: ${alert.thresholdPence}p)`,
            icon: '/favicon.ico',
            tag: key,
          });
          notified.add(key);
        } catch {
          // Notification may fail in some environments
        }
      }
    }

    saveNotified(notified);
  }, [stations, alerts, notifSupported, notifPermission]);

  // Run checks whenever stations or alerts change
  useEffect(() => {
    checkAlerts();
  }, [checkAlerts]);

  const requestPermission = async () => {
    if (!notifSupported) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  const handleAddAlert = () => {
    const threshold = parseFloat(thresholdInput);
    if (isNaN(threshold) || threshold <= 0) return;

    const newAlert: PriceAlertConfig = {
      id: `alert-${Date.now()}`,
      fuelType,
      thresholdPence: threshold,
      postcode: postcodeInput.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...alerts, newAlert];
    setAlerts(updated);
    saveAlerts(updated);

    // Reset form
    setPostcodeInput('');
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  };

  // Compute which alerts are currently triggered
  const triggeredAlertIds = new Set(
    alerts
      .filter((alert) =>
        stations.some((s) => {
          const price = fuelPriceForType(s, alert.fuelType);
          if (!price) return false;
          if (price > alert.thresholdPence) return false;
          if (alert.postcode) return s.address.toLowerCase().includes(alert.postcode.toLowerCase());
          return true;
        })
      )
      .map((a) => a.id)
  );

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-fuel-amber" />
          Price Alerts
        </h2>
        {notifSupported && notifPermission !== 'granted' && (
          <button
            onClick={requestPermission}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-fuel-amber/20 border border-fuel-amber/50 text-fuel-amber rounded-lg text-xs hover:bg-fuel-amber/30 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            Enable notifications
          </button>
        )}
        {notifPermission === 'granted' && (
          <span className="text-xs text-ev-green flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Notifications enabled
          </span>
        )}
        {notifPermission === 'denied' && (
          <span className="text-xs text-red-400 flex items-center gap-1">
            <BellOff className="w-3 h-3" />
            Notifications blocked
          </span>
        )}
      </div>

      {/* New alert form */}
      <div className="bg-navy-700 rounded-lg p-3 space-y-3">
        <div className="text-xs text-gray-400 font-medium">New alert</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fuel type</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelTypeFilter)}
              className="w-full bg-navy-600 border border-navy-500 text-gray-300 text-xs rounded-lg px-2 py-1.5"
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="super_unleaded">Super Unleaded</option>
              <option value="lpg">LPG</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Alert when below (pence)</label>
            <input
              type="number"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              placeholder="e.g. 135"
              min={50}
              max={250}
              step={0.1}
              className="w-full bg-navy-600 border border-navy-500 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-fuel-amber"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Postcode filter (optional)</label>
          <input
            type="text"
            value={postcodeInput}
            onChange={(e) => setPostcodeInput(e.target.value.toUpperCase())}
            placeholder="e.g. SW1A (any station matching)"
            className="w-full bg-navy-600 border border-navy-500 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-fuel-amber"
          />
        </div>

        <button
          onClick={handleAddAlert}
          disabled={!thresholdInput || parseFloat(thresholdInput) <= 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-fuel-amber hover:bg-fuel-amber-dark text-navy-900 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Set Alert
        </button>
      </div>

      {/* Active alerts list */}
      {alerts.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Active alerts ({alerts.length})</div>
          {alerts.map((alert) => {
            const isTriggered = triggeredAlertIds.has(alert.id);
            return (
              <div
                key={alert.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${
                  isTriggered
                    ? 'bg-green-900/20 border-green-700/50'
                    : 'bg-navy-700 border-navy-600'
                }`}
              >
                <Bell className={`w-4 h-4 flex-shrink-0 ${isTriggered ? 'text-ev-green' : 'text-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium">
                    {fuelTypeLabel(alert.fuelType)} below{' '}
                    <span className={isTriggered ? 'text-ev-green' : 'text-fuel-amber'}>
                      {alert.thresholdPence}p
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {alert.postcode ? `Near ${alert.postcode}` : 'Any location'}
                    {isTriggered && (
                      <span className="ml-2 text-ev-green font-medium">Threshold met!</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                  title="Delete alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-2">
          No active alerts. Add one above to get notified when prices drop.
        </p>
      )}

      {!notifSupported && (
        <p className="text-xs text-gray-600 text-center">
          Browser notifications are not supported in this environment.
        </p>
      )}
    </div>
  );
}
