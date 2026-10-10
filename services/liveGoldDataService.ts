import { OHLC, TimeFrame } from '../types';

export interface BrokerFeedConfig {
  sourceName: string;
  tradingViewSymbol: string;
  brokerOffset: number; // in USD points, e.g. +0.40 or -0.80
  isAutoLive: boolean;
}

const STORAGE_KEY_OFFSET = 'goldhunter_broker_offset';
const STORAGE_KEY_BROKER = 'goldhunter_broker_name';
const STORAGE_KEY_FEED_MODE = 'goldhunter_feed_mode';

export const POPULAR_BROKERS = [
  { name: 'OANDA Interbank (Standard MT5)', tvSymbol: 'OANDA:XAUUSD' },
  { name: 'Pepperstone (Raw Spread MT5)', tvSymbol: 'PEPPERSTONE:XAUUSD' },
  { name: 'Forex.com / StoneX MT5', tvSymbol: 'FOREXCOM:XAUUSD' },
  { name: 'FXCM Spot Gold (Interbank)', tvSymbol: 'FX:XAUUSD' },
  { name: 'TVC Live CME Spot Gold', tvSymbol: 'TVC:GOLD' },
  { name: 'Binance PAXG Spot Gold (24/7 Live)', tvSymbol: 'BINANCE:PAXGUSDT' },
  { name: 'Exness / IC Markets MT5 (Custom Offset)', tvSymbol: 'OANDA:XAUUSD' }
];

export function getSavedBrokerOffset(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY_OFFSET);
    return val ? parseFloat(val) : 0;
  } catch {
    return 0;
  }
}

export function saveBrokerOffset(offset: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_OFFSET, offset.toString());
  } catch (e) {
    console.error('Failed to save broker offset', e);
  }
}

export function getSavedBrokerName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_BROKER) || 'OANDA Interbank (Standard MT5)';
  } catch {
    return 'OANDA Interbank (Standard MT5)';
  }
}

export function saveBrokerName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_BROKER, name);
  } catch (e) {
    console.error('Failed to save broker name', e);
  }
}

/**
 * Fetch raw live gold spot price from live interbank liquidity feed
 */
export async function fetchLiveGoldPrice(offset = 0): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawPrice = parseFloat(data.price);
    if (!isNaN(rawPrice) && rawPrice > 500) {
      return Number((rawPrice + offset).toFixed(2));
    }
  } catch (err) {
    console.warn('Live gold price fetch notice (will fallback to latest cache):', err);
  }
  return null;
}

/**
 * Calculate standard Exponential Moving Average (EMA)
 */
function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  let ema = prices[0];
  emaArray.push(ema);

  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    emaArray.push(Number(ema.toFixed(2)));
  }
  return emaArray;
}

/**
 * Calculate Relative Strength Index (RSI) for period (default 14)
 */
function calculateRSI(closes: number[], period = 14): number[] {
  const rsis: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period && i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsis.push(avgLoss === 0 ? 100 : Number((100 - (100 / (1 + avgGain / avgLoss))).toFixed(1)));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsis.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsis.push(Number((100 - (100 / (1 + rs))).toFixed(1)));
    }
  }

  // Prepend values for the initial period
  while (rsis.length < closes.length) {
    rsis.unshift(50);
  }

  return rsis;
}

/**
 * Map TimeFrame enum to Binance klines interval
 */
function mapTimeframeToBinanceInterval(tf: TimeFrame): string {
  switch (tf) {
    case TimeFrame.M1: return '1m';
    case TimeFrame.M5: return '5m';
    case TimeFrame.M15: return '15m';
    case TimeFrame.H1: return '1h';
    case TimeFrame.H4: return '4h';
    case TimeFrame.D1: return '1d';
    default: return '5m';
  }
}

/**
 * Fetch authentic real-time live OHLC gold candles from live interbank liquidity feed
 */
export async function fetchLiveGoldCandles(
  timeframe: TimeFrame,
  limit = 55,
  offset = 0
): Promise<OHLC[] | null> {
  const interval = mapTimeframeToBinanceInterval(timeframe);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=${interval}&limit=${limit}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rawData = await res.json();

    if (!Array.isArray(rawData) || rawData.length === 0) return null;

    const parsedCloses: number[] = [];

    const rawCandles: { time: number; open: number; high: number; low: number; close: number; volume: number }[] = rawData.map(item => {
      const time = parseInt(item[0], 10);
      const open = Number((parseFloat(item[1]) + offset).toFixed(2));
      const high = Number((parseFloat(item[2]) + offset).toFixed(2));
      const low = Number((parseFloat(item[3]) + offset).toFixed(2));
      const close = Number((parseFloat(item[4]) + offset).toFixed(2));
      const volume = parseFloat(item[5]);

      parsedCloses.push(close);
      return { time, open, high, low, close, volume };
    });

    const ema20s = calculateEMA(parsedCloses, 20);
    const ema50s = calculateEMA(parsedCloses, 50);
    const rsiList = calculateRSI(parsedCloses, 14);

    const ohlcList: OHLC[] = rawCandles.map((c, i) => {
      const change = c.close - c.open;
      const range = c.high - c.low;
      const isBreakout = Math.abs(change) > (range * 0.7) && range > 2.5;
      const isSweep = (c.high - Math.max(c.open, c.close) > 1.8) || (Math.min(c.open, c.close) - c.low > 1.8);
      const isBasing = range < 1.4;

      // FVG detection relative to candle 2 bars ago
      let isFvg = false;
      if (i >= 2) {
        const prev2 = rawCandles[i - 2];
        if (c.low > prev2.high) isFvg = true; // Bullish FVG
        else if (c.high < prev2.low) isFvg = true; // Bearish FVG
      }

      return {
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        isBreakout,
        isSweep,
        isBasing,
        isFvg,
        ema20: ema20s[i],
        ema50: ema50s[i],
        rsi: rsiList[i]
      };
    });

    return ohlcList;
  } catch (err) {
    console.warn('Failed to fetch live klines (fallback will maintain continuity):', err);
    return null;
  }
}
