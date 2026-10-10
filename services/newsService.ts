import { EconomicNewsEvent, CityTimeZone } from '../types';

export const MAJOR_WORLD_CITIES: CityTimeZone[] = [
  // AMERICAS
  { id: 'nyc', city: 'New York', country: 'United States', region: 'Americas', iana: 'America/New_York', flag: '🇺🇸', utcOffset: 'UTC-4', financialHub: 'NYSE & US Fed NY' },
  { id: 'chi', city: 'Chicago', country: 'United States', region: 'Americas', iana: 'America/Chicago', flag: '🇺🇸', utcOffset: 'UTC-5', financialHub: 'CME Group (Gold Futures)' },
  { id: 'lax', city: 'Los Angeles', country: 'United States', region: 'Americas', iana: 'America/Los_Angeles', flag: '🇺🇸', utcOffset: 'UTC-7' },
  { id: 'tor', city: 'Toronto', country: 'Canada', region: 'Americas', iana: 'America/Toronto', flag: '🇨🇦', utcOffset: 'UTC-4', financialHub: 'TSX' },
  { id: 'mex', city: 'Mexico City', country: 'Mexico', region: 'Americas', iana: 'America/Mexico_City', flag: '🇲🇽', utcOffset: 'UTC-6' },
  { id: 'sao', city: 'São Paulo', country: 'Brazil', region: 'Americas', iana: 'America/Sao_Paulo', flag: '🇧🇷', utcOffset: 'UTC-3', financialHub: 'B3' },
  { id: 'bue', city: 'Buenos Aires', country: 'Argentina', region: 'Americas', iana: 'America/Argentina/Buenos_Aires', flag: '🇦🇷', utcOffset: 'UTC-3' },
  { id: 'van', city: 'Vancouver', country: 'Canada', region: 'Americas', iana: 'America/Vancouver', flag: '🇨🇦', utcOffset: 'UTC-7' },

  // EUROPE
  { id: 'lon', city: 'London', country: 'United Kingdom', region: 'Europe', iana: 'Europe/London', flag: '🇬🇧', utcOffset: 'UTC+1', financialHub: 'LBMA (Gold Fix) & LSE' },
  { id: 'fra', city: 'Frankfurt', country: 'Germany', region: 'Europe', iana: 'Europe/Berlin', flag: '🇩🇪', utcOffset: 'UTC+2', financialHub: 'ECB Headquarters & Deutsche Börse' },
  { id: 'par', city: 'Paris', country: 'France', region: 'Europe', iana: 'Europe/Paris', flag: '🇫🇷', utcOffset: 'UTC+2', financialHub: 'Euronext' },
  { id: 'zur', city: 'Zurich', country: 'Switzerland', region: 'Europe', iana: 'Europe/Zurich', flag: '🇨🇭', utcOffset: 'UTC+2', financialHub: 'Swiss Gold Refineries & SNB' },
  { id: 'ams', city: 'Amsterdam', country: 'Netherlands', region: 'Europe', iana: 'Europe/Amsterdam', flag: '🇳🇱', utcOffset: 'UTC+2' },
  { id: 'mad', city: 'Madrid', country: 'Spain', region: 'Europe', iana: 'Europe/Madrid', flag: '🇪🇸', utcOffset: 'UTC+2' },
  { id: 'mil', city: 'Milan', country: 'Italy', region: 'Europe', iana: 'Europe/Rome', flag: '🇮🇹', utcOffset: 'UTC+2' },
  { id: 'gen', city: 'Geneva', country: 'Switzerland', region: 'Europe', iana: 'Europe/Zurich', flag: '🇨🇭', utcOffset: 'UTC+2' },
  { id: 'ist', city: 'Istanbul', country: 'Turkey', region: 'Europe', iana: 'Europe/Istanbul', flag: '🇹🇷', utcOffset: 'UTC+3', financialHub: 'Borsa Istanbul Gold Exchange' },
  { id: 'utc', city: 'GMT / UTC Universal', country: 'Global Standard', region: 'Europe', iana: 'UTC', flag: '🌐', utcOffset: 'UTC+0', financialHub: 'Universal Benchmark' },

  // MIDDLE EAST
  { id: 'dxb', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', iana: 'Asia/Dubai', flag: '🇦🇪', utcOffset: 'UTC+4', financialHub: 'DMCC City of Gold' },
  { id: 'ruh', city: 'Riyadh', country: 'Saudi Arabia', region: 'Middle East', iana: 'Asia/Riyadh', flag: '🇸🇦', utcOffset: 'UTC+3', financialHub: 'Tadawul' },
  { id: 'doh', city: 'Doha', country: 'Qatar', region: 'Middle East', iana: 'Asia/Qatar', flag: '🇶🇦', utcOffset: 'UTC+3' },
  { id: 'tlv', city: 'Tel Aviv', country: 'Israel', region: 'Middle East', iana: 'Asia/Jerusalem', flag: '🇮🇱', utcOffset: 'UTC+3' },

  // AFRICA
  { id: 'jnb', city: 'Johannesburg', country: 'South Africa', region: 'Africa', iana: 'Africa/Johannesburg', flag: '🇿🇦', utcOffset: 'UTC+2', financialHub: 'JSE & Rand Gold' },
  { id: 'cai', city: 'Cairo', country: 'Egypt', region: 'Africa', iana: 'Africa/Cairo', flag: '🇪🇬', utcOffset: 'UTC+3' },
  { id: 'los', city: 'Lagos', country: 'Nigeria', region: 'Africa', iana: 'Africa/Lagos', flag: '🇳🇬', utcOffset: 'UTC+1' },
  { id: 'nbo', city: 'Nairobi', country: 'Kenya', region: 'Africa', iana: 'Africa/Nairobi', flag: '🇰🇪', utcOffset: 'UTC+3' },
  { id: 'acc', city: 'Accra', country: 'Ghana', region: 'Africa', iana: 'Africa/Accra', flag: '🇬🇭', utcOffset: 'UTC+0' },

  // ASIA
  { id: 'tyo', city: 'Tokyo', country: 'Japan', region: 'Asia', iana: 'Asia/Tokyo', flag: '🇯🇵', utcOffset: 'UTC+9', financialHub: 'Bank of Japan & JPX' },
  { id: 'sin', city: 'Singapore', country: 'Singapore', region: 'Asia', iana: 'Asia/Singapore', flag: '🇸🇬', utcOffset: 'UTC+8', financialHub: 'SGX Asian Bullion Hub' },
  { id: 'hkg', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia', iana: 'Asia/Hong_Kong', flag: '🇭🇰', utcOffset: 'UTC+8', financialHub: 'HKEX & Chinese Gold Society' },
  { id: 'sha', city: 'Shanghai', country: 'China', region: 'Asia', iana: 'Asia/Shanghai', flag: '🇨🇳', utcOffset: 'UTC+8', financialHub: 'Shanghai Gold Exchange (SGE)' },
  { id: 'bom', city: 'Mumbai', country: 'India', region: 'Asia', iana: 'Asia/Kolkata', flag: '🇮🇳', utcOffset: 'UTC+5:30', financialHub: 'MCX Gold & NSE' },
  { id: 'sel', city: 'Seoul', country: 'South Korea', region: 'Asia', iana: 'Asia/Seoul', flag: '🇰🇷', utcOffset: 'UTC+9', financialHub: 'KRX' },
  { id: 'bkk', city: 'Bangkok', country: 'Thailand', region: 'Asia', iana: 'Asia/Bangkok', flag: '🇹🇭', utcOffset: 'UTC+7' },
  { id: 'jkt', city: 'Jakarta', country: 'Indonesia', region: 'Asia', iana: 'Asia/Jakarta', flag: '🇮🇩', utcOffset: 'UTC+7' },
  { id: 'kul', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia', iana: 'Asia/Kuala_Lumpur', flag: '🇲🇾', utcOffset: 'UTC+8' },

  // PACIFIC
  { id: 'syd', city: 'Sydney', country: 'Australia', region: 'Pacific', iana: 'Australia/Sydney', flag: '🇦🇺', utcOffset: 'UTC+10', financialHub: 'ASX & Perth Mint' },
  { id: 'mel', city: 'Melbourne', country: 'Australia', region: 'Pacific', iana: 'Australia/Melbourne', flag: '🇦🇺', utcOffset: 'UTC+10' },
  { id: 'akl', city: 'Auckland', country: 'New Zealand', region: 'Pacific', iana: 'Pacific/Auckland', flag: '🇳🇿', utcOffset: 'UTC+12' }
];

export function getDefaultUserCity(): CityTimeZone {
  // Try to match user's browser IANA timezone
  try {
    const userIana = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const found = MAJOR_WORLD_CITIES.find(c => c.iana === userIana);
    if (found) return found;
  } catch (e) {
    // fallback
  }
  // Default to New York (primary Gold driver)
  return MAJOR_WORLD_CITIES[0];
}

/**
 * Generate a rich, dynamic schedule of high/medium impact macroeconomic news events
 * positioned dynamically relative to the current live clock so countdowns are fresh and actionable.
 */
export function generateLiveEconomicNews(now = Date.now()): EconomicNewsEvent[] {
  const ONE_MIN = 60 * 1000;
  const ONE_HOUR = 60 * ONE_MIN;

  return [
    {
      id: 'news_cpi_core',
      title: 'US Core CPI (Consumer Price Index) m/m',
      currency: 'USD',
      impact: 'HIGH',
      timestamp: now + 18 * ONE_MIN, // Dropping in 18 minutes!
      dateLabel: 'Today (Live Drop)',
      forecast: '0.3%',
      previous: '0.2%',
      goldImpact: 'CRITICAL GOLD CATALYST: Higher CPI drives Fed rate hike odds and DXY rally, triggering sharp gold liquidation into 4/4 demand. Lower CPI causes explosive gold rally.',
      expectedVolatilityPips: 240,
      institutionalRule: 'BLACKOUT ACTIVE: Halt execution on unmitigated zones 10m before release. Wait 15m post-spike for basing confirmation.'
    },
    {
      id: 'news_retail_sales',
      title: 'US Core Retail Sales m/m',
      currency: 'USD',
      impact: 'HIGH',
      timestamp: now + 75 * ONE_MIN, // Dropping in 1h 15m
      dateLabel: 'Today',
      forecast: '0.4%',
      previous: '0.1%',
      goldImpact: 'Strong consumer demand strengthens USD, pressuring Gold. Weak retail print acts as a bullish catalyst towards higher supply zones.',
      expectedVolatilityPips: 160,
      institutionalRule: 'Look for liquidity sweeps above previous Asian session highs before looking for Rally-Base-Drop supply confirmations.'
    },
    {
      id: 'news_jobless_claims',
      title: 'US Initial Jobless Claims',
      currency: 'USD',
      impact: 'MEDIUM',
      timestamp: now + 3 * ONE_HOUR + 15 * ONE_MIN,
      dateLabel: 'Today',
      forecast: '219K',
      previous: '222K',
      goldImpact: 'Higher jobless claims indicate cooling labor market, giving Gold intraday upward momentum.',
      expectedVolatilityPips: 95,
      institutionalRule: 'Standard 4/4 S&D criteria holds. Look for M5/M15 Fair Value Gap confluence.'
    },
    {
      id: 'news_flash_pmi',
      title: 'US S&P Global Flash Manufacturing & Services PMI',
      currency: 'USD',
      impact: 'MEDIUM',
      timestamp: now + 5 * ONE_HOUR,
      dateLabel: 'Today',
      forecast: '51.8',
      previous: '51.2',
      goldImpact: 'Surprise contractions below 50.0 trigger rapid gold safe-haven buying.',
      expectedVolatilityPips: 110,
      institutionalRule: 'Monitor 20 EMA dynamic support on M15 timeframe.'
    },
    {
      id: 'news_powell_speech',
      title: 'Fed Chair Jerome Powell Press Conference & Speech',
      currency: 'USD',
      impact: 'HIGH',
      timestamp: now + 8 * ONE_HOUR + 30 * ONE_MIN,
      dateLabel: 'Today (NY PM)',
      forecast: 'Hawkish Tilt Expected',
      previous: 'Neutral Stance',
      goldImpact: 'MAXIMUM VOLATILITY: Powell commentary produces two-sided whip-saws (Judas Swings) across both supply and demand boundaries.',
      expectedVolatilityPips: 320,
      institutionalRule: 'AVOID MARKET ORDERS: Strict limit orders only with wide buffer or wait for post-speech consolidation base.'
    },
    {
      id: 'news_nfp_advance',
      title: 'US Non-Farm Payrolls (NFP) & Unemployment Rate',
      currency: 'USD',
      impact: 'HIGH',
      timestamp: now + 24 * ONE_HOUR + 45 * ONE_MIN,
      dateLabel: 'Tomorrow (NY AM)',
      forecast: '175K',
      previous: '187K',
      goldImpact: 'TIER-1 MACRO EVENT: Single largest volume expansion for XAU/USD. Deviations of +/- 40K create 250+ pip directional trends.',
      expectedVolatilityPips: 350,
      institutionalRule: 'Full execution moratorium 15m before and 20m after NFP release.'
    },
    {
      id: 'news_ecb_rate',
      title: 'ECB Main Refinancing Rate & Monetary Policy Statement',
      currency: 'EUR',
      impact: 'HIGH',
      timestamp: now + 28 * ONE_HOUR,
      dateLabel: 'Tomorrow',
      forecast: '3.75%',
      previous: '3.75%',
      goldImpact: 'Indirect impact through EUR/USD cross rates and DXY weighting.',
      expectedVolatilityPips: 130,
      institutionalRule: 'Watch London session London-NY overlap zones.'
    },
    {
      id: 'news_pce_price',
      title: 'US Core PCE Price Index m/m (Fed Preferred Inflation Metric)',
      currency: 'USD',
      impact: 'HIGH',
      timestamp: now + 48 * ONE_HOUR,
      dateLabel: 'This Week',
      forecast: '0.2%',
      previous: '0.3%',
      goldImpact: 'Directly influences FOMC rate projection dot plot. Soft PCE leads to massive gold breakouts.',
      expectedVolatilityPips: 280,
      institutionalRule: 'Prime candidate for Drop-Base-Rally demand continuation.'
    }
  ];
}

/**
 * Format a timestamp into the target city's time zone cleanly
 */
export function formatInCityTime(timestamp: number, ianaTimezone: string): {
  timeStr: string;
  dateStr: string;
  shortTz: string;
} {
  try {
    const d = new Date(timestamp);
    const timeStr = d.toLocaleTimeString('en-US', {
      timeZone: ianaTimezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const dateStr = d.toLocaleDateString('en-US', {
      timeZone: ianaTimezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    // Short timezone name
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      timeZoneName: 'short'
    }).formatToParts(d);
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || '';

    return { timeStr, dateStr, shortTz: tzPart };
  } catch (err) {
    return {
      timeStr: new Date(timestamp).toISOString().substring(11, 19),
      dateStr: new Date(timestamp).toDateString(),
      shortTz: 'UTC'
    };
  }
}

/**
 * Live Countdown helper
 */
export function getCountdownDetails(targetTimestamp: number, currentNow = Date.now()): {
  text: string;
  isPast: boolean;
  minutesDiff: number;
  status: 'DROPPING_SOON' | 'ACTIVE_NOW' | 'PASSED' | 'UPCOMING';
  isBlackout: boolean;
} {
  const diffMs = targetTimestamp - currentNow;
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);
  const minutesDiff = Math.round(diffMs / 60000);

  const hours = Math.floor(absDiff / 3600000);
  const minutes = Math.floor((absDiff % 3600000) / 60000);
  const seconds = Math.floor((absDiff % 60000) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeFormatted = hours > 0 
    ? `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
    : `${pad(minutes)}m ${pad(seconds)}s`;

  // Blackout rule: 15 mins before to 15 mins after
  const isBlackout = Math.abs(minutesDiff) <= 15;

  if (Math.abs(minutesDiff) <= 2) {
    return {
      text: 'DROPPING RIGHT NOW',
      isPast,
      minutesDiff,
      status: 'ACTIVE_NOW',
      isBlackout: true
    };
  }

  if (isPast) {
    return {
      text: `Dropped ${timeFormatted} ago`,
      isPast: true,
      minutesDiff,
      status: 'PASSED',
      isBlackout
    };
  }

  if (minutesDiff <= 20) {
    return {
      text: `Dropping in ${timeFormatted}`,
      isPast: false,
      minutesDiff,
      status: 'DROPPING_SOON',
      isBlackout
    };
  }

  return {
    text: `Dropping in ${timeFormatted}`,
    isPast: false,
    minutesDiff,
    status: 'UPCOMING',
    isBlackout: false
  };
}
