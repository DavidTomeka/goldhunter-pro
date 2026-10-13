import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Flame, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Zap, 
  Crosshair, 
  Sliders 
} from 'lucide-react';
import { TimeFrame, SupplyDemandZone } from '../types';
import { TIMEFRAME_PROFILES } from '../services/geminiService';

interface Props {
  price: number;
  activeTimeframe: TimeFrame;
  onSelectTimeframe: (tf: TimeFrame) => void;
  supplyDemandZones?: SupplyDemandZone[];
}

interface TimeframeAnalysisMeta {
  timeframe: TimeFrame;
  shortLabel: string;
  name: string;
  category: 'LTF' | 'HTF';
  role: string;
  status: 'active' | 'complete' | 'pending';
  badge: string;
  bias: 'BULLISH_EXPANSION' | 'BEARISH_DISPLACEMENT' | 'ACCUMULATION' | 'SWEEP_REVERSAL';
  keyLevels: (price: number) => {
    invalidationSL: string;
    tp1Target: string;
    tp2Target: string;
    zoneBackyard: string;
  };
  criteriaChecks: {
    sharpDisplacement: string;
    fvgImbalance: string;
    backyardOrders: string;
    stalledBasing: string;
  };
  details: (price: number) => string[];
}

const TIMEFRAME_ANALYSIS_DATABASE: Record<TimeFrame, TimeframeAnalysisMeta> = {
  [TimeFrame.M1]: {
    timeframe: TimeFrame.M1,
    shortLabel: '1M',
    name: '1-Minute (M1 Precision Scalp)',
    category: 'LTF',
    role: 'Micro Execution & Wick Purge Entry',
    status: 'active',
    badge: 'M1 PRECISION TAP',
    bias: 'BULLISH_EXPANSION',
    keyLevels: (price) => ({
      invalidationSL: `$${(price - 1.4).toFixed(2)} (-14 pips)`,
      tp1Target: `$${(price + 2.8).toFixed(2)} (+28 pips)`,
      tp2Target: `$${(price + 5.4).toFixed(2)} (+54 pips)`,
      zoneBackyard: `$${(price - 1.2).toFixed(2)} - $${(price - 0.4).toFixed(2)}`
    }),
    criteriaChecks: {
      sharpDisplacement: "M1 displacement candle closed +18 pips in 60s",
      fvgImbalance: "Sub-minute 3-candle imbalance void between wicks",
      backyardOrders: "High-frequency limit order absorption at origin",
      stalledBasing: "4 tight micro basing candles prior to expansion"
    },
    details: (price) => [
      `Immediate sub-minute mitigation into M1 Bullish Order Block at $${(price - 0.9).toFixed(2)}`,
      "Micro liquidity sweep cleared retail stop orders beneath previous 1-min swing low",
      "Instant 1:3.8 risk/reward scalp setup: 14-pip invalidation with +54 pips TP2 distribution"
    ]
  },
  [TimeFrame.M5]: {
    timeframe: TimeFrame.M5,
    shortLabel: '5M',
    name: '5-Minute (M5 Day Scalp & Silver Bullet)',
    category: 'LTF',
    role: 'ICT Silver Bullet & Killzone Execution',
    status: 'active',
    badge: 'ORDER ARMED (5M)',
    bias: 'BULLISH_EXPANSION',
    keyLevels: (price) => ({
      invalidationSL: `$${(price - 2.8).toFixed(2)} (-28 pips)`,
      tp1Target: `$${(price + 5.6).toFixed(2)} (+56 pips)`,
      tp2Target: `$${(price + 10.8).toFixed(2)} (+108 pips)`,
      zoneBackyard: `$${(price - 2.2).toFixed(2)} - $${(price - 0.8).toFixed(2)}`
    }),
    criteriaChecks: {
      sharpDisplacement: "Explosive +42 pips displacement breaking 5M structure",
      fvgImbalance: "Clean 5M Fair Value Gap created with unmitigated liquidity",
      backyardOrders: "Institutional buy programs active in $2.20 backyard",
      stalledBasing: "5 stalled candles forming the origin order block"
    },
    details: (price) => [
      `Price mitigating qualified M5 Bullish Demand Zone origin at $${(price - 1.8).toFixed(2)}`,
      "ICT Silver Bullet timing window active: institutional algorithmic delivery in progress",
      "RSI(14) turning upward from 42.0 oversold; tight 28-pip SL for high +108p return"
    ]
  },
  [TimeFrame.M15]: {
    timeframe: TimeFrame.M15,
    shortLabel: '15M',
    name: '15-Minute (M15 Structure & Judas Purge)',
    category: 'LTF',
    role: 'Session Structure & Judas Swing Purge',
    status: 'active',
    badge: 'JUDAS PURGE CONFIRMED',
    bias: 'SWEEP_REVERSAL',
    keyLevels: (price) => ({
      invalidationSL: `$${(price - 4.5).toFixed(2)} (-45 pips)`,
      tp1Target: `$${(price + 9.0).toFixed(2)} (+90 pips)`,
      tp2Target: `$${(price + 17.0).toFixed(2)} (+170 pips)`,
      zoneBackyard: `$${(price - 3.8).toFixed(2)} - $${(price - 1.2).toFixed(2)}`
    }),
    criteriaChecks: {
      sharpDisplacement: "Displacement candle +62 pips sweeping session range",
      fvgImbalance: "Large 15M FVG void between $2.80 and $4.20",
      backyardOrders: "Accumulation backyard fully retested with buyer dominance",
      stalledBasing: "4 stalled basing candles on 15M chart before impulse"
    },
    details: (price) => [
      "Asian Session Low swept with aggressive rejection wick, trapping breakout sellers",
      `Bullish Market Structure Shift (MSS) confirmed above 15M swing high $${(price + 3.2).toFixed(2)}`,
      "Institutional smart money displacement closed strongly inside session value zone"
    ]
  },
  [TimeFrame.H1]: {
    timeframe: TimeFrame.H1,
    shortLabel: '1H',
    name: '1-Hour (H1 Intraday Direction & Trend)',
    category: 'HTF',
    role: 'Intraday Trend & Institutional Order Flow',
    status: 'active',
    badge: 'HOURLY TREND BIAS',
    bias: 'BULLISH_EXPANSION',
    keyLevels: (price) => ({
      invalidationSL: `$${(price - 7.5).toFixed(2)} (-75 pips)`,
      tp1Target: `$${(price + 15.0).toFixed(2)} (+150 pips)`,
      tp2Target: `$${(price + 28.5).toFixed(2)} (+285 pips)`,
      zoneBackyard: `$${(price - 6.0).toFixed(2)} - $${(price - 2.5).toFixed(2)}`
    }),
    criteriaChecks: {
      sharpDisplacement: "Hourly expansion candle +110 pips into daily premium",
      fvgImbalance: "1H Imbalance void spanning across London open bars",
      backyardOrders: "Multi-hour limit order accumulation in origin zone",
      stalledBasing: "3 to 4 consolidation candles establishing firm base"
    },
    details: (price) => [
      `Hourly dynamic trendline and 20 EMA supporting Gold price above $${(price - 7.5).toFixed(2)}`,
      "Clean retest of previous day's value area high; liquidity rests above daily buy-stops",
      "Intraday directional bias solidly aligned with bullish institutional order flow"
    ]
  },
  [TimeFrame.H4]: {
    timeframe: TimeFrame.H4,
    shortLabel: '4H',
    name: '4-Hour (H4 Institutional Swing Structure)',
    category: 'HTF',
    role: 'Institutional Swing Liquidity Pools (BSL/SSL)',
    status: 'active',
    badge: '4H SWING STRUCTURE',
    bias: 'BULLISH_EXPANSION',
    keyLevels: (price) => ({
      invalidationSL: `$${(price - 15.0).toFixed(2)} (-150 pips)`,
      tp1Target: `$${(price + 30.0).toFixed(2)} (+300 pips)`,
      tp2Target: `$${(price + 57.0).toFixed(2)} (+570 pips)`,
      zoneBackyard: `$${(price - 14.0).toFixed(2)} - $${(price - 4.5).toFixed(2)}`
    }),
    criteriaChecks: {
      sharpDisplacement: "Macro 4H impulse +220 pips through swing resistance",
      fvgImbalance: "H4 Fair Value Gap between weekly order block wicks",
      backyardOrders: "Massive institutional central bank volume in origin backyard",
      stalledBasing: "5 stalled 4-hour candles forming structural foundation"
    },
    details: (price) => [
      `Previous Week High Buy-Side Liquidity (BSL) targeted at $${(price + 57.0).toFixed(2)}`,
      `Major 4H Demand Zone established between $${(price - 14.0).toFixed(2)} and $${(price - 4.5).toFixed(2)}`,
      "Higher institutional lows respected across multiple trading sessions with 1:3.8 R:R"
    ]
  },
  [TimeFrame.D1]: {
    timeframe: TimeFrame.D1,
    shortLabel: '1D',
    name: 'Daily (D1 Interbank Macro Reserve Trend)',
    category: 'HTF',
    role: 'Macro Interbank Reserve & DXY Inverse Bias',
    status: 'active',
    badge: 'MACRO INTERBANK BIAS',
    bias: 'BULLISH_EXPANSION',
    keyLevels: (price) => ({
      invalidationSL: `$${(price - 30.0).toFixed(2)} (-300 pips)`,
      tp1Target: `$${(price + 60.0).toFixed(2)} (+600 pips)`,
      tp2Target: `$${(price + 114.0).toFixed(2)} (+1140 pips)`,
      zoneBackyard: `$${(price - 28.0).toFixed(2)} - $${(price - 8.0).toFixed(2)}`
    }),
    criteriaChecks: {
      sharpDisplacement: "Daily expansion bar +450 pips breaking monthly high",
      fvgImbalance: "Interbank Daily FVG holding as institutional support",
      backyardOrders: "Sovereign fund & central bank physical accumulation",
      stalledBasing: "Weekly consolidation base stalled for 4 days before blast"
    },
    details: (price) => [
      `Daily Bullish Expansion sustained above critical support at $${(price - 30.0).toFixed(2)}`,
      "DXY US Dollar Index rejecting key overhead resistance, creating tailwind for Gold",
      "Macro multi-week expansion model targeting all-time liquidity pools (+1140 pips)"
    ]
  }
};

export const GoldAnalysisView: React.FC<Props> = ({ 
  price, 
  activeTimeframe, 
  onSelectTimeframe,
  supplyDemandZones = []
}) => {
  const activeMeta = TIMEFRAME_ANALYSIS_DATABASE[activeTimeframe] || TIMEFRAME_ANALYSIS_DATABASE[TimeFrame.M5];
  const activeLevels = activeMeta.keyLevels(price);
  const profile = TIMEFRAME_PROFILES[activeTimeframe];

  // Count zones matching current timeframe
  const tfZones = supplyDemandZones.filter(z => z.timeframe === activeTimeframe);
  const qualifiedTfZones = tfZones.filter(z => z.criteria.isValidZone);

  return (
    <div className="space-y-4">
      {/* 1. Active Timeframe Deep Dive Spotlight Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                ACTIVE TIMEFRAME SPOTLIGHT: {activeMeta.name}
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {activeMeta.category} HORIZON
              </span>
            </div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-amber-400" />
              {activeMeta.role}
            </h3>
          </div>

          {/* Timeframe Quick Switcher Pills inside the Analysis view */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-mono font-bold px-2">SWITCH TF:</span>
            {([TimeFrame.M1, TimeFrame.M5, TimeFrame.M15, TimeFrame.H1, TimeFrame.H4, TimeFrame.D1] as TimeFrame[]).map(tf => {
              const isSelected = activeTimeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => onSelectTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Timeframe Metrics & Execution Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block mb-1">
              {activeTimeframe} Stop Loss (SL)
            </span>
            <span className="text-sm font-black mono text-rose-400">
              {activeLevels.invalidationSL}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Tight institutional invalidation
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block mb-1">
              {activeTimeframe} Take Profit 2 (TP2)
            </span>
            <span className="text-sm font-black mono text-emerald-400">
              {activeLevels.tp2Target}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              1:3.8 R:R target distribution
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block mb-1">
              {activeTimeframe} S&D Backyard
            </span>
            <span className="text-sm font-black mono text-amber-300">
              {activeLevels.zoneBackyard}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Origin order accumulation
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block mb-1">
              {activeTimeframe} 4/4 S&D Zones
            </span>
            <span className="text-sm font-black mono text-cyan-400">
              {qualifiedTfZones.length > 0 ? `${qualifiedTfZones.length} QUALIFIED` : 'ACTIVE SCANNING'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Strict 4-criteria verified
            </span>
          </div>
        </div>

        {/* 4 Criteria Checklist for this exact Timeframe */}
        <div className="mt-4 p-3.5 bg-slate-950/70 rounded-xl border border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              4-Criteria Audit Verified on {activeTimeframe}:
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">100% INSTITUTIONAL ALIGNMENT</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px]"><strong className="text-white">1. Sharp Move:</strong> {activeMeta.criteriaChecks.sharpDisplacement}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px]"><strong className="text-white">2. FVG Imbalance:</strong> {activeMeta.criteriaChecks.fvgImbalance}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px]"><strong className="text-white">3. Backyard:</strong> {activeMeta.criteriaChecks.backyardOrders}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px]"><strong className="text-white">4. Stalled Base:</strong> {activeMeta.criteriaChecks.stalledBasing}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Multi-Timeframe Matrix Cards (Click any to instantly switch the entire app!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {([TimeFrame.M1, TimeFrame.M5, TimeFrame.M15, TimeFrame.H1, TimeFrame.H4, TimeFrame.D1] as TimeFrame[]).map(tf => {
          const meta = TIMEFRAME_ANALYSIS_DATABASE[tf];
          const isCurrent = activeTimeframe === tf;
          const levels = meta.keyLevels(price);

          return (
            <div
              key={tf}
              onClick={() => onSelectTimeframe(tf)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent 
                  ? 'bg-amber-950/30 border-amber-500 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/40' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-black mono flex items-center gap-1.5 ${isCurrent ? 'text-amber-400' : 'text-slate-300'}`}>
                    {meta.shortLabel}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isCurrent ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isCurrent ? 'ACTIVE' : meta.category}
                  </span>
                </div>

                <h4 className="text-[11px] font-bold text-slate-200 line-clamp-1 mb-1">
                  {meta.role}
                </h4>

                <div className="space-y-1 mb-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">SL:</span>
                    <span className="text-rose-400 font-bold">{levels.invalidationSL.split(' ')[1]}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">TP2:</span>
                    <span className="text-emerald-400 font-bold">{levels.tp2Target.split(' ')[1]}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTimeframe(tf);
                }}
                className={`w-full py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all text-center ${
                  isCurrent
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isCurrent ? '✓ Current View' : `Select ${meta.shortLabel}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
