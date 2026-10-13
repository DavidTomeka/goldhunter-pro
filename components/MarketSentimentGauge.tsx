import React, { useState, useMemo } from 'react';
import { MarketSentimentData, SentimentBias } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  Clock, 
  Compass,
  Sliders,
  Users
} from 'lucide-react';

interface Props {
  sentiment: MarketSentimentData;
  currentPrice: number;
  onTriggerShock: (type: 'BULLISH_SWEEP' | 'BEARISH_WALL' | 'RESET') => void;
}

export const MarketSentimentGauge: React.FC<Props> = ({
  sentiment,
  currentPrice,
  onTriggerShock
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'gauge' | 'depth' | 'tape'>('gauge');
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);

  const isBullish = sentiment.sentimentScore >= 55;
  const isBearish = sentiment.sentimentScore <= 45;
  const isNeutral = !isBullish && !isBearish;

  // Calculate SVG needle angle:
  // 0% => -90 deg (left/bearish)
  // 50% => 0 deg (top/neutral)
  // 100% => 90 deg (right/bullish)
  const needleAngle = useMemo(() => {
    return -90 + (sentiment.sentimentScore / 100) * 180;
  }, [sentiment.sentimentScore]);

  // Color styling based on bias
  const themeColors = useMemo(() => {
    if (sentiment.sentimentScore >= 75) {
      return {
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        ring: 'border-emerald-500/60 shadow-emerald-500/20',
        text: 'text-emerald-400',
        accentBg: 'bg-emerald-500',
        glow: 'shadow-emerald-500/30'
      };
    }
    if (sentiment.sentimentScore >= 56) {
      return {
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        ring: 'border-emerald-500/40 shadow-emerald-500/10',
        text: 'text-emerald-400',
        accentBg: 'bg-emerald-500',
        glow: 'shadow-emerald-500/20'
      };
    }
    if (sentiment.sentimentScore <= 25) {
      return {
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        ring: 'border-rose-500/60 shadow-rose-500/20',
        text: 'text-rose-400',
        accentBg: 'bg-rose-500',
        glow: 'shadow-rose-500/30'
      };
    }
    if (sentiment.sentimentScore <= 44) {
      return {
        badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        ring: 'border-rose-500/40 shadow-rose-500/10',
        text: 'text-rose-400',
        accentBg: 'bg-rose-500',
        glow: 'shadow-rose-500/20'
      };
    }
    return {
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      ring: 'border-amber-500/40 shadow-amber-500/10',
      text: 'text-amber-400',
      accentBg: 'bg-amber-500',
      glow: 'shadow-amber-500/20'
    };
  }, [sentiment.sentimentScore]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-5">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                Real-Time Order Flow Engine
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono border ${themeColors.badgeBg}`}>
                {sentiment.bias.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              XAU/USD Live Market Sentiment & Order Flow Gauge
            </h2>
          </div>
        </div>

        {/* View Tabs & Quick Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('gauge')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'gauge' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Gauge & Order Flow</span>
            </button>
            <button
              onClick={() => setActiveSubTab('depth')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'depth' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Level-2 Depth</span>
            </button>
            <button
              onClick={() => setActiveSubTab('tape')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'tape' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Institutional Tape</span>
            </button>
          </div>

          <button
            onClick={() => setAudioAlerts(!audioAlerts)}
            className={`p-2 rounded-xl border transition-all ${
              audioAlerts ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-slate-950 text-slate-600 border-slate-800'
            }`}
            title={audioAlerts ? 'Audio alert enabled for extreme sentiment shifts' : 'Audio alerts disabled'}
          >
            {audioAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {activeSubTab === 'gauge' && (
        <div className="space-y-6">
          {/* Main Visual Display: Radial Speedometer Gauge + Dual Volume Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Visual Speedometer SVG Gauge (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 relative overflow-hidden">
              {/* Background Glow */}
              <div className={`absolute w-36 h-36 rounded-full blur-3xl opacity-20 -top-6 ${themeColors.accentBg}`} />

              <div className="relative w-64 h-36 flex items-end justify-center">
                <svg className="w-64 h-36 overflow-visible" viewBox="0 0 200 110">
                  <defs>
                    <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />    {/* Extreme Bearish Red */}
                      <stop offset="25%" stopColor="#fb7185" />
                      <stop offset="50%" stopColor="#f59e0b" />   {/* Neutral Amber */}
                      <stop offset="75%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />  {/* Extreme Bullish Green */}
                    </linearGradient>

                    <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ffffff" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* Background Track Arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {/* Gradient Colored Arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#sentimentGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset="0"
                    className="opacity-90"
                  />

                  {/* Segment Division Tick Marks */}
                  <line x1="20" y1="100" x2="28" y2="100" stroke="#0f172a" strokeWidth="2" />
                  <line x1="60" y1="43" x2="66" y2="48" stroke="#0f172a" strokeWidth="2" />
                  <line x1="100" y1="20" x2="100" y2="28" stroke="#0f172a" strokeWidth="2" />
                  <line x1="140" y1="43" x2="134" y2="48" stroke="#0f172a" strokeWidth="2" />
                  <line x1="180" y1="100" x2="172" y2="100" stroke="#0f172a" strokeWidth="2" />

                  {/* Animated Pivot and Needle */}
                  <g 
                    transform={`rotate(${needleAngle}, 100, 100)`}
                    className="transition-transform duration-700 ease-out"
                  >
                    {/* Needle pointer */}
                    <polygon
                      points="98,100 100,24 102,100"
                      fill="#ffffff"
                      filter="url(#needleGlow)"
                    />
                    <circle cx="100" cy="24" r="3.5" fill="#f59e0b" />
                  </g>

                  {/* Center Pivot Cap */}
                  <circle cx="100" cy="100" r="10" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                  <circle cx="100" cy="100" r="4" fill="#f59e0b" />
                </svg>

                {/* Sub-Arc Labels */}
                <div className="absolute -bottom-1 left-2 text-[9px] font-mono font-black text-rose-400 uppercase">
                  BEARISH (0%)
                </div>
                <div className="absolute -top-1 font-mono text-[9px] font-black text-amber-400 uppercase">
                  NEUTRAL (50%)
                </div>
                <div className="absolute -bottom-1 right-2 text-[9px] font-mono font-black text-emerald-400 uppercase">
                  BULLISH (100%)
                </div>
              </div>

              {/* Digital Score Readout Box */}
              <div className="mt-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-4xl font-black font-mono tracking-tight ${themeColors.text}`}>
                    {sentiment.sentimentScore}%
                  </span>
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">
                      {isBullish ? 'BULL DOMINANCE' : isBearish ? 'BEAR PRESSURE' : 'EQUILIBRIUM'}
                    </span>
                    <span className="text-xs font-black text-white">
                      {sentiment.sentimentScore >= 50 ? `+${sentiment.sentimentScore - 50}% Net` : `-${50 - sentiment.sentimentScore}% Net`}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-300 max-w-[280px]">
                  {sentiment.biasLabel}
                </p>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Confidence Score: {sentiment.confidence}% • Live Tick Order Flow
                </span>
              </div>
            </div>

            {/* Real-Time Buy/Sell Order Flow Breakdown (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Buy vs Sell Volume Comparative Bar */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black font-mono text-emerald-400">
                      BUY FLOW: {sentiment.buyRatio}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-rose-400">
                      SELL FLOW: {sentiment.sellRatio}%
                    </span>
                  </div>
                </div>

                {/* Dual Progress Bar */}
                <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-700 relative"
                    style={{ width: `${sentiment.buyRatio}%` }}
                  >
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-950 font-mono">
                      {sentiment.buyVolumeLots.toLocaleString()} Lots
                    </span>
                  </div>
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-r-full transition-all duration-700 relative"
                    style={{ width: `${sentiment.sellRatio}%` }}
                  >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-white font-mono">
                      {sentiment.sellVolumeLots.toLocaleString()} Lots
                    </span>
                  </div>
                </div>

                {/* Net Delta & Imbalance Ratio */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Net Volume Delta:</span>
                    <strong className={sentiment.netDeltaLots >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {sentiment.netDeltaLots >= 0 ? `+${sentiment.netDeltaLots.toLocaleString()}` : sentiment.netDeltaLots.toLocaleString()} Lots
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Book Imbalance:</span>
                    <strong className="text-amber-400 font-bold">
                      {sentiment.imbalanceRatio}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3 Order Flow Confluence Micro-Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. CVD (Cumulative Volume Delta) */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    CVD Contracts
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-base font-black font-mono ${sentiment.cvdContracts >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                      {sentiment.cvdContracts >= 0 ? `+${sentiment.cvdContracts.toLocaleString()}` : sentiment.cvdContracts.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 block">
                    Slope: <strong className="text-white">{sentiment.cvdSlope.replace('_', ' ')}</strong>
                  </span>
                </div>

                {/* 2. Institutional Bias */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    Smart Money Bias
                  </span>
                  <span className={`text-xs font-black font-mono block ${isBullish ? 'text-emerald-400' : isBearish ? 'text-rose-400' : 'text-amber-400'}`}>
                    {sentiment.institutionalBias.replace('_', ' ')}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block">
                    Accumulation: <strong className="text-white">{sentiment.institutionalAccumulationPct}%</strong>
                  </span>
                </div>

                {/* 3. Retail Contrarian Indicator */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-500" />
                    Retail Crowd
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-300">
                      {sentiment.retailLongPct}% L / {sentiment.retailShortPct}% S
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400/90 block truncate" title={sentiment.crowdContrarianSignal}>
                    {sentiment.retailShortPct >= 58 ? 'Retail Short = Bull Fuel' : sentiment.retailLongPct >= 58 ? 'Retail Long = Bear Trap' : 'Balanced Crowd'}
                  </span>
                </div>
              </div>

              {/* Retail Contrarian Callout Banner */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    ICT Institutional Order Flow Confluence:
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {sentiment.crowdContrarianSignal}. Real-time interbank liquidity algorithms are targeting stop orders above and below session liquidity pools.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Order Flow Simulation Shocks */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Live Order Flow Shocks:
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onTriggerShock('BULLISH_SWEEP')}
                className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Simulate Bullish Buy Sweep (+6.5k CVD)
              </button>

              <button
                onClick={() => onTriggerShock('BEARISH_WALL')}
                className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                Simulate Institutional Sell Wall (-6.5k CVD)
              </button>

              <button
                onClick={() => onTriggerShock('RESET')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition-all"
                title="Reset to dynamic market flow"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LEVEL-2 ORDER BOOK DEPTH LADDER */}
      {activeSubTab === 'depth' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Aggregated Institutional Level-2 Depth (Gold Spot ${currentPrice.toFixed(2)})</span>
            <span className="font-mono text-amber-400 font-bold">Total Depth: {(sentiment.bidDepthLots + sentiment.askDepthLots).toLocaleString()} Lots</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ask Ladder (Sell Orders above spot) */}
            <div className="p-3 bg-slate-950 rounded-xl border border-rose-500/20 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] font-mono uppercase text-rose-400 font-bold">
                <span>Ask Level (Resistance)</span>
                <span>Lots / Depth</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {sentiment.topAsks.slice().reverse().map(ask => (
                  <div key={ask.level} className="relative p-1.5 rounded bg-slate-900/80 flex items-center justify-between overflow-hidden">
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-rose-500/15 transition-all"
                      style={{ width: `${ask.depthPercentage}%` }}
                    />
                    <span className="font-bold text-rose-400 relative z-10">${ask.price.toFixed(2)}</span>
                    <span className="text-slate-300 relative z-10">{ask.lots} Lots ({ask.totalLots} cum)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bid Ladder (Buy Orders below spot) */}
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] font-mono uppercase text-emerald-400 font-bold">
                <span>Bid Level (Support)</span>
                <span>Lots / Depth</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {sentiment.topBids.map(bid => (
                  <div key={bid.level} className="relative p-1.5 rounded bg-slate-900/80 flex items-center justify-between overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 transition-all"
                      style={{ width: `${bid.depthPercentage}%` }}
                    />
                    <span className="font-bold text-emerald-400 relative z-10">${bid.price.toFixed(2)}</span>
                    <span className="text-slate-300 relative z-10">{bid.lots} Lots ({bid.totalLots} cum)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TIME & SALES INSTITUTIONAL TAPE */}
      {activeSubTab === 'tape' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interbank Time & Sales (Real-Time Aggressor Feed)</span>
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TICK STREAM
            </span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 font-mono text-xs">
            {sentiment.recentTape.map(order => {
              const isBuy = order.side === 'BUY';
              return (
                <div 
                  key={order.id}
                  className={`p-2 rounded-lg border flex items-center justify-between gap-3 ${
                    isBuy ? 'bg-slate-950 border-emerald-500/25' : 'bg-slate-950 border-rose-500/25'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{order.time}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                      isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {order.side}
                    </span>
                    <strong className="text-white">${order.price.toFixed(2)}</strong>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {order.lots} Lots
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {order.pool}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
