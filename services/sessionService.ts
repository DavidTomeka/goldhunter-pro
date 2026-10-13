import { TradingSession } from '../types';

export interface SessionSchedule {
  id: TradingSession;
  name: string;
  shortName: string;
  gmtRange: string;
  gmtStartMinutes: number; // minutes from 00:00 UTC
  gmtEndMinutes: number;
  liquidity: string;
  color: string;
  activeBadgeColor: string;
  activeBorderColor: string;
}

export const SESSIONS_CONFIG: SessionSchedule[] = [
  {
    id: 'ASIAN_RANGE',
    name: 'Asian Range',
    shortName: 'Asian',
    gmtRange: '00:00 - 06:30 GMT',
    gmtStartMinutes: 0,
    gmtEndMinutes: 390, // 06:30
    liquidity: 'Consolidation / Liquidity Pool Formation (Tokyo / Sydney)',
    color: 'border-amber-500/80 bg-amber-950/30 text-amber-300',
    activeBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    activeBorderColor: 'border-amber-500'
  },
  {
    id: 'LONDON_OPEN',
    name: 'London Open',
    shortName: 'London',
    gmtRange: '06:30 - 12:30 GMT',
    gmtStartMinutes: 390, // 06:30 (European pre-market / London bank desks & 07:00-11:00 Killzone)
    gmtEndMinutes: 750, // 12:30
    liquidity: 'Judas Swing & Initial Breakout Liquidity (Frankfurt & London)',
    color: 'border-blue-500/80 bg-blue-950/30 text-blue-300',
    activeBadgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    activeBorderColor: 'border-blue-500'
  },
  {
    id: 'NY_AM_KILLZONE',
    name: 'New York AM Killzone',
    shortName: 'NY AM',
    gmtRange: '12:30 - 16:30 GMT',
    gmtStartMinutes: 750, // 12:30 (08:30 EST - Peak volume, CPI, NFP, Silver Bullet)
    gmtEndMinutes: 990, // 16:30
    liquidity: 'Peak Gold Volume / Silver Bullet / US News (CPI/NFP/FOMC)',
    color: 'border-emerald-500/80 bg-emerald-950/30 text-emerald-300',
    activeBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    activeBorderColor: 'border-emerald-500'
  },
  {
    id: 'NY_PM_SESSION',
    name: 'New York PM Session',
    shortName: 'NY PM',
    gmtRange: '16:30 - 21:00 GMT',
    gmtStartMinutes: 990, // 16:30 (12:30 EST - Afternoon trend & daily range close)
    gmtEndMinutes: 1260, // 21:00
    liquidity: 'Mean Reversion & Daily Range Close (London Close / NY PM)',
    color: 'border-indigo-500/80 bg-indigo-950/30 text-indigo-300',
    activeBadgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    activeBorderColor: 'border-indigo-500'
  }
];

export interface LiveSessionState {
  activeSession: TradingSession;
  sessionName: string;
  timeRemainingFormatted: string;
  secondsRemaining: number;
  nextSession: TradingSession;
  nextSessionName: string;
  isWeekend: boolean;
  currentGmtHour: number;
  currentGmtMinute: number;
}

/**
 * Calculates current real-time market session and countdown based on UTC time
 */
export function getLiveSessionState(now: Date = new Date()): LiveSessionState {
  const dayOfWeek = now.getUTCDay(); // 0 is Sunday, 6 is Saturday
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcSeconds = now.getUTCSeconds();
  const currentMinutes = utcHours * 60 + utcMinutes;

  // Forex/Gold Market Weekend Close:
  // Friday 22:00 GMT to Sunday 22:00 GMT
  const isFridayAfterClose = dayOfWeek === 5 && currentMinutes >= 1320; // >= 22:00 GMT
  const isSaturday = dayOfWeek === 6;
  const isSundayBeforeOpen = dayOfWeek === 0 && currentMinutes < 1320; // < 22:00 GMT
  const isWeekend = isFridayAfterClose || isSaturday || isSundayBeforeOpen;

  if (isWeekend) {
    // Calculate time until Sunday 22:00 GMT open
    let minutesUntilOpen = 0;
    if (isFridayAfterClose) {
      minutesUntilOpen = (1440 - currentMinutes) + 1440 + 1320;
    } else if (isSaturday) {
      minutesUntilOpen = (1440 - currentMinutes) + 1320;
    } else {
      minutesUntilOpen = 1320 - currentMinutes;
    }

    const hours = Math.floor(minutesUntilOpen / 60);
    const mins = minutesUntilOpen % 60;

    return {
      activeSession: 'MARKET_CLOSE',
      sessionName: 'Market Closed (Weekend)',
      timeRemainingFormatted: `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m to Open`,
      secondsRemaining: minutesUntilOpen * 60 - utcSeconds,
      nextSession: 'ASIAN_RANGE',
      nextSessionName: 'Asian Range (Sunday 22:00 GMT)',
      isWeekend: true,
      currentGmtHour: utcHours,
      currentGmtMinute: utcMinutes
    };
  }

  // Determine active session during trading days
  // 1. Asian Range: 00:00 - 06:30 GMT OR 21:00 - 24:00 GMT (Sydney / Early Asia)
  // 2. London Open: 06:30 - 12:30 GMT
  // 3. NY AM Killzone: 12:30 - 16:30 GMT
  // 4. NY PM Session: 16:30 - 21:00 GMT
  // 5. Late Asian / Sydney: 21:00 - 24:00 GMT -> counts as Asian Range formation
  let activeSession: TradingSession = 'ASIAN_RANGE';
  let sessionName = 'Asian Range';
  let endMinutes = 390; // 06:30
  let nextSession: TradingSession = 'LONDON_OPEN';
  let nextSessionName = 'London Open';

  if (currentMinutes >= 390 && currentMinutes < 750) {
    // 06:30 to 12:30 GMT -> London Open
    activeSession = 'LONDON_OPEN';
    sessionName = 'London Open';
    endMinutes = 750;
    nextSession = 'NY_AM_KILLZONE';
    nextSessionName = 'New York AM Killzone';
  } else if (currentMinutes >= 750 && currentMinutes < 990) {
    // 12:30 to 16:30 GMT -> NY AM Killzone
    activeSession = 'NY_AM_KILLZONE';
    sessionName = 'New York AM Killzone';
    endMinutes = 990;
    nextSession = 'NY_PM_SESSION';
    nextSessionName = 'New York PM Session';
  } else if (currentMinutes >= 990 && currentMinutes < 1260) {
    // 16:30 to 21:00 GMT -> NY PM Session
    activeSession = 'NY_PM_SESSION';
    sessionName = 'New York PM Session';
    endMinutes = 1260;
    nextSession = 'ASIAN_RANGE';
    nextSessionName = 'Asian Range';
  } else {
    // 21:00 to 06:30 GMT -> Asian Range (Sydney / Tokyo liquidity)
    activeSession = 'ASIAN_RANGE';
    sessionName = 'Asian Range';
    // If between 21:00 and 24:00, session ends at 06:30 of next day
    if (currentMinutes >= 1260) {
      endMinutes = 1440 + 390; // next day 06:30
    } else {
      endMinutes = 390; // today 06:30
    }
    nextSession = 'LONDON_OPEN';
    nextSessionName = 'London Open';
  }

  // Calculate remaining time
  const remainingMinutes = Math.max(0, endMinutes - currentMinutes);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;
  const remainingSecs = (60 - utcSeconds) % 60;
  const secondsRemaining = Math.max(0, remainingMinutes * 60 - utcSeconds);

  const formatted = `${String(remainingHours).padStart(2, '0')}h ${String(remainingMins).padStart(2, '0')}m ${String(remainingSecs).padStart(2, '0')}s`;

  return {
    activeSession,
    sessionName,
    timeRemainingFormatted: formatted,
    secondsRemaining,
    nextSession,
    nextSessionName,
    isWeekend: false,
    currentGmtHour: utcHours,
    currentGmtMinute: utcMinutes
  };
}
