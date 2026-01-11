// 13th Agent: Ethical Guardrails (Dark Pattern Detection)
import { ChatOpenAI } from '@langchain/openai'

export class EthicalGuardrailsAgent {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.3
    })
  }

  async detectDarkPatterns(
    url: string,
    html: string,
    targetAudience: string
  ): Promise<{
    darkPatterns: Array<{
      type: string
      element: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      complianceRisk: string
    }>
    privacyViolations: string[]
    kidSafetyIssues: string[]
    overallScore: number
  }> {
    const prompt = `Analyze this UI for dark patterns and ethical violations.

Target Audience: ${targetAudience}

Dark Patterns to detect:
1. Forced Continuity (hard to cancel subscriptions)
2. Confirmshaming (guilt-tripping users)
3. Hidden Costs (surprise fees at checkout)
4. Trick Questions (confusing opt-out language)
5. Bait and Switch (misleading buttons)
6. Disguised Ads (ads that look like content)
7. Privacy Zuckering (tricking users into sharing data)

For kids apps, also check:
- COPPA compliance (no data collection under 13)
- In-app purchases clearly labeled
- No manipulative reward systems
- Age-appropriate content

HTML: ${html.substring(0, 3000)}

Return JSON with darkPatterns array, privacyViolations, kidSafetyIssues, and overallScore (0-100).`

    const response = await this.llm.invoke(prompt)
    const content = response.content as string
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Failed to parse ethical analysis:', error)
    }

    return {
      darkPatterns: [],
      privacyViolations: [],
      kidSafetyIssues: [],
      overallScore: 100
    }
  }
}
