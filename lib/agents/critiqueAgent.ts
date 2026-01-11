import { ChatAnthropic } from '@langchain/anthropic'

interface DivergenceAnalysis {
  missedIssues: Array<{
    humanFinding: string
    whyAIMissedIt: string
    category: 'subtle_ux' | 'emotional_friction' | 'cognitive_load' | 'cultural_context' | 'accessibility_nuance'
    severity: 'low' | 'medium' | 'high' | 'critical'
    learningPoint: string
  }>
  agreementScore: number
  aiBlindSpots: string[]
  recommendations: string[]
  summary: string
}

/**
 * CritiqueAgent - Analyzes divergence between AI and human test results
 * 
 * This agent is the "secret sauce" for continuous learning. Instead of just
 * averaging AI and human scores, it deeply analyzes WHY the AI missed what
 * humans found. These insights are stored as "Discrepancy Lessons" in vector
 * memory, creating a self-correcting UX engine.
 */
export class CritiqueAgent {
  private llm: ChatAnthropic

  constructor() {
    this.llm = new ChatAnthropic({
      modelName: 'claude-3-5-sonnet-20241022',
      temperature: 0.2,
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }

  /**
   * Analyzes divergence between AI and human findings
   * Focuses on the "missing 20%" where real value lies
   */
  async analyzeDivergence(
    aiResults: any,
    humanResults: any,
    persona: any,
    testContext: {
      url: string
      objective: string
      businessGoal?: string
    }
  ): Promise<DivergenceAnalysis> {
    const prompt = `You are a UX Critique Specialist analyzing why an AI testing system missed issues that human testers found.

**Context:**
- URL: ${testContext.url}
- Objective: ${testContext.objective}
- Business Goal: ${testContext.businessGoal || 'Not specified'}
- Persona: ${persona.name} (${persona.age}yo, ${persona.tech_literacy} tech literacy)

**AI Test Results:**
- Sentiment Score: ${aiResults.sentimentScore}
- Friction Points Found: ${aiResults.frictionPoints.length}
- Issues: ${JSON.stringify(aiResults.frictionPoints.slice(0, 5), null, 2)}

**Human Test Results:**
- Sentiment Score: ${humanResults.sentimentScore}
- Friction Points Found: ${humanResults.frictionPoints.length}
- Issues: ${JSON.stringify(humanResults.frictionPoints.slice(0, 5), null, 2)}
- Tester Notes: ${humanResults.notes || 'None'}

**Your Task:**
Analyze the DIVERGENCE. Focus on:
1. What did the human find that the AI completely missed?
2. WHY did the AI miss it? (Be specific - was it subtle UX, emotional friction, cultural context, etc.)
3. What can the AI learn from this to improve future tests?

**Critical Focus Areas:**
- Emotional/visceral reactions ("this feels sketchy", "I don't trust this")
- Subtle cognitive load (confusion not captured by heuristics)
- Cultural or demographic nuances
- Accessibility issues beyond WCAG compliance
- "Vibe" or brand perception issues

Return JSON:
{
  "missedIssues": [
    {
      "humanFinding": "exact quote or description",
      "whyAIMissedIt": "detailed explanation of AI's blind spot",
      "category": "subtle_ux|emotional_friction|cognitive_load|cultural_context|accessibility_nuance",
      "severity": "low|medium|high|critical",
      "learningPoint": "actionable lesson for AI improvement"
    }
  ],
  "agreementScore": 0.0-1.0,
  "aiBlindSpots": ["pattern 1", "pattern 2"],
  "recommendations": ["how to improve AI detection"],
  "summary": "brief analysis"
}`

    try {
      const response = await this.llm.invoke(prompt)
      const content = response.content as string
      
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error('Failed to parse critique response')
    } catch (error) {
      console.error('Critique analysis failed:', error)
      return {
        missedIssues: [],
        agreementScore: 0.5,
        aiBlindSpots: [],
        recommendations: [],
        summary: 'Analysis failed'
      }
    }
  }

  /**
   * Generates a "Discrepancy Lesson" for vector memory storage
   * These lessons help the AI self-correct over time
   */
  async generateDiscrepancyLesson(
    divergenceAnalysis: DivergenceAnalysis,
    testContext: any
  ): Promise<{
    lessonText: string
    category: string
    resolution: string
    confidence: number
  }> {
    const criticalMissed = divergenceAnalysis.missedIssues.filter(
      issue => issue.severity === 'critical' || issue.severity === 'high'
    )

    if (criticalMissed.length === 0) {
      return {
        lessonText: 'AI and human results aligned well',
        category: 'alignment',
        resolution: 'No major discrepancies',
        confidence: 0.9
      }
    }

    const lessonText = `On ${testContext.url}, human testers found ${criticalMissed.length} critical issues that AI missed: ${
      criticalMissed.map(issue => issue.humanFinding).join('; ')
    }. Root cause: ${divergenceAnalysis.aiBlindSpots.join(', ')}.`

    const resolution = divergenceAnalysis.recommendations.join(' ')

    return {
      lessonText,
      category: 'discrepancy_lesson',
      resolution,
      confidence: 1 - divergenceAnalysis.agreementScore
    }
  }

  /**
   * Analyzes patterns across multiple divergence reports
   * Identifies systemic AI blind spots
   */
  async analyzeSystemicBlindSpots(
    recentDivergences: DivergenceAnalysis[]
  ): Promise<{
    patterns: Array<{
      blindSpot: string
      frequency: number
      impact: 'low' | 'medium' | 'high'
      recommendation: string
    }>
    overallTrend: 'improving' | 'stable' | 'degrading'
  }> {
    const allBlindSpots = recentDivergences.flatMap(d => d.aiBlindSpots)
    const blindSpotCounts = new Map<string, number>()

    allBlindSpots.forEach(spot => {
      blindSpotCounts.set(spot, (blindSpotCounts.get(spot) || 0) + 1)
    })

    const patterns = Array.from(blindSpotCounts.entries())
      .map(([blindSpot, frequency]) => ({
        blindSpot,
        frequency,
        impact: frequency > 5 ? 'high' : frequency > 2 ? 'medium' : 'low' as 'low' | 'medium' | 'high',
        recommendation: `Enhance detection for: ${blindSpot}`
      }))
      .sort((a, b) => b.frequency - a.frequency)

    const avgAgreement = recentDivergences.reduce((sum, d) => sum + d.agreementScore, 0) / recentDivergences.length
    const overallTrend = avgAgreement > 0.8 ? 'improving' : avgAgreement > 0.6 ? 'stable' : 'degrading'

    return { patterns, overallTrend }
  }
}
