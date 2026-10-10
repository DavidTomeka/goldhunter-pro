import { 
  MarketSentimentData, 
  SentimentBias, 
  OrderBookLevel, 
  TapeOrder, 
  TradingSession, 
  SupplyDemandZone 
} from '../types';

let currentCvd = 14250;
let tapeHistory: TapeOrder[] = [
  {
    id: 'tape_1',
    time: new Date(Date.now() - 4000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    price: 2682.40,
    lots: 140,
    side: 'BUY',
    aggressor: 'BUY_MARKET_TAKER',
    pool: 'NY Interbank Aggressor'
  },
  {
    id: 'tape_2',
    time: new Date(Date.now() - 8000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    price: 2682.20,
    lots: 85,
    side: 'BUY',
    aggressor: 'INSTITUTIONAL_BLOCK',
    pool: 'CME Comex Block Flow'
  },
  {
    id: 'tape_3',
    time: new Date(Date.now() - 14000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    price: 2681.90,
    lots: 60,
    side: 'SELL',
    aggressor: 'SELL_MARKET_TAKER',
    pool: 'London Fixing Pool'
  },
  {
    id: 'tape_4',
    time: new Date(Date.now() - 20000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    price: 2682.10,
    lots: 210,
    side: 'BUY',
    aggressor: 'INSTITUTIONAL_BLOCK',
    pool: 'Central Bank Bullion Desk'
  },
  {
    id: 'tape_5',
    time: new Date(Date.now() - 28000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    price: 2681.60,
    lots: 45,
    side: 'SELL',
    aggressor: 'SELL_MARKET_TAKER',
    pool: 'Retail Broker Margin Stop'
  }
];

let shockOffset = 0; // +/- percentage shift from manual user shocks

/**
 * Trigger an instantaneous order flow shock for live simulation
 */
export function triggerOrderFlowShock(type: 'BULLISH_SWEEP' | 'BEARISH_WALL' | 'RESET'): number {
  if (type === 'BULLISH_SWEEP') {
    shockOffset = Math.min(shockOffset + 24, 35);
    currentCvd += 6500;
  } else if (type === 'BEARISH_WALL') {
    shockOffset = Math.max(shockOffset - 24, -35);
    currentCvd -= 6500;
  } else {
    shockOffset = 0;
    currentCvd = 14250;
  }
  return shockOffset;
}

/**
 * Compute real-time buy/sell order flow sentiment on XAU/USD
 */
export function calculateMarketSentiment(
  currentPrice: number,
  prevPrice: number,
  rsi: number,
  ema20: number,
  session: TradingSession,
  zones: SupplyDemandZone[]
): MarketSentimentData {
  const priceDelta = currentPrice - (prevPrice || currentPrice);
  
  // Base baseline sentiment score based on price vs EMA20 and RSI
  let baseScore = 52;

  // EMA20 dynamic alignment
  if (currentPrice > ema20) {
    baseScore += Math.min(18, (currentPrice - ema20) * 4);
  } else {
    baseScore -= Math.min(18, (ema20 - currentPrice) * 4);
  }

  // RSI alignment (Oversold = smart money accumulation; Overbought = distribution)
  if (rsi > 50) {
    baseScore += (rsi - 50) * 0.35;
  } else {
    baseScore -= (50 - rsi) * 0.35;
  }

  // Session institutional volume multiplier
  if (session === 'NY_AM_KILLZONE' || session === 'LONDON_OPEN') {
    baseScore += 3;
  }

  // S&D Zone proximity influence
  const nearDemand = zones.some(z => z.type === 'DEMAND' && Math.abs(currentPrice - z.priceHigh) < 3.0);
  const nearSupply = zones.some(z => z.type === 'SUPPLY' && Math.abs(currentPrice - z.priceLow) < 3.0);
  if (nearDemand) baseScore += 8;
  if (nearSupply) baseScore -= 8;

  // Immediate tick momentum
  if (priceDelta > 0.05) baseScore += 6;
  if (priceDelta < -0.05) baseScore -= 6;

  // Apply manual shock offset
  baseScore += shockOffset;

  // Clamp sentiment score between 5 and 95
  const sentimentScore = Math.max(8, Math.min(95, Math.round(baseScore)));

  // Determine Bias Classification
  let bias: SentimentBias = 'NEUTRAL_EQUILIBRIUM';
  let biasLabel = 'NEUTRAL CHOP (EQUILIBRIUM)';

  if (sentimentScore >= 75) {
    bias = 'EXTREME_BULLISH';
    biasLabel = 'EXTREME BULLISH (HEAVY BUY AGGRESSION)';
  } else if (sentimentScore >= 56) {
    bias = 'MODERATE_BULLISH';
    biasLabel = 'MODERATE BULLISH (BUYERS ABSORBING ASKS)';
  } else if (sentimentScore <= 25) {
    bias = 'EXTREME_BEARISH';
    biasLabel = 'EXTREME BEARISH (INSTITUTIONAL DISTRIBUTION)';
  } else if (sentimentScore <= 44) {
    bias = 'MODERATE_BEARISH';
    biasLabel = 'MODERATE BEARISH (SELLERS IN CONTROL)';
  } else {
    bias = 'NEUTRAL_EQUILIBRIUM';
    biasLabel = 'FAIR VALUE EQUILIBRIUM (BALANCED FLOW)';
  }

  // Calculate realistic Buy / Sell Lot Volumes
  const baseTotalLots = 24500;
  const buyRatio = sentimentScore;
  const sellRatio = 100 - sentimentScore;
  const buyVolumeLots = Math.round((baseTotalLots * buyRatio) / 100);
  const sellVolumeLots = baseTotalLots - buyVolumeLots;
  const netDeltaLots = buyVolumeLots - sellVolumeLots;

  // Update CVD dynamically
  const cvdDelta = Math.round(priceDelta * 400 + (sentimentScore - 50) * 15);
  currentCvd += cvdDelta;

  let cvdSlope: 'ACCELERATING_UP' | 'RISING' | 'NEUTRAL' | 'FALLING' | 'ACCELERATING_DOWN' = 'RISING';
  if (sentimentScore >= 75) cvdSlope = 'ACCELERATING_UP';
  else if (sentimentScore >= 56) cvdSlope = 'RISING';
  else if (sentimentScore <= 25) cvdSlope = 'ACCELERATING_DOWN';
  else if (sentimentScore <= 44) cvdSlope = 'FALLING';
  else cvdSlope = 'NEUTRAL';

  // Bid / Ask Level-2 Depth Generation
  const bidDepthLots = Math.round(3800 * (sentimentScore / 50));
  const askDepthLots = Math.round(3800 * ((100 - sentimentScore) / 50));
  const totalDepth = bidDepthLots + askDepthLots;
  const bidPressurePercentage = Math.round((bidDepthLots / totalDepth) * 100);
  const askPressurePercentage = 100 - bidPressurePercentage;
  const imbalanceRatio = (bidDepthLots / Math.max(1, askDepthLots)).toFixed(2) + ' : 1';

  // Institutional vs Retail Crowd Sentiment (Contrarian Indicator)
  const institutionalAccumulationPct = Math.min(94, Math.max(12, Math.round(sentimentScore * 1.05)));
  // Retail crowd usually bets against strong institutional trends in Gold
  const retailLongPct = Math.max(18, Math.min(84, 100 - sentimentScore + Math.round((Math.random() - 0.5) * 6)));
  const retailShortPct = 100 - retailLongPct;

  let crowdContrarianSignal = 'BALANCED RETAIL POSITIONING';
  if (retailShortPct >= 62) {
    crowdContrarianSignal = `BULLISH SQUEEZE FUEL: Retail is ${retailShortPct}% SHORT — Smart Money absorbing retail stops`;
  } else if (retailLongPct >= 62) {
    crowdContrarianSignal = `BEARISH DISTRIBUTION: Retail is ${retailLongPct}% LONG — Smart Money preparing downside purge`;
  } else {
    crowdContrarianSignal = `EQUILIBRIUM: Retail evenly positioned (${retailLongPct}% Long / ${retailShortPct}% Short)`;
  }

  let institutionalBias: 'HEAVY_ACCUMULATION' | 'MODERATE_BUYING' | 'EQUILIBRIUM' | 'MODERATE_DISTRIBUTION' | 'HEAVY_DISTRIBUTION' = 'MODERATE_BUYING';
  if (sentimentScore >= 75) institutionalBias = 'HEAVY_ACCUMULATION';
  else if (sentimentScore >= 56) institutionalBias = 'MODERATE_BUYING';
  else if (sentimentScore <= 25) institutionalBias = 'HEAVY_DISTRIBUTION';
  else if (sentimentScore <= 44) institutionalBias = 'MODERATE_DISTRIBUTION';
  else institutionalBias = 'EQUILIBRIUM';

  // Build top 5 Bids (below spot) and top 5 Asks (above spot)
  const spreadStep = 0.35;
  const topBids: OrderBookLevel[] = [1, 2, 3, 4, 5].map(lvl => {
    const p = Number((currentPrice - lvl * spreadStep).toFixed(2));
    const lots = Math.round((450 - lvl * 40) * (sentimentScore / 50) + (Math.sin(lvl + currentPrice) * 30));
    return {
      level: lvl,
      price: p,
      lots: Math.max(25, lots),
      totalLots: 0,
      depthPercentage: Math.min(100, Math.round((lots / 600) * 100))
    };
  });

  const topAsks: OrderBookLevel[] = [1, 2, 3, 4, 5].map(lvl => {
    const p = Number((currentPrice + lvl * spreadStep).toFixed(2));
    const lots = Math.round((450 - lvl * 40) * ((100 - sentimentScore) / 50) + (Math.cos(lvl + currentPrice) * 30));
    return {
      level: lvl,
      price: p,
      lots: Math.max(25, lots),
      totalLots: 0,
      depthPercentage: Math.min(100, Math.round((lots / 600) * 100))
    };
  });

  // Calculate cumulative lots for depth
  let cumBids = 0;
  topBids.forEach(b => {
    cumBids += b.lots;
    b.totalLots = cumBids;
  });

  let cumAsks = 0;
  topAsks.forEach(a => {
    cumAsks += a.lots;
    a.totalLots = cumAsks;
  });

  // Occasionally push a new tape tick when price moves or time passes
  if (Math.abs(priceDelta) > 0.02 || Math.random() < 0.3) {
    const side = priceDelta >= 0 ? (sentimentScore >= 45 ? 'BUY' : 'SELL') : (sentimentScore <= 55 ? 'SELL' : 'BUY');
    const pools = [
      'NY Interbank Aggressor',
      'CME Comex Block Flow',
      'London Fixing Pool',
      'Central Bank Bullion Desk',
      'EBS Spot Liquidity'
    ];
    const newTapeOrder: TapeOrder = {
      id: `tape_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: currentPrice,
      lots: Math.floor(Math.random() * 160) + 20,
      side: side as 'BUY' | 'SELL',
      aggressor: side === 'BUY' ? 'BUY_MARKET_TAKER' : 'SELL_MARKET_TAKER',
      pool: pools[Math.floor(Math.random() * pools.length)]
    };
    tapeHistory = [newTapeOrder, ...tapeHistory.slice(0, 19)];
  }

  return {
    sentimentScore,
    bias,
    biasLabel,
    confidence: Math.min(98, Math.max(82, Math.round(75 + Math.abs(sentimentScore - 50) * 0.6))),
    buyVolumeLots,
    sellVolumeLots,
    totalVolumeLots: baseTotalLots,
    buyRatio,
    sellRatio,
    netDeltaLots,
    cvdSlope,
    cvdContracts: currentCvd,
    bidDepthLots,
    askDepthLots,
    bidPressurePercentage,
    askPressurePercentage,
    imbalanceRatio,
    institutionalBias,
    institutionalAccumulationPct,
    retailLongPct,
    retailShortPct,
    crowdContrarianSignal,
    topBids,
    topAsks,
    recentTape: tapeHistory,
    lastUpdated: Date.now()
  };
}
