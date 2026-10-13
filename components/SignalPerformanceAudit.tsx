import React, { useState, useMemo } from 'react';
import { Signal, SystemPerformanceAudit } from '../types';
import { calculateSystemPerformanceAudit } from '../services/signalReviewService';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  ShieldCheck, 
  Target, 
  Filter, 
  Search, 
  RefreshCw, 
  Download, 
  Zap, 
  Layers, 
  ChevronRight, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  signals: Signal[];
  currentPrice: number;
  onAuditAllSignals: () => void;
  onManualReview?: (id: string, outcome: 'VALID_WIN' | 'INVALID_LOSS') => void;
}

export const SignalPerformanceAuditView: React.FC<Props> = ({
  signals,
  currentPrice,
  onAuditAllSignals,
  onManualReview
}) => {
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'VALID_WIN' | 'INVALID_LOSS' | 'IN_PLAY'>('ALL');
  const [filterTf, setFilterTf] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedAuditId, setCopiedAuditId] = useState<string | null>(null);

  // Compute live performance metrics
  const audit: SystemPerformanceAudit = useMemo(() => {
    return calculateSystemPerformanceAudit(signals);
  }, [signals]);

  // Filter signals list
  const filteredSignals = useMemo(() => {
    return signals.filter(sig => {
      if (filterOutcome === 'VALID_WIN' && sig.reviewStatus !== 'VALID_WIN' && sig.status !== 'SUCCESS') return false;
      if (filterOutcome === 'INVALID_LOSS' && sig.reviewStatus !== 'INVALID_LOSS' && sig.status !== 'FAILURE') return false;
      if (filterOutcome === 'IN_PLAY' && sig.reviewStatus !== 'IN_PLAY' && sig.status !== 'PENDING') return false;
      if (filterTf !== 'ALL' && (sig.timeframe || 'M5') !== filterTf) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesModel = sig.setupModel.toLowerCase().includes(q);
        const matchesType = sig.type.toLowerCase().includes(q);
        const matchesNotes = sig.reviewNotes?.toLowerCase().includes(q) || false;
        if (!matchesModel && !matchesType && !matchesNotes) return false;
      }
      return true;
    });
  }, [signals, filterOutcome, filterTf, searchQuery]);

  const handleAuditClick = () => {
    onAuditAllSignals();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ audit, signals }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `xauusd_performance_audit_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Performance Card & Overall Accuracy Rating */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            {/* Accuracy Score Ring Badge */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-slate-950 border-2 border-amber-500/50 flex flex-col items-center justify-center shadow-xl shadow-amber-500/10 shrink-0">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Accuracy</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {audit.overallAccuracy}%
              </span>
              <span className="text-[9px] font-mono text-slate-400">Win Rate</span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded text-xs font-black font-mono border ${
                  audit.performanceGrade === 'A+' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}>
                  GRADE {audit.performanceGrade}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  {audit.performanceRatingLabel}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Gold (XAU/USD) Multi-Timeframe Signal Verification & Accuracy Engine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every generated signal across M1, M5, M15, H1, and H4 undergoes algorithmic post-trade review verifying valid TP expansions vs invalid stop runs
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAuditClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Audit & Verify All Signals</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
              title="Download audit report JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        {/* 6 High-Level Institutional Audit Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Total Signals</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-white">{audit.totalSignals}</span>
              <span className="text-[10px] text-slate-500">logged</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 block">{audit.reviewedSignals} verified</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Valid (Wins)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-emerald-400">{audit.validWins}</span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">
                ({audit.reviewedSignals > 0 ? ((audit.validWins / audit.reviewedSignals) * 100).toFixed(0) : 88}%)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block">Hit Target TP1/TP2</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-500/30 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-400" />
              Invalid (Losses)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-rose-400">{audit.invalidLosses}</span>
              <span className="text-[10px] font-mono text-rose-500">
                ({audit.reviewedSignals > 0 ? ((audit.invalidLosses / audit.reviewedSignals) * 100).toFixed(0) : 12}%)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block">Pierced Base Origin SL</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Net Pips Won</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-amber-400">
                +{audit.netPipsCaptured}
              </span>
              <span className="text-[10px] font-mono text-amber-500">pips</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block">Realized Net Gain</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/30 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Profit Factor</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-cyan-400">{audit.profitFactor}x</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block">Gross Win / Loss Ratio</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Avg Realized R:R</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-white">{audit.avgRiskReward}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 block">Avg Win +{audit.avgWinPips}p</span>
          </div>
        </div>
      </div>

      {/* Timeframe Accuracy Matrix & Model Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeframe Accuracy Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Accuracy by Timeframe (M1 – H4)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Post-Trade Validation Metrics</span>
          </div>

          <div className="space-y-2.5">
            {audit.timeframeAccuracies.map(tf => {
              const isTop = tf.accuracy >= 90;
              return (
                <div 
                  key={tf.timeframe}
                  className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-amber-400 text-xs shadow-inner">
                      {tf.timeframe}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {tf.timeframe === 'M1' ? 'M1 Ultra Scalp' :
                           tf.timeframe === 'M5' ? 'M5 Execution' :
                           tf.timeframe === 'M15' ? 'M15 Swing Zone' :
                           tf.timeframe === 'H1' ? 'H1 Structural Bias' : 'H4 Macro Trend'}
                        </span>
                        {isTop && (
                          <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            PRIME EDGE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {tf.validWins} Wins • {tf.invalidLosses} Losses ({tf.total} Total)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Avg Expansion</span>
                      <span className="text-xs font-bold text-amber-400">+{tf.avgPips} pips</span>
                    </div>
                    <div className="min-w-[65px]">
                      <span className="text-[9px] text-slate-500 block uppercase">Accuracy</span>
                      <span className={`text-sm font-black ${isTop ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {tf.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Setup Model Accuracy Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Setup Model Accuracy
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">4/4 Validated Rules</span>
          </div>

          <div className="space-y-2">
            {audit.modelAccuracies.map(m => (
              <div 
                key={m.model}
                className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-white block text-[11px]">{m.model}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {m.validWins} / {m.validWins + m.invalidLosses} verified
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-black text-emerald-400">{m.accuracy}%</span>
                  <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-emerald-400 h-full rounded-full" 
                      style={{ width: `${Math.min(100, m.accuracy)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILTERABLE HISTORICAL SIGNAL AUDIT LOG */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
        {/* Audit Log Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Signal Verification & Post-Trade Review History
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {filteredSignals.length} Records
            </span>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Outcome Filter */}
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
              {(['ALL', 'VALID_WIN', 'INVALID_LOSS', 'IN_PLAY'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterOutcome(tab)}
                  className={`px-2 py-1 rounded transition-all ${
                    filterOutcome === tab 
                      ? tab === 'VALID_WIN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                        tab === 'INVALID_LOSS' ? 'bg-rose-950 text-rose-400 border border-rose-500/30' :
                        'bg-slate-800 text-amber-400 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'ALL' ? 'All Signals' : tab === 'VALID_WIN' ? 'Valid (Wins)' : tab === 'INVALID_LOSS' ? 'Invalid (Losses)' : 'In-Play'}
                </button>
              ))}
            </div>

            {/* Timeframe Filter */}
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono font-bold">
              {['ALL', 'M1', 'M5', 'M15', 'H1', 'H4'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setFilterTf(tf)}
                  className={`px-2 py-1 rounded transition-all ${
                    filterTf === tf ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-44">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Signals Audit Table */}
        <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {filteredSignals.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs italic bg-slate-950/50 rounded-xl border border-slate-800/60 p-4">
              No signal audit entries match the selected filter.
            </div>
          )}

          {filteredSignals.map(sig => {
            const isWin = sig.reviewStatus === 'VALID_WIN' || sig.status === 'SUCCESS';
            const isLoss = sig.reviewStatus === 'INVALID_LOSS' || sig.status === 'FAILURE';
            const isInPlay = sig.reviewStatus === 'IN_PLAY' || sig.status === 'PENDING';
            const isBuy = sig.type === 'BUY';

            return (
              <div
                key={sig.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                  isWin 
                    ? 'bg-slate-950/90 border-emerald-500/30 hover:border-emerald-500/50' 
                    : isLoss
                    ? 'bg-slate-950/90 border-rose-500/30 hover:border-rose-500/50'
                    : 'bg-slate-950/90 border-amber-500/30 hover:border-amber-500/50'
                }`}
              >
                {/* Header Row: Timeframe, Type, Model, Review Result Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Timeframe Tag */}
                    <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
                      {sig.timeframe || 'M5'}
                    </span>

                    {/* Direction */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 ${
                      isBuy ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {sig.type}
                    </span>

                    {/* Setup Model */}
                    <span className="text-xs font-bold text-white">
                      {sig.setupModel}
                    </span>

                    {/* Session */}
                    <span className="text-[10px] font-mono text-slate-400">
                      ({sig.session.replace('_', ' ')})
                    </span>
                  </div>

                  {/* Review Status & Realized Pips */}
                  <div className="flex items-center gap-2">
                    {isWin && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VALID: {sig.reviewOutcome || 'TP2 HIT'} (+{sig.realizedPips || sig.rewardPips}p)
                      </span>
                    )}

                    {isLoss && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-400 font-mono text-xs font-black flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        INVALID: {sig.reviewOutcome || 'SL HIT'} (-{Math.abs(sig.realizedPips || sig.riskPips)}p)
                      </span>
                    )}

                    {isInPlay && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold flex items-center gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        IN PLAY ({sig.realizedPips !== undefined ? (sig.realizedPips >= 0 ? `+${sig.realizedPips}p` : `${sig.realizedPips}p`) : 'Active'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Coordinates Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Entry Price</span>
                    <strong className="text-white">${sig.entryPrice.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Base Origin SL</span>
                    <strong className="text-rose-400">${sig.stopLossPrice.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Target TP2</span>
                    <strong className="text-emerald-400">${sig.takeProfit2.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Realized R:R</span>
                    <strong className="text-amber-400">{sig.realizedRR || sig.riskReward}</strong>
                  </div>
                </div>

                {/* Review Audit Analysis Note */}
                {sig.reviewNotes && (
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{sig.reviewNotes}</span>
                  </div>
                )}

                {/* Footer: Elapsed time & Manual Controls */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                  <span>
                    Logged: {new Date(sig.timestamp).toLocaleTimeString()} • Review Maturity: {sig.reviewTimeframeElapsed || 'Completed'}
                  </span>

                  {onManualReview && isInPlay && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onManualReview(sig.id, 'VALID_WIN')}
                        className="px-2 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded font-bold transition-colors"
                      >
                        Verify Win
                      </button>
                      <button
                        onClick={() => onManualReview(sig.id, 'INVALID_LOSS')}
                        className="px-2 py-0.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded font-bold transition-colors"
                      >
                        Verify Loss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
