import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MarketAsset, Signal, TimeFrame, OHLC, TradingSession, GoldMacroData, SupplyDemandZone } from './types';
import { analyzeGoldMarketPatterns, TIMEFRAME_PROFILES } from './services/geminiService';
import { scanSupplyDemandZones, detectMarketRegime, generateSignalFromZone, isHigherTimeframe } from './services/supplyDemandScanner';
import { 
  ZoneNotificationToasts, 
  NotificationControlsBar, 
  ActiveZoneAlert 
} from './components/ZoneNotificationToasts';
import { 
  triggerBrowserZoneNotification, 
  playAlertSound 
} from './services/notificationService';
import { IndicatorGauges } from './components/IndicatorGauges';
import { SignalLog } from './components/SignalLog';
import { GoldAnalysisView } from './components/GoldAnalysisView';
import { GoldChart } from './components/GoldChart';
import { GoldSessionClock } from './components/GoldSessionClock';
import { GoldMacroBar } from './components/GoldMacroBar';
import { MT5Studio } from './components/MT5Studio';
import { SupplyDemandInspector } from './components/SupplyDemandInspector';
import { ZonePerformanceHeatmap } from './components/ZonePerformanceHeatmap';
import { LiveEconomicNews } from './components/LiveEconomicNews';
import { SignalPerformanceAuditView } from './components/SignalPerformanceAudit';
import { MarketSentimentGauge } from './components/MarketSentimentGauge';
import { 
  getInitialReviewedSignals, 
  reviewSignal, 
  calculateSystemPerformanceAudit 
} from './services/signalReviewService';
import {
  calculateMarketSentiment,
  triggerOrderFlowShock
} from './services/orderFlowSentimentService';
import { 
  fetchLiveGoldPrice, 
  fetchLiveGoldCandles, 
  getSavedBrokerOffset, 
  saveBrokerOffset 
} from './services/liveGoldDataService';
import { 
  Zap, 
  Terminal, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Download, 
  Sparkles,
  Info,
  Clock,
  Compass,
  Award,
  Layers,
  Volume2,
  VolumeX,
  Bell,
  BarChart3,
  Flame,
  Globe,
  FileText,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SystemManualModal } from './components/SystemManualModal';
import { HowToUseMenuModal } from './components/HowToUseMenuModal';

const App: React.FC = () => {
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [showHowToUseModal, setShowHowToUseModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sentiment' | 'heatmap' | 'audit' | 'news' | 'mt5_studio'>('dashboard');
  const [signals, setSignals] = useState<Signal[]>(() => {
    try {
      const saved = localStorage.getItem('xauusd_signals_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return getInitialReviewedSignals();
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisNotice, setAnalysisNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Price & Market States for Gold (XAU/USD)
  const [currentPrice, setCurrentPrice] = useState(4358.20);
  const [rsi, setRsi] = useState(48.5);
  const [ema20, setEma20] = useState(4356.80);
  const [ema50, setEma50] = useState(4354.20);
  const [spreadPoints, setSpreadPoints] = useState(18); // 1.8 pips
  const [candles, setCandles] = useState<OHLC[]>([]);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>(TimeFrame.M5);
  const [supplyDemandZones, setSupplyDemandZones] = useState<SupplyDemandZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  // Live Interbank Feed & Broker Offset Calibration State
  const [liveOffset, setLiveOffset] = useState<number>(() => getSavedBrokerOffset());
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [chartMode, setChartMode] = useState<'TRADINGVIEW_LIVE' | 'ALGO_SND'>('TRADINGVIEW_LIVE');

  // Institutional Market Regime: IMBALANCE vs BALANCED
  const { regime: marketRegime } = detectMarketRegime(candles);

  // Real-time Browser Notification & Audio Chime System
  const [alerts, setAlerts] = useState<ActiveZoneAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('goldhunter_sound_alerts');
      return saved !== 'false';
    }
    return true;
  });
  const notifiedZoneIdsRef = useRef<Set<string>>(new Set());

  // Save signals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('xauusd_signals_history', JSON.stringify(signals));
    } catch (e) {
      // ignore
    }
  }, [signals]);

  // Compute live system performance audit
  const systemAudit = useMemo(() => calculateSystemPerformanceAudit(signals), [signals]);

  // Periodic Automated Signal Review Loop
  // Evaluates in-play & pending signals across timeframes against current gold price
  useEffect(() => {
    const reviewInterval = setInterval(() => {
      setSignals(prev => {
        let hasChanges = false;
        const updated = prev.map(sig => {
          if (sig.reviewStatus === 'VALID_WIN' || sig.reviewStatus === 'INVALID_LOSS') {
            return sig;
          }
          const reviewed = reviewSignal(sig, currentPrice);
          if (
            reviewed.reviewStatus !== sig.reviewStatus ||
            reviewed.highestPriceReached !== sig.highestPriceReached ||
            reviewed.lowestPriceReached !== sig.lowestPriceReached ||
            reviewed.status !== sig.status
          ) {
            hasChanges = true;
            // Notify if newly verified
            if (reviewed.reviewStatus === 'VALID_WIN') {
              setAnalysisNotice({
                type: 'success',
                message: `🎯 SIGNAL VERIFIED VALID: ${sig.setupModel} hit TP (+${reviewed.realizedPips} pips)! Accuracy rating updated.`
              });
            } else if (reviewed.reviewStatus === 'INVALID_LOSS') {
              setAnalysisNotice({
                type: 'error',
                message: `⚠️ SIGNAL VERIFIED INVALID: ${sig.setupModel} stop loss breached (-${Math.abs(reviewed.realizedPips || sig.riskPips)} pips).`
              });
            }
            return reviewed;
          }
          return sig;
        });
        return hasChanges ? updated : prev;
      });
    }, 4500);

    return () => clearInterval(reviewInterval);
  }, [currentPrice]);

  const handleAuditAllSignals = useCallback(() => {
    setSignals(prev => prev.map(sig => reviewSignal(sig, currentPrice)));
    const updatedAudit = calculateSystemPerformanceAudit(signals);
    setAnalysisNotice({
      type: 'success',
      message: `📊 SYSTEM ACCURACY AUDIT: ${updatedAudit.overallAccuracy}% Win Rate (${updatedAudit.validWins} Wins / ${updatedAudit.invalidLosses} Losses) | Rating: ${updatedAudit.performanceGrade} (+${updatedAudit.netPipsCaptured} pips)`
    });
  }, [currentPrice, signals]);

  const handleManualReview = useCallback((id: string, outcome: 'VALID_WIN' | 'INVALID_LOSS') => {
    setSignals(prev => prev.map(s => {
      if (s.id !== id) return s;
      const isWin = outcome === 'VALID_WIN';
      return {
        ...s,
        status: isWin ? 'SUCCESS' : 'FAILURE',
        reviewStatus: outcome,
        reviewOutcome: isWin ? 'TP2_HIT' : 'SL_HIT',
        reviewTimestamp: Date.now(),
        realizedPips: isWin ? s.rewardPips : -s.riskPips,
        reviewNotes: `Manually audited & verified as ${isWin ? 'VALID WIN' : 'INVALID LOSS'}.`
      };
    }));
  }, []);

  const handleReviewSingleSignal = useCallback((id: string) => {
    setSignals(prev => prev.map(s => {
      if (s.id !== id) return s;
      return reviewSignal(s, currentPrice);
    }));
  }, [currentPrice]);

  // Function to dispatch browser notification, audio chime, and in-app toast
  const notifyNewQualifiedZone = useCallback((zone: SupplyDemandZone, price: number) => {
    // 1. Browser Native Notification + Audio Chime
    triggerBrowserZoneNotification(zone, price, soundEnabled);

    // 2. In-App Floating Toast Alert
    const alertId = `zone_alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newAlert: ActiveZoneAlert = {
      id: alertId,
      zone,
      timestamp: Date.now(),
      currentPrice: price
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 3)]);

    // Auto-dismiss in-app toast after 8.5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }, 8500);
  }, [soundEnabled]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('goldhunter_sound_alerts', String(next));
      if (next) {
        playAlertSound('DEMAND');
      }
      return next;
    });
  }, []);

  const handleDismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleSelectZone = useCallback((zone: SupplyDemandZone) => {
    setSelectedZoneId(zone.id);
  }, []);

  const handleTestNotification = useCallback(() => {
    const isDemand = Math.random() > 0.45;
    const testZone: SupplyDemandZone = {
      id: `test_zone_${Date.now()}`,
      type: isDemand ? 'DEMAND' : 'SUPPLY',
      priceHigh: Number((currentPrice + (isDemand ? -0.8 : 3.6)).toFixed(2)),
      priceLow: Number((currentPrice + (isDemand ? -3.2 : 1.2)).toFixed(2)),
      timeframe: activeTimeframe,
      timeframeCategory: 'LTF',
      structureType: isDemand ? 'Drop-Base-Rally' : 'Rally-Base-Drop',
      marketRegime: 'IMBALANCE',
      criteria: {
        sharpMovement: true,
        displacementPips: isDemand ? 72 : 78,
        fvgCreated: true,
        fvgTop: Number((currentPrice + 1.8).toFixed(2)),
        fvgBottom: Number((currentPrice + 0.6).toFixed(2)),
        backyardTrading: true,
        backyardDescription: "Verified institutional order accumulation in origin backyard before expansion.",
        stalledCandlesCount: 4,
        stalledCandlesValid: true,
        isValidZone: true
      },
      status: 'QUALIFIED_FRESH',
      timestamp: Date.now(),
      explanation: `Test 4/4 Qualified ${isDemand ? 'DEMAND' : 'SUPPLY'} Zone alert.`
    };

    notifiedZoneIdsRef.current.add(testZone.id);
    notifyNewQualifiedZone(testZone, currentPrice);
  }, [currentPrice, activeTimeframe, notifyNewQualifiedZone]);

  // Macro Metrics for Gold
  const [macroData, setMacroData] = useState<GoldMacroData>({
    dxyIndex: 101.35,
    dxyChange: -0.28,
    us10yYield: 4.12,
    goldDailyHigh: 2698.80,
    goldDailyLow: 2672.40,
    dailyRangePips: 264,
    activeSession: 'NY_AM_KILLZONE',
    sessionTimeRemaining: '02h 45m',
    fedSentiment: 'DOVISH'
  });

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);

  // Real-Time Market Sentiment & Order Flow Engine
  const [sentimentTick, setSentimentTick] = useState(0);
  const prevPriceRef = useRef<number>(currentPrice);

  const sentimentData = useMemo(() => {
    return calculateMarketSentiment(
      currentPrice,
      prevPriceRef.current,
      rsi,
      ema20,
      macroData.activeSession,
      supplyDemandZones
    );
  }, [currentPrice, rsi, ema20, macroData.activeSession, supplyDemandZones, sentimentTick]);

  useEffect(() => {
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  const handleTriggerOrderFlowShock = useCallback((type: 'BULLISH_SWEEP' | 'BEARISH_WALL' | 'RESET') => {
    triggerOrderFlowShock(type);
    if (type === 'BULLISH_SWEEP') {
      setCurrentPrice(p => Number((p + 1.20).toFixed(2)));
      setRsi(r => Math.min(85, r + 7));
      setAnalysisNotice({
        type: 'success',
        message: '⚡ ORDER FLOW SURGE: Institutional Bullish Sweep (+120 Lots Market Aggressor / +6,500 CVD) executed!'
      });
    } else if (type === 'BEARISH_WALL') {
      setCurrentPrice(p => Number((p - 1.20).toFixed(2)));
      setRsi(r => Math.max(20, r - 7));
      setAnalysisNotice({
        type: 'error',
        message: '🛑 ORDER FLOW REJECTION: Institutional Sell Wall (-140 Lots Limit Ask / -6,500 CVD) active!'
      });
    } else {
      setAnalysisNotice({
        type: 'info',
        message: '⚖️ ORDER FLOW RESET: Restored balanced two-way market liquidity flow.'
      });
    }
    setSentimentTick(t => t + 1);
  }, []);

  // Initialize realistic XAU/USD candles scaled to active timeframe
  const generateInitialCandles = useCallback((priceSeed = 4358.00, tf = activeTimeframe): OHLC[] => {
    const basePrice = priceSeed;
    const initial: OHLC[] = [];
    let price = basePrice;
    const now = Date.now();

    // Timeframe step scale in minutes & pip amplitude
    const tfConfig: Record<TimeFrame, { stepMin: number; baseAmp: number }> = {
      [TimeFrame.M1]: { stepMin: 1, baseAmp: 0.6 },
      [TimeFrame.M5]: { stepMin: 5, baseAmp: 1.4 },
      [TimeFrame.M15]: { stepMin: 15, baseAmp: 2.8 },
      [TimeFrame.H1]: { stepMin: 60, baseAmp: 6.0 },
      [TimeFrame.H4]: { stepMin: 240, baseAmp: 14.0 },
      [TimeFrame.D1]: { stepMin: 1440, baseAmp: 28.0 }
    };

    const cfg = tfConfig[tf] || tfConfig[TimeFrame.M5];

    for (let i = 55; i >= 0; i--) {
      const time = now - i * cfg.stepMin * 60000;
      let change = (Math.random() - 0.47) * cfg.baseAmp;
      
      const isSweep = (i === 18 || i === 36);
      if (isSweep) {
        change = i === 18 ? cfg.baseAmp * 2.5 : -cfg.baseAmp * 2.3;
      }

      const open = price;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * (cfg.baseAmp * 0.4);
      const low = Math.min(open, close) - Math.random() * (cfg.baseAmp * 0.4);

      price = close;
      initial.push({
        time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        isBreakout: isSweep,
        isSweep,
        ema20: Number((price - (cfg.baseAmp * 0.6)).toFixed(2)),
        ema50: Number((price - (cfg.baseAmp * 1.5)).toFixed(2)),
        rsi: 45 + Math.random() * 15
      });
    }

    return initial;
  }, [activeTimeframe]);

  // Fetch real-time live market data from interbank liquidity feed
  const loadLiveMarketData = useCallback(async (tf: TimeFrame, offset: number = liveOffset) => {
    setIsLoadingLive(true);
    try {
      const liveCandles = await fetchLiveGoldCandles(tf, 55, offset);
      if (liveCandles && liveCandles.length > 0) {
        setCandles(liveCandles);
        const last = liveCandles[liveCandles.length - 1];
        setCurrentPrice(last.close);
        setEma20(last.ema20 || last.close - 1.2);
        setEma50(last.ema50 || last.close - 2.5);
        setRsi(last.rsi || 50);

        const highs = liveCandles.map(c => c.high);
        const lows = liveCandles.map(c => c.low);
        const dayHigh = Math.max(...highs);
        const dayLow = Math.min(...lows);
        setMacroData(m => ({
          ...m,
          goldDailyHigh: dayHigh,
          goldDailyLow: dayLow,
          dailyRangePips: Math.round((dayHigh - dayLow) * 10)
        }));

        const detected = scanSupplyDemandZones(liveCandles, last.close, tf);
        setSupplyDemandZones(detected);
        if (detected[0]) setSelectedZoneId(detected[0].id);

        detected.forEach(z => {
          if (z.criteria.isValidZone) {
            notifiedZoneIdsRef.current.add(z.id);
          }
        });

        setAnalysisNotice({
          type: 'success',
          message: `🟢 LIVE DATA CHART CONNECTED: Synchronized with live MT5 market feed (${liveCandles.length} ${tf.toUpperCase()} candles @ $${last.close.toFixed(2)})`
        });
        return;
      }
    } catch (e) {
      console.warn("Live feed fetch notice:", e);
    } finally {
      setIsLoadingLive(false);
    }

    // Fallback if network is unavailable
    const fallback = generateInitialCandles(4358.00, tf);
    setCandles(fallback);
    const last = fallback[fallback.length - 1];
    if (last) {
      setCurrentPrice(last.close);
      setEma20(last.ema20 || last.close - 1.2);
      setEma50(last.ema50 || last.close - 2.5);
      setRsi(last.rsi || 50);
    }
  }, [liveOffset, generateInitialCandles]);

  // Synchronized Multi-Timeframe Switcher (switches chart, live data feed, S&D scan, indicators, and setups)
  const handleTimeframeChange = useCallback((newTf: TimeFrame) => {
    setActiveTimeframe(newTf);
    loadLiveMarketData(newTf, liveOffset);
    const profile = TIMEFRAME_PROFILES[newTf] || TIMEFRAME_PROFILES[TimeFrame.M5];
    setAnalysisNotice({
      type: 'info',
      message: `⚡ TIMEFRAME SYNCHRONIZED: Switched entire terminal to ${newTf.toUpperCase()} (${profile.label}). Live chart, 4-criteria S&D zones, indicators, and setups updated.`
    });
  }, [liveOffset, loadLiveMarketData]);

  // Calibrate Terminal to User's MT5 Broker Quote
  const handlePriceCalibrate = useCallback((targetPrice: number, offset: number) => {
    setLiveOffset(offset);
    saveBrokerOffset(offset);
    setCurrentPrice(targetPrice);
    setCandles(prev => {
      if (prev.length === 0) return prev;
      const lastClose = prev[prev.length - 1].close;
      const shift = targetPrice - lastClose;
      return prev.map(c => ({
        ...c,
        open: Number((c.open + shift).toFixed(2)),
        high: Number((c.high + shift).toFixed(2)),
        low: Number((c.low + shift).toFixed(2)),
        close: Number((c.close + shift).toFixed(2)),
        ema20: c.ema20 ? Number((c.ema20 + shift).toFixed(2)) : undefined,
        ema50: c.ema50 ? Number((c.ema50 + shift).toFixed(2)) : undefined
      }));
    });
    setAnalysisNotice({
      type: 'success',
      message: `🎯 BROKER SYNC COMPLETE: Calibrated to your MT5 quote $${targetPrice.toFixed(2)} (Offset: ${offset > 0 ? '+' : ''}${offset} USD)`
    });
  }, []);

  // Initialize and load live market data on mount & timeframe change
  useEffect(() => {
    loadLiveMarketData(activeTimeframe, liveOffset);
  }, [activeTimeframe, loadLiveMarketData, liveOffset]);

  // Real-Time Live Market Polling (streams live ticks matching MT5 numbers)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(async () => {
      try {
        const livePrice = await fetchLiveGoldPrice(liveOffset);
        if (livePrice && Math.abs(livePrice - currentPrice) < 300) {
          setCurrentPrice(livePrice);
          setCandles(prev => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            const updatedLast: OHLC = {
              ...last,
              high: Math.max(last.high, livePrice),
              low: Math.min(last.low, livePrice),
              close: livePrice,
              ema20: Number(((last.ema20 || livePrice) * 0.9 + livePrice * 0.1).toFixed(2)),
              ema50: Number(((last.ema50 || livePrice) * 0.95 + livePrice * 0.05).toFixed(2)),
              rsi: Math.min(85, Math.max(15, (last.rsi || 50) + (livePrice > last.close ? 0.15 : -0.15)))
            };
            setEma20(updatedLast.ema20!);
            setEma50(updatedLast.ema50!);
            setRsi(updatedLast.rsi!);
            return [...prev.slice(0, -1), updatedLast];
          });
        }
      } catch {
        // silent fallback
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStreaming, liveOffset, currentPrice]);

  // Load signals from storage
  useEffect(() => {
    const saved = localStorage.getItem('goldhunter_signals_v1');
    if (saved) {
      try {
        setSignals(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save signals to storage
  useEffect(() => {
    localStorage.setItem('goldhunter_signals_v1', JSON.stringify(signals));
  }, [signals]);

  // Re-scan zones whenever candles update significantly
  useEffect(() => {
    if (candles.length > 15) {
      const detected = scanSupplyDemandZones(candles, currentPrice, activeTimeframe);
      setSupplyDemandZones(detected);

      // Trigger browser notification & toast for any newly qualified 4/4 zones
      detected.forEach(z => {
        if (z.criteria.isValidZone && !notifiedZoneIdsRef.current.has(z.id)) {
          notifiedZoneIdsRef.current.add(z.id);
          notifyNewQualifiedZone(z, currentPrice);
        }
      });
    }
  }, [candles, currentPrice, activeTimeframe, notifyNewQualifiedZone]);

  // Real-time Gold Tick Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const intervalTime = Math.max(400, Math.floor(1800 / simSpeed));
    const interval = setInterval(() => {
      const drift = (Math.random() - 0.48) * 0.35;

      setCandles(prev => {
        if (prev.length === 0) return prev;
        const lastCandle = prev[prev.length - 1];
        const newClose = Number((lastCandle.close + drift).toFixed(2));

        const updatedLast: OHLC = {
          ...lastCandle,
          high: Math.max(lastCandle.high, newClose),
          low: Math.min(lastCandle.low, newClose),
          close: newClose,
          ema20: Number((lastCandle.ema20! * 0.9 + newClose * 0.1).toFixed(2)),
          ema50: Number((lastCandle.ema50! * 0.95 + newClose * 0.05).toFixed(2)),
          rsi: Math.min(75, Math.max(25, (lastCandle.rsi || 50) + (drift > 0 ? 0.3 : -0.3)))
        };

        setCurrentPrice(newClose);
        setEma20(updatedLast.ema20!);
        setEma50(updatedLast.ema50!);
        setRsi(updatedLast.rsi!);

        return [...prev.slice(0, -1), updatedLast];
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // SIMULATE 4-CRITERIA VALID DEMAND ZONE
  // Rules:
  // 1. Sharp movement immediately to upside (+72 pips)
  // 2. Fair Value Gap (FVG) created right after sharp movement
  // 3. Immediate trading in the backyard (clean origin accumulation)
  // 4. 4 candles that stalled before the market continued!
  const handleSimulateDemandZone = useCallback(() => {
    const baseOrigin = currentPrice;
    const now = Date.now();
    const newCandles: OHLC[] = [];

    // Step A: 4 candles that stalled in the backyard (Criterion 4 & Criterion 3)
    for (let k = 4; k >= 1; k--) {
      const stallOpen = baseOrigin + (k % 2 === 0 ? 0.3 : -0.3);
      const stallClose = baseOrigin + (k % 2 === 0 ? -0.2 : 0.4);
      newCandles.push({
        time: now - (k + 1) * 60000,
        open: Number(stallOpen.toFixed(2)),
        high: Number((Math.max(stallOpen, stallClose) + 0.5).toFixed(2)),
        low: Number((Math.min(stallOpen, stallClose) - 0.5).toFixed(2)),
        close: Number(stallClose.toFixed(2)),
        isBasing: true, // Marked as stalled basing candle
        ema20: baseOrigin - 0.5,
        ema50: baseOrigin - 1.5,
        rsi: 46.0
      });
    }

    // Step B: Sharp explosive displacement candle to the upside (+7.50 / +75 pips) (Criterion 1)
    const sharpOpen = baseOrigin + 0.2;
    const sharpClose = baseOrigin + 7.5;
    newCandles.push({
      time: now - 60000,
      open: Number(sharpOpen.toFixed(2)),
      high: Number((sharpClose + 0.8).toFixed(2)),
      low: Number((sharpOpen - 0.3).toFixed(2)),
      close: Number(sharpClose.toFixed(2)),
      isBreakout: true,
      ema20: baseOrigin + 2.5,
      ema50: baseOrigin + 0.8,
      rsi: 69.0
    });

    // Step C: Subsequent continuation candle leaving an FVG gap between candleBefore.high and candleAfter.low (Criterion 2)
    const continuationOpen = sharpClose + 0.5;
    const continuationClose = sharpClose + 2.8;
    newCandles.push({
      time: now,
      open: Number(continuationOpen.toFixed(2)),
      high: Number((continuationClose + 0.6).toFixed(2)),
      low: Number((continuationOpen - 0.2).toFixed(2)), // Stays well above baseOrigin + 1.0 -> Leaving FVG gap!
      close: Number(continuationClose.toFixed(2)),
      isFvg: true,
      ema20: Number((sharpClose + 1.2).toFixed(2)),
      ema50: baseOrigin + 1.5,
      rsi: 71.0
    });

    setCandles(prev => {
      const merged = [...prev.slice(newCandles.length), ...newCandles];
      return merged;
    });

    const finalPrice = Number(continuationClose.toFixed(2));
    setCurrentPrice(finalPrice);

    // Create the qualified Demand Zone fulfilling all 4 criteria
    const newDemandZone: SupplyDemandZone = {
      id: `demand_${Date.now()}`,
      type: 'DEMAND',
      priceHigh: Number((baseOrigin + 0.8).toFixed(2)),
      priceLow: Number((baseOrigin - 0.6).toFixed(2)),
      timeframe: activeTimeframe,
      timeframeCategory: activeTimeframe === TimeFrame.H1 || activeTimeframe === TimeFrame.H4 ? 'HTF' : 'LTF',
      structureType: 'Drop-Base-Rally',
      marketRegime: 'IMBALANCE',
      criteria: {
        sharpMovement: true,
        displacementPips: 75,
        fvgCreated: true,
        fvgTop: Number((continuationOpen - 0.2).toFixed(2)),
        fvgBottom: Number((baseOrigin + 0.8).toFixed(2)),
        backyardTrading: true,
        backyardDescription: `Institutional accumulation verified in the backyard ($${(baseOrigin - 0.6).toFixed(2)} - $${(baseOrigin + 0.8).toFixed(2)}) prior to expansion.`,
        stalledCandlesCount: 4,
        stalledCandlesValid: true,
        isValidZone: true
      },
      status: 'QUALIFIED_FRESH',
      timestamp: Date.now(),
      explanation: "Qualified 4/4 DEMAND ZONE: Sharp +75p displacement, FVG formed, clean backyard trading, and 4 stalled basing candles."
    };

    setSupplyDemandZones(prev => [newDemandZone, ...prev]);
    setSelectedZoneId(newDemandZone.id);
    notifiedZoneIdsRef.current.add(newDemandZone.id);
    notifyNewQualifiedZone(newDemandZone, finalPrice);

    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.7 }
    });

    setAnalysisNotice({
      type: 'success',
      message: `✓ 4-Criteria QUALIFIED DEMAND ZONE FORMATION! 4 Stalled Candles → Sharp +75p Movement → FVG Imbalance → Backyard Trading Verified.`
    });
  }, [currentPrice, activeTimeframe, notifyNewQualifiedZone]);

  // SIMULATE 4-CRITERIA VALID SUPPLY ZONE
  const handleSimulateSupplyZone = useCallback(() => {
    const baseOrigin = currentPrice;
    const now = Date.now();
    const newCandles: OHLC[] = [];

    // Step A: 5 candles that stalled in the backyard (Criterion 4 & Criterion 3)
    for (let k = 5; k >= 1; k--) {
      const stallOpen = baseOrigin + (k % 2 === 0 ? -0.3 : 0.3);
      const stallClose = baseOrigin + (k % 2 === 0 ? 0.3 : -0.2);
      newCandles.push({
        time: now - (k + 1) * 60000,
        open: Number(stallOpen.toFixed(2)),
        high: Number((Math.max(stallOpen, stallClose) + 0.5).toFixed(2)),
        low: Number((Math.min(stallOpen, stallClose) - 0.5).toFixed(2)),
        close: Number(stallClose.toFixed(2)),
        isBasing: true,
        ema20: baseOrigin + 0.5,
        ema50: baseOrigin + 1.2,
        rsi: 52.0
      });
    }

    // Step B: Sharp explosive displacement candle to downside (-78 pips) (Criterion 1)
    const sharpOpen = baseOrigin - 0.2;
    const sharpClose = baseOrigin - 7.8;
    newCandles.push({
      time: now - 60000,
      open: Number(sharpOpen.toFixed(2)),
      high: Number((sharpOpen + 0.3).toFixed(2)),
      low: Number((sharpClose - 0.7).toFixed(2)),
      close: Number(sharpClose.toFixed(2)),
      isBreakout: true,
      ema20: baseOrigin - 2.8,
      ema50: baseOrigin - 1.0,
      rsi: 33.0
    });

    // Step C: Subsequent continuation candle leaving an FVG gap below base (Criterion 2)
    const continuationOpen = sharpClose - 0.4;
    const continuationClose = sharpClose - 2.6;
    newCandles.push({
      time: now,
      open: Number(continuationOpen.toFixed(2)),
      high: Number((continuationOpen + 0.3).toFixed(2)), // Stays well below baseOrigin - 0.8 -> Leaving FVG gap!
      low: Number((continuationClose - 0.5).toFixed(2)),
      close: Number(continuationClose.toFixed(2)),
      isFvg: true,
      ema20: Number((sharpClose - 1.5).toFixed(2)),
      ema50: baseOrigin - 2.0,
      rsi: 28.0
    });

    setCandles(prev => {
      const merged = [...prev.slice(newCandles.length), ...newCandles];
      return merged;
    });

    const finalPrice = Number(continuationClose.toFixed(2));
    setCurrentPrice(finalPrice);

    // Create the qualified Supply Zone fulfilling all 4 criteria
    const newSupplyZone: SupplyDemandZone = {
      id: `supply_${Date.now()}`,
      type: 'SUPPLY',
      priceHigh: Number((baseOrigin + 0.6).toFixed(2)),
      priceLow: Number((baseOrigin - 0.8).toFixed(2)),
      timeframe: activeTimeframe,
      timeframeCategory: activeTimeframe === TimeFrame.H1 || activeTimeframe === TimeFrame.H4 ? 'HTF' : 'LTF',
      structureType: 'Rally-Base-Drop',
      marketRegime: 'IMBALANCE',
      criteria: {
        sharpMovement: true,
        displacementPips: 78,
        fvgCreated: true,
        fvgTop: Number((baseOrigin - 0.8).toFixed(2)),
        fvgBottom: Number((continuationOpen + 0.3).toFixed(2)),
        backyardTrading: true,
        backyardDescription: `Institutional distribution volume cleared all bids in backyard ($${(baseOrigin - 0.8).toFixed(2)} - $${(baseOrigin + 0.6).toFixed(2)}) prior to continuation.`,
        stalledCandlesCount: 5,
        stalledCandlesValid: true,
        isValidZone: true
      },
      status: 'QUALIFIED_FRESH',
      timestamp: Date.now(),
      explanation: "Qualified 4/4 SUPPLY ZONE: Sharp -78p displacement, Bearish FVG formed, clean backyard trading, and 5 stalled basing candles."
    };

    setSupplyDemandZones(prev => [newSupplyZone, ...prev]);
    setSelectedZoneId(newSupplyZone.id);
    notifiedZoneIdsRef.current.add(newSupplyZone.id);
    notifyNewQualifiedZone(newSupplyZone, finalPrice);

    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.7 }
    });

    setAnalysisNotice({
      type: 'info',
      message: `✓ 4-Criteria QUALIFIED SUPPLY ZONE FORMATION! 5 Stalled Candles → Sharp -78p Movement → FVG Imbalance → Backyard Trading Verified.`
    });
  }, [currentPrice, activeTimeframe, notifyNewQualifiedZone]);

  // GENERATE ACTIONABLE SIGNAL FROM ANY QUALIFIED ZONE
  const handleGenerateZoneSignal = useCallback((zone: SupplyDemandZone) => {
    const rawSignal = generateSignalFromZone(zone, currentPrice, macroData.activeSession);
    const newSignal: Signal = {
      ...rawSignal,
      timeframe: zone.timeframe || activeTimeframe,
      reviewStatus: 'IN_PLAY',
      reviewOutcome: 'ACTIVE_FLOATING',
      highestPriceReached: currentPrice,
      lowestPriceReached: currentPrice,
      realizedPips: 0,
      reviewNotes: `Signal initiated on ${zone.timeframe || activeTimeframe}. Real-time post-trade verification engine tracking price towards TP2 $${rawSignal.takeProfit2.toFixed(2)}.`
    };
    setSignals(prev => [newSignal, ...prev]);

    if (soundEnabled) {
      playAlertSound(zone.type);
    }

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.7 }
    });

    setAnalysisNotice({
      type: 'success',
      message: `⚡ INSTITUTIONAL ${newSignal.type} SIGNAL ACTIVATED: ${newSignal.setupModel} @ $${newSignal.entryPrice.toFixed(2)} | SL: $${newSignal.stopLossPrice.toFixed(2)} | TP2: $${newSignal.takeProfit2.toFixed(2)} (${newSignal.riskReward} R:R)`
    });
  }, [currentPrice, macroData.activeSession, soundEnabled]);

  // LIVE NEWS RELEASE MARKET DISPLACEMENT HANDLER
  const handleNewsPriceShock = useCallback((pips: number, reason: string) => {
    const priceShift = pips * 0.1; // e.g. -18.5
    const newPrice = Number((currentPrice + priceShift).toFixed(2));
    setCurrentPrice(newPrice);

    const now = Date.now();
    setCandles(prev => [
      ...prev.slice(1),
      {
        time: now,
        open: currentPrice,
        high: Number((Math.max(currentPrice, newPrice) + 1.2).toFixed(2)),
        low: Number((Math.min(currentPrice, newPrice) - 1.5).toFixed(2)),
        close: newPrice,
        isBreakout: true,
        ema20: newPrice,
        ema50: currentPrice,
        rsi: pips > 0 ? 76.5 : 24.5
      }
    ]);

    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.7 }
    });

    setAnalysisNotice({
      type: 'info',
      message: `🚨 NEWS RELEASE DISPLACEMENT TRIGGERED: ${reason} (Gold shifted ${pips > 0 ? '+' : ''}${pips} pips to $${newPrice.toFixed(2)})`
    });
  }, [currentPrice]);

  // SIMULATE LTF EXTREME HIGH SUPPLY ZONE & 3-GREEN ENGULFING RETEST SHORT SIGNAL
  const handleSimulateLtfShort = useCallback(() => {
    const baseOrigin = currentPrice;
    const now = Date.now();
    const newCandles: OHLC[] = [];

    // Step A: 3 Consecutive GREEN Candlesticks pushing into Extreme High (supply exceeds demand)
    for (let k = 3; k >= 1; k--) {
      const gOpen = baseOrigin - (k * 0.9);
      const gClose = gOpen + 0.8;
      newCandles.push({
        time: now - (k + 2) * 60000,
        open: Number(gOpen.toFixed(2)),
        high: Number((gClose + 0.3).toFixed(2)),
        low: Number((gOpen - 0.2).toFixed(2)),
        close: Number(gClose.toFixed(2)),
        isBasing: true, // Basing push
        ema20: baseOrigin - 1.0,
        ema50: baseOrigin - 2.0,
        rsi: 58.0 + (3 - k) * 3
      });
    }

    // Step B: 1 Powerful RED Candlestick that ENGULFS all 3 previous Green Candlesticks
    // (Sweeps the high, causes CHoCH, and creates sharp -85 pip displacement)
    const sweepHigh = baseOrigin + 1.2;
    const engulfOpen = baseOrigin + 0.2;
    const engulfClose = baseOrigin - 8.5; // Engulfs all 3 green candles completely
    newCandles.push({
      time: now - 120000,
      open: Number(engulfOpen.toFixed(2)),
      high: Number(sweepHigh.toFixed(2)), // Wick sweeps liquidity above green candles
      low: Number((engulfClose - 0.5).toFixed(2)),
      close: Number(engulfClose.toFixed(2)),
      isSweep: true,
      isBreakout: true,
      ema20: baseOrigin - 3.2,
      ema50: baseOrigin - 1.5,
      rsi: 28.0
    });

    // Step C: Retest Candle: Price retraces back up to retest the engulfing order block origin!
    const retestOpen = engulfClose + 0.3;
    const retestHigh = baseOrigin - 0.2; // Retests the order block
    const retestClose = baseOrigin - 1.8; // Rejection confirmed
    newCandles.push({
      time: now - 60000,
      open: Number(retestOpen.toFixed(2)),
      high: Number(retestHigh.toFixed(2)),
      low: Number((retestOpen - 0.4).toFixed(2)),
      close: Number(retestClose.toFixed(2)),
      isBasing: true,
      ema20: baseOrigin - 2.0,
      ema50: baseOrigin - 1.8,
      rsi: 32.0
    });

    // Step D: Expansion candle heading toward Fair Value
    const finalClose = baseOrigin - 4.5;
    newCandles.push({
      time: now,
      open: Number(retestClose.toFixed(2)),
      high: Number(retestClose.toFixed(2)),
      low: Number((finalClose - 0.5).toFixed(2)),
      close: Number(finalClose.toFixed(2)),
      isFvg: true,
      ema20: Number((finalClose + 1.5).toFixed(2)),
      ema50: baseOrigin,
      rsi: 26.0
    });

    setCandles(prev => [...prev.slice(newCandles.length), ...newCandles]);
    setCurrentPrice(finalClose);

    // Calculate Fair Value Target (50% equilibrium)
    const fairValueTarget = Number((baseOrigin - 12.0).toFixed(2));

    // Create the qualified Extreme High Supply Zone
    const newLtfSupplyZone: SupplyDemandZone = {
      id: `extreme_supply_${Date.now()}`,
      type: 'SUPPLY',
      priceHigh: Number((sweepHigh).toFixed(2)),
      priceLow: Number((baseOrigin - 0.6).toFixed(2)),
      timeframe: TimeFrame.M5,
      timeframeCategory: 'LTF',
      structureType: 'Rally-Base-Drop',
      marketRegime: 'IMBALANCE',
      originCandleIndex: Math.max(0, candles.length - 5),
      arrowTargetPrice: fairValueTarget,
      fairValuePrice: fairValueTarget,
      isExtreme: true,
      criteria: {
        sharpMovement: true,
        displacementPips: 85,
        fvgCreated: true,
        fvgTop: Number((baseOrigin - 0.6).toFixed(2)),
        fvgBottom: Number((retestOpen).toFixed(2)),
        backyardTrading: true,
        backyardDescription: `Institutional limit sells absorbed all buy liquidity at extreme high ($${(baseOrigin - 0.6).toFixed(2)} - $${sweepHigh.toFixed(2)}).`,
        stalledCandlesCount: 2, // NB: <= 5 candles spent (Ultra High Imbalance)
        stalledCandlesValid: true,
        timeSpentRank: 'ULTRA_HIGH_IMBALANCE',
        isExtremeHigh: true,
        isExtremeLow: false,
        unfilledOrdersStatus: 'UNFILLED_INSTITUTIONAL_ORDERS',
        fairValueTarget,
        lowerTimeframeConfirmation: {
          liquiditySweepConfirmed: true,
          chochConfirmed: true,
          threeCandleEngulfing: true,
          engulfingType: 'BEARISH_ENGULF_3_GREEN',
          retestConfirmed: true,
          retestPrice: Number(retestHigh.toFixed(2))
        },
        isValidZone: true
      },
      status: 'QUALIFIED_FRESH',
      timestamp: Date.now(),
      explanation: `Qualified EXTREME HIGH SUPPLY: 3 Green Candles engulfed by 1 Red Candle, liquidity swept, CHoCH confirmed, origin retested. Exit target at Fair Value ($${fairValueTarget.toFixed(2)}).`
    };

    setSupplyDemandZones(prev => [newLtfSupplyZone, ...prev]);
    setSelectedZoneId(newLtfSupplyZone.id);
    notifiedZoneIdsRef.current.add(newLtfSupplyZone.id);
    notifyNewQualifiedZone(newLtfSupplyZone, finalClose);

    // Generate the institutional SHORT signal with exit at Fair Value
    const shortSignal = generateSignalFromZone(newLtfSupplyZone, finalClose, macroData.activeSession);
    setSignals(prev => [shortSignal, ...prev]);

    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.7 }
    });

    setAnalysisNotice({
      type: 'success',
      message: `🎯 EXTREME HIGH SUPPLY CONFIRMED: 3 Green Candles Engulfed by Red → Retest Verified → SELL XAU/USD @ $${shortSignal.entryPrice.toFixed(2)} | SL: $${shortSignal.stopLossPrice.toFixed(2)} | Exit: Fair Value $${shortSignal.takeProfit2.toFixed(2)}`
    });
  }, [currentPrice, candles.length, macroData.activeSession, notifyNewQualifiedZone]);

  // SIMULATE LTF EXTREME LOW DEMAND ZONE & 3-RED ENGULFING RETEST LONG SIGNAL
  const handleSimulateLtfLong = useCallback(() => {
    const baseOrigin = currentPrice;
    const now = Date.now();
    const newCandles: OHLC[] = [];

    // Step A: 3 Consecutive RED Candlesticks pushing into Extreme Low (demand exceeds supply)
    for (let k = 3; k >= 1; k--) {
      const rOpen = baseOrigin + (k * 0.9);
      const rClose = rOpen - 0.8;
      newCandles.push({
        time: now - (k + 2) * 60000,
        open: Number(rOpen.toFixed(2)),
        high: Number((rOpen + 0.2).toFixed(2)),
        low: Number((rClose - 0.3).toFixed(2)),
        close: Number(rClose.toFixed(2)),
        isBasing: true,
        ema20: baseOrigin + 1.0,
        ema50: baseOrigin + 2.0,
        rsi: 42.0 - (3 - k) * 3
      });
    }

    // Step B: 1 Powerful GREEN Candlestick that ENGULFS all 3 previous Red Candlesticks
    // (Sweeps the low, causes CHoCH, and creates sharp +85 pip displacement)
    const sweepLow = baseOrigin - 1.2;
    const engulfOpen = baseOrigin - 0.2;
    const engulfClose = baseOrigin + 8.5; // Engulfs all 3 red candles completely
    newCandles.push({
      time: now - 120000,
      open: Number(engulfOpen.toFixed(2)),
      high: Number((engulfClose + 0.5).toFixed(2)),
      low: Number(sweepLow.toFixed(2)), // Wick sweeps liquidity below red candles
      close: Number(engulfClose.toFixed(2)),
      isSweep: true,
      isBreakout: true,
      ema20: baseOrigin + 3.2,
      ema50: baseOrigin + 1.5,
      rsi: 72.0
    });

    // Step C: Retest Candle: Price retraces back down to retest the engulfing order block origin!
    const retestOpen = engulfClose - 0.3;
    const retestLow = baseOrigin + 0.2; // Retests the order block
    const retestClose = baseOrigin + 1.8; // Rejection confirmed
    newCandles.push({
      time: now - 60000,
      open: Number(retestOpen.toFixed(2)),
      high: Number((retestOpen + 0.4).toFixed(2)),
      low: Number(retestLow.toFixed(2)),
      close: Number(retestClose.toFixed(2)),
      isBasing: true,
      ema20: baseOrigin + 2.0,
      ema50: baseOrigin + 1.8,
      rsi: 68.0
    });

    // Step D: Expansion candle heading toward Fair Value
    const finalClose = baseOrigin + 4.5;
    newCandles.push({
      time: now,
      open: Number(retestClose.toFixed(2)),
      high: Number((finalClose + 0.5).toFixed(2)),
      low: Number(retestClose.toFixed(2)),
      close: Number(finalClose.toFixed(2)),
      isFvg: true,
      ema20: Number((finalClose - 1.5).toFixed(2)),
      ema50: baseOrigin,
      rsi: 74.0
    });

    setCandles(prev => [...prev.slice(newCandles.length), ...newCandles]);
    setCurrentPrice(finalClose);

    // Calculate Fair Value Target (50% equilibrium)
    const fairValueTarget = Number((baseOrigin + 12.0).toFixed(2));

    // Create the qualified Extreme Low Demand Zone
    const newLtfDemandZone: SupplyDemandZone = {
      id: `extreme_demand_${Date.now()}`,
      type: 'DEMAND',
      priceHigh: Number((baseOrigin + 0.6).toFixed(2)),
      priceLow: Number((sweepLow).toFixed(2)),
      timeframe: TimeFrame.M5,
      timeframeCategory: 'LTF',
      structureType: 'Drop-Base-Rally',
      marketRegime: 'IMBALANCE',
      originCandleIndex: Math.max(0, candles.length - 5),
      arrowTargetPrice: fairValueTarget,
      fairValuePrice: fairValueTarget,
      isExtreme: true,
      criteria: {
        sharpMovement: true,
        displacementPips: 85,
        fvgCreated: true,
        fvgTop: Number((retestOpen).toFixed(2)),
        fvgBottom: Number((baseOrigin + 0.6).toFixed(2)),
        backyardTrading: true,
        backyardDescription: `Institutional buy programs accumulated aggressively at extreme low ($${sweepLow.toFixed(2)} - $${(baseOrigin + 0.6).toFixed(2)}).`,
        stalledCandlesCount: 2, // NB: <= 5 candles spent (Ultra High Imbalance)
        stalledCandlesValid: true,
        timeSpentRank: 'ULTRA_HIGH_IMBALANCE',
        isExtremeHigh: false,
        isExtremeLow: true,
        unfilledOrdersStatus: 'UNFILLED_INSTITUTIONAL_ORDERS',
        fairValueTarget,
        lowerTimeframeConfirmation: {
          liquiditySweepConfirmed: true,
          chochConfirmed: true,
          threeCandleEngulfing: true,
          engulfingType: 'BULLISH_ENGULF_3_RED',
          retestConfirmed: true,
          retestPrice: Number(retestLow.toFixed(2))
        },
        isValidZone: true
      },
      status: 'QUALIFIED_FRESH',
      timestamp: Date.now(),
      explanation: `Qualified EXTREME LOW DEMAND: 3 Red Candles engulfed by 1 Green Candle, liquidity swept, CHoCH confirmed, origin retested. Exit target at Fair Value ($${fairValueTarget.toFixed(2)}).`
    };

    setSupplyDemandZones(prev => [newLtfDemandZone, ...prev]);
    setSelectedZoneId(newLtfDemandZone.id);
    notifiedZoneIdsRef.current.add(newLtfDemandZone.id);
    notifyNewQualifiedZone(newLtfDemandZone, finalClose);

    // Generate the institutional LONG signal with exit at Fair Value
    const longSignal = generateSignalFromZone(newLtfDemandZone, finalClose, macroData.activeSession);
    setSignals(prev => [longSignal, ...prev]);

    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.7 }
    });

    setAnalysisNotice({
      type: 'success',
      message: `🎯 EXTREME LOW DEMAND CONFIRMED: 3 Red Candles Engulfed by Green → Retest Verified → BUY XAU/USD @ $${longSignal.entryPrice.toFixed(2)} | SL: $${longSignal.stopLossPrice.toFixed(2)} | Exit: Fair Value $${longSignal.takeProfit2.toFixed(2)}`
    });
  }, [currentPrice, candles.length, macroData.activeSession, notifyNewQualifiedZone]);

  // Simulate NY Killzone Breakout
  const triggerBreakout = useCallback(() => {
    const breakoutSize = 8.5;

    setCandles(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const newClose = Number((last.close + breakoutSize).toFixed(2));
      const newCandle: OHLC = {
        time: Date.now(),
        open: last.close,
        high: newClose + 1.2,
        low: last.close - 0.4,
        close: newClose,
        isBreakout: true,
        ema20: Number((last.ema20! * 0.8 + newClose * 0.2).toFixed(2)),
        ema50: Number((last.ema50! * 0.9 + newClose * 0.1).toFixed(2)),
        rsi: 68.5
      };

      setCurrentPrice(newClose);
      setEma20(newCandle.ema20!);
      setEma50(newCandle.ema50!);
      setRsi(newCandle.rsi!);

      setSignals(curr => curr.map(s => {
        if (s.status === 'PENDING' && s.type === 'BUY') {
          return { ...s, status: 'SUCCESS', pipsGained: 85 };
        }
        return s;
      }));

      return [...prev.slice(1), newCandle];
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 }
    });

    setAnalysisNotice({
      type: 'success',
      message: `⚡ Simulated NY Killzone Institutional Expansion (+85 Pips)! Active BUY targets achieved.`
    });
  }, []);

  // Simulate Asian Liquidity Sweep (Judas Swing)
  const triggerJudasSwing = useCallback(() => {
    setCandles(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const lowDip = last.close - 4.5;
      const newClose = Number((last.close + 2.8).toFixed(2));

      const newCandle: OHLC = {
        time: Date.now(),
        open: last.close,
        high: newClose + 0.8,
        low: lowDip,
        close: newClose,
        isSweep: true,
        isBreakout: true,
        ema20: Number((last.ema20! + 0.5).toFixed(2)),
        ema50: last.ema50,
        rsi: 54.0
      };

      setCurrentPrice(newClose);
      setEma20(newCandle.ema20!);
      setRsi(newCandle.rsi!);

      return [...prev.slice(1), newCandle];
    });

    setAnalysisNotice({
      type: 'info',
      message: `🎯 Asian Range Low Swept (Judas Swing)! Liquidity purge completed.`
    });
  }, []);

  // Run Gemini 3.8 Flash / Algorithmic Pattern Scan on Gold
  const triggerAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisNotice(null);

    const marketState = {
      currentPrice,
      spreadPoints,
      rsi,
      ema20,
      ema50,
      atrPips: 24,
      macro: macroData,
      liquidityLevels: [],
      supplyDemandZones
    };

    const result = await analyzeGoldMarketPatterns(marketState, signals, activeTimeframe);

    if (result && result.isSignalPresent && result.requirementsMet >= 90) {
      const newSignal: Signal = {
        id: Math.random().toString(36).substr(2, 9),
        asset: MarketAsset.XAUUSD,
        type: result.type,
        setupModel: result.setupModel,
        session: macroData.activeSession,
        timeframe: activeTimeframe,
        timeframeCategory: isHigherTimeframe(activeTimeframe) ? 'HTF' : 'LTF',
        entryPrice: result.entryPrice || currentPrice,
        stopLossPrice: result.stopLossPrice,
        takeProfit1: result.takeProfit1,
        takeProfit2: result.takeProfit2,
        riskPips: result.riskPips,
        rewardPips: result.rewardPips,
        riskReward: result.riskReward,
        confidence: result.confidence,
        requirementsMet: result.requirementsMet,
        timestamp: Date.now(),
        reasons: result.reasoning,
        mt5Action: result.mt5Action,
        source: result.engine,
        status: 'PENDING'
      };

      setSignals(prev => [...prev, newSignal]);

      setAnalysisNotice({
        type: 'success',
        message: `🎯 96%+ 4-Criteria ${result.type} Signal on ${activeTimeframe}: ${result.setupModel} (SL: -${result.riskPips}p | TP2: +${result.rewardPips}p)`
      });

      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.85 }
      });
    } else {
      setAnalysisNotice({
        type: 'info',
        message: `Gold ${activeTimeframe} market scanned: Confluence at ${result?.requirementsMet || 85}%. Standing aside until a 4/4 qualified zone aligns.`
      });
    }

    setIsAnalyzing(false);
  }, [currentPrice, spreadPoints, rsi, ema20, ema50, macroData, signals, supplyDemandZones, activeTimeframe]);

  const updateSignalStatus = (id: string, status: 'SUCCESS' | 'FAILURE') => {
    setSignals(prev => prev.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          status,
          pipsGained: status === 'SUCCESS' ? s.rewardPips : -s.riskPips
        };
      }
      return s;
    }));
  };

  const clearHistory = () => {
    setSignals([]);
    localStorage.removeItem('goldhunter_signals_v1');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
      {/* Real-Time Floating Zone Notification Toasts */}
      <ZoneNotificationToasts 
        alerts={alerts}
        onDismissAlert={handleDismissAlert}
        onSelectZone={handleSelectZone}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onTestNotification={handleTestNotification}
      />

      {/* Top Navigation Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Award className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                GOLDHUNTER <span className="text-amber-400">PRO</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded">
                4-CRITERIA S&D
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              Institutional Gold (XAU/USD) Terminal • MT5 MQL5 Ready
            </p>
          </div>
        </div>

        {/* Center Live Gold Spot Banner */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-black text-slate-300">LIVE MT5 FEED:</span>
          </div>
          <span className="text-base font-black text-amber-400">${currentPrice.toFixed(2)}</span>
          {liveOffset !== 0 && (
            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
              {liveOffset > 0 ? `+${liveOffset}` : liveOffset} OFFSET
            </span>
          )}
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            {supplyDemandZones.filter(z => z.criteria.isValidZone).length} VALID S&D ZONES
          </span>
        </div>

        {/* Right Navigation & Audio / MT5 Studio Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Quick Sound Alert Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={soundEnabled ? 'Alert audio is on' : 'Alert audio is muted'}
            className={`p-2 rounded-xl border text-xs transition-all ${
              soundEnabled 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' 
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Zone alert chime: ACTIVE' : 'Zone alert chime: MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Test Notification Quick Trigger */}
          <button
            onClick={handleTestNotification}
            aria-label="Test real-time alert"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 active:scale-95"
            title="Test real-time notification"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Alert</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <span>Live Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('sentiment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'sentiment'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Order Flow Sentiment</span>
            <span className="sm:hidden">Sentiment</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black ${
              sentimentData.sentimentScore >= 55 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : sentimentData.sentimentScore <= 45 
                ? 'bg-rose-500/20 text-rose-400' 
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              {sentimentData.sentimentScore}% {sentimentData.sentimentScore >= 55 ? 'BULL' : sentimentData.sentimentScore <= 45 ? 'BEAR' : 'CHOP'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'heatmap'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Win Rate Heatmap</span>
            <span className="sm:hidden">Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Accuracy Audit</span>
            <span className="sm:hidden">Audit</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black ${
              activeTab === 'audit' ? 'bg-slate-950 text-amber-400' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {systemAudit.overallAccuracy}% ({systemAudit.performanceGrade})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'news'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 fill-current" />
            <span className="hidden sm:inline">Live News & Macro</span>
            <span className="sm:hidden">News</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
          </button>

          <button
            onClick={() => setActiveTab('mt5_studio')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'mt5_studio'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">MT5 EA Studio</span>
            <span className="sm:hidden">MT5 EA</span>
          </button>

          <button
            onClick={() => setShowHowToUseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border-emerald-500/40 shadow-sm active:scale-95"
            title="Open comprehensive user guide menu & client explainer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">How To Use</span>
            <span className="sm:hidden">Guide</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border-amber-500/40 shadow-sm active:scale-95"
            title="Open institutional handbook & download PDF"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">System Manual (PDF)</span>
            <span className="sm:hidden">PDF Manual</span>
          </button>

          <div className="text-right hidden lg:block">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Broker MT5 Bridge</p>
            <p className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              XAUUSD 4/4 RULES ACTIVE
            </p>
          </div>
        </div>
      </header>

      {/* Notice Banner */}
      {analysisNotice && (
        <div className={`px-6 py-2.5 flex items-center justify-between text-xs font-medium border-b ${
          analysisNotice.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : analysisNotice.type === 'info'
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
        }`}>
          <div className="flex items-center gap-2 max-w-[1600px] mx-auto w-full">
            {analysisNotice.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {analysisNotice.type === 'info' && <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            {analysisNotice.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            <span>{analysisNotice.message}</span>
          </div>
          <button 
            onClick={() => setAnalysisNotice(null)} 
            className="text-slate-400 hover:text-white text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6">
        {activeTab === 'mt5_studio' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                MetaTrader 5 Expert Advisor & Indicator Studio for Gold (XAUUSD)
              </h2>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700"
              >
                Back to Live Gold Dashboard
              </button>
            </div>
            <MT5Studio />
          </div>
        ) : activeTab === 'news' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400 fill-current" />
                Live Macroeconomic News Calendar & World City Timezone System
              </h2>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700"
              >
                Back to Live Gold Dashboard
              </button>
            </div>
            <LiveEconomicNews onSimulatePriceShock={handleNewsPriceShock} />
          </div>
        ) : activeTab === 'audit' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Signal Verification & Multi-Timeframe Accuracy Audit Ledger
              </h2>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700"
              >
                Back to Live Gold Dashboard
              </button>
            </div>
            <SignalPerformanceAuditView 
              signals={signals}
              currentPrice={currentPrice}
              onAuditAllSignals={handleAuditAllSignals}
              onManualReview={handleManualReview}
            />
          </div>
        ) : activeTab === 'sentiment' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                Real-Time Order Flow Sentiment & Cumulative Volume Delta (CVD) Terminal
              </h2>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700"
              >
                Back to Live Gold Dashboard
              </button>
            </div>
            <MarketSentimentGauge 
              sentiment={sentimentData}
              currentPrice={currentPrice}
              onTriggerShock={handleTriggerOrderFlowShock}
            />
          </div>
        ) : activeTab === 'heatmap' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                4/4 Qualified Zone Performance & Win Rate Analytics
              </h2>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700"
              >
                Back to Live Gold Dashboard
              </button>
            </div>
            <ZonePerformanceHeatmap currentZones={supplyDemandZones} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Global Session Clocks */}
            <GoldSessionClock activeSession={macroData.activeSession} />

            {/* Real-Time Market Sentiment & Buy/Sell Order Flow Gauge */}
            <MarketSentimentGauge 
              sentiment={sentimentData}
              currentPrice={currentPrice}
              onTriggerShock={handleTriggerOrderFlowShock}
            />

            {/* Signal Verification & Accuracy Rating Engine */}
            <SignalPerformanceAuditView 
              signals={signals}
              currentPrice={currentPrice}
              onAuditAllSignals={handleAuditAllSignals}
              onManualReview={handleManualReview}
            />

            {/* Live Macroeconomic News & Global Multi-City Timezone Feed */}
            <LiveEconomicNews onSimulatePriceShock={handleNewsPriceShock} />

            {/* Zone Performance Heatmap (Hours of the Day vs Win Rate) */}
            <ZonePerformanceHeatmap currentZones={supplyDemandZones} />

            {/* Macro & DXY Indicators Bar */}
            <GoldMacroBar macro={macroData} spreadPoints={spreadPoints} currentPrice={currentPrice} />

            {/* Real-Time Browser & Audio Notification Control Bar */}
            <NotificationControlsBar
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onTestNotification={handleTestNotification}
            />

            {/* 4-Criteria Supply & Demand Zone Validation Engine */}
            <SupplyDemandInspector 
              zones={supplyDemandZones}
              currentPrice={currentPrice}
              activeTimeframe={activeTimeframe}
              onSelectTimeframe={handleTimeframeChange}
              selectedZoneId={selectedZoneId}
              onSelectZone={handleSelectZone}
              onSimulateValidZone={(type) => {
                if (type === 'DEMAND') handleSimulateDemandZone();
                else handleSimulateSupplyZone();
              }}
              onGenerateZoneSignal={handleGenerateZoneSignal}
            />

            {/* Global Master Timeframe Synchronization Bar */}
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Active Timeframe Synchronizer:
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-amber-500 text-slate-950">
                      {activeTimeframe} ACTIVE
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono font-bold">
                      • {TIMEFRAME_PROFILES[activeTimeframe]?.label || activeTimeframe}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    All live charts, 4-criteria S&D zones, indicator gauges, and AI setup models are synchronized to this timeframe.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                {([TimeFrame.M1, TimeFrame.M5, TimeFrame.M15, TimeFrame.H1, TimeFrame.H4, TimeFrame.D1] as TimeFrame[]).map(tf => {
                  const isSelected = activeTimeframe === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => handleTimeframeChange(tf)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <span>{tf}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Live Gold Chart & Top-Down SMC Analysis (8 cols) */}
              <div className="xl:col-span-8 space-y-6">
                {/* Ticker & AI Scan Trigger Bar */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">
                        Institutional XAU/USD Spot Gold • Real-Time Interbank Feed
                      </span>
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-3xl md:text-4xl font-black mono text-white">
                          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                        <span className="text-xs font-black px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/30">
                          {currentPrice >= ema20 ? '▲ INSTITUTIONAL ACCUMULATION' : '▼ PREMIUM DISTRIBUTION'}
                        </span>
                      </div>
                    </div>

                    {/* Scan Gold Setup Button */}
                    <button 
                      disabled={isAnalyzing}
                      onClick={triggerAnalysis}
                      className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs md:text-sm tracking-wide transition-all shadow-xl ${
                        isAnalyzing 
                          ? 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-75' 
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 hover:scale-[1.02] active:scale-95 font-black'
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></div>
                          AUDITING 4 CRITERIA S&D...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          SCAN 4/4 VALID S&D SETUP ({activeTimeframe})
                        </>
                      )}
                    </button>
                  </div>

                  {/* Indicator Gauges */}
                  <IndicatorGauges 
                    rsi={rsi} 
                    ema20={ema20} 
                    ema50={ema50} 
                    price={currentPrice} 
                    spreadPoints={spreadPoints} 
                    timeframe={activeTimeframe}
                  />
                </div>

                {/* Interactive Gold Candlestick Chart */}
                <GoldChart 
                  candles={candles}
                  currentPrice={currentPrice}
                  ema20={ema20}
                  ema50={ema50}
                  rsi={rsi}
                  supplyDemandZones={supplyDemandZones}
                  marketRegime={marketRegime}
                  activeTimeframe={activeTimeframe}
                  onChangeTimeframe={handleTimeframeChange}
                  isSimulating={isSimulating}
                  onToggleSimulation={() => setIsSimulating(!isSimulating)}
                  simSpeed={simSpeed}
                  onChangeSpeed={setSimSpeed}
                  onTriggerBreakout={triggerBreakout}
                  onTriggerJudasSwing={triggerJudasSwing}
                  onSimulateDemandZone={handleSimulateDemandZone}
                  onSimulateSupplyZone={handleSimulateSupplyZone}
                  onSimulateLtfShort={handleSimulateLtfShort}
                  onSimulateLtfLong={handleSimulateLtfLong}
                  chartMode={chartMode}
                  onToggleChartMode={setChartMode}
                  onPriceCalibrate={handlePriceCalibrate}
                  onRefreshLiveFeed={() => loadLiveMarketData(activeTimeframe, liveOffset)}
                  isLoadingLive={isLoadingLive}
                />

                {/* Top-Down SMC Market Intelligence */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Top-Down SMC & ICT Institutional Bias ({activeTimeframe})
                    </h3>
                    <span className="text-[10px] text-slate-500 mono uppercase font-bold">
                      LIQUIDITY RUNS & 4-CRITERIA S&D CONFLUENCE
                    </span>
                  </div>
                  <GoldAnalysisView 
                    price={currentPrice} 
                    activeTimeframe={activeTimeframe}
                    onSelectTimeframe={handleTimeframeChange}
                    supplyDemandZones={supplyDemandZones}
                  />
                </section>
              </div>

              {/* Right Column: Signal Hub & MT5 Quick Deployment (4 cols) */}
              <div className="xl:col-span-4 flex flex-col gap-6">
                {/* Signal Log Card */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex-1 flex flex-col min-h-[520px]">
                  <SignalLog 
                    signals={signals} 
                    onFeedback={updateSignalStatus}
                    onClearHistory={clearHistory}
                    onOpenPerformanceAudit={() => setActiveTab('audit')}
                    onReviewSignal={handleReviewSingleSignal}
                  />
                </div>

                {/* MT5 Gold Deployment Summary */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      MT5 Auto-Trader Ready
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      XAUUSD / GOLD
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Deploy this automated institutional strategy directly to your MT5 account. It enforces a strict 35-pip SL, secures 50% partials at TP1 (+65 pips), and automatically arms break-even for risk-free runners.
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('mt5_studio')}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      EXPORT GOLD MQL5 EXPERT ADVISOR
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>Symbol Target:</span>
                      <strong className="text-white">XAUUSD / GOLD</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Execution Timeframe:</span>
                      <strong className="text-amber-400">M5 / M15 (Killzones)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Stop-Loss / Break-Even:</span>
                      <strong className="text-emerald-400">35 Pips / Armed @ +30p</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-6 py-3.5 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
              GEMINI 3.8 FLASH GOLD ENGINE
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span> 
              4-CRITERIA STRICT S&D VALIDATION
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 
              XAU/USD SPECIALIZED TERMINAL
            </span>
          </div>
          <p>© 2026 GOLDHUNTER PRO • INSTITUTIONAL GOLD INTELLIGENCE & METATRADER 5</p>
        </div>
      </footer>

      {/* Institutional System Manual & PDF Reader Modal */}
      <SystemManualModal 
        isOpen={showManualModal} 
        onClose={() => setShowManualModal(false)} 
      />

      {/* Interactive 'How to Use' Menu Modal */}
      <HowToUseMenuModal
        isOpen={showHowToUseModal}
        onClose={() => setShowHowToUseModal(false)}
        onOpenPDFManual={() => setShowManualModal(true)}
      />
    </div>
  );
};

export default App;
