import React, { useEffect, useState } from 'react';
import { SupplyDemandZone } from '../types';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  X, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  getBrowserNotificationPermission, 
  requestBrowserNotificationPermission,
  playAlertSound 
} from '../services/notificationService';

export interface ActiveZoneAlert {
  id: string;
  zone: SupplyDemandZone;
  timestamp: number;
  currentPrice: number;
}

interface Props {
  alerts: ActiveZoneAlert[];
  onDismissAlert: (id: string) => void;
  onSelectZone?: (zone: SupplyDemandZone) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTestNotification: () => void;
}

export const ZoneNotificationToasts: React.FC<Props> = ({
  alerts,
  onDismissAlert,
  onSelectZone,
  soundEnabled,
  onToggleSound,
  onTestNotification
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      onTestNotification();
    }
  };

  return (
    <>
      {/* Floating Real-time Toast Stack in Top Right */}
      <aside aria-label="Zone Notifications" className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {alerts.map(alert => {
          const isDemand = alert.zone.type === 'DEMAND';
          const pipsDist = Math.round(Math.abs(alert.currentPrice - (isDemand ? alert.zone.priceHigh : alert.zone.priceLow)) * 10);

          return (
            <div
              key={alert.id}
              role="alert"
              className={`pointer-events-auto shadow-2xl rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in slide-in-from-right-5 ${
                isDemand 
                  ? 'bg-slate-900/95 border-emerald-500/80 shadow-emerald-500/20' 
                  : 'bg-slate-900/95 border-rose-500/80 shadow-rose-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                    isDemand ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {isDemand ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                        isDemand 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        4/4 VALID {alert.zone.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">XAU/USD</span>
                    </div>
                    <h4 className="text-xs font-black text-white mt-0.5">
                      ${alert.zone.priceLow.toFixed(2)} - ${alert.zone.priceHigh.toFixed(2)}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => onDismissAlert(alert.id)}
                  aria-label="Dismiss notification"
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Criteria Checklist Pills */}
              <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-300 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  Sharp {alert.zone.criteria.displacementPips}p Move
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  FVG Created
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  Backyard Orders
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  {alert.zone.criteria.stalledCandlesCount} Stalled Basing
                </span>
              </div>

              {/* Action and Distance */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[10px]">
                <span className="text-amber-400 font-mono font-bold">
                  {pipsDist} pips from live spot (${alert.currentPrice.toFixed(2)})
                </span>
                <button
                  onClick={() => {
                    if (onSelectZone) onSelectZone(alert.zone);
                    onDismissAlert(alert.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                    isDemand 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black' 
                      : 'bg-rose-500 hover:bg-rose-400 text-white font-black'
                  }`}
                >
                  <span>Trade Zone</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </aside>
    </>
  );
};

export const NotificationControlsBar: React.FC<{
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTestNotification: () => void;
}> = ({
  soundEnabled,
  onToggleSound,
  onTestNotification
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      onTestNotification();
    }
  };

  const isGranted = permission === 'granted';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isGranted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {isGranted ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Browser Real-Time Zone Alerts</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
              isGranted 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isGranted ? 'ACTIVE' : permission === 'denied' ? 'BLOCKED' : 'PROMPT'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Instant OS/desktop notification and audio chime when a 4/4 qualified Demand or Supply zone forms.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
            soundEnabled 
              ? 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-750' 
              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Mute alert audio' : 'Enable alert audio'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
        </button>

        {/* Test Alert Button */}
        <button
          onClick={onTestNotification}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-bold transition-all active:scale-95"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          Test Alert
        </button>

        {/* Permission Request Button */}
        {!isGranted && (
          <button
            onClick={handleRequestPermission}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-black shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <BellRing className="w-3.5 h-3.5" />
            Enable Browser Alerts
          </button>
        )}
      </div>
    </div>
  );
};
