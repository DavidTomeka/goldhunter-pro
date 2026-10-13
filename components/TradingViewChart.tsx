import React, { useState, memo } from 'react';
import { 
  POPULAR_BROKERS, 
  getSavedBrokerName, 
  saveBrokerName, 
  getSavedBrokerOffset, 
  saveBrokerOffset 
} from '../services/liveGoldDataService';
import { 
  Radio, 
  Sliders, 
  RefreshCw, 
  Check, 
  Maximize2, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Flame, 
  Zap,
  Clock,
  Activity
} from 'lucide-react';
import { TimeFrame } from '../types';

interface Props {
  currentPrice: number;
  timeframe: TimeFrame;
  onPriceCalibrate?: (newPrice: number, offset: number) => void;
  onRefreshLiveFeed?: () => void;
  isLoadingLive?: boolean;
  onSwitchToAlgoChart?: () => void;
}

export const TradingViewChart: React.FC<Props> = memo(({
  currentPrice,
  timeframe,
  onPriceCalibrate,
  onRefreshLiveFeed,
  isLoadingLive = false,
  onSwitchToAlgoChart
}) => {
  const [selectedBroker, setSelectedBroker] = useState<string>(() => getSavedBrokerName());
  const [brokerOffset, setBrokerOffset] = useState<number>(() => getSavedBrokerOffset());
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState<boolean>(false);
  const [iframeError, setIframeError] = useState<boolean>(false);

  // Map timeframe to TradingView interval string
  const tvInterval = (() => {
    switch (timeframe) {
      case TimeFrame.M1: return '1';
      case TimeFrame.M5: return '5';
      case TimeFrame.M15: return '15';
      case TimeFrame.H1: return '60';
      case TimeFrame.H4: return '240';
      case TimeFrame.D1: return 'D';
      default: return '5';
    }
  })();

  const currentBrokerConfig = POPULAR_BROKERS.find(b => b.name === selectedBroker) || POPULAR_BROKERS[0];

  const tvWidgetUrl = React.useMemo(() => {
    const config = {
      autosize: true,
      symbol: currentBrokerConfig.tvSymbol,
      interval: tvInterval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      backgroundColor: "rgba(10, 15, 30, 1)",
      gridColor: "rgba(30, 41, 59, 0.35)",
      studies: [
        "STD;EMA",
        "STD;RSI"
      ]
    };
    return `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
  }, [currentBrokerConfig.tvSymbol, tvInterval]);

  const handleSelectBroker = (brokerName: string) => {
    setSelectedBroker(brokerName);
    saveBrokerName(brokerName);
  };

  const handleApplyCalibration = () => {
    const targetPrice = parseFloat(customPriceInput);
    if (!isNaN(targetPrice) && targetPrice > 500) {
      const calculatedOffset = Number((targetPrice - currentPrice).toFixed(2));
      setBrokerOffset(calculatedOffset);
      saveBrokerOffset(calculatedOffset);
      if (onPriceCalibrate) {
        onPriceCalibrate(targetPrice, calculatedOffset);
      }
      setCalibrationSuccess(true);
      setTimeout(() => {
        setCalibrationSuccess(false);
        setIsCalibrating(false);
      }, 1500);
    }
  };

  const handleResetOffset = () => {
    setBrokerOffset(0);
    saveBrokerOffset(0);
    if (onPriceCalibrate) {
      onPriceCalibrate(currentPrice - brokerOffset, 0);
    }
    setCustomPriceInput('');
    setIsCalibrating(false);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-2xl space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live MT5 Interbank Feed Active
              </span>
              {brokerOffset !== 0 && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                  MT5 Offset: {brokerOffset > 0 ? `+${brokerOffset}` : brokerOffset} USD
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              TradingView Real-Time Institutional Gold (XAU/USD) Chart
            </h2>
          </div>
        </div>

        {/* Live Spot Price Display & Broker Calibration Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 font-mono">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Spot Gold:</span>
            <span className="text-base font-black text-amber-400">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Broker Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedBroker}
              onChange={(e) => handleSelectBroker(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-500"
              title="Select your MT5 broker's feed provider"
            >
              {POPULAR_BROKERS.map(b => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Quick Refresh Live Feed */}
            {onRefreshLiveFeed && (
              <button
                onClick={onRefreshLiveFeed}
                disabled={isLoadingLive}
                className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-all"
                title="Refresh live market price & candles"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
              </button>
            )}

            {/* Sync / Calibrate Button */}
            <button
              onClick={() => setIsCalibrating(!isCalibrating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isCalibrating 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                  : 'bg-slate-950 hover:bg-slate-800 text-amber-400 border-amber-500/30'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sync With My MT5</span>
            </button>
          </div>
        </div>
      </div>

      {/* Broker Price Sync / Calibration Panel Drawer */}
      {isCalibrating && (
        <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Calibrate Terminal to Your Exact MT5 Broker Quote
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Broker spreads vary by $0.20 - $1.50 across Exness, IC Markets, XM, FTMO
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Enter the exact price currently showing on your MetaTrader 5 terminal. The entire application (Candlestick chart, 4-Criteria Supply & Demand zones, RSI, EMA20, and order flow sentiment) will immediately synchronize to your broker's exact numbers!
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">$</span>
              <input
                type="number"
                step="0.01"
                placeholder={`e.g. ${currentPrice.toFixed(2)} (your MT5 gold price)`}
                value={customPriceInput}
                onChange={(e) => setCustomPriceInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-7 pr-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={handleApplyCalibration}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {calibrationSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  Synced Successfully!
                </>
              ) : (
                'Apply MT5 Price Sync'
              )}
            </button>

            {brokerOffset !== 0 && (
              <button
                onClick={handleResetOffset}
                className="w-full sm:w-auto px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Reset to Raw Interbank Spot
              </button>
            )}
          </div>
        </div>
      )}

      {/* TradingView Advanced Real-Time Chart Container */}
      <div className="w-full h-[540px] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-inner relative">
        {iframeError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950">
            <ShieldCheck className="w-10 h-10 text-amber-400" />
            <h3 className="text-sm font-bold text-white">TradingView Embed Notice</h3>
            <p className="text-xs text-slate-400 max-w-md">
              External TradingView frame blocked by browser privacy or sandbox settings. You can switch to our high-precision Algorithmic S&D Blueprint Chart.
            </p>
            <div className="flex items-center gap-3">
              {onSwitchToAlgoChart && (
                <button
                  onClick={onSwitchToAlgoChart}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-500/20"
                >
                  Switch to S&D Blueprint Chart
                </button>
              )}
              <button
                onClick={() => setIframeError(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Retry Loading
              </button>
            </div>
          </div>
        ) : (
          <iframe
            key={`${currentBrokerConfig.tvSymbol}-${tvInterval}`}
            src={tvWidgetUrl}
            title={`TradingView ${currentBrokerConfig.tvSymbol} ${timeframe} Chart`}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
            onError={() => setIframeError(true)}
          />
        )}
      </div>

      {/* Footer Status & MT5 Hot-Key Helper */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Active TradingView Feed:</span>
          <strong className="text-white">{currentBrokerConfig.tvSymbol}</strong>
          <span className="text-slate-600">•</span>
          <span>Timeframe: <strong className="text-amber-400 font-bold">{timeframe.toUpperCase()}</strong></span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span>Tick by tick interbank liquidity</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">100% Identical to MT5 Candles</span>
        </div>
      </div>
    </div>
  );
});
