import { SupplyDemandZone } from '../types';

/**
 * Web Audio API synthesized institutional alert chime
 * Generates an instant high-frequency double-tone chime (Bloomberg/MT5 style)
 */
export const playAlertSound = (type: 'DEMAND' | 'SUPPLY' = 'DEMAND') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Bullish Demand = Higher rising tone; Bearish Supply = Crisp falling tone
    const f1 = type === 'DEMAND' ? 587.33 : 880.00; // D5 vs A5
    const f2 = type === 'DEMAND' ? 880.00 : 587.33; // A5 vs D5

    osc1.frequency.setValueAtTime(f1, now);
    osc1.frequency.exponentialRampToValueAtTime(f2, now + 0.12);

    osc2.frequency.setValueAtTime(f1 * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(f2 * 1.5, now + 0.12);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (e) {
    console.warn("Audio chime could not be played:", e);
  }
};

/**
 * Checks current browser notification permission
 */
export const getBrowserNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Requests browser notification permission
 */
export const requestBrowserNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return 'denied';
  }
};

/**
 * Dispatches a native browser notification for a 4/4 qualified Supply or Demand zone
 */
export const triggerBrowserZoneNotification = (
  zone: SupplyDemandZone,
  currentPrice: number,
  soundEnabled: boolean = true
): boolean => {
  // Always trigger audio chime if enabled
  if (soundEnabled) {
    playAlertSound(zone.type);
  }

  // Trigger Native OS / Browser Notification if supported and permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const isDemand = zone.type === 'DEMAND';
    const title = isDemand 
      ? `🟢 4/4 Valid DEMAND Zone Detected [XAU/USD]` 
      : `🔴 4/4 Valid SUPPLY Zone Detected [XAU/USD]`;

    const body = `${isDemand ? 'BUY LIMIT' : 'SELL LIMIT'} candidate at $${zone.priceLow.toFixed(2)} - $${zone.priceHigh.toFixed(2)}.\n` +
      `✓ Sharp ${zone.criteria.displacementPips}p movement\n` +
      `✓ Fair Value Gap (FVG) formed\n` +
      `✓ Backyard trading verified\n` +
      `✓ ${zone.criteria.stalledCandlesCount} stalled basing candles`;

    try {
      const notification = new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/2622/2622419.png',
        tag: `gold_zone_${zone.id}`,
        silent: true // We use custom low-latency synthesized chime
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (e) {
      console.warn("Native notification dispatch error:", e);
      return false;
    }
  }

  return false;
};
