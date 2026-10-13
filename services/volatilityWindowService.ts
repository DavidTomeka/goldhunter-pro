import { OHLC } from '../types';

export interface VolatilityWindow {
  id: string;
  name: string;
  shortLabel: string;
  gmtStartMinutes: number; // minutes from 00:00 UTC
  gmtEndMinutes: number;
  gmtTimeRange: string;
  localTimeDescription: string;
  intensity: 'ULTRA_PEAK' | 'HIGH' | 'ELEVATED';
  avgPipsExpansion: number;
  gradientId: string;
  primaryColor: string;
  borderColor: string;
  fillOpacity: number;
  textColor: string;
  badgeBg: string;
  description: string;
  tradeTimingEdge: string;
}

export const HISTORICAL_VOLATILITY_WINDOWS: VolatilityWindow[] = [
  {
    id: 'LONDON_OPEN_EXPANSION',
    name: 'London Open & Judas Swing Expansion',
    shortLabel: 'London Open Expansion',
    gmtStartMinutes: 390, // 06:30 GMT
    gmtEndMinutes: 570,   // 09:30 GMT
    gmtTimeRange: '06:30 - 09:30 GMT',
    localTimeDescription: '07:30 - 10:30 BST / 02:30 - 05:30 EST',
    intensity: 'HIGH',
    avgPipsExpansion: 54.0,
    gradientId: 'volatilityLondonGrad',
    primaryColor: '#38bdf8', // sky-400
    borderColor: '#0284c7', // sky-600
    fillOpacity: 0.12,
    textColor: 'text-sky-300',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    description: 'European market open & Frankfurt initial burst. Asian session highs and lows are swept before true institutional direction takes place.',
    tradeTimingEdge: 'Wait for Asian High/Low manipulation sweep, then enter on 4/4 S&D retest toward opposite liquidity pool.'
  },
  {
    id: 'LONDON_NY_OVERLAP',
    name: 'London & New York Overlap (Peak Volatility)',
    shortLabel: 'London/NY Overlap (Peak)',
    gmtStartMinutes: 720, // 12:00 GMT (08:00 EST / 13:00 BST)
    gmtEndMinutes: 960,   // 16:00 GMT (12:00 EST / 17:00 BST)
    gmtTimeRange: '12:00 - 16:00 GMT',
    localTimeDescription: '08:00 - 12:00 EST / 13:00 - 17:00 BST',
    intensity: 'ULTRA_PEAK',
    avgPipsExpansion: 88.5,
    gradientId: 'volatilityOverlapGrad',
    primaryColor: '#818cf8', // indigo-400
    borderColor: '#6366f1', // indigo-500
    fillOpacity: 0.16,
    textColor: 'text-indigo-300',
    badgeBg: 'bg-indigo-500/25 text-indigo-300 border-indigo-500/50',
    description: 'The highest liquidity and volatility session in world financial markets. US macroeconomic announcements (CPI, NFP, Retail Sales) drop at 12:30/13:30 GMT with maximum spread tightening and aggressive institutional displacement.',
    tradeTimingEdge: 'Prime execution window for ICT Silver Bullet (14:00-15:00 GMT) and HTF unmitigated origin supply/demand bounces.'
  },
  {
    id: 'LONDON_CLOSE_FIXING',
    name: 'London Close & NY Afternoon Fixing',
    shortLabel: 'London Close Fixing',
    gmtStartMinutes: 960,  // 16:00 GMT
    gmtEndMinutes: 1050,  // 17:30 GMT
    gmtTimeRange: '16:00 - 17:30 GMT',
    localTimeDescription: '12:00 - 13:30 EST / 17:00 - 18:30 BST',
    intensity: 'ELEVATED',
    avgPipsExpansion: 42.0,
    gradientId: 'volatilityLondonCloseGrad',
    primaryColor: '#f59e0b', // amber-500
    borderColor: '#d97706', // amber-600
    fillOpacity: 0.10,
    textColor: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'European bank square-off and 16:00 London fixing benchmark. Often triggers sharp profit-taking reversals or sudden liquidity purges before the daily close.',
    tradeTimingEdge: 'Ideal for tightening stops on day trades and hunting mean-reversion retests back into equilibrium.'
  }
];

export interface ChartVolatilitySpan {
  window: VolatilityWindow;
  startIndex: number;
  endIndex: number;
  startCandleTime: number;
  endCandleTime: number;
  candleCount: number;
  isActiveCurrent: boolean;
}

/**
 * Given an array of candles, detects contiguous chart indices that fall into historical high volatility windows.
 */
export function detectVolatilitySpans(candles: OHLC[]): ChartVolatilitySpan[] {
  if (!candles || candles.length === 0) return [];

  const spans: ChartVolatilitySpan[] = [];
  const nowUtc = Date.now();

  // For each volatility window, find contiguous indices
  HISTORICAL_VOLATILITY_WINDOWS.forEach(win => {
    let currentStartIdx: number | null = null;

    candles.forEach((candle, idx) => {
      const date = new Date(candle.time);
      const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();

      const inWindow = utcMinutes >= win.gmtStartMinutes && utcMinutes < win.gmtEndMinutes;

      if (inWindow) {
        if (currentStartIdx === null) {
          currentStartIdx = idx;
        }
      } else {
        if (currentStartIdx !== null) {
          const endIdx = idx - 1;
          const isLatest = endIdx === candles.length - 1;
          spans.push({
            window: win,
            startIndex: currentStartIdx,
            endIndex: endIdx,
            startCandleTime: candles[currentStartIdx].time,
            endCandleTime: candles[endIdx].time,
            candleCount: endIdx - currentStartIdx + 1,
            isActiveCurrent: isLatest
          });
          currentStartIdx = null;
        }
      }
    });

    // If span reached end of candles
    if (currentStartIdx !== null) {
      const endIdx = candles.length - 1;
      spans.push({
        window: win,
        startIndex: currentStartIdx,
        endIndex: endIdx,
        startCandleTime: candles[currentStartIdx].time,
        endCandleTime: candles[endIdx].time,
        candleCount: endIdx - currentStartIdx + 1,
        isActiveCurrent: true
      });
    }
  });

  // Sort spans by starting index
  return spans.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Returns current real-time volatility status
 */
export function getCurrentVolatilityStatus(now: Date = new Date()): {
  activeWindow: VolatilityWindow | null;
  nextWindow: VolatilityWindow;
  minutesUntilNext: number;
  isPeakOverlap: boolean;
} {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  let activeWindow: VolatilityWindow | null = null;
  for (const win of HISTORICAL_VOLATILITY_WINDOWS) {
    if (utcMinutes >= win.gmtStartMinutes && utcMinutes < win.gmtEndMinutes) {
      activeWindow = win;
      break;
    }
  }

  // Find next upcoming window
  let nextWindow = HISTORICAL_VOLATILITY_WINDOWS[0];
  let minDiff = 1440;

  for (const win of HISTORICAL_VOLATILITY_WINDOWS) {
    let diff = win.gmtStartMinutes - utcMinutes;
    if (diff < 0) {
      diff += 1440; // tomorrow
    }
    if (diff < minDiff && diff > 0) {
      minDiff = diff;
      nextWindow = win;
    }
  }

  return {
    activeWindow,
    nextWindow,
    minutesUntilNext: minDiff === 1440 ? 0 : minDiff,
    isPeakOverlap: activeWindow?.id === 'LONDON_NY_OVERLAP'
  };
}
