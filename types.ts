export enum MarketAsset {
  XAUUSD = 'XAU/USD'
}

export enum TimeFrame {
  M1 = '1m',
  M5 = '5m',
  M15 = '15m',
  H1 = '1h',
  H4 = '4h',
  D1 = 'D1'
}

export type TradingSession = 'ASIAN_RANGE' | 'LONDON_OPEN' | 'NY_AM_KILLZONE' | 'NY_PM_SESSION' | 'MARKET_CLOSE';

export interface OHLC {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  isBreakout?: boolean;
  isSweep?: boolean;
  isBasing?: boolean; // 3-6 stalling candles
  isFvg?: boolean;
  ema20?: number;
  ema50?: number;
  rsi?: number;
}

/**
 * Strict Institutional Supply & Demand Qualification
 * Based on Market Imbalance, Extreme Highs/Lows, and Time Spent (5 candles or less)
 */
export interface ValidZoneCriteria {
  // Criterion 1: Sharp explosive movement immediately up (Demand) or down (Supply)
  sharpMovement: boolean;
  displacementPips: number;

  // Criterion 2: Fair Value Gap (FVG) created right after the sharp movement
  fvgCreated: boolean;
  fvgTop: number;
  fvgBottom: number;

  // Criterion 3: Immediate trading in the backyard (clean origin liquidity & direct order build-up)
  backyardTrading: boolean;
  backyardDescription: string;

  // Criterion 4: Time Spent Rule (NB: 5 CANDLES OR LESS)
  // The LESS time price spends, the MORE out of balance supply & demand is at that level
  stalledCandlesCount: number;
  stalledCandlesValid: boolean; // true if <= 5 candles
  timeSpentRank?: 'ULTRA_HIGH_IMBALANCE' | 'HIGH_IMBALANCE' | 'BALANCED_DISQUALIFIED';

  // Extreme Highs (Sells) and Extreme Lows (Buys)
  isExtremeHigh?: boolean; // For Supply: at extreme high where supply exceeds demand
  isExtremeLow?: boolean; // For Demand: at extreme low where demand exceeds supply

  // Unfilled Orders Status: Unfilled resting limit orders cause price to turn
  unfilledOrdersStatus?: 'UNFILLED_INSTITUTIONAL_ORDERS' | 'PARTIALLY_FILLED' | 'FILLED_MITIGATED';

  // Fair Value Target: Where price moves to (equilibrium where orders are filled and price exits)
  fairValueTarget?: number;

  // Lower Timeframe (M15 / M5) Confirmation
  lowerTimeframeConfirmation?: {
    liquiditySweepConfirmed: boolean;
    chochConfirmed: boolean;
    threeCandleEngulfing: boolean;
    engulfingType?: 'BULLISH_ENGULF_3_RED' | 'BEARISH_ENGULF_3_GREEN';
    retestConfirmed: boolean;
    retestPrice?: number;
  };

  // All core criteria satisfied
  isValidZone: boolean;
}

export interface SupplyDemandZone {
  id: string;
  type: 'DEMAND' | 'SUPPLY';
  priceHigh: number;
  priceLow: number;
  timeframe: TimeFrame;
  timeframeCategory?: 'HTF' | 'LTF'; // Higher Timeframe (H4, H1) vs Lower Timeframe (M15, M5, M1)
  structureType?: 'Rally-Base-Drop' | 'Drop-Base-Drop' | 'Drop-Base-Rally' | 'Rally-Base-Rally';
  marketRegime?: 'IMBALANCE' | 'BALANCED'; // Only trade where there is market imbalance, never when balanced
  originCandleIndex?: number; // Starting candle of the explosive move
  arrowTargetPrice?: number; // Target price reached by the explosive move
  fairValuePrice?: number; // Fair value equilibrium (target exit)
  isExtreme?: boolean; // true if at extreme high or extreme low
  criteria: ValidZoneCriteria;
  status: 'QUALIFIED_FRESH' | 'MITIGATING' | 'DISQUALIFIED';
  timestamp: number;
  explanation: string;
}

export interface LiquidityLevel {
  id: string;
  name: string;
  price: number;
  type: 'BSL' | 'SSL' | 'ORDER_BLOCK' | 'FVG' | 'EQUAL_HIGHS' | 'EQUAL_LOWS';
  timeframe: TimeFrame;
  swept: boolean;
}

export interface GoldMacroData {
  dxyIndex: number;
  dxyChange: number;
  us10yYield: number;
  goldDailyHigh: number;
  goldDailyLow: number;
  dailyRangePips: number;
  activeSession: TradingSession;
  sessionTimeRemaining: string;
  fedSentiment: 'HAWKISH' | 'DOVISH' | 'NEUTRAL';
}

export interface Signal {
  id: string;
  asset: MarketAsset;
  type: 'BUY' | 'SELL';
  setupModel: 'Valid Demand Zone Retest' | 'Valid Supply Zone Retest' | 'ICT Silver Bullet' | 'Judas Swing Liquidity Purge' | 'Asian Range Sweep' | 'LTF Supply Zone Short' | 'LTF Demand Zone Long' | (string & {});
  session: TradingSession;
  timeframe?: TimeFrame;
  timeframeCategory?: 'HTF' | 'LTF';
  entryPrice: number;
  stopLossPrice: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3?: number;
  riskPips: number;
  rewardPips: number;
  riskReward: string;
  confidence: number;
  requirementsMet: number;
  timestamp: number;
  reasons: string[];
  mt5Action: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILURE';
  source?: 'gemini' | 'algorithmic';
  pipsGained?: number;
  zoneMatched?: SupplyDemandZone;
  marketRegime?: 'IMBALANCE' | 'BALANCED';
  isExtreme?: boolean; // True if triggered at extreme high (Sell) or extreme low (Buy)
  fairValuePrice?: number; // Target exit at fair value / equilibrium
  orderFlowDynamics?: {
    wherePriceTurnsTo: string; // Significant supply/demand imbalance
    whatCausesTurn: string; // Unfilled institutional limit orders
    wherePriceMovesTo: string; // Areas lacking significant imbalance (fair value)
    whatFacilitatesMovement: string; // Filled orders facilitate price movement
  };
  threeCandleEngulfing?: {
    detected: boolean;
    pattern: 'BULLISH_ENGULF_3_RED' | 'BEARISH_ENGULF_3_GREEN';
    sweepConfirmed: boolean;
    chochConfirmed: boolean;
    retestConfirmed: boolean;
    retestPrice: number;
  };

  // Real-Time & Post-Trade Review Engine
  reviewStatus?: 'UNREVIEWED' | 'VALID_WIN' | 'INVALID_LOSS' | 'IN_PLAY' | 'SCRATCH_BE';
  reviewOutcome?: 'TP1_HIT' | 'TP2_HIT' | 'FULL_TP_HIT' | 'SL_HIT' | 'INVALIDATED_STRUCTURE' | 'ACTIVE_FLOATING';
  reviewTimestamp?: number;
  reviewNotes?: string;
  highestPriceReached?: number;
  lowestPriceReached?: number;
  realizedPips?: number;
  realizedRR?: string;
  reviewTimeframeElapsed?: string;
  autoVerified?: boolean;
}

export interface TimeframeAccuracy {
  timeframe: string;
  total: number;
  validWins: number;
  invalidLosses: number;
  accuracy: number;
  avgPips: number;
}

export interface ModelAccuracy {
  model: string;
  total: number;
  validWins: number;
  invalidLosses: number;
  accuracy: number;
}

export interface SystemPerformanceAudit {
  totalSignals: number;
  reviewedSignals: number;
  validWins: number;
  invalidLosses: number;
  inPlay: number;
  overallAccuracy: number; // percentage
  performanceGrade: 'A+' | 'A' | 'B' | 'C';
  performanceRatingLabel: string;
  netPipsCaptured: number;
  profitFactor: number;
  avgWinPips: number;
  avgLossPips: number;
  avgRiskReward: string;
  winStreak: number;
  bestTradePips: number;
  timeframeAccuracies: TimeframeAccuracy[];
  modelAccuracies: ModelAccuracy[];
}

export interface HourlyZonePerformance {
  hourGMT: number; // 0 - 23
  hourLabel: string; // "00:00", "01:00", etc.
  nyTimeLabel: string;
  londonTimeLabel: string;
  sessionName: 'Asian Range' | 'London Open' | 'London-NY Overlap' | 'NY AM Killzone' | 'NY PM Session' | 'Asian Late';
  isKillzone: boolean;
  totalZones: number;
  winningZones: number;
  losingZones: number;
  winRate: number; // percentage, e.g. 88.5
  demandWinRate: number;
  supplyWinRate: number;
  avgPipsGained: number;
  avgRiskReward: number;
  profitFactor: number;
  dominantStructure: 'Rally-Base-Drop' | 'Drop-Base-Rally';
  volumeTier: 'PEAK_INSTITUTIONAL' | 'HIGH' | 'MODERATE' | 'LOW_CHOP';
}

export interface CityTimeZone {
  id: string;
  city: string;
  country: string;
  region: 'Americas' | 'Europe' | 'Asia' | 'Middle East' | 'Africa' | 'Pacific';
  iana: string; // standard IANA timezone, e.g. 'America/New_York'
  flag: string;
  utcOffset: string; // e.g. 'UTC-4', 'UTC+0', 'UTC+4'
  financialHub?: string; // e.g. 'Wall Street / NY Fed', 'City of London', 'Tokyo Exchange'
}

export interface EconomicNewsEvent {
  id: string;
  title: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number; // Unix epoch ms
  dateLabel: string; // e.g. "Today", "Tomorrow"
  forecast: string;
  previous: string;
  actual?: string;
  goldImpact: string;
  expectedVolatilityPips: number;
  institutionalRule: string;
}

export interface GoldMarketState {
  currentPrice: number;
  spreadPoints: number;
  rsi: number;
  ema20: number;
  ema50: number;
  atrPips: number;
  marketRegime: 'IMBALANCE' | 'BALANCED';
  macro: GoldMacroData;
  liquidityLevels: LiquidityLevel[];
  supplyDemandZones: SupplyDemandZone[];
}

export type SentimentBias = 
  | 'EXTREME_BEARISH' 
  | 'MODERATE_BEARISH' 
  | 'NEUTRAL_EQUILIBRIUM' 
  | 'MODERATE_BULLISH' 
  | 'EXTREME_BULLISH';

export interface OrderBookLevel {
  level: number;
  price: number;
  lots: number;
  totalLots: number;
  depthPercentage: number;
}

export interface TapeOrder {
  id: string;
  time: string;
  price: number;
  lots: number;
  side: 'BUY' | 'SELL';
  aggressor: 'BUY_MARKET_TAKER' | 'SELL_MARKET_TAKER' | 'INSTITUTIONAL_BLOCK';
  pool: string;
}

export interface MarketSentimentData {
  sentimentScore: number; // 0 - 100 (0 = Extreme Bearish, 50 = Neutral, 100 = Extreme Bullish)
  bias: SentimentBias;
  biasLabel: string;
  confidence: number;

  // Buy / Sell Order Flow Volume Data
  buyVolumeLots: number;
  sellVolumeLots: number;
  totalVolumeLots: number;
  buyRatio: number; // percentage, e.g. 66.4
  sellRatio: number; // percentage, e.g. 33.6
  netDeltaLots: number; // e.g. +7840

  // Cumulative Volume Delta (CVD)
  cvdSlope: 'ACCELERATING_UP' | 'RISING' | 'NEUTRAL' | 'FALLING' | 'ACCELERATING_DOWN';
  cvdContracts: number;

  // Bid / Ask Depth Imbalance
  bidDepthLots: number;
  askDepthLots: number;
  bidPressurePercentage: number;
  askPressurePercentage: number;
  imbalanceRatio: string;

  // Institutional vs Retail Crowd Sentiment
  institutionalBias: 'HEAVY_ACCUMULATION' | 'MODERATE_BUYING' | 'EQUILIBRIUM' | 'MODERATE_DISTRIBUTION' | 'HEAVY_DISTRIBUTION';
  institutionalAccumulationPct: number;
  retailLongPct: number;
  retailShortPct: number;
  crowdContrarianSignal: string;

  // Depth & Tape
  topBids: OrderBookLevel[];
  topAsks: OrderBookLevel[];
  recentTape: TapeOrder[];

  lastUpdated: number;
}
