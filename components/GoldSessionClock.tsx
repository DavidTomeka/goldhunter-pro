import React, { useState, useEffect } from 'react';
import { TradingSession } from '../types';
import { Globe, Clock, Zap, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { SESSIONS_CONFIG, getLiveSessionState } from '../services/sessionService';

interface Props {
  activeSession: TradingSession;
  sessionMode?: 'AUTO' | 'MANUAL';
  onSelectSession?: (session: TradingSession) => void;
  onResetToAuto?: () => void;
}

export const GoldSessionClock: React.FC<Props> = ({ 
  activeSession, 
  sessionMode = 'AUTO',
  onSelectSession,
  onResetToAuto 
}) => {
  const [gmtTime, setGmtTime] = useState<string>('');
  const [nyTime, setNyTime] = useState<string>('');
  const [londonTime, setLondonTime] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('');
  const [liveAutoSession, setLiveAutoSession] = useState<TradingSession>('LONDON_OPEN');
  const [isWeekend, setIsWeekend] = useState<boolean>(false);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setGmtTime(now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }));
      setNyTime(now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }));
      setLondonTime(now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false }));

      const liveState = getLiveSessionState(now);
      setCountdown(liveState.timeRemainingFormatted);
      setLiveAutoSession(liveState.activeSession);
      setIsWeekend(liveState.isWeekend);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSessionDetails = (id: TradingSession) => {
    return SESSIONS_CONFIG.find(s => s.id === id);
  };

  const currentConfig = getSessionDetails(activeSession);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
      {/* Session Header and Real Clocks */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                Institutional Gold Sessions & Killzones
              </h3>
              {sessionMode === 'AUTO' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Auto-Detected
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Clock className="w-3 h-3" />
                    Manual Simulation
                  </span>
                  {onResetToAuto && (
                    <button
                      onClick={onResetToAuto}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-0.5"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Reset to Live Auto
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Strict ICT timing synchronization with London (BST) & New York (EST) bank trading desks
            </p>
          </div>
        </div>

        {/* Global Clocks */}
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap sm:flex-nowrap">
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center flex-1 sm:flex-none">
            <span className="text-[9px] text-slate-500 block uppercase font-sans font-semibold">GMT / UTC</span>
            <span className="text-amber-400 font-bold">{gmtTime || '07:00:00'}</span>
          </div>
          <div className={`px-3 py-1.5 bg-slate-950 rounded-lg border text-center flex-1 sm:flex-none transition-all ${
            activeSession === 'LONDON_OPEN' ? 'border-blue-500/50 ring-1 ring-blue-500/30' : 'border-slate-800'
          }`}>
            <span className="text-[9px] text-blue-400 block uppercase font-sans font-semibold flex items-center justify-center gap-1">
              London (BST)
              {activeSession === 'LONDON_OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
            </span>
            <span className="text-blue-300 font-bold">{londonTime || '08:00:00'}</span>
          </div>
          <div className={`px-3 py-1.5 bg-slate-950 rounded-lg border text-center flex-1 sm:flex-none transition-all ${
            activeSession === 'NY_AM_KILLZONE' || activeSession === 'NY_PM_SESSION' ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' : 'border-slate-800'
          }`}>
            <span className="text-[9px] text-emerald-400 block uppercase font-sans font-semibold flex items-center justify-center gap-1">
              New York (EST)
              {(activeSession === 'NY_AM_KILLZONE' || activeSession === 'NY_PM_SESSION') && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </span>
            <span className="text-emerald-400 font-bold">{nyTime || '03:00:00'}</span>
          </div>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isWeekend ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-slate-400">Current Phase:</span>
          <span className="font-bold text-white flex items-center gap-1">
            {currentConfig?.name || (isWeekend ? 'Weekend Market Close' : 'Live Gold Trading')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
            ({currentConfig?.gmtRange})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-slate-400">Session Remaining:</span>
            <span className="font-mono font-bold text-amber-300 text-xs">{countdown}</span>
          </div>
          {sessionMode === 'MANUAL' && onResetToAuto && (
            <button
              onClick={onResetToAuto}
              className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-[10px] font-bold border border-cyan-500/30 transition-all flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Follow Live Clock
            </button>
          )}
        </div>
      </div>

      {/* 4 Sessions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SESSIONS_CONFIG.map((sess) => {
          const isActive = activeSession === sess.id;
          const isRealLive = liveAutoSession === sess.id;
          return (
            <div 
              key={sess.id}
              onClick={() => onSelectSession && onSelectSession(sess.id)}
              className={`p-3 rounded-xl border transition-all relative overflow-hidden cursor-pointer select-none group ${
                isActive 
                  ? `${sess.color} ring-1 ring-white/10 shadow-lg` 
                  : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full pointer-events-none" />
              )}
              
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {sess.name}
                </span>
                <div className="flex items-center gap-1">
                  {isRealLive && sessionMode === 'MANUAL' && (
                    <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      LIVE NOW
                    </span>
                  )}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded transition-all ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                      : 'bg-slate-800/80 text-slate-500 group-hover:text-slate-400'
                  }`}>
                    {isActive ? 'ACTIVE' : 'STANDBY'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>{sess.gmtRange}</span>
                {isActive && (
                  <span className="text-[9px] text-emerald-400 font-sans font-bold flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Executing
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">
                {sess.liquidity}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
