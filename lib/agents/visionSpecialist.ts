import { ChatAnthropic } from '@langchain/anthropic'
import { HeuristicLoader, WeightedGuideline } from '@/lib/memory/heuristicLoader'

export class VisionSpecialist {
  private llm: ChatAnthropic
  private heuristicLoader: HeuristicLoader

  constructor() {
    this.llm = new ChatAnthropic({
      modelName: 'claude-3-5-sonnet-20240620',
      temperature: 0.5,
      maxTokens: 4096
    })
    this.heuristicLoader = new HeuristicLoader()
  }

  async auditUX(persona: any, schema: any, context: string) {
    // Load persona-weighted UX guidelines BEFORE audit
    const guidelines = await this.heuristicLoader.getRelevantGuidelines(
      context,
      persona,
      5 // Top 5 most relevant guidelines for this persona
    )

    // Format guidelines for prompt
    const guidelinesSection = this.formatGuidelinesForPrompt(guidelines)

    const prompt = `You are a HUMAN-CENTRIC cognitive auditor testing on behalf of a real user persona.

Your job is to identify how THIS SPECIFIC PERSON would experience friction, not just generic UX issues.

**PRIMARY: Persona Profile (Your Testing Lens)**:
- Name: ${persona.name}
- Age: ${persona.age}
- Tech Literacy: ${persona.tech_literacy}
- Eyesight: ${persona.eyesight}
- Cognitive Load: ${persona.cognitive_load}
- Attention Rules: ${JSON.stringify(persona.attention_rules)}
- Reading Level: ${persona.reading_level || 'intermediate'}
- Preferred Navigation: ${persona.preferred_navigation || 'linear'}

**SUPPORTING: Evidence-Based UX Guidelines**:
${guidelinesSection}

**Page Context**:
${context.substring(0, 3000)}

**UI Schema**:
${JSON.stringify(schema).substring(0, 2000)}

**CRITICAL INSTRUCTIONS**:
1. Think like ${persona.name} (age ${persona.age}, ${persona.eyesight}, ${persona.tech_literacy} tech literacy)
2. Prioritize issues that affect THIS persona most severely
3. For EVERY friction point, cite a guideline from the Evidence Base above (use the ID like "BAY-001" or "NNG-003")
4. Explain the persona impact FIRST, then reference the guideline as supporting evidence
5. Severity should reflect impact on THIS persona, not generic users

Identify friction points in these categories:
1. Visibility Issues (contrast, size, hidden elements)
2. Cognitive Load Problems (complexity, unclear navigation)
3. Interaction Friction (hard to click, unexpected behavior)
4. Accessibility Gaps (missing ARIA, poor keyboard nav)

Return JSON:
{
  "frictionPoints": [
    {
      "element": "specific element",
      "issueType": "visibility|cognitive_load|interaction|accessibility",
      "severity": "low|medium|high|critical",
      "personaImpact": "HOW and WHY this affects ${persona.name} specifically",
      "guidelineCitation": "BAY-001 or NNG-003 etc.",
      "resolution": "how to fix"
    }
  ],
  "overallSentiment": "positive|neutral|negative|critical",
  "sentimentScore": 0.0-1.0,
  "blockingIssues": ["issues preventing ${persona.name} from completing task"],
  "summary": "brief assessment from ${persona.name}'s perspective"
}`

    const response = await this.llm.invoke(prompt)
    
    try {
      const content = response.content as string
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          frictionPoints: (parsed.frictionPoints || []).map((fp: any) => ({
            ...fp,
            guidelineCitation: fp.guidelineCitation || 'NONE' // Ensure citation field exists
          })),
          overallSentiment: parsed.overallSentiment || 'neutral',
          sentimentScore: parsed.sentimentScore || 0.5,
          blockingIssues: parsed.blockingIssues || [],
          summary: parsed.summary || ''
        }
      }
    } catch (error) {
      console.error('Failed to parse audit results:', error)
    }

    return {
      frictionPoints: [],
      overallSentiment: 'neutral',
      sentimentScore: 0.5,
      blockingIssues: [],
      summary: 'Audit parsing failed'
    }
  }

  /**
   * Format weighted guidelines for LLM prompt
   */
  private formatGuidelinesForPrompt(guidelines: WeightedGuideline[]): string {
    return guidelines.map((g, idx) => `
${idx + 1}. [${g.id}] ${g.title} (${g.source.toUpperCase()})
   - Description: ${g.description}
   - Why this matters for this persona: ${g.personaImpactReason}
   - Severity Weight: ${(g.severityWeight * 100).toFixed(0)}%
   - Examples: ${g.examples.join(', ')}
   - Citation: ${g.citationUrl}`).join('\n')
  }
}
