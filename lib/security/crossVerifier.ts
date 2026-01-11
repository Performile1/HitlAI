import { Page } from 'playwright'
import { ChatAnthropic } from '@langchain/anthropic'

interface VerificationResult {
  elementExists: boolean
  actualSelector: string | null
  confidence: number
  reasoning: string
}

/**
 * CrossVerifier - Prevents vision model hallucinations
 * 
 * Vision models sometimes "see" buttons that aren't actually in the DOM,
 * especially in complex screenshots. This verifier uses Playwright to
 * confirm elements exist before logging friction points.
 */
export class CrossVerifier {
  private llm: ChatAnthropic

  constructor() {
    this.llm = new ChatAnthropic({
      modelName: 'claude-3-5-sonnet-20241022',
      temperature: 0.1,
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }

  /**
   * Verifies that an element identified by VisionSpecialist actually exists in DOM
   */
  async verifyElement(
    page: Page,
    elementDescription: string,
    visionLocation?: { x: number; y: number }
  ): Promise<VerificationResult> {
    try {
      // Try multiple selector strategies
      const selectors = await this.generateSelectors(elementDescription)

      for (const selector of selectors) {
        try {
          const element = await page.$(selector)
          if (element) {
            // Element exists - verify it's visible
            const isVisible = await element.isVisible()
            if (isVisible) {
              return {
                elementExists: true,
                actualSelector: selector,
                confidence: 1.0,
                reasoning: `Element found with selector: ${selector}`
              }
            }
          }
        } catch (error) {
          // Try next selector
          continue
        }
      }

      // If vision provided coordinates, check if anything clickable is there
      if (visionLocation) {
        const elementAtPoint = await page.evaluate(
          ({ x, y }) => {
            const el = document.elementFromPoint(x, y)
            if (!el) return null
            return {
              tagName: el.tagName,
              id: el.id,
              className: el.className,
              text: el.textContent?.substring(0, 50)
            }
          },
          visionLocation
        )

        if (elementAtPoint) {
          return {
            elementExists: true,
            actualSelector: `${elementAtPoint.tagName}${elementAtPoint.id ? '#' + elementAtPoint.id : ''}`,
            confidence: 0.7,
            reasoning: `Found element at coordinates but description mismatch: ${JSON.stringify(elementAtPoint)}`
          }
        }
      }

      // Element not found - likely hallucination
      return {
        elementExists: false,
        actualSelector: null,
        confidence: 0.0,
        reasoning: `Element "${elementDescription}" not found in DOM. Possible vision hallucination.`
      }

    } catch (error) {
      console.error('Cross-verification failed:', error)
      return {
        elementExists: false,
        actualSelector: null,
        confidence: 0.0,
        reasoning: `Verification error: ${error}`
      }
    }
  }

  /**
   * Generates multiple selector strategies from element description
   */
  private async generateSelectors(elementDescription: string): Promise<string[]> {
    const prompt = `Generate CSS/Playwright selectors for this element description: "${elementDescription}"

Return 5 different selector strategies in order of likelihood:
1. Text-based (getByText, getByRole with name)
2. ARIA-based (getByRole, getByLabel)
3. ID/Class-based
4. Data attribute-based
5. Structural (nth-child, etc.)

Return JSON array of selector strings:
["selector1", "selector2", "selector3", "selector4", "selector5"]`

    try {
      const response = await this.llm.invoke(prompt)
      const content = response.content as string
      
      const jsonMatch = content.match(/\[[\s\S]*?\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Selector generation failed:', error)
    }

    // Fallback: basic selectors
    return [
      `text="${elementDescription}"`,
      `[aria-label*="${elementDescription}"]`,
      `button:has-text("${elementDescription}")`,
      `a:has-text("${elementDescription}")`,
      `*:has-text("${elementDescription}")`
    ]
  }

  /**
   * Validates friction points from VisionSpecialist against actual DOM
   * Filters out hallucinated elements
   */
  async validateFrictionPoints(
    page: Page,
    frictionPoints: Array<{
      element: string
      issueType: string
      severity: string
      [key: string]: any
    }>
  ): Promise<{
    verified: typeof frictionPoints
    hallucinated: typeof frictionPoints
    uncertain: typeof frictionPoints
  }> {
    const verified: typeof frictionPoints = []
    const hallucinated: typeof frictionPoints = []
    const uncertain: typeof frictionPoints = []

    for (const point of frictionPoints) {
      const verification = await this.verifyElement(page, point.element)

      if (verification.confidence >= 0.8) {
        verified.push({
          ...point,
          verifiedSelector: verification.actualSelector
        })
      } else if (verification.confidence < 0.3) {
        hallucinated.push({
          ...point,
          hallucinationReason: verification.reasoning
        })
      } else {
        uncertain.push({
          ...point,
          verificationNote: verification.reasoning
        })
      }
    }

    return { verified, hallucinated, uncertain }
  }

  /**
   * Generates a hallucination report for monitoring
   */
  async generateHallucinationReport(
    testRunId: string,
    hallucinatedElements: any[]
  ): Promise<string> {
    if (hallucinatedElements.length === 0) {
      return 'No hallucinations detected ✅'
    }

    return `
# Vision Hallucination Report

**Test Run:** ${testRunId}
**Hallucinated Elements:** ${hallucinatedElements.length}

## Details

${hallucinatedElements.map((el, i) => `
### ${i + 1}. ${el.element}
- **Issue Type:** ${el.issueType}
- **Severity:** ${el.severity}
- **Reason:** ${el.hallucinationReason}
`).join('\n')}

## Recommendation
These elements were flagged by VisionSpecialist but don't exist in the DOM.
This may indicate:
1. Vision model misinterpreting the screenshot
2. Element description too vague
3. Dynamic content that loaded/unloaded

**Action:** Review VisionSpecialist prompts and consider retraining on similar layouts.
`
  }

  /**
   * Tracks hallucination patterns over time
   */
  async analyzeHallucinationPatterns(
    recentHallucinations: Array<{
      element: string
      issueType: string
      url: string
      timestamp: Date
    }>
  ): Promise<{
    commonPatterns: string[]
    problematicSites: string[]
    recommendation: string
  }> {
    const elementTypes = new Map<string, number>()
    const sites = new Map<string, number>()

    recentHallucinations.forEach(h => {
      elementTypes.set(h.issueType, (elementTypes.get(h.issueType) || 0) + 1)
      sites.set(h.url, (sites.get(h.url) || 0) + 1)
    })

    const commonPatterns = Array.from(elementTypes.entries())
      .filter(([_, count]) => count >= 3)
      .map(([type, _]) => type)

    const problematicSites = Array.from(sites.entries())
      .filter(([_, count]) => count >= 5)
      .map(([url, _]) => url)

    let recommendation = ''
    if (commonPatterns.length > 0) {
      recommendation += `Vision model struggles with: ${commonPatterns.join(', ')}. `
    }
    if (problematicSites.length > 0) {
      recommendation += `Specific sites causing issues: ${problematicSites.join(', ')}. Consider manual review.`
    }

    return {
      commonPatterns,
      problematicSites,
      recommendation: recommendation || 'No significant patterns detected'
    }
  }
}
