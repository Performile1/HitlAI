import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'

interface FrustrationMoment {
  timestamp: number
  type: 'rage_click' | 'long_pause' | 'cursor_confusion' | 'back_navigation' | 'repeated_action'
  description: string
  severity: number
  element?: string
  screenshotUrl?: string
}

interface VideoAnalysis {
  frustrationMoments: FrustrationMoment[]
  overallFrustrationScore: number
  keyInsights: string[]
  recommendedTimestamps: number[]
  summary: string
}

/**
 * VideoAnalyzer - Analyzes test recordings to detect frustration moments
 * 
 * Uses vision models to watch human tester recordings and automatically
 * timestamp "Moments of Frustration" like rage clicks, long pauses, and
 * cursor confusion. This provides deeper insights than just the final report.
 */
export class VideoAnalyzer {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.3
    })
  }

  /**
   * Analyzes interaction events from a recorded session
   * Detects patterns indicating frustration or confusion
   */
  async analyzeInteractionStream(
    interactions: Array<{
      timestamp: number
      type: string
      target: string
      value?: string
    }>
  ): Promise<FrustrationMoment[]> {
    const frustrationMoments: FrustrationMoment[] = []

    // Detect rage clicks (multiple clicks in short succession)
    for (let i = 1; i < interactions.length; i++) {
      const current = interactions[i]
      const previous = interactions[i - 1]

      if (
        current.type === 'click' &&
        previous.type === 'click' &&
        current.target === previous.target &&
        current.timestamp - previous.timestamp < 500
      ) {
        let clickCount = 2
        let j = i + 1
        while (
          j < interactions.length &&
          interactions[j].type === 'click' &&
          interactions[j].target === current.target &&
          interactions[j].timestamp - interactions[j - 1].timestamp < 500
        ) {
          clickCount++
          j++
        }

        if (clickCount >= 3) {
          frustrationMoments.push({
            timestamp: current.timestamp,
            type: 'rage_click',
            description: `User clicked ${clickCount} times rapidly on ${current.target}`,
            severity: Math.min(10, clickCount * 2),
            element: current.target
          })
        }
      }
    }

    // Detect long pauses (no interaction for >5 seconds)
    for (let i = 1; i < interactions.length; i++) {
      const timeDiff = interactions[i].timestamp - interactions[i - 1].timestamp
      if (timeDiff > 5000) {
        frustrationMoments.push({
          timestamp: interactions[i - 1].timestamp,
          type: 'long_pause',
          description: `User paused for ${Math.round(timeDiff / 1000)}s (likely confused or reading)`,
          severity: Math.min(10, Math.floor(timeDiff / 2000)),
          element: interactions[i - 1].target
        })
      }
    }

    // Detect cursor confusion (rapid movement without clicks)
    let hoverCount = 0
    let lastHoverTime = 0
    for (const interaction of interactions) {
      if (interaction.type === 'hover' || interaction.type === 'mousemove') {
        if (interaction.timestamp - lastHoverTime < 100) {
          hoverCount++
        } else {
          if (hoverCount > 20) {
            frustrationMoments.push({
              timestamp: lastHoverTime,
              type: 'cursor_confusion',
              description: `Rapid cursor movement (${hoverCount} moves) - user searching for clickable element`,
              severity: Math.min(10, Math.floor(hoverCount / 5))
            })
          }
          hoverCount = 0
        }
        lastHoverTime = interaction.timestamp
      } else {
        hoverCount = 0
      }
    }

    // Detect back navigation (user giving up)
    for (const interaction of interactions) {
      if (interaction.type === 'navigation' && interaction.value === 'back') {
        frustrationMoments.push({
          timestamp: interaction.timestamp,
          type: 'back_navigation',
          description: 'User clicked back button (abandoning current flow)',
          severity: 8
        })
      }
    }

    // Detect repeated actions (trying same thing multiple times)
    const actionMap = new Map<string, number[]>()
    for (const interaction of interactions) {
      const key = `${interaction.type}:${interaction.target}`
      const timestamps = actionMap.get(key) || []
      timestamps.push(interaction.timestamp)
      actionMap.set(key, timestamps)
    }

    for (const [action, timestamps] of actionMap.entries()) {
      if (timestamps.length >= 3) {
        const [type, target] = action.split(':')
        frustrationMoments.push({
          timestamp: timestamps[0],
          type: 'repeated_action',
          description: `User repeated "${type}" on "${target}" ${timestamps.length} times`,
          severity: Math.min(10, timestamps.length * 2),
          element: target
        })
      }
    }

    return frustrationMoments.sort((a, b) => a.timestamp - b.timestamp)
  }

  /**
   * Uses GPT-4o vision to analyze screenshots at frustration moments
   * Provides context for why the user was frustrated
   */
  async analyzeScreenshotContext(
    screenshotUrl: string,
    frustrationMoment: FrustrationMoment,
    persona: any
  ): Promise<string> {
    const prompt = `Analyze this screenshot taken during a moment of user frustration.

**Context:**
- Frustration Type: ${frustrationMoment.type}
- Description: ${frustrationMoment.description}
- Severity: ${frustrationMoment.severity}/10
- Element: ${frustrationMoment.element || 'Unknown'}

**Persona:**
- ${persona.name} (${persona.age}yo, ${persona.tech_literacy} tech literacy)
- Eyesight: ${persona.eyesight}
- Cognitive Load: ${persona.cognitive_load}

**Your Task:**
Look at the screenshot and explain WHY this persona would be frustrated at this moment. Consider:
- Is the UI element hard to see for their eyesight level?
- Is the layout confusing for their tech literacy?
- Are there too many options causing cognitive overload?
- Is there unclear feedback or error messaging?

Provide a concise explanation (2-3 sentences).`

    try {
      const response = await this.llm.invoke([
        new HumanMessage({
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: screenshotUrl } }
          ]
        })
      ])

      return response.content as string
    } catch (error) {
      console.error('Screenshot analysis failed:', error)
      return 'Unable to analyze screenshot context'
    }
  }

  /**
   * Generates a comprehensive video analysis report
   */
  async generateVideoReport(
    interactions: any[],
    persona: any,
    testObjective: string
  ): Promise<VideoAnalysis> {
    const frustrationMoments = await this.analyzeInteractionStream(interactions)

    const overallFrustrationScore = frustrationMoments.length > 0
      ? frustrationMoments.reduce((sum, m) => sum + m.severity, 0) / frustrationMoments.length / 10
      : 0

    const keyInsights: string[] = []
    
    if (frustrationMoments.some(m => m.type === 'rage_click')) {
      keyInsights.push('User experienced rage clicks - elements not responding as expected')
    }
    if (frustrationMoments.some(m => m.type === 'long_pause')) {
      keyInsights.push('Long pauses detected - user confused or reading complex content')
    }
    if (frustrationMoments.some(m => m.type === 'cursor_confusion')) {
      keyInsights.push('Cursor confusion - difficulty finding clickable elements')
    }
    if (frustrationMoments.some(m => m.type === 'back_navigation')) {
      keyInsights.push('User navigated back - abandoned the flow')
    }

    const recommendedTimestamps = frustrationMoments
      .filter(m => m.severity >= 7)
      .map(m => m.timestamp)
      .slice(0, 5)

    const summary = `Detected ${frustrationMoments.length} frustration moments with average severity ${(overallFrustrationScore * 10).toFixed(1)}/10. ${
      keyInsights.length > 0 ? 'Key issues: ' + keyInsights.join('; ') : 'Session relatively smooth.'
    }`

    return {
      frustrationMoments,
      overallFrustrationScore,
      keyInsights,
      recommendedTimestamps,
      summary
    }
  }
}
