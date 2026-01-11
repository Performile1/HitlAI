import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface VelocityAnalysis {
  isBot: boolean
  confidence: number
  suspiciousPatterns: string[]
  humanLikelihood: number
  reasoning: string
}

interface InteractionMetrics {
  avgTimeBetweenClicks: number
  clickVariance: number
  movementLinearity: number
  pausePatterns: number
  errorRate: number
}

/**
 * VelocityChecker - Detects auto-clicker bots used by fraudulent testers
 * 
 * Human movement is erratic and unpredictable. Bots are linear and mathematical.
 * This analyzer examines interaction patterns to distinguish real humans from
 * automated scripts.
 */
export class VelocityChecker {
  /**
   * Analyzes interaction patterns to detect bot behavior
   */
  async analyzeInteractions(
    sessionId: string
  ): Promise<VelocityAnalysis> {
    try {
      // Get all interactions for this session
      const { data: interactions } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })

      if (!interactions || interactions.length < 10) {
        return {
          isBot: false,
          confidence: 0.5,
          suspiciousPatterns: [],
          humanLikelihood: 0.5,
          reasoning: 'Insufficient data for analysis'
        }
      }

      const metrics = this.calculateMetrics(interactions)
      const patterns = this.detectSuspiciousPatterns(metrics, interactions)

      // Bot detection heuristics
      const botScore = this.calculateBotScore(metrics, patterns)
      const isBot = botScore > 0.7
      const humanLikelihood = 1 - botScore

      return {
        isBot,
        confidence: Math.abs(botScore - 0.5) * 2, // 0.5 = uncertain, 0 or 1 = certain
        suspiciousPatterns: patterns,
        humanLikelihood,
        reasoning: this.generateReasoning(metrics, patterns, botScore)
      }

    } catch (error) {
      console.error('Velocity analysis failed:', error)
      return {
        isBot: false,
        confidence: 0,
        suspiciousPatterns: [],
        humanLikelihood: 0.5,
        reasoning: 'Analysis error'
      }
    }
  }

  /**
   * Calculates interaction metrics
   */
  private calculateMetrics(interactions: any[]): InteractionMetrics {
    const clicks = interactions.filter(i => i.event_type === 'click')
    const moves = interactions.filter(i => i.event_type === 'mousemove')

    // Time between clicks
    const clickTimes: number[] = []
    for (let i = 1; i < clicks.length; i++) {
      const timeDiff = new Date(clicks[i].timestamp).getTime() - new Date(clicks[i - 1].timestamp).getTime()
      clickTimes.push(timeDiff)
    }

    const avgTimeBetweenClicks = clickTimes.length > 0
      ? clickTimes.reduce((sum, t) => sum + t, 0) / clickTimes.length
      : 0

    // Click variance (humans are inconsistent, bots are regular)
    const variance = clickTimes.length > 1
      ? clickTimes.reduce((sum, t) => sum + Math.pow(t - avgTimeBetweenClicks, 2), 0) / clickTimes.length
      : 0

    const clickVariance = Math.sqrt(variance)

    // Movement linearity (bots move in straight lines)
    let totalAngleChange = 0
    for (let i = 2; i < moves.length; i++) {
      const prev = moves[i - 2]
      const curr = moves[i - 1]
      const next = moves[i]

      if (prev.x && curr.x && next.x) {
        const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
        const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
        totalAngleChange += Math.abs(angle2 - angle1)
      }
    }

    const movementLinearity = moves.length > 2
      ? 1 - (totalAngleChange / (moves.length - 2)) / Math.PI // 0 = very linear, 1 = very erratic
      : 0.5

    // Pause patterns (humans pause to think, bots don't)
    let pauseCount = 0
    for (let i = 1; i < interactions.length; i++) {
      const timeDiff = new Date(interactions[i].timestamp).getTime() - new Date(interactions[i - 1].timestamp).getTime()
      if (timeDiff > 2000 && timeDiff < 10000) { // 2-10 second pauses
        pauseCount++
      }
    }

    const pausePatterns = pauseCount / interactions.length

    // Error rate (humans make mistakes, bots don't)
    const errors = interactions.filter(i => 
      i.event_type === 'click' && i.metadata?.failed === true
    )
    const errorRate = clicks.length > 0 ? errors.length / clicks.length : 0

    return {
      avgTimeBetweenClicks,
      clickVariance,
      movementLinearity,
      pausePatterns,
      errorRate
    }
  }

  /**
   * Detects suspicious patterns indicating bot behavior
   */
  private detectSuspiciousPatterns(
    metrics: InteractionMetrics,
    interactions: any[]
  ): string[] {
    const patterns: string[] = []

    // Too consistent timing (bots)
    if (metrics.clickVariance < 100) {
      patterns.push('Suspiciously consistent click timing')
    }

    // Too fast (bots)
    if (metrics.avgTimeBetweenClicks < 300) {
      patterns.push('Unrealistically fast interactions')
    }

    // Too linear movement (bots)
    if (metrics.movementLinearity > 0.9) {
      patterns.push('Linear mouse movement (not human-like)')
    }

    // No pauses (bots don't think)
    if (metrics.pausePatterns < 0.05) {
      patterns.push('No natural pauses (humans pause to read/think)')
    }

    // No errors (bots are perfect)
    if (metrics.errorRate === 0 && interactions.length > 20) {
      patterns.push('Zero errors (humans make mistakes)')
    }

    // Perfect rhythm (bots)
    const clicks = interactions.filter(i => i.event_type === 'click')
    if (clicks.length >= 5) {
      const intervals: number[] = []
      for (let i = 1; i < clicks.length; i++) {
        intervals.push(
          new Date(clicks[i].timestamp).getTime() - new Date(clicks[i - 1].timestamp).getTime()
        )
      }

      // Check if all intervals are nearly identical
      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length
      const allSimilar = intervals.every(i => Math.abs(i - avgInterval) < 50)
      
      if (allSimilar) {
        patterns.push('Perfect rhythm (bot-like consistency)')
      }
    }

    // Instant form filling (bots)
    const inputs = interactions.filter(i => i.event_type === 'input')
    if (inputs.length > 0) {
      const typingSpeeds: number[] = []
      for (let i = 1; i < inputs.length; i++) {
        const timeDiff = new Date(inputs[i].timestamp).getTime() - new Date(inputs[i - 1].timestamp).getTime()
        typingSpeeds.push(timeDiff)
      }

      const avgTypingSpeed = typingSpeeds.reduce((sum, s) => sum + s, 0) / typingSpeeds.length
      if (avgTypingSpeed < 50) { // Less than 50ms per character
        patterns.push('Unrealistic typing speed')
      }
    }

    return patterns
  }

  /**
   * Calculates overall bot probability score
   */
  private calculateBotScore(
    metrics: InteractionMetrics,
    patterns: string[]
  ): number {
    let score = 0

    // Weight different factors
    if (metrics.clickVariance < 100) score += 0.25
    if (metrics.avgTimeBetweenClicks < 300) score += 0.2
    if (metrics.movementLinearity > 0.9) score += 0.2
    if (metrics.pausePatterns < 0.05) score += 0.15
    if (metrics.errorRate === 0) score += 0.1

    // Patterns add to score
    score += patterns.length * 0.1

    return Math.min(1.0, score)
  }

  /**
   * Generates human-readable reasoning
   */
  private generateReasoning(
    metrics: InteractionMetrics,
    patterns: string[],
    botScore: number
  ): string {
    if (botScore < 0.3) {
      return `Natural human behavior detected. Erratic timing (variance: ${metrics.clickVariance.toFixed(0)}ms), natural pauses (${(metrics.pausePatterns * 100).toFixed(1)}%), and realistic movement patterns.`
    }

    if (botScore > 0.7) {
      return `Bot behavior detected. ${patterns.join('; ')}. Bot score: ${(botScore * 100).toFixed(0)}%`
    }

    return `Uncertain. Some bot-like patterns but not conclusive. Patterns: ${patterns.join('; ')}`
  }

  /**
   * Analyzes multiple sessions from same tester
   */
  async analyzeTesterPattern(
    testerId: string,
    recentSessions: string[]
  ): Promise<{
    consistentlyBot: boolean
    botSessionCount: number
    totalSessions: number
    recommendation: string
  }> {
    const analyses = await Promise.all(
      recentSessions.map(sessionId => this.analyzeInteractions(sessionId))
    )

    const botSessions = analyses.filter(a => a.isBot && a.confidence > 0.7)
    const consistentlyBot = botSessions.length / analyses.length > 0.5

    let recommendation = ''
    if (consistentlyBot) {
      recommendation = '🚫 HIGH RISK: Suspend tester immediately. Consistent bot behavior detected.'
    } else if (botSessions.length > 0) {
      recommendation = '⚠️ MEDIUM RISK: Review manually. Some bot-like sessions detected.'
    } else {
      recommendation = '✅ LOW RISK: Natural human behavior across all sessions.'
    }

    return {
      consistentlyBot,
      botSessionCount: botSessions.length,
      totalSessions: analyses.length,
      recommendation
    }
  }
}
