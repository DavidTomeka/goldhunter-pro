import React, { useState } from 'react';
import { 
  GoldMQL5Config, 
  defaultGoldMQL5Config, 
  generateGoldExpertAdvisor, 
  generateGoldIndicator, 
  downloadMQL5File 
} from '../services/mql5Service';
import { 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Settings, 
  HelpCircle, 
  Smartphone, 
  ShieldCheck, 
  Cpu, 
  Award,
  Zap,
  Layers,
  Sparkles,
  BarChart3,
  FileText,
  Lock
} from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export const MT5Studio: React.FC<Props> = ({ onClose }) => {
  const [config, setConfig] = useState<GoldMQL5Config>(defaultGoldMQL5Config);
  const [activeTab, setActiveTab] = useState<'ea' | 'indicator' | 'guide' | 'bridge'>('ea');
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const eaCode = generateGoldExpertAdvisor(config);
  const indicatorCode = generateGoldIndicator();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEA = () => {
    downloadMQL5File('GoldHunter_Pro_XAUUSD.mq5', eaCode);
  };

  const handleDownloadIndicator = () => {
    downloadMQL5File('GoldHunter_ICT_Levels_MT5.mq5', indicatorCode);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl flex flex-col space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Terminal className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Gold (XAU/USD) MT5 Integration Hub</h2>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded">
                MQL5 XAUUSD PRO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deploy automated Smart Money Concepts (SMC) & ICT setups directly onto MetaTrader 5 for Gold.
            </p>
          </div>
        </div>

        {/* Quick Download Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadEA}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD .MQ5 GOLD EA
          </button>
          <button
            onClick={handleDownloadIndicator}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            INDICATOR (.MQ5)
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-800 w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab('ea')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ea' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Gold Expert Advisor (EA)
        </button>
        <button
          onClick={() => setActiveTab('indicator')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'indicator' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          ICT Levels & Arrows
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'guide' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          MT5 Setup Guide (4 Steps)
        </button>
        <button
          onClick={() => setActiveTab('bridge')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'bridge' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Performance & Alerts
        </button>
      </div>

      {/* TAB 1: EXPERT ADVISOR CODE & SETTINGS */}
      {activeTab === 'ea' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive MQL5 Settings Configurator */}
          <div className="lg:col-span-5 space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-amber-400" />
                Customize Gold Parameters
              </span>
              <button 
                onClick={() => setConfig(defaultGoldMQL5Config)}
                className="text-[10px] text-amber-400 hover:underline font-mono"
              >
                Reset Defaults
              </button>
            </div>

            {/* Parameter Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Lot Size (Default: 0.05 lot = $5 / pip on standard accounts)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10.0"
                  value={config.lotSize}
                  onChange={e => setConfig({ ...config, lotSize: parseFloat(e.target.value) || 0.01 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Stop Loss (Pips)</label>
                  <input
                    type="number"
                    value={config.stopLossPips}
                    onChange={e => setConfig({ ...config, stopLossPips: parseInt(e.target.value) || 35 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white"
                  />
                  <span className="text-[10px] text-slate-500">35 pips = $3.50 in Gold</span>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Take Profit 1 (Pips)</label>
                  <input
                    type="number"
                    value={config.takeProfit1Pips}
                    onChange={e => setConfig({ ...config, takeProfit1Pips: parseInt(e.target.value) || 65 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white"
                  />
                  <span className="text-[10px] text-slate-500">Partial 50% TP</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Take Profit 2 (Runner)</label>
                  <input
                    type="number"
                    value={config.takeProfit2Pips}
                    onChange={e => setConfig({ ...config, takeProfit2Pips: parseInt(e.target.value) || 130 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white"
                  />
                  <span className="text-[10px] text-slate-500">Full 1:3.8 R:R</span>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Break-Even Trigger (Pips)</label>
                  <input
                    type="number"
                    value={config.breakEvenPips}
                    onChange={e => setConfig({ ...config, breakEvenPips: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white"
                  />
                  <span className="text-[10px] text-slate-500">Locks trade at entry</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Trailing Stop (Pips)</label>
                  <input
                    type="number"
                    value={config.trailingStopPips}
                    onChange={e => setConfig({ ...config, trailingStopPips: parseInt(e.target.value) || 25 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Max Allowed Spread</label>
                  <input
                    type="number"
                    step="0.5"
                    value={config.maxSpreadPips}
                    onChange={e => setConfig({ ...config, maxSpreadPips: parseFloat(e.target.value) || 3.5 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-900/80 rounded-lg border border-slate-800 hover:border-slate-700">
                  <div>
                    <span className="text-slate-300 font-semibold block">London & NY Session Filter</span>
                    <span className="text-[10px] text-slate-500">Only trade during institutional liquidity hours</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.useSessionFilter}
                    onChange={e => setConfig({ ...config, useSessionFilter: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-900/80 rounded-lg border border-slate-800 hover:border-slate-700">
                  <div>
                    <span className="text-slate-300 font-semibold block">Partial Take-Profit (50%)</span>
                    <span className="text-[10px] text-slate-500">Close 50% at TP1 and let runner hit TP2</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.usePartialTakeProfit}
                    onChange={e => setConfig({ ...config, usePartialTakeProfit: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-900/80 rounded-lg border border-slate-800 hover:border-slate-700">
                  <div>
                    <span className="text-slate-300 font-semibold block">MT5 Mobile Push Alerts</span>
                    <span className="text-[10px] text-slate-500">Notify phone on order execution & BE</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enablePushNotifications}
                    onChange={e => setConfig({ ...config, enablePushNotifications: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                </label>
              </div>

              {/* Real-Time Chart Visuals Settings (Live Zones) */}
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Real-Time Chart Zone Drawing</span>
                </div>

                <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-900/80 rounded-lg border border-emerald-950/60 hover:border-emerald-800/80">
                  <div>
                    <span className="text-emerald-300 font-semibold block flex items-center gap-1">
                      <span>Draw S&D Boxes on Chart</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] rounded font-mono font-bold">LIVE</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Paints Emerald Demand & Crimson Supply boxes directly on MT5</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.drawZonesOnChart}
                    onChange={e => setConfig({ ...config, drawZonesOnChart: e.target.checked })}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-900/80 rounded-lg border border-slate-800 hover:border-slate-700">
                  <div>
                    <span className="text-slate-300 font-semibold block">Dynamic Forward Projection</span>
                    <span className="text-[10px] text-slate-500">Extends active boxes rightward as new price ticks arrive</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.extendZonesForward}
                    onChange={e => setConfig({ ...config, extendZonesForward: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-900/80 rounded-lg border border-slate-800 hover:border-slate-700">
                  <div>
                    <span className="text-slate-300 font-semibold block">Semi-Transparent Fill</span>
                    <span className="text-[10px] text-slate-500">Shades zone backgrounds behind candles</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.fillZones}
                    onChange={e => setConfig({ ...config, fillZones: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                </label>

                <div className="flex items-center justify-between p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-300 font-semibold block">Max Active Zones On Chart</span>
                    <span className="text-[10px] text-slate-500">Auto-cleans older zones to keep charts neat</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={config.maxZonesDrawn}
                    onChange={e => setConfig({ ...config, maxZonesDrawn: parseInt(e.target.value) || 6 })}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-center font-mono text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: MQL5 Source Code Box */}
          <div className="lg:col-span-7 flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            {/* Visual Drawing Engine Status Banner */}
            <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    Live MT5 Chart Zone Painter Active
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] rounded font-mono font-bold">4/4 VERIFIED</span>
                  </span>
                  <p className="text-[10px] text-slate-400">
                    The robot auto-draws Demand (Emerald) & Supply (Crimson) boxes and stretches them forward as ticks arrive.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-400 border border-slate-700">
                OnTick() Projected
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                GoldHunter_Pro_XAUUSD.mq5
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(eaCode)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-all border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={handleDownloadEA}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-black transition-all shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .mq5
                </button>
              </div>
            </div>

            <div className="p-4 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[420px] leading-relaxed select-all">
              <pre>{eaCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INDICATOR CODE */}
      {activeTab === 'indicator' && (
        <div className="flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
            <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              GoldHunter_ICT_Levels_MT5.mq5 (Visual Indicator for XAUUSD)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(indicatorCode)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-all border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                onClick={handleDownloadIndicator}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all shadow"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          <div className="p-4 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[400px] leading-relaxed select-all">
            <pre>{indicatorCode}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: STEP-BY-STEP SETUP GUIDE */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Step Selector Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { num: 1, title: "Open MetaEditor", desc: "Press F4 in MetaTrader 5" },
              { num: 2, title: "Create Gold EA", desc: "Paste MQL5 source code" },
              { num: 3, title: "Compile (F7)", desc: "Check 0 errors in Toolbox" },
              { num: 4, title: "Attach to XAUUSD", desc: "Enable Algo Trading (Ctrl+E)" }
            ].map(s => (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeStep === s.num
                    ? 'bg-amber-500/20 border-amber-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep === s.num ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {s.num}
                  </span>
                  <span className="font-bold text-xs text-white">{s.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 ml-7">{s.desc}</p>
              </button>
            ))}
          </div>

          {/* Active Step Detailed Content */}
          <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
            {activeStep === 1 && (
              <div>
                <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-amber-400">Step 1:</span> Launch MetaQuotes Language Editor (MetaEditor)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Open your <strong>MetaTrader 5</strong> desktop terminal (connected to your broker).
                  In MT5, click on <strong>Tools</strong> in the top menu and select <strong>MetaQuotes Language Editor</strong>, or simply press the shortcut key <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-amber-400">F4</kbd>.
                </p>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono">
                  MT5 Menu → Tools → MetaQuotes Language Editor (or press F4)
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-amber-400">Step 2:</span> Create a New Gold Expert Advisor File
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                  <li>In MetaEditor, click <strong>File → New</strong> (or press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">Ctrl+N</kbd>).</li>
                  <li>Select <strong>Expert Advisor (template)</strong> and click <strong>Next</strong>.</li>
                  <li>Name the EA <code className="text-amber-400 font-bold">GoldHunter_Pro_XAUUSD</code> and click <strong>Finish</strong>.</li>
                  <li>Erase all existing template text in the editor, and click the <strong>Copy Code</strong> button from the tab above and paste it.</li>
                </ol>
              </div>
            )}

            {activeStep === 3 && (
              <div>
                <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-amber-400">Step 3:</span> Compile the Source Code (<kbd className="text-emerald-400 font-mono">F7</kbd>)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Click the <strong>Compile</strong> button in the MetaEditor toolbar (or press <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-emerald-400">F7</kbd>).
                </p>
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300">
                  ✓ The Toolbox window at the bottom will display: <strong>0 errors, 0 warnings</strong>. The compiled binary <code className="text-white">GoldHunter_Pro_XAUUSD.ex5</code> is automatically ready in your MT5 Navigator.
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div>
                <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-amber-400">Step 4:</span> Attach to XAU/USD (Gold) M5 or M15 Chart
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                    <span>Switch back to the MT5 terminal window. Open the <strong>XAUUSD</strong> (or <strong>GOLD</strong>) chart and set timeframe to <strong>5 Minutes (M5)</strong> or <strong>15 Minutes (M15)</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                    <span>In the <strong>Navigator</strong> window (Ctrl+N), expand <strong>Expert Advisors</strong> and drag <strong>GoldHunter_Pro_XAUUSD</strong> onto the chart.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                    <span>In the EA popup dialog under the <strong>Common</strong> tab, check <strong className="text-emerald-400">"Allow Algo Trading"</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                    <span>Click the <strong>Algo Trading</strong> button on the MT5 main toolbar. The EA icon in the top right of your chart will show active status!</span>
                  </li>
                  <li className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                    <span><strong>Live Chart Zones Appear Instantly:</strong> The robot automatically scans recent candles and draws green Demand and red Supply boxes directly onto your MT5 chart. As price moves tick-by-tick, the robot extends active boxes forward and turns them dashed when price retests/mitigates them!</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE MONITORING & MOBILE ALERTS */}
      {activeTab === 'bridge' && (
        <div className="space-y-6 bg-slate-950/60 p-6 rounded-xl border border-slate-800">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">How the Robot Tracks Performance</h3>
              <p className="text-xs text-slate-400">Where to view real-time trades, win rate %, drawdowns, equity curves, and phone alerts.</p>
            </div>
          </div>

          {/* Performance Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: MT5 Internal Performance Tracker */}
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>1. MT5 Live & Historical Report (Terminal)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The EA executes trades natively inside MetaTrader 5 on your PC or VPS. MetaTrader 5 automatically logs every tick, trade, and dollar of profit:
              </p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0"></span>
                  <span><strong>Live History:</strong> Press <kbd className="bg-slate-950 px-1 py-0.5 rounded text-slate-300">Ctrl + T</kbd> to open Toolbox → click the <strong>History</strong> tab to inspect closed trades, pips gained, and net balance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0"></span>
                  <span><strong>Export Full Report:</strong> Right-click anywhere in the History tab → choose <strong>Report → HTML / Open XML</strong>. MT5 automatically plots your <strong>Equity Curve, Profit Factor, Win Rate, and Max Drawdown</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0"></span>
                  <span><strong>Strategy Tester:</strong> Press <kbd className="bg-slate-950 px-1 py-0.5 rounded text-slate-300">Ctrl + R</kbd> to backtest the robot across any past months or years of tick data to verify its statistical edge before going live.</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Security & Privacy Guarantee */}
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>2. Broker Account Privacy & Security</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                By default, the EA <strong>does not send your private broker credentials, balance, or live positions over the internet to outside servers</strong>:
              </p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0"></span>
                  <span><strong>Zero Third-Party Latency:</strong> All calculations execute in micro-seconds directly between your VPS and the broker's liquidity provider.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0"></span>
                  <span><strong>Institutional Privacy:</strong> Your account balance and open lots remain strictly confidential on your terminal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0"></span>
                  <span><strong>Web App Statistical Audit:</strong> Switch to the <strong>"Signal Performance Audit"</strong> tab in this dashboard to see real-time algorithmic backtests and verified win-loss audits of the 4 criteria.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Mobile Push Notifications */}
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>3. Live Mobile Trade Alerts (MetaQuotes ID)</span>
            </div>
            <p className="text-xs text-slate-300">
              When the EA opens a trade, secures TP1, or moves to Break-Even on your VPS, it sends an instant notification to your smartphone:
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5">
              <li>Open the <strong>MetaTrader 5</strong> app on your iPhone or Android.</li>
              <li>Go to <strong>Settings → Messages → MetaQuotes ID</strong> (e.g. <code>4E2A190B</code>).</li>
              <li>In your Desktop MT5 on your VPS/PC: Click <strong>Tools → Options → Notifications</strong> tab.</li>
              <li>Check <strong>"Enable Push Notifications"</strong> and enter your MetaQuotes ID.</li>
              <li>Click <strong>Test</strong> — your phone will chime whenever GoldHunter Pro acts!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
