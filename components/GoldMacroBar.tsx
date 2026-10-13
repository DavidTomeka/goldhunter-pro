import React from 'react';
import { GoldMacroData } from '../types';
import { DollarSign, TrendingDown, TrendingUp, BarChart2, Shield, Activity, Flame } from 'lucide-react';

interface Props {
  macro: GoldMacroData;
  spreadPoints: number;
  currentPrice: number;
}

export const GoldMacroBar: React.FC<Props> = ({ macro, spreadPoints, currentPrice }) => {
  const isDxyDown = macro.dxyChange < 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
      {/* 1. DXY US Dollar Index */}
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            DXY Dollar Index
          </span>
          <span className={`text-[10px] font-mono font-bold flex items-center ${isDxyDown ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isDxyDown ? <TrendingDown className="w-3 h-3 mr-0.5" /> : <TrendingUp className="w-3 h-3 mr-0.5" />}
            {macro.dxyChange > 0 ? `+${macro.dxyChange.toFixed(2)}%` : `${macro.dxyChange.toFixed(2)}%`}
          </span>
        </div>
        <div className="mt-1">
          <span className="text-xl font-black mono text-white">{macro.dxyIndex.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {isDxyDown ? 'Bullish for Gold (Inverse)' : 'Bearish for Gold (Dollar Strength)'}
          </span>
        </div>
      </div>

      {/* 2. US 10Y Treasury Yield */}
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <BarChart2 className="w-3 h-3 text-amber-400" />
            US 10Y Yield
          </span>
          <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
            RATES
          </span>
        </div>
        <div className="mt-1">
          <span className="text-xl font-black mono text-amber-400">{macro.us10yYield.toFixed(2)}%</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Benchmark Cost of Capital
          </span>
        </div>
      </div>

      {/* 3. Daily Range in Pips */}
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-400" />
            Daily Range (ATR)
          </span>
          <span className="text-[9px] font-mono text-blue-400">
            {Math.round((macro.goldDailyHigh - macro.goldDailyLow) * 10)} Pips
          </span>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black mono text-white">
              {(macro.goldDailyHigh - macro.goldDailyLow).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">USD/oz</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            L: ${macro.goldDailyLow.toFixed(1)} — H: ${macro.goldDailyHigh.toFixed(1)}
          </span>
        </div>
      </div>

      {/* 4. Live Gold Spread (Points/Pips) */}
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" />
            MT5 Spread
          </span>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 rounded">
            OPTIMAL
          </span>
        </div>
        <div className="mt-1">
          <span className="text-xl font-black mono text-cyan-400">{(spreadPoints / 10).toFixed(1)} <span className="text-xs text-slate-400 font-normal">pips</span></span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {spreadPoints} MT5 Points (${(spreadPoints * 0.01).toFixed(2)})
          </span>
        </div>
      </div>

      {/* 5. Macro Fed Sentiment */}
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex flex-col justify-between col-span-2 md:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            Macro Sentiment
          </span>
          <span className="text-[9px] font-bold text-emerald-400">
            SAFE-HAVEN
          </span>
        </div>
        <div className="mt-1">
          <span className="text-lg font-black mono text-emerald-400">DOVISH / EASING</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Central Bank Physical Accumulation
          </span>
        </div>
      </div>
    </div>
  );
};
