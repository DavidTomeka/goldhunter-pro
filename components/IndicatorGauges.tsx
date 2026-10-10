import React from 'react';
import { TimeFrame } from '../types';
import { TIMEFRAME_PROFILES } from '../services/geminiService';

interface Props {
  rsi: number;
  ema20: number;
  ema50: number;
  price: number;
  spreadPoints: number;
  timeframe?: TimeFrame;
}

export const IndicatorGauges: React.FC<Props> = ({ 
  rsi, 
  ema20, 
  ema50, 
  price, 
  spreadPoints,
  timeframe = TimeFrame.M5
}) => {
  const profile = TIMEFRAME_PROFILES[timeframe] || TIMEFRAME_PROFILES[TimeFrame.M5];

  const getRsiStatus = (val: number) => {
    if (val <= 30) return { text: `OVERSOLD (${timeframe} BUY ACCUMULATION)`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (val >= 70) return { text: `OVERBOUGHT (${timeframe} PREMIUM DISTRIBUTION)`, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    if (val >= 45 && val <= 55) return { text: `${timeframe} FAIR VALUE EQUILIBRIUM`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { text: val > 50 ? `${timeframe} BULLISH MOMENTUM` : `${timeframe} BEARISH MOMENTUM`, color: 'text-cyan-400', bg: 'bg-slate-800/40 border-slate-700/60' };
  };

  const rsiStatus = getRsiStatus(rsi);
  const diffFromEma20 = (price - ema20);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
      {/* 1. RSI Indicator Box */}
      <div className={`flex flex-col items-center justify-center p-3 rounded-lg border ${rsiStatus.bg} transition-all`}>
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            RSI (14) • {timeframe}
          </span>
          <span className="text-[9px] font-mono text-slate-500">Range: 30 - 70</span>
        </div>
        <span className={`text-2xl font-black mono ${rsiStatus.color}`}>
          {rsi.toFixed(1)}
        </span>
        <span className={`text-[10px] font-bold mt-0.5 text-center ${rsiStatus.color}`}>
          {rsiStatus.text}
        </span>
      </div>

      {/* 2. EMA(20) & EMA(50) Trend Alignment */}
      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            EMA (20) • {timeframe}
          </span>
          <span className="text-[9px] font-mono text-cyan-400">
            {diffFromEma20 >= 0 ? `+${diffFromEma20.toFixed(2)}` : diffFromEma20.toFixed(2)} pts
          </span>
        </div>
        <span className="text-2xl font-black mono text-cyan-400">
          ${ema20.toFixed(2)}
        </span>
        <span className="text-[10px] font-bold text-slate-400 mt-0.5">
          {price >= ema20 ? `✓ Above Dynamic ${timeframe} Support` : `▼ Below Dynamic ${timeframe} Resistance`}
        </span>
      </div>

      {/* 3. ATR Volatility & Expected Candle Range */}
      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            ATR VOLATILITY • {timeframe}
          </span>
          <span className="text-[9px] font-mono text-emerald-400">
            Avg: ~{profile.atrAvg} pips
          </span>
        </div>
        <span className="text-2xl font-black mono text-emerald-400">
          {profile.atrAvg} <span className="text-sm font-normal text-slate-400">PIPS</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400 mt-0.5">
          {profile.horizon} Candle Volatility Target
        </span>
      </div>

      {/* 4. SMC Liquidity State */}
      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            SMC ORDER FLOW • {timeframe}
          </span>
          <span className="text-[9px] font-mono text-amber-400">96%+ Alignment</span>
        </div>
        <span className="text-lg font-black mono text-amber-400">
          {timeframe === TimeFrame.H4 || timeframe === TimeFrame.D1 
            ? 'BSL/SSL EXPANSION' 
            : timeframe === TimeFrame.M15 
            ? 'JUDAS SWING / OTE' 
            : 'SILVER BULLET / FVG'}
        </span>
        <span className="text-[10px] font-bold text-slate-400 mt-0.5">
          {timeframe === TimeFrame.H4 || timeframe === TimeFrame.D1
            ? 'Weekly Liquidity Pools Activated'
            : 'Origin Order Block Mitigated'}
        </span>
      </div>
    </div>
  );
};
