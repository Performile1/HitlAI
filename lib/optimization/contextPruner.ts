/**
 * ContextPruner - Token window management for multi-agent workflows
 * 
 * Problem: As tests progress, context grows with HTML, logs, and previous actions.
 * This causes:
 * - Token limit exceeded errors
 * - Increased API costs
 * - "Context Drift" where AI forgets original mission
 * 
 * Solution: Sliding window that keeps only most relevant information:
 * - Last 3 actions (not all 50)
 * - Critical DOM elements (not entire HTML)
 * - Recent friction points (not historical)
 * - Original mission objective (always preserved)
 */

interface PrunedContext {
  mission: string
  recentActions: Array<{
    action: string
    result: string
    timestamp: string
  }>
  relevantDOM: string
  recentFrictionPoints: Array<{
    element: string
    issue: string
    severity: string
  }>
  tokenCount: number
}

interface FullContext {
  mission: string
  allActions: Array<any>
  fullHTML: string
  allFrictionPoints: Array<any>
  persona: any
  auditResults: any
}

export class ContextPruner {
  private readonly MAX_ACTIONS = 3
  private readonly MAX_FRICTION_POINTS = 5
  private readonly MAX_DOM_ELEMENTS = 50
  private readonly TARGET_TOKEN_COUNT = 4000 // Leave room for response

  /**
   * Prunes context to fit within token limits while preserving critical info
   */
  pruneContext(fullContext: FullContext): PrunedContext {
    // 1. Always preserve mission objective
    const mission = fullContext.mission

    // 2. Keep only last N actions (sliding window)
    const recentActions = fullContext.allActions
      .slice(-this.MAX_ACTIONS)
      .map(action => ({
        action: action.action_type || action.type,
        result: action.success ? 'success' : action.error_message,
        timestamp: action.created_at
      }))

    // 3. Extract only interactive/relevant DOM elements
    const relevantDOM = this.extractRelevantDOM(fullContext.fullHTML)

    // 4. Keep only recent high-severity friction points
    const recentFrictionPoints = fullContext.allFrictionPoints
      .filter((fp: any) => fp.severity === 'high' || fp.severity === 'critical')
      .slice(-this.MAX_FRICTION_POINTS)
      .map((fp: any) => ({
        element: fp.element,
        issue: fp.issue_type,
        severity: fp.severity
      }))

    // 5. Estimate token count
    const tokenCount = this.estimateTokens({
      mission,
      recentActions,
      relevantDOM,
      recentFrictionPoints
    })

    return {
      mission,
      recentActions,
      relevantDOM,
      recentFrictionPoints,
      tokenCount
    }
  }

  /**
   * Extracts only interactive/relevant DOM elements from full HTML
   */
  private extractRelevantDOM(fullHTML: string): string {
    // Parse HTML and extract only interactive elements
    const relevantTags = [
      'button',
      'a',
      'input',
      'select',
      'textarea',
      'form',
      '[role="button"]',
      '[role="link"]',
      '[onclick]'
    ]

    try {
      // Simple regex-based extraction (in production, use proper HTML parser)
      const elements: string[] = []
      
      relevantTags.forEach(tag => {
        const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi')
        const matches = fullHTML.match(regex) || []
        elements.push(...matches.slice(0, 10)) // Max 10 per tag
      })

      // Limit total elements
      const limitedElements = elements.slice(0, this.MAX_DOM_ELEMENTS)
      
      return limitedElements.join('\n')
    } catch (error) {
      console.error('Failed to extract relevant DOM:', error)
      // Fallback: truncate HTML
      return fullHTML.substring(0, 5000)
    }
  }

  /**
   * Estimates token count (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(context: any): number {
    const text = JSON.stringify(context)
    return Math.ceil(text.length / 4)
  }

  /**
   * Checks if context is within safe token limits
   */
  isWithinLimits(context: PrunedContext): boolean {
    return context.tokenCount <= this.TARGET_TOKEN_COUNT
  }

  /**
   * Further prunes context if still too large
   */
  aggressivePrune(context: PrunedContext): PrunedContext {
    return {
      mission: context.mission,
      recentActions: context.recentActions.slice(-2), // Only last 2 actions
      relevantDOM: context.relevantDOM.substring(0, 2000), // Truncate DOM
      recentFrictionPoints: context.recentFrictionPoints.slice(-3), // Only last 3
      tokenCount: this.estimateTokens({
        mission: context.mission,
        recentActions: context.recentActions.slice(-2),
        relevantDOM: context.relevantDOM.substring(0, 2000),
        recentFrictionPoints: context.recentFrictionPoints.slice(-3)
      })
    }
  }

  /**
   * Formats pruned context for LLM prompt
   */
  formatForPrompt(context: PrunedContext): string {
    return `
**Mission Objective**: ${context.mission}

**Recent Actions** (last ${context.recentActions.length}):
${context.recentActions.map((a, i) => `${i + 1}. ${a.action} → ${a.result}`).join('\n')}

**Relevant DOM Elements**:
${context.relevantDOM}

**Recent Friction Points**:
${context.recentFrictionPoints.map(fp => `- ${fp.element}: ${fp.issue} (${fp.severity})`).join('\n')}

**Token Count**: ${context.tokenCount} / ${this.TARGET_TOKEN_COUNT}
`.trim()
  }

  /**
   * Creates summary of pruned information for logging
   */
  createPruningSummary(
    originalSize: number,
    prunedSize: number
  ): {
    originalTokens: number
    prunedTokens: number
    reduction: number
    reductionPercent: number
  } {
    const reduction = originalSize - prunedSize
    const reductionPercent = Math.round((reduction / originalSize) * 100)

    return {
      originalTokens: originalSize,
      prunedTokens: prunedSize,
      reduction,
      reductionPercent
    }
  }

  /**
   * Validates that critical information is preserved
   */
  validatePruning(
    original: FullContext,
    pruned: PrunedContext
  ): {
    valid: boolean
    warnings: string[]
  } {
    const warnings: string[] = []

    // Check mission preserved
    if (pruned.mission !== original.mission) {
      warnings.push('Mission objective was modified during pruning')
    }

    // Check if too aggressive
    if (pruned.recentActions.length === 0) {
      warnings.push('No actions preserved - pruning too aggressive')
    }

    if (pruned.relevantDOM.length < 100) {
      warnings.push('Very little DOM preserved - may lack context')
    }

    return {
      valid: warnings.length === 0,
      warnings
    }
  }
}

// Singleton instance
let prunerInstance: ContextPruner | null = null

export function getContextPruner(): ContextPruner {
  if (!prunerInstance) {
    prunerInstance = new ContextPruner()
  }
  return prunerInstance
}

/**
 * Helper function for quick pruning in orchestrator
 */
export function pruneForAgent(
  mission: string,
  actions: Array<any>,
  html: string,
  frictionPoints: Array<any>
): PrunedContext {
  const pruner = getContextPruner()
  
  const fullContext: FullContext = {
    mission,
    allActions: actions,
    fullHTML: html,
    allFrictionPoints: frictionPoints,
    persona: {},
    auditResults: {}
  }

  const pruned = pruner.pruneContext(fullContext)

  // If still too large, prune more aggressively
  if (!pruner.isWithinLimits(pruned)) {
    console.warn('[ContextPruner] Context still too large, applying aggressive pruning')
    return pruner.aggressivePrune(pruned)
  }

  return pruned
}
