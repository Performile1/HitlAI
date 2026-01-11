import { ChatOpenAI } from '@langchain/openai'

interface HeuristicWeight {
  heuristicId: string
  heuristicName: string
  baseWeight: number
  adjustedWeight: number
  reasoning: string
}

interface WeightingStrategy {
  businessGoal: string
  weights: HeuristicWeight[]
  priorityCategories: string[]
  explanation: string
}

/**
 * DynamicHeuristicWeighter - Adjusts heuristic importance based on business goals
 * 
 * Instead of using fixed Baymard/NN/g scores, this agent dynamically weights
 * heuristics based on the specific business goal. For example:
 * - "Brand Awareness" → Visual Clarity weighted higher
 * - "Conversion" → Checkout Speed weighted higher
 * - "Engagement" → Content Clarity weighted higher
 */
export class DynamicHeuristicWeighter {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.3,
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  /**
   * Generates dynamic heuristic weights based on business goal
   */
  async generateWeights(
    businessGoal: string,
    testObjective: string,
    persona: any,
    availableHeuristics: Array<{
      id: string
      name: string
      category: string
      baseWeight: number
    }>
  ): Promise<WeightingStrategy> {
    const prompt = `You are a UX strategy expert. Adjust the importance (weight) of UX heuristics based on a specific business goal.

**Business Goal:** ${businessGoal}

**Test Objective:** ${testObjective}

**Persona:** ${persona.name} (${persona.age}yo, ${persona.tech_literacy} tech literacy)

**Available Heuristics:**
${JSON.stringify(availableHeuristics, null, 2)}

**Your Task:**
Adjust the weights (0.0-2.0 multiplier) for each heuristic based on how important it is for achieving the business goal.

**Examples:**
- If goal is "Brand Awareness", increase weights for:
  - Visual Clarity (users need to understand brand identity)
  - First Impressions (critical for brand perception)
  - Aesthetic Design (brand image)
  
- If goal is "Conversion/Sales", increase weights for:
  - Checkout Speed (reduce cart abandonment)
  - Trust Signals (security, reviews)
  - Call-to-Action Clarity (clear next steps)
  
- If goal is "User Engagement", increase weights for:
  - Content Clarity (easy to understand)
  - Navigation Ease (explore more pages)
  - Loading Speed (reduce bounce)

**Consider the Persona:**
- Low tech literacy → Increase weight for "Simplicity" and "Error Prevention"
- Poor eyesight → Increase weight for "Visual Contrast" and "Font Size"
- High cognitive load → Increase weight for "Information Architecture"

Return JSON:
{
  "businessGoal": "${businessGoal}",
  "weights": [
    {
      "heuristicId": "id",
      "heuristicName": "name",
      "baseWeight": 1.0,
      "adjustedWeight": 0.0-2.0,
      "reasoning": "why this weight for this goal"
    }
  ],
  "priorityCategories": ["category1", "category2"],
  "explanation": "overall strategy"
}`

    try {
      const response = await this.llm.invoke(prompt)
      const content = response.content as string
      
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error('Failed to parse weighting strategy')
    } catch (error) {
      console.error('Dynamic weighting failed:', error)
      return {
        businessGoal,
        weights: availableHeuristics.map(h => ({
          heuristicId: h.id,
          heuristicName: h.name,
          baseWeight: h.baseWeight,
          adjustedWeight: h.baseWeight,
          reasoning: 'Default weight (weighting failed)'
        })),
        priorityCategories: [],
        explanation: 'Using default weights'
      }
    }
  }

  /**
   * Applies dynamic weights to friction point severity scores
   */
  applyWeights(
    frictionPoints: Array<{
      heuristicId: string
      severity: number
      [key: string]: any
    }>,
    weightingStrategy: WeightingStrategy
  ): Array<{
    originalSeverity: number
    adjustedSeverity: number
    weight: number
    [key: string]: any
  }> {
    const weightMap = new Map(
      weightingStrategy.weights.map(w => [w.heuristicId, w.adjustedWeight])
    )

    return frictionPoints.map(fp => {
      const weight = weightMap.get(fp.heuristicId) || 1.0
      const adjustedSeverity = Math.min(10, fp.severity * weight)

      return {
        ...fp,
        originalSeverity: fp.severity,
        adjustedSeverity,
        weight
      }
    })
  }

  /**
   * Generates a business-goal-aligned report
   * Prioritizes issues that matter most for the specific goal
   */
  async generateGoalAlignedReport(
    frictionPoints: any[],
    weightingStrategy: WeightingStrategy,
    testResults: any
  ): Promise<{
    criticalForGoal: any[]
    secondaryIssues: any[]
    goalAlignment: string
    recommendations: string[]
  }> {
    const weightedPoints = this.applyWeights(frictionPoints, weightingStrategy)
    
    const criticalForGoal = weightedPoints
      .filter(fp => fp.adjustedSeverity >= 7)
      .sort((a, b) => b.adjustedSeverity - a.adjustedSeverity)

    const secondaryIssues = weightedPoints
      .filter(fp => fp.adjustedSeverity < 7 && fp.adjustedSeverity >= 4)
      .sort((a, b) => b.adjustedSeverity - a.adjustedSeverity)

    const prompt = `Generate recommendations for achieving a business goal based on UX test results.

**Business Goal:** ${weightingStrategy.businessGoal}

**Critical Issues (Blocking Goal):**
${JSON.stringify(criticalForGoal.slice(0, 5), null, 2)}

**Secondary Issues:**
${JSON.stringify(secondaryIssues.slice(0, 5), null, 2)}

**Test Results:**
- Sentiment Score: ${testResults.sentimentScore}
- Completion Rate: ${testResults.completionRate || 'N/A'}

Provide:
1. Goal alignment assessment (how well does the current UX support the goal?)
2. Top 5 actionable recommendations prioritized by business impact

Return JSON:
{
  "goalAlignment": "assessment text",
  "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"]
}`

    try {
      const response = await this.llm.invoke(prompt)
      const content = response.content as string
      
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          criticalForGoal,
          secondaryIssues,
          goalAlignment: parsed.goalAlignment,
          recommendations: parsed.recommendations
        }
      }
    } catch (error) {
      console.error('Report generation failed:', error)
    }

    return {
      criticalForGoal,
      secondaryIssues,
      goalAlignment: 'Unable to assess alignment',
      recommendations: []
    }
  }
}
