import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface CostTracker {
  testRunId: string
  totalCost: number
  costByModel: Map<string, number>
  callCount: number
  startTime: number
}

interface ModelPricing {
  inputTokenPrice: number  // per 1M tokens
  outputTokenPrice: number // per 1M tokens
}

/**
 * CircuitBreaker - Financial safety for AI operations
 * 
 * Prevents catastrophic cost scenarios:
 * - Infinite loops draining OpenAI balance
 * - Runaway agent chains
 * - Budget overruns
 * 
 * Hard-stops all AI calls if cost exceeds threshold
 * Saves test run state before killing
 * Alerts admins of circuit break events
 */
export class CircuitBreaker {
  private costTrackers: Map<string, CostTracker> = new Map()
  private readonly DEFAULT_THRESHOLD = 5.00 // $5 per test run
  private readonly GLOBAL_DAILY_LIMIT = 1000.00 // $1000 per day
  private dailyCost: number = 0
  private dailyResetTime: number = Date.now()

  // Model pricing (as of Jan 2026)
  private readonly MODEL_PRICING: Record<string, ModelPricing> = {
    'gpt-4o': {
      inputTokenPrice: 2.50,   // $2.50 per 1M tokens
      outputTokenPrice: 10.00  // $10 per 1M tokens
    },
    'gpt-4': {
      inputTokenPrice: 30.00,
      outputTokenPrice: 60.00
    },
    'gpt-4o-mini': {
      inputTokenPrice: 0.15,
      outputTokenPrice: 0.60
    },
    'claude-3.5-sonnet': {
      inputTokenPrice: 3.00,
      outputTokenPrice: 15.00
    },
    'claude-3-opus': {
      inputTokenPrice: 15.00,
      outputTokenPrice: 75.00
    },
    'dall-e-3': {
      inputTokenPrice: 0,
      outputTokenPrice: 0.04 * 1000000 // $0.04 per image = $40k per 1M "tokens"
    }
  }

  /**
   * Initializes cost tracking for a test run
   */
  initializeTestRun(testRunId: string, customThreshold?: number): void {
    this.costTrackers.set(testRunId, {
      testRunId,
      totalCost: 0,
      costByModel: new Map(),
      callCount: 0,
      startTime: Date.now()
    })

    console.log(`[CircuitBreaker] Initialized tracking for test ${testRunId} with threshold $${customThreshold || this.DEFAULT_THRESHOLD}`)
  }

  /**
   * Records an AI API call and checks if circuit should break
   */
  async recordCall(
    testRunId: string,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<{ allowed: boolean; reason?: string; currentCost: number }> {
    // Check daily limit first
    this.checkDailyReset()
    
    if (this.dailyCost >= this.GLOBAL_DAILY_LIMIT) {
      await this.triggerGlobalCircuitBreak('Daily limit exceeded')
      return {
        allowed: false,
        reason: `Global daily limit of $${this.GLOBAL_DAILY_LIMIT} exceeded`,
        currentCost: this.dailyCost
      }
    }

    // Get or create tracker
    let tracker = this.costTrackers.get(testRunId)
    if (!tracker) {
      this.initializeTestRun(testRunId)
      tracker = this.costTrackers.get(testRunId)!
    }

    // Calculate cost for this call
    const pricing = this.MODEL_PRICING[model] || this.MODEL_PRICING['gpt-4o'] // Default to GPT-4o pricing
    const cost = this.calculateCost(inputTokens, outputTokens, pricing)

    // Update trackers
    tracker.totalCost += cost
    tracker.callCount++
    tracker.costByModel.set(
      model,
      (tracker.costByModel.get(model) || 0) + cost
    )
    this.dailyCost += cost

    // Log the call
    await this.logAPICall(testRunId, model, inputTokens, outputTokens, cost)

    // Check if threshold exceeded
    if (tracker.totalCost > this.DEFAULT_THRESHOLD) {
      await this.triggerCircuitBreak(testRunId, tracker)
      return {
        allowed: false,
        reason: `Test run cost of $${tracker.totalCost.toFixed(2)} exceeded threshold of $${this.DEFAULT_THRESHOLD}`,
        currentCost: tracker.totalCost
      }
    }

    return {
      allowed: true,
      currentCost: tracker.totalCost
    }
  }

  /**
   * Calculates cost for an API call
   */
  private calculateCost(
    inputTokens: number,
    outputTokens: number,
    pricing: ModelPricing
  ): number {
    const inputCost = (inputTokens / 1000000) * pricing.inputTokenPrice
    const outputCost = (outputTokens / 1000000) * pricing.outputTokenPrice
    return inputCost + outputCost
  }

  /**
   * Triggers circuit break for a specific test run
   */
  private async triggerCircuitBreak(
    testRunId: string,
    tracker: CostTracker
  ): Promise<void> {
    console.error(`[CircuitBreaker] 🚨 CIRCUIT BREAK: Test ${testRunId} exceeded cost threshold`)
    console.error(`Total cost: $${tracker.totalCost.toFixed(2)}`)
    console.error(`Call count: ${tracker.callCount}`)
    console.error(`Duration: ${Math.round((Date.now() - tracker.startTime) / 1000)}s`)

    const supabase = getSupabaseAdmin()
    // Update test run status
    await supabase
      .from('test_runs')
      .update({
        status: 'failed',
        failure_count: 999, // Special code for circuit break
        updated_at: new Date().toISOString()
      })
      .eq('id', testRunId)

    // Log circuit break event
    await supabase
      .from('circuit_break_events')
      .insert({
        test_run_id: testRunId,
        total_cost: tracker.totalCost,
        call_count: tracker.callCount,
        duration_ms: Date.now() - tracker.startTime,
        cost_by_model: Object.fromEntries(tracker.costByModel),
        threshold: this.DEFAULT_THRESHOLD,
        reason: 'Cost threshold exceeded',
        created_at: new Date().toISOString()
      })

    // Send alert (implement email/Slack notification)
    await this.sendAlert(testRunId, tracker)

    // Cleanup tracker
    this.costTrackers.delete(testRunId)
  }

  /**
   * Triggers global circuit break (all tests stopped)
   */
  private async triggerGlobalCircuitBreak(reason: string): Promise<void> {
    console.error(`[CircuitBreaker] 🚨🚨 GLOBAL CIRCUIT BREAK: ${reason}`)
    console.error(`Daily cost: $${this.dailyCost.toFixed(2)}`)

    const supabase = getSupabaseAdmin()
    // Log global event
    await supabase
      .from('circuit_break_events')
      .insert({
        test_run_id: null,
        total_cost: this.dailyCost,
        call_count: 0,
        duration_ms: Date.now() - this.dailyResetTime,
        cost_by_model: {},
        threshold: this.GLOBAL_DAILY_LIMIT,
        reason: 'Global daily limit exceeded',
        is_global: true,
        created_at: new Date().toISOString()
      })

    // Send critical alert
    await this.sendGlobalAlert(reason)
  }

  /**
   * Logs individual API call
   */
  private async logAPICall(
    testRunId: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    cost: number
  ): Promise<void> {
    try {
      const supabase = getSupabaseAdmin()
      await supabase
        .from('api_call_logs')
        .insert({
          test_run_id: testRunId,
          model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('[CircuitBreaker] Failed to log API call:', error)
    }
  }

  /**
   * Sends alert for circuit break
   */
  private async sendAlert(testRunId: string, tracker: CostTracker): Promise<void> {
    // TODO: Implement email/Slack notification
    console.error(`
🚨 CIRCUIT BREAKER TRIGGERED 🚨

Test Run: ${testRunId}
Total Cost: $${tracker.totalCost.toFixed(2)}
Threshold: $${this.DEFAULT_THRESHOLD}
Call Count: ${tracker.callCount}
Duration: ${Math.round((Date.now() - tracker.startTime) / 1000)}s

Cost Breakdown:
${Array.from(tracker.costByModel.entries())
  .map(([model, cost]) => `  ${model}: $${cost.toFixed(2)}`)
  .join('\n')}

Action: Test run has been stopped and marked as failed.
    `)
  }

  /**
   * Sends global alert
   */
  private async sendGlobalAlert(reason: string): Promise<void> {
    // TODO: Implement critical email/Slack notification
    console.error(`
🚨🚨 GLOBAL CIRCUIT BREAKER TRIGGERED 🚨🚨

Reason: ${reason}
Daily Cost: $${this.dailyCost.toFixed(2)}
Daily Limit: $${this.GLOBAL_DAILY_LIMIT}

Action: ALL AI operations have been stopped.
Manual intervention required.
    `)
  }

  /**
   * Checks if daily limit should reset
   */
  private checkDailyReset(): void {
    const now = Date.now()
    const hoursSinceReset = (now - this.dailyResetTime) / (1000 * 60 * 60)

    if (hoursSinceReset >= 24) {
      console.log(`[CircuitBreaker] Daily reset - Previous cost: $${this.dailyCost.toFixed(2)}`)
      this.dailyCost = 0
      this.dailyResetTime = now
    }
  }

  /**
   * Gets current cost for a test run
   */
  getCurrentCost(testRunId: string): number {
    const tracker = this.costTrackers.get(testRunId)
    return tracker?.totalCost || 0
  }

  /**
   * Gets cost breakdown for a test run
   */
  getCostBreakdown(testRunId: string): {
    totalCost: number
    callCount: number
    costByModel: Record<string, number>
    duration: number
  } | null {
    const tracker = this.costTrackers.get(testRunId)
    if (!tracker) return null

    return {
      totalCost: tracker.totalCost,
      callCount: tracker.callCount,
      costByModel: Object.fromEntries(tracker.costByModel),
      duration: Date.now() - tracker.startTime
    }
  }

  /**
   * Gets daily cost summary
   */
  getDailySummary(): {
    dailyCost: number
    dailyLimit: number
    percentUsed: number
    timeUntilReset: number
  } {
    const now = Date.now()
    const hoursSinceReset = (now - this.dailyResetTime) / (1000 * 60 * 60)
    const hoursUntilReset = 24 - hoursSinceReset

    return {
      dailyCost: this.dailyCost,
      dailyLimit: this.GLOBAL_DAILY_LIMIT,
      percentUsed: (this.dailyCost / this.GLOBAL_DAILY_LIMIT) * 100,
      timeUntilReset: hoursUntilReset * 60 * 60 * 1000 // milliseconds
    }
  }

  /**
   * Manually resets a test run's cost tracking (admin only)
   */
  resetTestRun(testRunId: string): void {
    this.costTrackers.delete(testRunId)
    console.log(`[CircuitBreaker] Reset cost tracking for test ${testRunId}`)
  }

  /**
   * Manually resets daily limit (admin only)
   */
  resetDailyLimit(): void {
    console.warn(`[CircuitBreaker] Manual daily limit reset - Previous cost: $${this.dailyCost.toFixed(2)}`)
    this.dailyCost = 0
    this.dailyResetTime = Date.now()
  }
}

// Singleton instance
let breakerInstance: CircuitBreaker | null = null

export function getCircuitBreaker(): CircuitBreaker {
  if (!breakerInstance) {
    breakerInstance = new CircuitBreaker()
  }
  return breakerInstance
}

/**
 * Middleware wrapper for LLM calls
 */
export async function withCircuitBreaker<T>(
  testRunId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  operation: () => Promise<T>
): Promise<T> {
  const breaker = getCircuitBreaker()
  
  const { allowed, reason, currentCost } = await breaker.recordCall(
    testRunId,
    model,
    inputTokens,
    outputTokens
  )

  if (!allowed) {
    throw new Error(`Circuit breaker triggered: ${reason}. Current cost: $${currentCost.toFixed(2)}`)
  }

  return operation()
}
