interface BiometricData {
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  keystrokes: Array<{ key: string; timestamp: number }>;
  focusEvents: Array<{ type: 'focus' | 'blur'; timestamp: number }>;
  tabSwitches: number;
}

interface BiometricScore {
  humanityScore: number;
  mouseJitterVariance: number;
  typingSpeedVariance: number;
  focusEventCount: number;
  tabSwitchCount: number;
  flaggedForReview: boolean;
}

export class SentinelBiometricTracker {
  private mouseMovements: Array<{ x: number; y: number; timestamp: number }> = [];
  private keystrokes: Array<{ key: string; timestamp: number }> = [];
  private focusEvents: Array<{ type: 'focus' | 'blur'; timestamp: number }> = [];
  private tabSwitchCount = 0;

  trackMouseMovement(x: number, y: number) {
    this.mouseMovements.push({
      x,
      y,
      timestamp: Date.now()
    });
  }

  trackKeystroke(key: string) {
    this.keystrokes.push({
      key,
      timestamp: Date.now()
    });
  }

  trackFocusEvent(type: 'focus' | 'blur') {
    this.focusEvents.push({
      type,
      timestamp: Date.now()
    });
    
    if (type === 'blur') {
      this.tabSwitchCount++;
    }
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return variance;
  }

  private calculateMouseJitter(): number {
    if (this.mouseMovements.length < 10) return 0;
    
    const distances: number[] = [];
    for (let i = 1; i < this.mouseMovements.length; i++) {
      const prev = this.mouseMovements[i - 1];
      const curr = this.mouseMovements[i];
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      distances.push(distance);
    }
    
    return this.calculateVariance(distances);
  }

  private calculateTypingVariance(): number {
    if (this.keystrokes.length < 5) return 0;
    
    const intervals: number[] = [];
    for (let i = 1; i < this.keystrokes.length; i++) {
      const interval = this.keystrokes[i].timestamp - this.keystrokes[i - 1].timestamp;
      intervals.push(interval);
    }
    
    return this.calculateVariance(intervals);
  }

  calculateHumanityScore(): BiometricScore {
    const mouseJitterVariance = this.calculateMouseJitter();
    const typingSpeedVariance = this.calculateTypingVariance();
    const focusEventCount = this.focusEvents.length;
    
    let humanityScore = 1.0;
    
    if (mouseJitterVariance < 10) {
      humanityScore -= 0.3;
    }
    
    if (typingSpeedVariance < 50) {
      humanityScore -= 0.3;
    }
    
    if (this.tabSwitchCount > 10) {
      humanityScore -= 0.2;
    }
    
    if (focusEventCount < 2) {
      humanityScore -= 0.2;
    }
    
    humanityScore = Math.max(0, Math.min(1, humanityScore));
    
    const flaggedForReview = humanityScore < 0.6;
    
    return {
      humanityScore,
      mouseJitterVariance,
      typingSpeedVariance,
      focusEventCount,
      tabSwitchCount: this.tabSwitchCount,
      flaggedForReview
    };
  }

  reset() {
    this.mouseMovements = [];
    this.keystrokes = [];
    this.focusEvents = [];
    this.tabSwitchCount = 0;
  }
}

export function initializeSentinel(): SentinelBiometricTracker {
  const sentinel = new SentinelBiometricTracker();
  
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
      sentinel.trackMouseMovement(e.clientX, e.clientY);
    });
    
    window.addEventListener('keydown', (e) => {
      sentinel.trackKeystroke(e.key);
    });
    
    window.addEventListener('focus', () => {
      sentinel.trackFocusEvent('focus');
    });
    
    window.addEventListener('blur', () => {
      sentinel.trackFocusEvent('blur');
    });
  }
  
  return sentinel;
}
