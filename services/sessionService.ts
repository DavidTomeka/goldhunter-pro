import { TradingSession } from '../types';

export interface SessionSchedule {
  id: TradingSession;
  name: string;
  shortName: string;
  gmtRange: string;
  localLondonRange: string;
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
    gmtRange: '21:00 - 06:00 GMT',
    localLondonRange: '22:00 - 07:00 BST / 21:00 - 06:00 GMT',
    gmtStartMinutes: 0,
    gmtEndMinutes: 360, // 06:00 GMT
    liquidity: 'Consolidation / Liquidity Pool Formation (Tokyo / Sydney / Asian Range)',
    color: 'border-amber-500/80 bg-amber-950/30 text-amber-300',
    activeBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    activeBorderColor: 'border-amber-500'
  },
  {
    id: 'LONDON_OPEN',
    name: 'London Open & Killzone',
    shortName: 'London',
    gmtRange: '06:00 - 12:00 GMT',
    localLondonRange: '07:00 - 13:00 BST / 06:00 - 12:00 GMT',
    gmtStartMinutes: 360, // 06:00 GMT (Frankfurt open & London bank desk initialization, 07:00-10:00 Killzone)
    gmtEndMinutes: 720, // 12:00 GMT
    liquidity: 'Judas Swing & Initial Breakout Liquidity (Frankfurt & London Desks)',
    color: 'border-blue-500/80 bg-blue-950/30 text-blue-300',
    activeBadgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    activeBorderColor: 'border-blue-500'
  },
  {
    id: 'NY_AM_KILLZONE',
    name: 'New York AM Killzone',
    shortName: 'NY AM',
    gmtRange: '12:00 - 16:30 GMT',
    localLondonRange: '13:00 - 17:30 BST / 12:00 - 16:30 GMT',
    gmtStartMinutes: 720, // 12:00 GMT (08:00 EST - Peak volume, CPI, NFP, Silver Bullet)
    gmtEndMinutes: 990, // 16:30 GMT
    liquidity: 'Peak Gold Volume / Silver Bullet / US News Releases (CPI/NFP/FOMC)',
    color: 'border-emerald-500/80 bg-emerald-950/30 text-emerald-300',
    activeBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    activeBorderColor: 'border-emerald-500'
  },
  {
    id: 'NY_PM_SESSION',
    name: 'New York PM Session',
    shortName: 'NY PM',
    gmtRange: '16:30 - 21:00 GMT',
    localLondonRange: '17:30 - 22:00 BST / 16:30 - 21:00 GMT',
    gmtStartMinutes: 990, // 16:30 GMT (12:30 EST - Afternoon trend & daily range close)
    gmtEndMinutes: 1260, // 21:00 GMT
    liquidity: 'Mean Reversion & Daily Range Close (London Close / NY PM Desk)',
    color: 'border-indigo-500/80 bg-indigo-950/30 text-indigo-300',
    activeBadgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    activeBorderColor: 'border-indigo-500'
  }
];

export interface TimeDiagnosticInfo {
  rawDeviceLocalTime: string;
  userTimezone: string;
  userUtcOffsetMinutes: number;
  userUtcOffsetFormatted: string; // e.g. "UTC+01:00" or "UTC-07:00"
  rawUtcTime: string;
  utcHours: number;
  utcMinutes: number;
  utcSeconds: number;
  currentUtcMinutes: number; // total minutes from 00:00 UTC (0 - 1439)
  londonTime: string;
  londonIsDst: boolean; // BST (UTC+1) vs GMT (UTC+0)
  nyTime: string;
  determinedSession: TradingSession;
  sessionMatchReason: string;
  londonSessionStatus: {
    status: 'ACTIVE' | 'STANDBY' | 'CLOSED';
    windowGmt: string;
    windowLondon: string;
    details: string;
  };
}

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
  diagnostic: TimeDiagnosticInfo;
}

/**
 * Helper to format minutes offset to human readable UTC offset (e.g. UTC+01:00 or UTC-07:00)
 */
export function formatUtcOffset(offsetMinutes: number): string {
  // Date.getTimezoneOffset() returns minutes by which UTC is ahead of local time
  // e.g., for UTC+1 (BST), getTimezoneOffset() is -60
  // e.g., for UTC-7 (PDT), getTimezoneOffset() is +420
  const actualOffsetMinutes = -offsetMinutes;
  const sign = actualOffsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(actualOffsetMinutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculates current real-time market session and countdown based on precise UTC time
 * with full diagnostic breakdown of local time vs UTC offset.
 */
export function getLiveSessionState(now: Date = new Date()): LiveSessionState {
  // Day of week in UTC: 0 = Sunday, 6 = Saturday
  const dayOfWeek = now.getUTCDay();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcSeconds = now.getUTCSeconds();
  const currentMinutes = utcHours * 60 + utcMinutes;

  // Local device time and offset info
  const offsetMinutes = now.getTimezoneOffset();
  const userUtcOffsetFormatted = formatUtcOffset(offsetMinutes);
  let userTimezone = 'Unknown/Browser';
  try {
    userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Browser Local';
  } catch {
    userTimezone = 'Local Time';
  }

  const rawDeviceLocalTime = now.toLocaleTimeString('en-US', { hour12: false });
  const rawUtcTime = `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}:${String(utcSeconds).padStart(2, '0')}`;

  let londonTime = '';
  let nyTime = '';
  try {
    londonTime = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false });
    nyTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false });
  } catch {
    londonTime = rawUtcTime;
    nyTime = rawUtcTime;
  }

  // Check if London is currently on BST (UTC+1)
  // Compare London hour with UTC hour
  let londonIsDst = false;
  try {
    const londonHourStr = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', hour12: false });
    const londonHour = parseInt(londonHourStr, 10);
    londonIsDst = ((londonHour - utcHours + 24) % 24) === 1;
  } catch {
    londonIsDst = false;
  }

  // Forex/Gold Market Weekend Close:
  // Friday 22:00 GMT (1320 mins) to Sunday 22:00 GMT (1320 mins)
  const isFridayAfterClose = dayOfWeek === 5 && currentMinutes >= 1320;
  const isSaturday = dayOfWeek === 6;
  const isSundayBeforeOpen = dayOfWeek === 0 && currentMinutes < 1320;
  const isWeekend = isFridayAfterClose || isSaturday || isSundayBeforeOpen;

  if (isWeekend) {
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

    const londonStatus: TimeDiagnosticInfo['londonSessionStatus'] = {
      status: 'CLOSED',
      windowGmt: '06:00 - 12:00 GMT',
      windowLondon: londonIsDst ? '07:00 - 13:00 BST' : '06:00 - 12:00 GMT',
      details: 'Global Forex/Gold markets are closed for the weekend until Sunday 22:00 GMT.'
    };

    const diagnostic: TimeDiagnosticInfo = {
      rawDeviceLocalTime,
      userTimezone,
      userUtcOffsetMinutes: -offsetMinutes,
      userUtcOffsetFormatted,
      rawUtcTime,
      utcHours,
      utcMinutes,
      utcSeconds,
      currentUtcMinutes: currentMinutes,
      londonTime,
      londonIsDst,
      nyTime,
      determinedSession: 'MARKET_CLOSE',
      sessionMatchReason: `Weekend market close active (Day ${dayOfWeek}, UTC ${rawUtcTime})`,
      londonSessionStatus: londonStatus
    };

    return {
      activeSession: 'MARKET_CLOSE',
      sessionName: 'Market Closed (Weekend)',
      timeRemainingFormatted: `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m to Open`,
      secondsRemaining: minutesUntilOpen * 60 - utcSeconds,
      nextSession: 'ASIAN_RANGE',
      nextSessionName: 'Asian Range (Sunday 22:00 GMT)',
      isWeekend: true,
      currentGmtHour: utcHours,
      currentGmtMinute: utcMinutes,
      diagnostic
    };
  }

  // Determine active session during trading days
  // 1. Asian Range: 21:00 - 06:00 GMT (00:00 - 06:00 GMT core)
  // 2. London Open & Killzone: 06:00 - 12:00 GMT (360 - 720 mins)
  // 3. New York AM Killzone: 12:00 - 16:30 GMT (720 - 990 mins)
  // 4. New York PM Session: 16:30 - 21:00 GMT (990 - 1260 mins)
  // 5. Late Asian / Sydney formation: 21:00 - 24:00 GMT (1260 - 1440 mins)
  let activeSession: TradingSession = 'ASIAN_RANGE';
  let sessionName = 'Asian Range';
  let endMinutes = 360; // 06:00 GMT
  let nextSession: TradingSession = 'LONDON_OPEN';
  let nextSessionName = 'London Open & Killzone';
  let sessionMatchReason = '';

  if (currentMinutes >= 360 && currentMinutes < 720) {
    // 06:00 to 12:00 GMT -> London Open & Killzone
    activeSession = 'LONDON_OPEN';
    sessionName = 'London Open & Killzone';
    endMinutes = 720;
    nextSession = 'NY_AM_KILLZONE';
    nextSessionName = 'New York AM Killzone';
    sessionMatchReason = `Current UTC time ${rawUtcTime} (${currentMinutes}m) is within London window 06:00 - 12:00 GMT (360m - 720m)`;
  } else if (currentMinutes >= 720 && currentMinutes < 990) {
    // 12:00 to 16:30 GMT -> NY AM Killzone
    activeSession = 'NY_AM_KILLZONE';
    sessionName = 'New York AM Killzone';
    endMinutes = 990;
    nextSession = 'NY_PM_SESSION';
    nextSessionName = 'New York PM Session';
    sessionMatchReason = `Current UTC time ${rawUtcTime} (${currentMinutes}m) is within New York AM window 12:00 - 16:30 GMT (720m - 990m)`;
  } else if (currentMinutes >= 990 && currentMinutes < 1260) {
    // 16:30 to 21:00 GMT -> NY PM Session
    activeSession = 'NY_PM_SESSION';
    sessionName = 'New York PM Session';
    endMinutes = 1260;
    nextSession = 'ASIAN_RANGE';
    nextSessionName = 'Asian Range';
    sessionMatchReason = `Current UTC time ${rawUtcTime} (${currentMinutes}m) is within New York PM window 16:30 - 21:00 GMT (990m - 1260m)`;
  } else {
    // 21:00 to 06:00 GMT -> Asian Range (Sydney / Tokyo liquidity)
    activeSession = 'ASIAN_RANGE';
    sessionName = 'Asian Range';
    if (currentMinutes >= 1260) {
      endMinutes = 1440 + 360; // next day 06:00 GMT
      sessionMatchReason = `Current UTC time ${rawUtcTime} (${currentMinutes}m) is late evening Sydney/Asia session (>= 21:00 GMT)`;
    } else {
      endMinutes = 360; // today 06:00 GMT
      sessionMatchReason = `Current UTC time ${rawUtcTime} (${currentMinutes}m) is Tokyo/Asian overnight range (< 06:00 GMT)`;
    }
    nextSession = 'LONDON_OPEN';
    nextSessionName = 'London Open & Killzone';
  }

  // Calculate remaining time
  const remainingMinutes = Math.max(0, endMinutes - currentMinutes);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;
  const remainingSecs = (60 - utcSeconds) % 60;
  const secondsRemaining = Math.max(0, remainingMinutes * 60 - utcSeconds);

  const formatted = `${String(remainingHours).padStart(2, '0')}h ${String(remainingMins).padStart(2, '0')}m ${String(remainingSecs).padStart(2, '0')}s`;

  // Explicit London Session Status explanation
  let londonStatusObj: TimeDiagnosticInfo['londonSessionStatus'];
  const londonWindowLabel = londonIsDst ? '07:00 - 13:00 BST' : '06:00 - 12:00 GMT';
  
  if (currentMinutes >= 360 && currentMinutes < 720) {
    londonStatusObj = {
      status: 'ACTIVE',
      windowGmt: '06:00 - 12:00 GMT',
      windowLondon: londonWindowLabel,
      details: `Active Now. Closes in ${remainingHours}h ${remainingMins}m at 12:00 GMT (${londonIsDst ? '13:00 BST' : '12:00 GMT'}).`
    };
  } else if (currentMinutes < 360) {
    const minsUntilLondon = 360 - currentMinutes;
    const hrs = Math.floor(minsUntilLondon / 60);
    const mins = minsUntilLondon % 60;
    londonStatusObj = {
      status: 'STANDBY',
      windowGmt: '06:00 - 12:00 GMT',
      windowLondon: londonWindowLabel,
      details: `Standby. London opens in ${hrs}h ${mins}m at 06:00 GMT (${londonIsDst ? '07:00 BST' : '06:00 GMT'}). Currently in Asian Range.`
    };
  } else {
    // Passed 12:00 GMT
    const minsUntilNextLondon = (1440 - currentMinutes) + 360;
    const hrs = Math.floor(minsUntilNextLondon / 60);
    const mins = minsUntilNextLondon % 60;
    londonStatusObj = {
      status: 'STANDBY',
      windowGmt: '06:00 - 12:00 GMT',
      windowLondon: londonWindowLabel,
      details: `Standby (Closed for today). London ended at 12:00 GMT. Next session opens in ${hrs}h ${mins}m.`
    };
  }

  const diagnostic: TimeDiagnosticInfo = {
    rawDeviceLocalTime,
    userTimezone,
    userUtcOffsetMinutes: -offsetMinutes,
    userUtcOffsetFormatted,
    rawUtcTime,
    utcHours,
    utcMinutes,
    utcSeconds,
    currentUtcMinutes: currentMinutes,
    londonTime,
    londonIsDst,
    nyTime,
    determinedSession: activeSession,
    sessionMatchReason,
    londonSessionStatus: londonStatusObj
  };

  return {
    activeSession,
    sessionName,
    timeRemainingFormatted: formatted,
    secondsRemaining,
    nextSession,
    nextSessionName,
    isWeekend: false,
    currentGmtHour: utcHours,
    currentGmtMinute: utcMinutes,
    diagnostic
  };
}

/**
 * Prints a clean debug log to the browser console for session diagnostics
 */
export function logSessionDiagnostic(diagnostic: TimeDiagnosticInfo): void {
  console.groupCollapsed(`[GoldHunter] Market Session Diagnostic: ${diagnostic.determinedSession}`);
  console.log(`%cUser Local Device Time: %c${diagnostic.rawDeviceLocalTime} (%c${diagnostic.userUtcOffsetFormatted}%c, ${diagnostic.userTimezone})`, 'color: #888;', 'color: #38bdf8; font-weight: bold;', 'color: #a855f7; font-weight: bold;', 'color: #888;');
  console.log(`%cNormalized UTC / GMT Time: %c${diagnostic.rawUtcTime} (Minutes into day: ${diagnostic.currentUtcMinutes}/1440)`, 'color: #888;', 'color: #f59e0b; font-weight: bold;');
  console.log(`%cLondon Desk Time: %c${diagnostic.londonTime} (${diagnostic.londonIsDst ? 'BST (UTC+1)' : 'GMT (UTC+0)'})`, 'color: #888;', 'color: #60a5fa; font-weight: bold;');
  console.log(`%cNew York Desk Time: %c${diagnostic.nyTime} (EST/EDT)`, 'color: #888;', 'color: #34d399; font-weight: bold;');
  console.log(`%cActive Session: %c${diagnostic.determinedSession}`, 'color: #888;', 'color: #10b981; font-weight: bold;');
  console.log(`%cSession Logic Reason: %c${diagnostic.sessionMatchReason}`, 'color: #888;', 'color: #e2e8f0;');
  console.log(`%cLondon Session Status: %c${diagnostic.londonSessionStatus.status} - ${diagnostic.londonSessionStatus.details}`, 'color: #888;', diagnostic.londonSessionStatus.status === 'ACTIVE' ? 'color: #10b981; font-weight: bold;' : 'color: #f59e0b; font-weight: bold;');
  console.groupEnd();
}
