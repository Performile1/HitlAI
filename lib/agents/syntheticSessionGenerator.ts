import { ChatOpenAI } from '@langchain/openai'

interface SyntheticAction {
  timestamp: number
  type: 'click' | 'scroll' | 'hover' | 'input' | 'pause' | 'rage_click' | 'back_button'
  target: string
  value?: string
  frustrationLevel: number
  reasoning: string
}

interface SyntheticSession {
  personaName: string
  actions: SyntheticAction[]
  predictedFailures: Array<{
    step: string
    reason: string
    likelihood: number
  }>
  estimatedCompletionTime: number
  estimatedSentiment: number
}

/**
 * SyntheticSessionGenerator - Simulates how a persona would interact with a site
 * 
 * Before human testing starts, this agent "acts out" the persona to predict
 * where they might struggle. This helps prioritize what human testers should
 * focus on and provides a baseline for comparison.
 */
export class SyntheticSessionGenerator {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  /**
   * Generates a synthetic user session based on persona characteristics
   * Uses GPT-4o to "think like" the persona and predict their behavior
   */
  async generateSession(
    persona: any,
    pageContext: string,
    objective: string,
    uiSchema: any
  ): Promise<SyntheticSession> {
    const prompt = `You are simulating how a specific user persona would interact with a website. Think deeply about their cognitive profile and predict their exact behavior.

**Persona Profile:**
- Name: ${persona.name}
- Age: ${persona.age}
- Tech Literacy: ${persona.tech_literacy}
- Eyesight: ${persona.eyesight}
- Cognitive Load: ${persona.cognitive_load}
- Attention Rules: ${JSON.stringify(persona.attention_rules)}

**Page Context:**
${pageContext.substring(0, 2000)}

**Available UI Elements:**
${JSON.stringify(uiSchema.interactive_elements || []).substring(0, 1500)}

**Objective:**
${objective}

**Your Task:**
Act as ${persona.name}. Generate a realistic sequence of actions they would take, including:
- Where they would click (or fail to find the right element)
- When they would pause (confusion or reading)
- When they would get frustrated (rage clicks, back button)
- What they would type (including mistakes)

**Consider:**
- Low tech literacy = more exploration, more mistakes
- Poor eyesight = might miss small buttons
- High cognitive load = gets overwhelmed by complex layouts
- Attention rules = what catches their eye first

Return JSON:
{
  "personaName": "${persona.name}",
  "actions": [
    {
      "timestamp": 0,
      "type": "click|scroll|hover|input|pause|rage_click|back_button",
      "target": "element description",
      "value": "text if input",
      "frustrationLevel": 0-10,
      "reasoning": "why this action"
    }
  ],
  "predictedFailures": [
    {
      "step": "description",
      "reason": "why they'll fail",
      "likelihood": 0.0-1.0
    }
  ],
  "estimatedCompletionTime": seconds,
  "estimatedSentiment": 0.0-1.0
}`

    try {
      const response = await this.llm.invoke(prompt)
      const content = response.content as string
      
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error('Failed to parse synthetic session')
    } catch (error) {
      console.error('Synthetic session generation failed:', error)
      return {
        personaName: persona.name,
        actions: [],
        predictedFailures: [],
        estimatedCompletionTime: 0,
        estimatedSentiment: 0.5
      }
    }
  }

  /**
   * Compares synthetic session with actual human test results
   * Identifies where predictions were accurate vs. inaccurate
   */
  async compareWithActual(
    syntheticSession: SyntheticSession,
    actualResults: any
  ): Promise<{
    accuracyScore: number
    correctPredictions: string[]
    missedIssues: string[]
    falsePositives: string[]
    insights: string[]
  }> {
    const prompt = `Compare a predicted synthetic user session with actual human test results.

**Predicted Session:**
${JSON.stringify(syntheticSession, null, 2)}

**Actual Human Results:**
- Completion Time: ${actualResults.completionTime}s
- Sentiment: ${actualResults.sentimentScore}
- Friction Points: ${JSON.stringify(actualResults.frictionPoints, null, 2)}
- Notes: ${actualResults.notes}

**Analyze:**
1. Which predicted failures actually happened?
2. What issues did the human find that weren't predicted?
3. What false positives did the prediction have?
4. How accurate was the behavioral simulation?

Return JSON:
{
  "accuracyScore": 0.0-1.0,
  "correctPredictions": ["what we got right"],
  "missedIssues": ["what we didn't predict"],
  "falsePositives": ["what we predicted but didn't happen"],
  "insights": ["learnings for better predictions"]
}`

    try {
      const response = await this.llm.invoke(prompt)
      const content = response.content as string
      
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error('Failed to parse comparison')
    } catch (error) {
      console.error('Comparison failed:', error)
      return {
        accuracyScore: 0,
        correctPredictions: [],
        missedIssues: [],
        falsePositives: [],
        insights: []
      }
    }
  }

  /**
   * Generates a "failure heatmap" showing where personas are most likely to struggle
   */
  async generateFailureHeatmap(
    sessions: SyntheticSession[]
  ): Promise<Map<string, { frequency: number; avgFrustration: number }>> {
    const heatmap = new Map<string, { frequency: number; avgFrustration: number; totalFrustration: number }>()

    sessions.forEach(session => {
      session.actions.forEach(action => {
        if (action.frustrationLevel > 5) {
          const existing = heatmap.get(action.target) || { frequency: 0, avgFrustration: 0, totalFrustration: 0 }
          existing.frequency++
          existing.totalFrustration += action.frustrationLevel
          existing.avgFrustration = existing.totalFrustration / existing.frequency
          heatmap.set(action.target, existing)
        }
      })
    })

    return new Map(
      Array.from(heatmap.entries()).map(([target, data]) => [
        target,
        { frequency: data.frequency, avgFrustration: data.avgFrustration }
      ])
    )
  }
}
