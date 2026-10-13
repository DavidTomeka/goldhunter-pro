import React, { useState } from 'react';
import { 
  FileText, Download, Printer, CheckCircle2, AlertTriangle, 
  Layers, Compass, Crosshair, ArrowRight, X, ShieldAlert, Sparkles, BookOpen
} from 'lucide-react';

interface SystemManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemManualModal: React.FC<SystemManualModalProps> = ({ isOpen, onClose }) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (id: number) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Direct link to the generated static PDF
    const link = document.createElement('a');
    link.href = '/GoldHunter_Pro_System_Manual.pdf';
    link.download = 'GoldHunter_Pro_System_Manual.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl shadow-black/80 overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  GoldHunter Pro <span className="text-amber-400">Institutional System Manual</span>
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PDF Edition
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Operational Blueprint • Supply & Demand Imbalance Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              title="Download compiled PDF file directly"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="Print or Save as PDF via browser"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print / Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 bg-slate-900/95 text-slate-200">

          {/* Banner Box: Executive Law */}
          <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/40 relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-black text-amber-300 uppercase tracking-wide">
                  The Core Law: Signals Are Sent ONLY at Extreme Imbalances — Never at Fair Value
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  When price trades around fair value (equilibrium), supply and demand are balanced and no commercial edge exists. 
                  The bot only generates signals when an <strong className="text-amber-300 font-bold">extreme imbalance</strong> is discovered: 
                  at <strong className="text-rose-400">Extreme Highs</strong> (where supply severely exceeds demand) for Sells, and at <strong className="text-emerald-400">Extreme Lows</strong> (where demand severely exceeds supply) for Buys. 
                  Trades always aim to <strong className="text-amber-300">exit at Fair Value</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: The Four Laws of Price Movement */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                1. The Four Invariable Laws of Price Movement
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">A) What causes price to turn?</span>
                <p className="text-xs text-slate-200 mt-1 font-semibold">Unfilled Institutional Orders</p>
                <p className="text-xs text-slate-400 mt-1">
                  Price cannot penetrate past huge clusters of resting commercial limit orders. When buy or sell orders exceed available liquidity, price is forced to reverse immediately.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">B) Where will price turn to?</span>
                <p className="text-xs text-slate-200 mt-1 font-semibold">Areas of Significant Supply & Demand Imbalance</p>
                <p className="text-xs text-slate-400 mt-1">
                  Price moves like a magnet toward unmitigated zones where massive resting institutional order blocks remain untouched.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">C) Where will price move to?</span>
                <p className="text-xs text-slate-200 mt-1 font-semibold">Areas that Lack Significant Imbalance (Liquidity Voids)</p>
                <p className="text-xs text-slate-400 mt-1">
                  Zones with low friction and thin counter-orders offer zero resistance, allowing rapid, uninterrupted price movement toward the opposite extreme.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">D) What facilitates price movement?</span>
                <p className="text-xs text-slate-200 mt-1 font-semibold">Orders That Have Already Been Filled (Mitigated Zones)</p>
                <p className="text-xs text-slate-400 mt-1">
                  Once a level has absorbed its unfilled orders, it ceases to act as support or resistance. Price cuts smoothly through mitigated areas without turning.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Zone Identification & The 5-Candle Departure Rule */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                2. Identifying High-Probability Supply & Demand (4H down to 5M)
              </h3>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>The Golden Metric: Time Spent at Price Level (5 Candles or Less)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                    ✓ High Probability (≤ 5 Candles Departure)
                  </span>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    <strong>THE LESS TIME</strong> price spends at a certain price level, <strong>THE MORE OUT OF BALANCE</strong> supply and demand is at that level. 
                    An explosive blast away in 5 candles or fewer proves aggressive commercial participation with abundant leftover unfilled orders.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/30">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                    ✗ Invalid / Weak (&gt; 5 Candles Departure)
                  </span>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    <strong>THE MORE TIME</strong> price spends at a level, <strong>THE LESS OUT OF BALANCE</strong> it is. 
                    Extended churning (&gt; 5 candles) signifies fair value order matching. The system rejects these zones as weak and un-tradeable.
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <strong>Timeframe Hierarchy</strong>: We identify high-timeframe zones starting from the <span className="text-amber-400 font-bold">4-Hour (4H)</span> and <span className="text-amber-400 font-bold">1-Hour (1H)</span> charts to identify macro extreme levels, then drill down to <span className="text-amber-400 font-bold">15-Minute</span> and <span className="text-amber-400 font-bold">5-Minute</span> for precision execution.
              </div>
            </div>
          </div>

          {/* Section 3: Lower Timeframe Execution Sequence */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crosshair className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                3. Lower Timeframe Execution Protocol (5M / 15M)
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              When price arrives at a qualified HTF zone, all four lower-timeframe criteria must occur in exact chronological order:
            </p>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Clear Liquidity Sweep</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Price pierces past a key swing high (for Sells) or swing low (for Buys) with a sharp wick into the extreme zone, taking out retail stop losses before quickly retreating.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Change of Character (CHoCH)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    The 5M candle body must close decisively across the prior structural swing. For Sells: closes below previous demand swing low. For Buys: closes above previous supply swing high.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 bg-amber-950/10">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-amber-300">The 3-Candle Engulfing Rule</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-xs">
                      <span className="font-bold text-emerald-400 uppercase">FOR BUYS:</span>
                      <p className="text-slate-300 mt-0.5">
                        A single strong <strong>Green (Bullish)</strong> candle must completely engulf the real bodies of the previous <strong>THREE Red (Bearish)</strong> candles.
                      </p>
                    </div>
                    <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/30 text-xs">
                      <span className="font-bold text-rose-400 uppercase">FOR SELLS:</span>
                      <p className="text-slate-300 mt-0.5">
                        A single strong <strong>Red (Bearish)</strong> candle must completely engulf the real bodies of the previous <strong>THREE Green (Bullish)</strong> candles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black shrink-0">
                  4
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Retest Entry (Never Chase Market Orders)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    We never execute immediately on the close of the engulfing candle. The system places a <strong>Pending Limit Order</strong> (Buy Limit / Sell Limit) at the 50% equilibrium retest of the engulfing block or newly created 5M Order Block.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Exit & Stop Loss Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <h4 className="text-xs font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
                <span>Stop Loss Protocol</span>
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                • <strong>SELL TRADES</strong>: Placed 10–15 pips above the extreme wick high that produced the liquidity sweep.<br />
                • <strong>BUY TRADES</strong>: Placed 10–15 pips below the extreme wick low that produced the liquidity sweep.<br />
                • If price breaks this extreme, the setup is invalidated immediately.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <span>Take Profit Protocol (Fair Value Exit)</span>
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                • <strong>TARGET 1</strong>: Internal Fair Value Gap (FVG) / 38.2% retracement (secure partials & move SL to BE).<br />
                • <strong>TARGET 2 (FINAL)</strong>: Exactly at <strong>Fair Value (50% Equilibrium)</strong>. We close 100% of remaining volume because supply and demand have achieved temporary balance.
              </p>
            </div>
          </div>

          {/* Section 5: Interactive 6-Point Pre-Trade Checklist */}
          <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black text-white uppercase">
                  Institutional Pre-Trade Verification Checklist
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                {Object.values(checkedItems).filter(Boolean).length} / 6 Verified
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-4">
              Click each box to verify every condition before opening any pending order on MT5:
            </p>

            <div className="space-y-2">
              {[
                { id: 1, text: 'Price is currently at an EXTREME HIGH (Supply) or EXTREME LOW (Demand), not within fair value consolidation.' },
                { id: 2, text: 'The higher-timeframe zone demonstrated a rapid departure in 5 CANDLES OR FEWER.' },
                { id: 3, text: 'A distinct Liquidity Sweep occurred on the 5M/15M chart with an extended rejection wick.' },
                { id: 4, text: 'Clear Change of Character (CHoCH) completed with a full 5M candle body close.' },
                { id: 5, text: '3-Candle Engulfing verified (1 green candle engulfs 3 red candles for buys, or 1 red candle engulfs 3 green candles for sells).' },
                { id: 6, text: 'Pending Limit Order set at the RETEST with Take Profit mapped directly to Fair Value (50% Equilibrium).' }
              ].map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                    checkedItems[item.id]
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    checkedItems[item.id]
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-black'
                      : 'border-slate-600 bg-slate-850'
                  }`}>
                    {checkedItems[item.id] && '✓'}
                  </div>
                  <span className="text-xs font-medium select-none">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>GoldHunter Pro v2.4 • All rules synchronized with active terminal scanner</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF File</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
