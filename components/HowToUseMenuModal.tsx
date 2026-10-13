import React, { useState } from 'react';
import { 
  HelpCircle, BookOpen, CheckCircle2, AlertTriangle, ArrowRight, 
  Terminal, ShieldCheck, Zap, Download, Copy, Check, Crosshair, 
  TrendingUp, TrendingDown, Layers, Sparkles, X, ChevronRight, Sliders, BarChart3
} from 'lucide-react';

interface HowToUseMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPDFManual?: () => void;
}

export const HowToUseMenuModal: React.FC<HowToUseMenuModalProps> = ({
  isOpen,
  onClose,
  onOpenPDFManual
}) => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'rules' | 'screens' | 'pitch' | 'faq'>('quickstart');
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickPitchText = `GoldHunter Pro is an institutional Supply & Demand terminal engineered specifically for Gold (XAU/USD). Unlike ordinary indicators, it does NOT trade random candles or fair-value consolidations. It scans for true market imbalances between 4H and 5M where unfilled institutional orders exist. When price reaches an extreme high (Supply) or extreme low (Demand) created by rapid departures (5 candles or less), the system watches for a 5M Liquidity Sweep, a Change of Character (CHoCH), and a 3-candle engulfing pattern. You only enter on the retest and take profit at fair value.`;

  const copyPitch = () => {
    navigator.clipboard.writeText(quickPitchText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl shadow-black/90 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30 text-amber-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  How To Use <span className="text-amber-400">GoldHunter Pro</span>
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Client & Trader Guide
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The complete walkthrough: how to answer clients, read signals, and execute 100% compliant trades.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPDFManual && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPDFManual();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Full PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection('quickstart')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'quickstart'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. Quick-Start (30-Sec Overview)</span>
          </button>

          <button
            onClick={() => setActiveSection('rules')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'rules'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. The 4 Golden Rules</span>
          </button>

          <button
            onClick={() => setActiveSection('screens')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'screens'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. How to Read Each Screen</span>
          </button>

          <button
            onClick={() => setActiveSection('pitch')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'pitch'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. What to Say When Asked</span>
          </button>

          <button
            onClick={() => setActiveSection('faq')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'faq'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>5. Common Questions & FAQ</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm text-slate-300">
          
          {/* SECTION 1: QUICK START */}
          {activeSection === 'quickstart' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  How to Use the System in 3 Easy Steps
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Anyone can use GoldHunter Pro by following this simple daily routine. You do not need to sit and guess candle movements all day.
                </p>
              </div>

              {/* 3 Step Process Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center mb-3">
                      01
                    </div>
                    <h4 className="font-bold text-white mb-1">Look for High-Imbalance Signals</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Open the <strong>Dashboard</strong>. If the system status says <span className="text-emerald-400 font-bold">\"ACTIVE SETUP\"</span> or <span className="text-amber-400 font-bold">\"MONITORING ZONE\"</span>, it means price has touched an extreme High or Low where banks have unfilled orders.
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-amber-300/80 bg-slate-900 p-2 rounded border border-slate-800">
                    Rule: We ignore signals when price is near Fair Value.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center mb-3">
                      02
                    </div>
                    <h4 className="font-bold text-white mb-1">Verify the 4 Confirmation Badges</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      On the signal card, look at the 4 checkmarks:
                    </p>
                    <ul className="text-xs text-slate-300 space-y-1 mb-3">
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Extreme High / Low (4H/1H)</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fast departure (≤ 5 candles)</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 5M Liquidity Sweep + CHoCH</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 3-Candle Engulfing on Lower TF</li>
                    </ul>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-300/80 bg-slate-900 p-2 rounded border border-slate-800">
                    Rule: All 4 badges must be green before taking the trade!
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center mb-3">
                      03
                    </div>
                    <h4 className="font-bold text-white mb-1">Place Limit Order on Retest & Exit at Fair Value</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Never chase market orders. Place a <strong>Limit Order</strong> at the retest level shown on the terminal. Stop-loss goes 1-2 points beyond the extreme wick. Take Profit is strictly at <strong>Fair Value</strong>.
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-300/80 bg-slate-900 p-2 rounded border border-slate-800">
                    Or copy the generated MT5 EA code to execute hands-free!
                  </div>
                </div>

              </div>

              {/* Visual Flow diagram */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Visual Lifecycle of a Trade
                </h4>
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                  <div className="w-full md:w-1/4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Step 1 • 4H Zone</span>
                    <span className="font-bold text-white">Rapid Departure</span>
                    <p className="text-[11px] text-slate-400 mt-1">Price left in ≤ 5 candles leaving unfilled orders.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 md:rotate-0 flex-shrink-0" />
                  <div className="w-full md:w-1/4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">Step 2 • 5M Return</span>
                    <span className="font-bold text-white">Liquidity Sweep</span>
                    <p className="text-[11px] text-slate-400 mt-1">Retail stops are cleared; structure flips (CHoCH).</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 md:rotate-0 flex-shrink-0" />
                  <div className="w-full md:w-1/4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Step 3 • Engulfing</span>
                    <span className="font-bold text-white">3-Candle Engulf</span>
                    <p className="text-[11px] text-slate-400 mt-1">1 candle completely swallows previous 3 opposite candles.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 md:rotate-0 flex-shrink-0" />
                  <div className="w-full md:w-1/4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">Step 4 • Execution</span>
                    <span className="font-bold text-white">Retest & Exit</span>
                    <p className="text-[11px] text-slate-400 mt-1">Fill pending limit on retest; secure TP at Fair Value.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: THE 4 GOLDEN RULES */}
          {activeSection === 'rules' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-300">
                  Every signal generated by this system must strictly satisfy these 4 conditions. If even one condition is missing, the trade is rejected:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      Trade ONLY at Extreme Highs (Supply) and Extreme Lows (Demand)
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Signals are NEVER sent when price is in the middle of a range or consolidating around fair value. Sells are taken only where supply drastically exceeds demand at extremes; Buys are taken only where demand drastically exceeds supply at extremes.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      Departure Speed Rule: ≤ 5 Candles
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      A valid institutional zone must have moved away rapidly. The less time price spent at that level, the higher the imbalance. If price took more than 5 candles to leave, the zone is invalid because the orders were already partially absorbed.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      5M Liquidity Sweep + Change of Character (CHoCH)
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      When price reaches the higher timeframe zone, we don't blindly buy or sell. We drop down to 5M/15M to confirm that smart money has swept retail liquidity (equal highs/lows) and then broken market structure with a full body close.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      Triple-Engulfing Candle + Retest Entry
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      For BUYS: 1 green candle must completely engulf the bodies of the 3 preceding red candles.<br/>
                      For SELLS: 1 red candle must completely engulf the bodies of the 3 preceding green candles.<br/>
                      Once printed, wait for a pullback (retest) into the 50%-78% zone before executing the pending limit order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: HOW TO READ EACH SCREEN */}
          {activeSection === 'screens' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                    <Crosshair className="w-4 h-4" />
                    <span>Live Cockpit & Chart</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Shows live XAU/USD candles with shaded Supply zones (red), Demand zones (green), and Fair Value lines (yellow). Look at the Departure Candle Count badge displayed directly on each zone.
                  </p>
                  <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded">
                    <strong>Tip:</strong> Toggle timeframes between 4H, 1H, 15M, and 5M to see the top-down alignment.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Signals & Execution Panel</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Displays high-probability pending limits and active trades with exact entry, stop loss, and take profit levels calculated according to your lot size and account balance.
                  </p>
                  <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded">
                    <strong>Tip:</strong> Copy the exact lot size calculated by the built-in 1% institutional risk formula.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                    <Layers className="w-4 h-4" />
                    <span>Institutional Order Flow Heatmap</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Visualizes where unfilled orders are resting vs. where orders have already been filled. Price moves through filled areas smoothly and turns when hitting large clusters of unfilled institutional orders.
                  </p>
                  <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded">
                    <strong>Tip:</strong> Unfilled zones represent turning points; filled zones represent movement corridors.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-purple-400 font-bold mb-2">
                    <Terminal className="w-4 h-4" />
                    <span>MT5 EA Studio</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    Generates copy-paste ready MetaTrader 5 Expert Advisor (.mq5) source code programmed with all 4 institutional rules for automated hands-free execution on your broker account.
                  </p>
                  <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded">
                    <strong>Tip:</strong> Click \"Copy MQL5 Source Code\" and compile it in MetaEditor in 3 seconds.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 4: WHAT TO SAY WHEN ASKED */}
          {activeSection === 'pitch' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Copy-Paste Client Explanation
                  </h3>
                  <button
                    onClick={copyPitch}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold transition-all border border-blue-500/30"
                  >
                    {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPitch ? 'Copied!' : 'Copy Explanation'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-slate-800 font-sans leading-relaxed">
                  \"{quickPitchText}\"
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Answers to the 5 Core Questions People Ask:
                </h4>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-amber-400">Q1: How does it know where price will turn?</span>
                  <p className="text-xs text-slate-300">
                    It looks for significant supply and demand imbalances created by rapid departures (5 candles or fewer), where large institutional orders could not be completely filled on the initial impulse.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-amber-400">Q2: What actually causes price to turn?</span>
                  <p className="text-xs text-slate-300">
                    Unfilled institutional limit orders waiting at extreme price levels. When price returns, the overwhelming volume of resting buy or sell orders forces price in the opposite direction.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-amber-400">Q3: Where will price move to?</span>
                  <p className="text-xs text-slate-300">
                    Price moves toward areas that lack a significant supply and demand imbalance (the Fair Value corridor). We take our profit at Fair Value rather than hoping for endless trends.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-amber-400">Q4: What facilitates price movement?</span>
                  <p className="text-xs text-slate-300">
                    Orders that have already been filled facilitate smooth price movement, because there is no remaining opposing liquidity to slow price down.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-amber-400">Q5: How do we avoid fakeouts?</span>
                  <p className="text-xs text-slate-300">
                    We never enter immediately upon touch. We demand a 5M Liquidity Sweep, a Change of Character (CHoCH), and a 3-candle engulfing candlestick, and then we enter strictly on the retest.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: FAQ */}
          {activeSection === 'faq' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-1">Does this work on mobile phones?</h4>
                <p className="text-xs text-slate-400">
                  Yes, GoldHunter Pro is fully responsive. You can open the URL in Chrome or Safari on your iOS or Android phone, view live signals, and download the PDF manual.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-1">What timeframe should I look at first?</h4>
                <p className="text-xs text-slate-400">
                  Always start at the <strong>4-Hour (4H)</strong> and <strong>1-Hour (1H)</strong> timeframes to establish the macro extreme zones. Then drop down to <strong>5-Minute (5M)</strong> or <strong>15-Minute (15M)</strong> to wait for the lower timeframe sweep and 3-candle engulfing trigger.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-1">How can I download the complete manual as a PDF?</h4>
                <p className="text-xs text-slate-400">
                  Click the <strong>\"System Manual (PDF)\"</strong> button in the top navigation bar. Inside the window, click <strong>\"Download PDF\"</strong> to get the official vector PDF directly onto your device.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-1">Can I connect this to MetaTrader 5?</h4>
                <p className="text-xs text-slate-400">
                  Yes. Switch to the <strong>"MT5 EA Studio"</strong> tab, where the system provides pre-generated MQL5 Expert Advisor code configured with the exact 4 rules, departure speed verification, and automatic trade execution.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/40 bg-emerald-950/10">
                <h4 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Does the robot draw supply and demand zones as the market moves?
                </h4>
                <p className="text-xs text-slate-300">
                  <strong>Yes!</strong> The GoldHunter Pro EA includes a dedicated real-time charting engine. As ticks arrive in MetaTrader 5, the robot automatically scans candles, paints colored Demand (Emerald) and Supply (Crimson) boxes on your chart, extends them dynamically into the future, and flags them with <em>⚡ [TESTING ZONE]</em> when price returns to mitigate!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Does the EA send back data to this system to see performance?
                </h4>
                <p className="text-xs text-slate-300">
                  The EA runs directly on your MetaTrader 5 terminal (on your PC or VPS) for <strong>100% privacy and security</strong> — it does not expose your broker account balance or private trades over the public internet. All live and historical performance is tracked in two places:
                </p>
                <ul className="text-xs text-slate-400 list-disc list-inside mt-2 space-y-1">
                  <li><strong>Inside MetaTrader 5:</strong> Check the <strong>History</strong> tab at the bottom of MT5, or right-click and choose <strong>Report → HTML</strong> to see your full equity curve, win rate, and profit factor.</li>
                  <li><strong>Strategy Tester:</strong> Press <kbd className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-amber-400">Ctrl + R</kbd> in MT5 to backtest on historical data with institutional graphs.</li>
                  <li><strong>Mobile Push:</strong> Real-time trade executions and TP alerts ring directly on your phone via your MetaQuotes ID.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>GoldHunter Pro • Operational User Guide</span>
          </div>
          
          <div className="flex items-center gap-3">
            {onOpenPDFManual && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPDFManual();
                }}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
              >
                <span>Read Institutional PDF Manual</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
            >
              Close Menu
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
