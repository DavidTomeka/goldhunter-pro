import React, { useState, useEffect } from 'react';
import { TradingSession } from '../types';
import { Clock, Globe, Zap, ShieldAlert } from 'lucide-react';

interface Props {
  activeSession: TradingSession;
}

export const GoldSessionClock: React.FC<Props> = ({ activeSession }) => {
  const [gmtTime, setGmtTime] = useState<string>('');
  const [nyTime, setNyTime] = useState<string>('');
  const [londonTime, setLondonTime] = useState<string>('');

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setGmtTime(now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }));
      setNyTime(now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }));
      setLondonTime(now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false }));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const sessions = [
    {
      name: 'Asian Range',
      gmtRange: '00:00 - 08:00 GMT',
      status: activeSession === 'ASIAN_RANGE' ? 'ACTIVE' : 'STANDBY',
      liquidity: 'Consolidation / Liquidity Pool Formation',
      color: activeSession === 'ASIAN_RANGE' ? 'border-amber-500/80 bg-amber-950/30 text-amber-300' : 'border-slate-800 bg-slate-900/50 text-slate-400'
    },
    {
      name: 'London Open',
      gmtRange: '07:00 - 11:00 GMT',
      status: activeSession === 'LONDON_OPEN' ? 'ACTIVE' : 'STANDBY',
      liquidity: 'Judas Swing & Initial Breakout Liquidity',
      color: activeSession === 'LONDON_OPEN' ? 'border-blue-500/80 bg-blue-950/30 text-blue-300' : 'border-slate-800 bg-slate-900/50 text-slate-400'
    },
    {
      name: 'New York AM Killzone',
      gmtRange: '12:30 - 16:30 GMT',
      status: activeSession === 'NY_AM_KILLZONE' ? 'ACTIVE' : 'STANDBY',
      liquidity: 'Peak Gold Volume / Silver Bullet / US News (CPI/NFP)',
      color: activeSession === 'NY_AM_KILLZONE' ? 'border-emerald-500/80 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-slate-900/50 text-slate-400'
    },
    {
      name: 'New York PM Session',
      gmtRange: '17:00 - 21:00 GMT',
      status: activeSession === 'NY_PM_SESSION' ? 'ACTIVE' : 'STANDBY',
      liquidity: 'Mean Reversion & Daily Range Close',
      color: activeSession === 'NY_PM_SESSION' ? 'border-indigo-500/80 bg-indigo-950/30 text-indigo-300' : 'border-slate-800 bg-slate-900/50 text-slate-400'
    }
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
      {/* Session Header and Real Clocks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              Institutional Gold Sessions & Killzones
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-400">ICT High-Probability Execution Timing for XAU/USD</p>
          </div>
        </div>

        {/* Global Clocks */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-[9px] text-slate-500 block">GMT / UTC</span>
            <span className="text-amber-400 font-bold">{gmtTime || '13:42:00'}</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-[9px] text-slate-500 block">NEW YORK (EST)</span>
            <span className="text-emerald-400 font-bold">{nyTime || '09:42:00'}</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-[9px] text-slate-500 block">LONDON (BST)</span>
            <span className="text-blue-400 font-bold">{londonTime || '14:42:00'}</span>
          </div>
        </div>
      </div>

      {/* 4 Sessions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {sessions.map((sess, idx) => {
          const isActive = sess.status === 'ACTIVE';
          return (
            <div 
              key={idx}
              className={`p-2.5 rounded-xl border transition-all ${sess.color} relative overflow-hidden`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
              )}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {sess.name}
                </span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
                }`}>
                  {sess.status}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mb-1">{sess.gmtRange}</div>
              <p className="text-[10px] text-slate-300 leading-snug line-clamp-1">{sess.liquidity}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
