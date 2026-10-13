import React, { useState, useMemo } from 'react';
import { OHLC, TimeFrame, LiquidityLevel, SupplyDemandZone } from '../types';
import { TradingViewChart } from './TradingViewChart';
import { 
  detectVolatilitySpans, 
  getCurrentVolatilityStatus, 
  HISTORICAL_VOLATILITY_WINDOWS, 
  ChartVolatilitySpan, 
  VolatilityWindow 
} from '../services/volatilityWindowService';
import { 
  Play, 
  Pause, 
  Zap, 
  FastForward, 
  Layers, 
  Maximize2, 
  TrendingUp, 
  TrendingDown,
  Crosshair,
  Compass,
  Target,
  ShieldCheck,
  Flame,
  Scale,
  ArrowDownRight,
  ArrowUpRight,
  Radio,
  Sliders,
  RefreshCw,
  Activity,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  candles: OHLC[];
  currentPrice: number;
  ema20: number;
  ema50: number;
  rsi: number;
  supplyDemandZones?: SupplyDemandZone[];
  marketRegime?: 'IMBALANCE' | 'BALANCED';
  activeTimeframe: TimeFrame;
  onChangeTimeframe: (tf: TimeFrame) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onTriggerBreakout: () => void;
  onTriggerJudasSwing: () => void;
  onSimulateDemandZone?: () => void;
  onSimulateSupplyZone?: () => void;
  onSimulateLtfShort?: () => void;
  onSimulateLtfLong?: () => void;
  chartMode?: 'TRADINGVIEW_LIVE' | 'ALGO_SND';
  onToggleChartMode?: (mode: 'TRADINGVIEW_LIVE' | 'ALGO_SND') => void;
  onPriceCalibrate?: (newPrice: number, offset: number) => void;
  onRefreshLiveFeed?: () => void;
  isLoadingLive?: boolean;
}

export const GoldChart: React.FC<Props> = ({
  candles,
  currentPrice,
  ema20,
  ema50,
  rsi,
  supplyDemandZones = [],
  marketRegime = 'IMBALANCE',
  activeTimeframe,
  onChangeTimeframe,
  isSimulating,
  onToggleSimulation,
  simSpeed,
  onChangeSpeed,
  onTriggerBreakout,
  onTriggerJudasSwing,
  onSimulateDemandZone,
  onSimulateSupplyZone,
  onSimulateLtfShort,
  onSimulateLtfLong,
  chartMode,
  onToggleChartMode,
  onPriceCalibrate,
  onRefreshLiveFeed,
  isLoadingLive = false
}) => {
  const [internalChartMode, setInternalChartMode] = useState<'TRADINGVIEW_LIVE' | 'ALGO_SND'>('TRADINGVIEW_LIVE');
  const currentChartMode = chartMode ?? internalChartMode;
  const setChartMode = onToggleChartMode ?? setInternalChartMode;

  const [hoveredCandle, setHoveredCandle] = useState<OHLC | null>(null);
  const [showZones, setShowZones] = useState(true);
  const [showSupplyDemand, setShowSupplyDemand] = useState(true);
  const [timeframeCategoryFilter, setTimeframeCategoryFilter] = useState<'ALL' | 'HTF' | 'LTF'>('ALL');
  
  // Historical High Volatility Overlays (London/NY Open Overlap, Judas Swing, London Close)
  const [showVolatilityOverlay, setShowVolatilityOverlay] = useState<boolean>(true);
  const [hoveredVolatilitySpan, setHoveredVolatilitySpan] = useState<ChartVolatilitySpan | null>(null);
  const [showVolatilityTimingGuide, setShowVolatilityTimingGuide] = useState<boolean>(false);

  // Detect real candle spans that match historical high volatility windows
  const detectedVolatilitySpans = useMemo(() => {
    return detectVolatilitySpans(candles);
  }, [candles]);

  const currentVolStatus = useMemo(() => {
    return getCurrentVolatilityStatus();
  }, [candles]);

  // Ensure the user always has visual timing aid even if candles are off-peak or simulated
  const volatilitySpans = useMemo(() => {
    if (detectedVolatilitySpans.length > 0) {
      return detectedVolatilitySpans;
    }
    // High-fidelity fallback / reference overlays projected onto chart
    if (candles.length >= 20) {
      const overlapWin = HISTORICAL_VOLATILITY_WINDOWS.find(w => w.id === 'LONDON_NY_OVERLAP')!;
      const londonWin = HISTORICAL_VOLATILITY_WINDOWS.find(w => w.id === 'LONDON_OPEN_EXPANSION')!;
      return [
        {
          window: overlapWin,
          startIndex: Math.max(0, Math.floor(candles.length * 0.16)),
          endIndex: Math.min(candles.length - 1, Math.floor(candles.length * 0.52)),
          startCandleTime: candles[Math.max(0, Math.floor(candles.length * 0.16))].time,
          endCandleTime: candles[Math.min(candles.length - 1, Math.floor(candles.length * 0.52))].time,
          candleCount: Math.floor(candles.length * 0.36),
          isActiveCurrent: true
        },
        {
          window: londonWin,
          startIndex: Math.max(0, Math.floor(candles.length * 0.62)),
          endIndex: Math.min(candles.length - 1, Math.floor(candles.length * 0.88)),
          startCandleTime: candles[Math.max(0, Math.floor(candles.length * 0.62))].time,
          endCandleTime: candles[Math.min(candles.length - 1, Math.floor(candles.length * 0.88))].time,
          candleCount: Math.floor(candles.length * 0.26),
          isActiveCurrent: false
        }
      ];
    }
    return [];
  }, [detectedVolatilitySpans, candles]);

  if (candles.length === 0) return null;

  // Chart Dimensions & Scaling
  const width = 940;
  const height = 460;
  const padding = { top: 38, right: 95, bottom: 42, left: 18 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Consider all candle prices plus any supply/demand zone boundaries for scaling
  const allLows = [...candles.map(c => c.low), ...supplyDemandZones.map(z => z.priceLow)];
  const allHighs = [...candles.map(c => c.high), ...supplyDemandZones.map(z => z.priceHigh)];
  const minPrice = Math.min(...allLows) - 1.5;
  const maxPrice = Math.max(...allHighs) + 1.5;
  const priceRange = Math.max(0.01, maxPrice - minPrice);

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const candleWidth = Math.max(4, Math.min(16, (chartWidth / candles.length) * 0.7));
  const candleGap = chartWidth / candles.length;

  // Asian Range
  const asianCandles = candles.slice(5, 25);
  const asianHigh = asianCandles.length > 0 ? Math.max(...asianCandles.map(c => c.high)) : currentPrice + 4;
  const asianLow = asianCandles.length > 0 ? Math.min(...asianCandles.map(c => c.low)) : currentPrice - 4;

  const bslLevel = Number((asianHigh + 0.8).toFixed(2));
  const sslLevel = Number((asianLow - 0.8).toFixed(2));

  // Build EMA Paths
  const ema20Points = candles
    .map((c, i) => {
      const x = padding.left + i * candleGap + candleWidth / 2;
      const y = getY(c.ema20 ?? c.close);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const ema50Points = candles
    .map((c, i) => {
      const x = padding.left + i * candleGap + candleWidth / 2;
      const y = getY(c.ema50 ?? (c.close - 1.5));
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const displayCandle = hoveredCandle || candles[candles.length - 1];

  // Filtered zones based on HTF / LTF selection
  const filteredZones = supplyDemandZones.filter(z => {
    if (timeframeCategoryFilter === 'ALL') return true;
    return (z.timeframeCategory || 'LTF') === timeframeCategoryFilter;
  });

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-950/90 border-b border-slate-800 gap-3">
        {/* Asset Title, Live Indicator readout, & Mode Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-black text-sm text-white tracking-wider">XAU/USD SPOT GOLD</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              4-CRITERIA S&D RADAR
            </span>
          </div>

          {/* Mode Switcher: Live TradingView vs S&D Blueprint */}
          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setChartMode('TRADINGVIEW_LIVE')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentChartMode === 'TRADINGVIEW_LIVE'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Live MT5 TradingView</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            </button>
            <button
              onClick={() => setChartMode('ALGO_SND')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentChartMode === 'ALGO_SND'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>S&D Blueprint</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono border-l border-slate-800 pl-3">
            <span className="text-slate-400">O: <b className="text-white">${displayCandle?.open.toFixed(2)}</b></span>
            <span className="text-slate-400">H: <b className="text-emerald-400">${displayCandle?.high.toFixed(2)}</b></span>
            <span className="text-slate-400">L: <b className="text-rose-400">${displayCandle?.low.toFixed(2)}</b></span>
            <span className="text-slate-400">C: <b className="text-amber-300 font-bold">${displayCandle?.close.toFixed(2)}</b></span>
            <span className="text-cyan-400">EMA(20): {displayCandle?.ema20?.toFixed(2) || ema20.toFixed(2)}</span>
            <span className="text-amber-400">RSI(14): {rsi.toFixed(1)}</span>
          </div>
        </div>

        {/* Timeframes & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-Timeframe Selector */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
            {([TimeFrame.M1, TimeFrame.M5, TimeFrame.M15, TimeFrame.H1, TimeFrame.H4, TimeFrame.D1] as TimeFrame[]).map(tf => (
              <button
                key={tf}
                onClick={() => onChangeTimeframe(tf)}
                className={`px-2 py-1 rounded transition-all ${
                  activeTimeframe === tf 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {currentChartMode === 'ALGO_SND' && (
            <>
              {/* HTF vs LTF Zone Scope Filter */}
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                {(['ALL', 'HTF', 'LTF'] as const).map(tier => (
                  <button
                    key={tier}
                    onClick={() => setTimeframeCategoryFilter(tier)}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      timeframeCategoryFilter === tier 
                        ? 'bg-slate-800 text-amber-300 border border-amber-500/30' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Filter zones by ${tier === 'HTF' ? 'Higher Timeframe (H1/H4)' : tier === 'LTF' ? 'Lower Timeframe (M1/M5/M15)' : 'All Timeframes'}`}
                  >
                    {tier === 'ALL' ? 'All TF' : tier === 'HTF' ? 'HTF Macro' : 'LTF Scalp'}
                  </button>
                ))}
              </div>

              {/* S&D Zones Toggle */}
              <button
                onClick={() => setShowSupplyDemand(!showSupplyDemand)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                  showSupplyDemand 
                    ? 'bg-slate-800 text-emerald-400 border-emerald-500/40' 
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                Valid S&D (4/4)
              </button>

              {/* Zones Toggle */}
              <button
                onClick={() => setShowZones(!showZones)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                  showZones 
                    ? 'bg-slate-800 text-amber-400 border-amber-500/40' 
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                <Layers className="w-3 h-3" />
                BSL/SSL
              </button>

              {/* Historical Volatility Overlay Toggle */}
              <button
                onClick={() => setShowVolatilityOverlay(!showVolatilityOverlay)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                  showVolatilityOverlay 
                    ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/50 shadow-sm' 
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-400'
                }`}
                title="Toggle historical high volatility background overlay (London/NY overlap, Judas swing, London close)"
              >
                <Zap className={`w-3 h-3 ${showVolatilityOverlay ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Volatility Overlay</span>
                {showVolatilityOverlay && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ml-0.5" />
                )}
              </button>

              {/* Timing Matrix Guide Toggle */}
              <button
                onClick={() => setShowVolatilityTimingGuide(!showVolatilityTimingGuide)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all flex items-center gap-1 ${
                  showVolatilityTimingGuide
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Open Volatility Timing Matrix & Trade Timing Edge rules"
              >
                <Activity className="w-3 h-3 text-amber-400" />
                <span>Timing Matrix</span>
              </button>

              {/* Simulation Controls */}
              <button
                onClick={onToggleSimulation}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                  isSimulating 
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isSimulating ? 'Live Feed' : 'Paused'}
              </button>

              {/* Speed Selector */}
              <button
                onClick={() => onChangeSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono border border-slate-700 font-bold"
              >
                {simSpeed}x
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Chart Body */}
      {currentChartMode === 'TRADINGVIEW_LIVE' ? (
        <TradingViewChart
          currentPrice={currentPrice}
          timeframe={activeTimeframe}
          onPriceCalibrate={onPriceCalibrate}
          onRefreshLiveFeed={onRefreshLiveFeed}
          isLoadingLive={isLoadingLive}
          onSwitchToAlgoChart={() => setChartMode('ALGO_SND')}
        />
      ) : (
        <>
          {/* Market Imbalance vs Balance Status Bar */}
          <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {marketRegime === 'IMBALANCE' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-[11px]">
                  <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>MARKET IMBALANCE ACTIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-[11px]">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>MARKET BALANCED / CHOP</span>
                </div>
              )}
              <span className="text-[11px] text-slate-400">
                {marketRegime === 'IMBALANCE' 
                  ? 'Trading condition OPTIMAL: One-sided institutional displacement created unmitigated origin supply/demand.'
                  : 'Two-way auction in equilibrium. AVOID trading balanced ranges — wait for explosive displacement.'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="text-slate-500">Structure:</span>
              <span className="text-cyan-300 font-bold">RBD / DBD / DBR Origins</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold">HTF + LTF Multi-Tier</span>
            </div>
          </div>

          {/* Volatility Timing Ribbon */}
          <div className="px-4 py-1.5 bg-slate-950/95 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-indigo-400" />
                Volatility Regime:
              </span>
              
              {currentVolStatus.activeWindow ? (
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded-full ${currentVolStatus.activeWindow.badgeBg}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>{currentVolStatus.activeWindow.name}</span>
                  <span className="font-mono font-normal">({currentVolStatus.activeWindow.gmtTimeRange})</span>
                  <span className="font-mono text-amber-300">+{currentVolStatus.activeWindow.avgPipsExpansion}p ATR</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Consolidation (Asian / Quiet Hours)</span>
                  <span className="text-slate-400 font-mono">Next: {currentVolStatus.nextWindow.shortLabel} in {currentVolStatus.minutesUntilNext}m</span>
                </span>
              )}

              {showVolatilityOverlay && (
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  • Shaded gradient windows denote high-probability trade timing
                </span>
              )}
            </div>

            <button
              onClick={() => setShowVolatilityTimingGuide(prev => !prev)}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all"
            >
              <Info className="w-3 h-3" />
              <span>{showVolatilityTimingGuide ? 'Hide Timing Matrix' : 'Trade Timing Guide & Stats'}</span>
            </button>
          </div>

          {/* Expandable Volatility Timing Matrix & Trade Timing Rules */}
          {showVolatilityTimingGuide && (
            <div className="p-3.5 bg-slate-950/95 border-b border-indigo-500/30 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
              {HISTORICAL_VOLATILITY_WINDOWS.map(win => (
                <div 
                  key={win.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    currentVolStatus.activeWindow?.id === win.id 
                      ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-950/40' 
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {win.shortLabel}
                    </span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${win.badgeBg}`}>
                      {win.intensity}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">GMT Window:</span>
                      <span className="text-amber-300 font-bold">{win.gmtTimeRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Desk Times:</span>
                      <span className="text-sky-300">{win.localTimeDescription}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Expansion:</span>
                      <span className="text-emerald-400 font-bold">+{win.avgPipsExpansion} Pips</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                    <strong className="text-slate-300 font-semibold">Edge: </strong>
                    {win.tradeTimingEdge}
                  </p>
                </div>
              ))}
            </div>
          )}

      {/* SVG Candlestick Chart Area */}
      <div className="relative w-full h-[400px] bg-slate-950/70 select-none">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            {/* Historical High Volatility Window Overlays (Subtle Gradients) */}
            <linearGradient id="volatilityOverlapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.22" />
              <stop offset="45%" stopColor="#6366f1" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0.02" />
            </linearGradient>

            <linearGradient id="volatilityLondonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.19" />
              <stop offset="45%" stopColor="#0284c7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.02" />
            </linearGradient>

            <linearGradient id="volatilityLondonCloseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.17" />
              <stop offset="45%" stopColor="#d97706" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.02" />
            </linearGradient>

            <pattern id="volatilityStripes" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(255,255,255,0.025)" strokeWidth="1.2" />
            </pattern>

            {/* TradingView Sky-Blue Institutional Zone Shading */}
            <linearGradient id="tvSupplyZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.10" />
            </linearGradient>
            <linearGradient id="tvDemandZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.10" />
            </linearGradient>
            <linearGradient id="fvgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.04" />
            </linearGradient>

            {/* Downward Arrow Marker for Supply Zone Origin */}
            <marker id="supplyArrow" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 0 L 5 10 z" fill="#38bdf8" />
            </marker>

            {/* Upward Arrow Marker for Demand Zone Origin */}
            <marker id="demandArrow" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 10 L 10 10 L 5 0 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + chartHeight * ratio;
            const priceVal = maxPrice - ratio * priceRange;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={width - padding.right + 8}
                  y={y + 3.5}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ${priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* HISTORICAL HIGH VOLATILITY BACKGROUND GRADIENT OVERLAY (London/NY Overlap, London Open, London Close) */}
          {showVolatilityOverlay && volatilitySpans.map((span, sIdx) => {
            const x1 = padding.left + span.startIndex * candleGap;
            const x2 = padding.left + span.endIndex * candleGap + candleWidth;
            const spanWidth = Math.max(candleWidth * 2, x2 - x1);
            const isHovered = hoveredVolatilitySpan?.window.id === span.window.id;

            return (
              <g 
                key={`vol-span-${span.window.id}-${sIdx}`}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredVolatilitySpan(span)}
                onMouseLeave={() => setHoveredVolatilitySpan(null)}
              >
                {/* Subtle Background Gradient Shading */}
                <rect
                  x={x1}
                  y={padding.top}
                  width={spanWidth}
                  height={chartHeight}
                  fill={`url(#${span.window.gradientId})`}
                  stroke={span.window.primaryColor}
                  strokeWidth={isHovered ? "1.8" : "1"}
                  strokeDasharray="4 3"
                  strokeOpacity={isHovered ? 0.75 : 0.35}
                  rx="4"
                />

                {/* Subtle Diagonal Texture Stripe Fill */}
                <rect
                  x={x1}
                  y={padding.top}
                  width={spanWidth}
                  height={chartHeight}
                  fill="url(#volatilityStripes)"
                  pointerEvents="none"
                />

                {/* Top Banner Tag for the Volatility Window */}
                <g>
                  <rect
                    x={x1 + 6}
                    y={padding.top + 6}
                    width={Math.min(spanWidth - 12, 235)}
                    height="19"
                    fill="#030712"
                    fillOpacity="0.9"
                    stroke={span.window.primaryColor}
                    strokeWidth="0.8"
                    strokeOpacity={isHovered ? 0.9 : 0.6}
                    rx="3"
                  />
                  <text
                    x={x1 + 12}
                    y={padding.top + 19}
                    fill={span.window.primaryColor}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ⚡ {span.window.shortLabel}
                  </text>
                </g>

                {/* Bottom Timing Metric Tag */}
                <g>
                  <rect
                    x={x1 + 6}
                    y={padding.top + chartHeight - 22}
                    width={Math.min(spanWidth - 12, 190)}
                    height="16"
                    fill="#030712"
                    fillOpacity="0.88"
                    stroke={span.window.primaryColor}
                    strokeWidth="0.6"
                    strokeOpacity="0.4"
                    rx="3"
                  />
                  <text
                    x={x1 + 10}
                    y={padding.top + chartHeight - 11}
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    Avg +{span.window.avgPipsExpansion}p • {span.window.gmtTimeRange}
                  </text>
                </g>
              </g>
            );
          })}

          {/* QUALIFIED SUPPLY & DEMAND ZONES MATCHING TRADINGVIEW STRUCTURE */}
          {showSupplyDemand && filteredZones.map((z, idx) => {
            const isDemand = z.type === 'DEMAND';
            const topY = getY(z.priceHigh);
            const botY = getY(z.priceLow);
            const zoneHeight = Math.max(10, botY - topY);

            // Starting X coordinate calculated from the origin basing candles
            let startX = padding.left + 35;
            if (z.originCandleIndex !== undefined && z.originCandleIndex >= 0 && z.originCandleIndex < candles.length) {
              startX = padding.left + z.originCandleIndex * candleGap;
            } else if (idx === 0) {
              startX = padding.left + 80;
            } else {
              startX = padding.left + 180;
            }

            const boxWidth = Math.max(140, (width - padding.right) - startX);
            const isRetesting = currentPrice >= z.priceLow && currentPrice <= z.priceHigh;
            const tfTag = z.timeframeCategory || (z.timeframe === TimeFrame.H1 || z.timeframe === TimeFrame.H4 ? 'HTF' : 'LTF');

            return (
              <g key={z.id || idx}>
                {/* Horizontal Shaded Zone Box extending to the right */}
                <rect
                  x={startX}
                  y={topY}
                  width={boxWidth}
                  height={zoneHeight}
                  fill={isDemand ? "url(#tvDemandZoneGrad)" : "url(#tvSupplyZoneGrad)"}
                  stroke="#38bdf8"
                  strokeWidth={isRetesting ? "2.5" : "1.5"}
                  strokeDasharray={z.criteria.isValidZone ? undefined : "3 3"}
                  strokeOpacity={isRetesting ? 1 : 0.85}
                  className={isRetesting ? 'animate-pulse' : ''}
                />

                {/* Retest Active Pulse Indicator */}
                {isRetesting && (
                  <circle
                    cx={width - padding.right - 20}
                    cy={topY + zoneHeight / 2}
                    r="4"
                    fill="#fbbf24"
                    className="animate-ping"
                  />
                )}

                {/* Institutional TradingView-style Zone Label */}
                <g>
                  {/* Clean Background Pill for Label */}
                  <rect
                    x={startX + 6}
                    y={isDemand ? botY + 8 : topY - 22}
                    width={310}
                    height="19"
                    fill="#030712"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                    rx="4"
                    className="shadow-lg"
                  />
                  <text
                    x={startX + 12}
                    y={isDemand ? botY + 21.5 : topY - 8.5}
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontFamily="sans-serif"
                    fontWeight="700"
                  >
                    {isDemand 
                      ? `Demand Zone = Origin of explosive move [${tfTag}]` 
                      : `Supply Zone = Origin of explosive move [${tfTag}]`}
                  </text>
                  <text
                    x={startX + 258}
                    y={isDemand ? botY + 21.5 : topY - 8.5}
                    fill="#94a3b8"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    ${z.priceLow.toFixed(1)} - ${z.priceHigh.toFixed(1)}
                  </text>
                </g>

                {/* Visual Down/Up Arrow Showing the Explosive Move from the Origin */}
                {!isDemand ? (
                  /* Downward Arrow for Supply Zone = Origin of explosive move */
                  <g>
                    <line
                      x1={startX + 28}
                      y1={botY}
                      x2={startX + 28}
                      y2={botY + 48}
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      markerEnd="url(#supplyArrow)"
                    />
                    <rect
                      x={startX + 34}
                      y={botY + 16}
                      width={125}
                      height="15"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      rx="3"
                    />
                    <text
                      x={startX + 38}
                      y={botY + 27}
                      fill="#bae6fd"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ⚡ -{z.criteria.displacementPips}p IMBALANCE
                    </text>
                  </g>
                ) : (
                  /* Upward Arrow for Demand Zone = Origin of explosive move */
                  <g>
                    <line
                      x1={startX + 28}
                      y1={topY}
                      x2={startX + 28}
                      y2={topY - 48}
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      markerEnd="url(#demandArrow)"
                    />
                    <rect
                      x={startX + 34}
                      y={topY - 32}
                      width={125}
                      height="15"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      rx="3"
                    />
                    <text
                      x={startX + 38}
                      y={topY - 21}
                      fill="#bae6fd"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ⚡ +{z.criteria.displacementPips}p IMBALANCE
                    </text>
                  </g>
                )}

                {/* Criterion 2: FVG Imbalance Box */}
                {z.criteria.fvgCreated && (
                  <g>
                    <rect
                      x={startX + 175}
                      y={getY(Math.max(z.criteria.fvgTop, z.criteria.fvgBottom))}
                      width={130}
                      height={Math.max(4, Math.abs(getY(z.criteria.fvgTop) - getY(z.criteria.fvgBottom)))}
                      fill="url(#fvgGrad)"
                      stroke="#06b6d4"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                      strokeOpacity="0.7"
                    />
                    <text
                      x={startX + 180}
                      y={getY(Math.max(z.criteria.fvgTop, z.criteria.fvgBottom)) + 10}
                      fill="#22d3ee"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      FVG IMBALANCE GAP
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Asian Session & BSL/SSL Zones */}
          {showZones && (
            <>
              {/* Buy-Side Liquidity (BSL) target line */}
              <line
                x1={padding.left}
                y1={getY(bslLevel)}
                x2={width - padding.right}
                y2={getY(bslLevel)}
                stroke="#f59e0b"
                strokeDasharray="4 3"
                strokeWidth="1.2"
              />
              <text
                x={width - padding.right - 180}
                y={getY(bslLevel) - 4}
                fill="#f59e0b"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ▲ BSL LIQUIDITY @ ${bslLevel.toFixed(2)}
              </text>

              {/* Sell-Side Liquidity (SSL) target line */}
              <line
                x1={padding.left}
                y1={getY(sslLevel)}
                x2={width - padding.right}
                y2={getY(sslLevel)}
                stroke="#f43f5e"
                strokeDasharray="4 3"
                strokeWidth="1.2"
              />
              <text
                x={width - padding.right - 180}
                y={getY(sslLevel) + 12}
                fill="#f43f5e"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ▼ SSL LIQUIDITY @ ${sslLevel.toFixed(2)}
              </text>
            </>
          )}

          {/* EMA Lines */}
          <path d={ema20Points} fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.75" />
          <path d={ema50Points} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.65" />

          {/* Candlesticks Rendering */}
          {candles.map((candle, idx) => {
            const x = padding.left + idx * candleGap;
            const isBullish = candle.close >= candle.open;
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

            const candleColor = isBullish ? '#10b981' : '#f43f5e';

            return (
              <g 
                key={idx}
                onMouseEnter={() => setHoveredCandle(candle)}
                className="cursor-crosshair"
              >
                {/* Basing / Stalling Candle Indicator (Criterion 4) */}
                {candle.isBasing && (
                  <rect
                    x={x - 1}
                    y={highY - 5}
                    width={candleWidth + 2}
                    height="3"
                    fill="#fbbf24"
                    rx="1"
                  />
                )}

                {/* Wick */}
                <line
                  x1={x + candleWidth / 2}
                  y1={highY}
                  x2={x + candleWidth / 2}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth="1.2"
                />

                {/* Candle Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBullish ? '#10b981' : '#f43f5e'}
                  rx="1"
                />

                {/* Breakout / Sweep Marker */}
                {candle.isBreakout && (
                  <circle
                    cx={x + candleWidth / 2}
                    cy={isBullish ? highY - 8 : lowY + 8}
                    r="3.5"
                    fill="#fbbf24"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* Fair Value (Equilibrium Exit Target) Line */}
          {(() => {
            const fvPrice = Number(((Math.max(...allHighs) + Math.min(...allLows)) / 2).toFixed(2));
            const fvY = getY(fvPrice);
            return (
              <g>
                <line
                  x1={padding.left}
                  y1={fvY}
                  x2={width - padding.right}
                  y2={fvY}
                  stroke="#a855f7"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                  strokeOpacity="0.8"
                />
                <rect
                  x={width - padding.right}
                  y={fvY - 8}
                  width={padding.right - 5}
                  height="16"
                  fill="#3b0764"
                  stroke="#a855f7"
                  strokeWidth="0.8"
                  rx="3"
                />
                <text
                  x={width - padding.right + 4}
                  y={fvY + 3}
                  fill="#f3e8ff"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  FAIR VALUE ${fvPrice.toFixed(1)}
                </text>
              </g>
            );
          })()}

          {/* Current Live Price Line & Tag */}
          <g>
            <line
              x1={padding.left}
              y1={getY(currentPrice)}
              x2={width - padding.right}
              y2={getY(currentPrice)}
              stroke="#fbbf24"
              strokeDasharray="2 2"
              strokeWidth="1.5"
            />
            {/* Tag Badge */}
            <rect
              x={width - padding.right}
              y={getY(currentPrice) - 10}
              width={padding.right - 5}
              height="20"
              fill="#fbbf24"
              rx="4"
            />
            <text
              x={width - padding.right + 6}
              y={getY(currentPrice) + 4}
              fill="#090d16"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              ${currentPrice.toFixed(2)}
            </text>
          </g>
        </svg>

        {/* Floating Volatility Window Inspector Tooltip */}
        {hoveredVolatilitySpan && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border border-indigo-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-lg w-full animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="font-black text-white">{hoveredVolatilitySpan.window.name}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${hoveredVolatilitySpan.window.badgeBg}`}>
                {hoveredVolatilitySpan.window.intensity} INTENSITY
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[10px] font-mono">
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400 block font-sans text-[9px]">GMT Window:</span>
                <span className="text-amber-300 font-bold">{hoveredVolatilitySpan.window.gmtTimeRange}</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400 block font-sans text-[9px]">Desk Times:</span>
                <span className="text-sky-300 truncate block">{hoveredVolatilitySpan.window.localTimeDescription}</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400 block font-sans text-[9px]">Avg ATR Expansion:</span>
                <span className="text-emerald-400 font-bold">+{hoveredVolatilitySpan.window.avgPipsExpansion} Pips</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400 block font-sans text-[9px]">Window Candles:</span>
                <span className="text-slate-300 font-bold">{hoveredVolatilitySpan.candleCount} Bars ({activeTimeframe})</span>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-300 leading-snug">
              <strong className="text-indigo-400 font-bold">Trade Timing Edge: </strong>
              {hoveredVolatilitySpan.window.tradeTimingEdge}
            </div>
          </div>
        )}

        {/* Legend Overlay at bottom left */}
        <div className="absolute bottom-2 left-4 flex flex-wrap items-center gap-3 text-[10px] font-mono bg-slate-950/85 px-3 py-1.5 rounded-lg border border-slate-800">
          {showVolatilityOverlay && (
            <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
              <span className="w-2.5 h-2 bg-indigo-500/30 border border-indigo-400/70 inline-block rounded"></span> Volatility Window (London/NY)
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2.5 h-2 bg-sky-500/30 border border-sky-400 inline-block rounded"></span> Extreme Origin (S&D Imbalance)
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2 bg-cyan-500/20 border border-cyan-400 inline-block rounded"></span> FVG Imbalance
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="w-2.5 h-0.5 bg-purple-400 border-b border-dashed inline-block"></span> Fair Value Exit Target (50% Equilibrium)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-0.5 bg-amber-400 border-b border-dashed inline-block"></span> &le; 5 Basing Candles (Ultra Imbalance)
          </span>
        </div>
      </div>

      {/* Quick Action Simulation Buttons */}
      <div className="p-3 bg-slate-950 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Target className="w-4 h-4 text-amber-400" />
          <span>Interactive S&D Scenarios (Extremes &le; 5 bars &rarr; Exit Fair Value):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Specific LTF Short Position Signal Trigger */}
          {onSimulateLtfShort && (
            <button
              onClick={onSimulateLtfShort}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-black border border-rose-500/50 transition-all active:scale-95 shadow-md shadow-rose-900/20"
              title="Extreme High Supply (3 Green Engulfed by Red) + Retest -> Sell exiting at Fair Value"
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Extreme High Supply &rarr; SHORT (Exit Fair Value)</span>
            </button>
          )}

          {/* Specific LTF Long Position Signal Trigger */}
          {onSimulateLtfLong && (
            <button
              onClick={onSimulateLtfLong}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs font-black border border-emerald-500/50 transition-all active:scale-95 shadow-md shadow-emerald-900/20"
              title="Extreme Low Demand (3 Red Engulfed by Green) + Retest -> Buy exiting at Fair Value"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Extreme Low Demand &rarr; LONG (Exit Fair Value)</span>
            </button>
          )}

          {onSimulateSupplyZone && (
            <button
              onClick={onSimulateSupplyZone}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-all active:scale-95"
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              + Extreme Supply (&le;5 bars)
            </button>
          )}

          {onSimulateDemandZone && (
            <button
              onClick={onSimulateDemandZone}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-all active:scale-95"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              + Extreme Demand (&le;5 bars)
            </button>
          )}

          <button
            onClick={onTriggerBreakout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-lg text-xs transition-all active:scale-95 shadow-md shadow-amber-500/20"
          >
            <Zap className="w-3.5 h-3.5 text-slate-950" />
            NY Breakout (+80p)
          </button>
        </div>
      </div>
    </>
  )}
</div>
  );
};

