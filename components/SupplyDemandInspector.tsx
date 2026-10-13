import React, { useState } from 'react';
import { SupplyDemandZone, ValidZoneCriteria, TimeFrame } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle,
  Zap,
  Target,
  Clock,
  Sparkles
} from 'lucide-react';

interface Props {
  zones: SupplyDemandZone[];
  currentPrice: number;
  activeTimeframe?: TimeFrame;
  onSelectTimeframe?: (tf: TimeFrame) => void;
  selectedZoneId?: string;
  onSelectZone?: (zone: SupplyDemandZone) => void;
  onSimulateValidZone: (type: 'DEMAND' | 'SUPPLY') => void;
  onGenerateZoneSignal?: (zone: SupplyDemandZone) => void;
}

export const SupplyDemandInspector: React.FC<Props> = ({
  zones,
  currentPrice,
  activeTimeframe,
  onSelectTimeframe,
  selectedZoneId: externalSelectedZoneId,
  onSelectZone,
  onSimulateValidZone,
  onGenerateZoneSignal
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(externalSelectedZoneId || zones[0]?.id || '');
  const [filter, setFilter] = useState<'ALL' | 'QUALIFIED' | 'DISQUALIFIED'>('QUALIFIED');
  const [tfFilter, setTfFilter] = useState<'ALL' | 'ACTIVE_TF' | 'HTF' | 'LTF'>('ALL');

  React.useEffect(() => {
    if (externalSelectedZoneId) {
      setSelectedZoneId(externalSelectedZoneId);
    }
  }, [externalSelectedZoneId]);

  const filteredZones = zones.filter(z => {
    if (filter === 'QUALIFIED' && !z.criteria.isValidZone) return false;
    if (filter === 'DISQUALIFIED' && z.criteria.isValidZone) return false;
    if (tfFilter === 'ACTIVE_TF' && activeTimeframe && z.timeframe !== activeTimeframe) return false;
    if (tfFilter === 'HTF' && (z.timeframeCategory || 'LTF') !== 'HTF') return false;
    if (tfFilter === 'LTF' && (z.timeframeCategory || 'LTF') !== 'LTF') return false;
    return true;
  });

  const activeZone = zones.find(z => z.id === selectedZoneId) || filteredZones[0] || zones[0];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col space-y-4">
      {/* Title & Qualification Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Supply & Demand Zone 4-Criteria Validation Engine
              </h3>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded">
                STRICT ICT QUALIFIER
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Only zones fulfilling all 4 institutional rules are approved for trade execution.
            </p>
          </div>
        </div>

        {/* Simulate Valid Zone Quick Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSimulateValidZone('DEMAND')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-700/60 transition-all active:scale-95 shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            + Valid Demand Zone
          </button>
          <button
            onClick={() => onSimulateValidZone('SUPPLY')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-lg border border-rose-700/60 transition-all active:scale-95 shadow-sm"
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            + Valid Supply Zone
          </button>
        </div>
      </div>

      {/* 4 Core Qualification Criteria Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-start gap-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">1</span>
          <div>
            <strong className="text-white block text-[11px]">Extreme High/Low Imbalance</strong>
            <span className="text-[10px] text-slate-400">Extreme High (Sells) & Extreme Low (Buys). Never at Fair Value.</span>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">2</span>
          <div>
            <strong className="text-white block text-[11px]">Time Spent: &le; 5 Candles</strong>
            <span className="text-[10px] text-slate-400">Less time spent = more out of balance. 5 candles or less.</span>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">3</span>
          <div>
            <strong className="text-white block text-[11px]">Unfilled Orders & FVG</strong>
            <span className="text-[10px] text-slate-400">Unfilled institutional orders cause turn. Sharp displacement FVG.</span>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">4</span>
          <div>
            <strong className="text-white block text-[11px]">3-Candle Engulfing & Retest</strong>
            <span className="text-[10px] text-slate-400">3 red/green engulfed + Sweep + CHoCH. Retest execution.</span>
          </div>
        </div>
      </div>

      {/* Main Inspector View: Zone Selector & Criteria Audit Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Zone Selection List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between pb-1 flex-wrap gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Zones</span>
            <div className="flex items-center gap-1.5">
              {/* HTF / LTF / Active TF Filter */}
              <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-[9px] font-mono">
                <button
                  onClick={() => setTfFilter('ALL')}
                  className={`px-1.5 py-0.5 rounded font-bold ${tfFilter === 'ALL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'}`}
                >
                  ALL
                </button>
                {activeTimeframe && (
                  <button
                    onClick={() => setTfFilter('ACTIVE_TF')}
                    className={`px-1.5 py-0.5 rounded font-bold ${tfFilter === 'ACTIVE_TF' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-amber-400'}`}
                  >
                    ★ {activeTimeframe}
                  </button>
                )}
                <button
                  onClick={() => setTfFilter('HTF')}
                  className={`px-1.5 py-0.5 rounded font-bold ${tfFilter === 'HTF' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'}`}
                >
                  HTF
                </button>
                <button
                  onClick={() => setTfFilter('LTF')}
                  className={`px-1.5 py-0.5 rounded font-bold ${tfFilter === 'LTF' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'}`}
                >
                  LTF
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-[9px] font-bold">
                {(['QUALIFIED', 'ALL'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-2 py-0.5 rounded ${filter === tab ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
            {filteredZones.map(zone => {
              const isDemand = zone.type === 'DEMAND';
              const isSelected = activeZone?.id === zone.id;
              const pipsAway = Math.round(Math.abs(currentPrice - (isDemand ? zone.priceHigh : zone.priceLow)) * 10);
              const tfCat = zone.timeframeCategory || 'LTF';

              return (
                <div
                  key={zone.id}
                  onClick={() => {
                    setSelectedZoneId(zone.id);
                    if (onSelectZone) onSelectZone(zone);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-slate-800/90 border-amber-500 shadow-md' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        isDemand ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {zone.type} ZONE
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700 font-bold">
                        {tfCat} • {zone.structureType || (isDemand ? 'DBR' : 'RBD')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">
                        ${zone.priceLow.toFixed(2)} - ${zone.priceHigh.toFixed(2)}
                      </span>
                    </div>

                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      zone.criteria.isValidZone 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-rose-950/40 text-rose-400 border border-rose-800'
                    }`}>
                      {zone.criteria.isValidZone ? '✓ 4/4 VALID' : 'DISQUALIFIED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Displacement: +{zone.criteria.displacementPips}p</span>
                    <span>Stalled: {zone.criteria.stalledCandlesCount} bars</span>
                    <span className="text-amber-400 font-bold">{pipsAway} pips away</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed 4-Criteria Audit Checklist (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          {activeZone ? (
            <>
              {/* Header of Active Zone */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${activeZone.type === 'DEMAND' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {activeZone.type} Zone Audit (${activeZone.priceLow.toFixed(2)} – ${activeZone.priceHigh.toFixed(2)})
                  </h4>
                </div>
                <div className={`px-2.5 py-1 rounded text-[10px] font-black border flex items-center gap-1.5 ${
                  activeZone.criteria.isValidZone 
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/70 shadow-emerald-500/10' 
                    : 'bg-rose-950/60 text-rose-300 border-rose-600/70'
                }`}>
                  {activeZone.criteria.isValidZone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  {activeZone.criteria.isValidZone ? 'QUALIFIED VALID INSTITUTIONAL ZONE' : 'CRITERIA NOT MET - DISQUALIFIED'}
                </div>
              </div>

              {/* The Criteria Detailed Cards */}
              <div className="space-y-2">
                {/* Criterion 1: Extreme High / Extreme Low */}
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/90 flex items-start gap-2.5">
                  {activeZone.isExtreme !== false ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <strong className="text-white">1. Extreme High/Low Imbalance (Never Fair Value)</strong>
                      <span className="font-mono text-emerald-400 font-bold">
                        {activeZone.type === 'SUPPLY' ? 'Supply Exceeds Demand (Extreme High)' : 'Demand Exceeds Supply (Extreme Low)'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Signals are strictly locked out at Fair Value. Only valid at extreme range boundaries where market order flow is one-sided.
                    </p>
                  </div>
                </div>

                {/* Criterion 2: Time Spent Rule (<= 5 candles) */}
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/90 flex items-start gap-2.5">
                  {activeZone.criteria.stalledCandlesValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <strong className="text-white">2. Time Spent Rule (NB: &le; 5 Candles)</strong>
                      <span className={`font-mono font-bold ${activeZone.criteria.stalledCandlesValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {activeZone.criteria.stalledCandlesCount} Candles Spent ({activeZone.criteria.stalledCandlesCount <= 2 ? '⚡ ULTRA HIGH IMBALANCE' : 'HIGH IMBALANCE'})
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      The LESS time price spends, the MORE out of balance supply & demand is. (If &gt; 5 candles, auction achieved balance & zone is disqualified).
                    </p>
                  </div>
                </div>

                {/* Criterion 3: Unfilled Orders & Sharp Displacement */}
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/90 flex items-start gap-2.5">
                  {activeZone.criteria.sharpMovement && activeZone.criteria.fvgCreated ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <strong className="text-white">3. What Causes Turn: Unfilled Institutional Orders</strong>
                      <span className="font-mono text-cyan-400 font-bold">+{activeZone.criteria.displacementPips}p Displacement + FVG</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Massive resting institutional limit orders cause price to turn. Sharp departure left FVG void (${activeZone.criteria.fvgBottom || (activeZone.priceLow - 1)} &ndash; ${activeZone.criteria.fvgTop || (activeZone.priceHigh + 1)}).
                    </p>
                  </div>
                </div>

                {/* Criterion 4: Lower Timeframe 3-Candle Engulfing + Retest */}
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/90 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <strong className="text-white">4. LTF 3-Candle Engulfing + Retest Execution</strong>
                      <span className="font-mono text-amber-400 font-bold">
                        {activeZone.type === 'DEMAND' ? '3 Red Engulfed by Green' : '3 Green Engulfed by Red'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Prior liquidity swept, CHoCH structural shift confirmed, 3-candle sequence engulfed, and origin order block retested prior to trade entry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trade Instruction & Exit at Fair Value */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400">Execution Plan:</span>
                    <span className="text-amber-400 font-bold">
                      {activeZone.type === 'DEMAND' ? 'BUY LIMIT' : 'SELL LIMIT'} @ ${activeZone.priceHigh.toFixed(2)}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-rose-400">SL: ${(activeZone.type === 'DEMAND' ? activeZone.priceLow - 0.90 : activeZone.priceHigh + 0.90).toFixed(2)}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-emerald-400 font-bold">
                      EXIT TARGET: Fair Value ${activeZone.fairValuePrice ? activeZone.fairValuePrice.toFixed(2) : (activeZone.type === 'DEMAND' ? (activeZone.priceHigh + 8).toFixed(2) : (activeZone.priceLow - 8).toFixed(2))}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
                    ⚡ {activeZone.timeframeCategory || 'LTF'} {activeZone.type === 'SUPPLY' ? 'Extreme High Short Position' : 'Extreme Low Long Position'} &bull; Filled orders facilitate rapid movement to Fair Value
                  </span>
                </div>

                {onGenerateZoneSignal && activeZone.criteria.isValidZone && (
                  <button
                    onClick={() => onGenerateZoneSignal(activeZone)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 ${
                      activeZone.type === 'SUPPLY'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Generate {activeZone.type === 'SUPPLY' ? 'SHORT' : 'LONG'} Signal</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs italic">
              No zones detected. Click "+ Valid Demand Zone" or "+ Valid Supply Zone" above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
