/**
 * HeuristicLoader - Persona-weighted UX guideline retrieval
 * 
 * This class provides evidence-based UX guidelines (Baymard, NN/g, WCAG)
 * weighted by persona characteristics. The guidelines SUPPORT persona-based
 * testing, they don't replace it.
 */

export interface UXHeuristic {
  id: string
  source: 'baymard' | 'nng' | 'wcag'
  category: string
  title: string
  description: string
  context: string[] // ['checkout', 'forms', 'mobile']
  severityWeight: number // 0.0-1.0
  personaRelevance: Record<string, number> // persona_name -> relevance score
  examples: string[]
  citationUrl: string
}

export interface PersonaProfile {
  name: string
  age: number
  tech_literacy: string
  eyesight: string
  cognitive_load: string
  attention_rules: string[]
}

export interface WeightedGuideline extends UXHeuristic {
  relevanceScore: number // How relevant to current persona
  personaImpactReason: string // WHY this matters for this persona
}

export class HeuristicLoader {
  private heuristics: UXHeuristic[]

  constructor() {
    this.heuristics = this.initializeDefaultHeuristics()
  }

  /**
   * Get guidelines relevant to the current context and persona.
   * Returns guidelines sorted by persona relevance, not just generic importance.
   */
  async getRelevantGuidelines(
    pageContext: string,
    persona: PersonaProfile,
    topK: number = 5
  ): Promise<WeightedGuideline[]> {
    // Extract context keywords from page
    const contextKeywords = this.extractContextKeywords(pageContext)
    
    // Score each heuristic by persona relevance
    const scored = this.heuristics.map(heuristic => {
      const personaScore = this.calculatePersonaRelevance(heuristic, persona)
      const contextScore = this.calculateContextRelevance(heuristic, contextKeywords)
      const combinedScore = (personaScore * 0.7) + (contextScore * 0.3) // Persona-first weighting
      
      return {
        ...heuristic,
        relevanceScore: combinedScore,
        personaImpactReason: this.generatePersonaImpactReason(heuristic, persona)
      }
    })

    // Sort by relevance and return top K
    return scored
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK)
  }

  /**
   * Calculate how relevant a guideline is to a specific persona.
   * This is where the "human testing" magic happens.
   */
  private calculatePersonaRelevance(
    heuristic: UXHeuristic,
    persona: PersonaProfile
  ): number {
    // Check if persona has explicit relevance score
    const baseScore = heuristic.personaRelevance[persona.name] || 0.5

    // Boost score based on persona characteristics
    let adjustedScore = baseScore

    // Age-based adjustments
    if (persona.age >= 65) {
      if (heuristic.category === 'Touch Targets') adjustedScore += 0.2
      if (heuristic.category === 'Text Readability') adjustedScore += 0.3
      if (heuristic.category === 'Cognitive Load') adjustedScore += 0.2
    }

    // Eyesight-based adjustments
    if (persona.eyesight.includes('low') || persona.eyesight.includes('presbyopia')) {
      if (heuristic.category === 'Contrast') adjustedScore += 0.3
      if (heuristic.category === 'Text Readability') adjustedScore += 0.3
      if (heuristic.category === 'Visual Hierarchy') adjustedScore += 0.2
    }

    // Tech literacy adjustments
    if (persona.tech_literacy === 'low') {
      if (heuristic.category === 'Navigation') adjustedScore += 0.2
      if (heuristic.category === 'Error Prevention') adjustedScore += 0.3
      if (heuristic.category === 'Microcopy') adjustedScore += 0.2
    }

    // Cognitive load adjustments
    if (persona.cognitive_load === 'low') {
      if (heuristic.category === 'Cognitive Load') adjustedScore += 0.3
      if (heuristic.category === 'Information Density') adjustedScore += 0.2
    }

    return Math.min(adjustedScore, 1.0)
  }

  /**
   * Calculate how relevant a guideline is to the current page context
   */
  private calculateContextRelevance(
    heuristic: UXHeuristic,
    contextKeywords: string[]
  ): number {
    const matches = heuristic.context.filter(ctx => 
      contextKeywords.some(keyword => 
        ctx.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(ctx.toLowerCase())
      )
    )
    
    return matches.length / Math.max(heuristic.context.length, 1)
  }

  /**
   * Extract relevant keywords from page context
   */
  private extractContextKeywords(pageContext: string): string[] {
    const keywords: string[] = []
    const lower = pageContext.toLowerCase()

    // Page type detection
    if (lower.includes('checkout') || lower.includes('cart')) keywords.push('checkout')
    if (lower.includes('form') || lower.includes('input')) keywords.push('forms')
    if (lower.includes('product') || lower.includes('price')) keywords.push('product')
    if (lower.includes('navigation') || lower.includes('menu')) keywords.push('navigation')
    if (lower.includes('search')) keywords.push('search')
    if (lower.includes('button')) keywords.push('buttons')
    if (lower.includes('link')) keywords.push('links')
    if (lower.includes('mobile') || lower.includes('responsive')) keywords.push('mobile')

    return keywords
  }

  /**
   * Generate a human-readable explanation of why this guideline matters for this persona
   */
  private generatePersonaImpactReason(
    heuristic: UXHeuristic,
    persona: PersonaProfile
  ): string {
    const reasons: string[] = []

    // Age-based reasoning
    if (persona.age >= 65) {
      if (heuristic.category === 'Touch Targets') {
        reasons.push(`Seniors often have reduced motor control and may struggle with small tap targets`)
      }
      if (heuristic.category === 'Text Readability') {
        reasons.push(`Age-related vision changes make small or low-contrast text difficult to read`)
      }
    }

    // Eyesight-based reasoning
    if (persona.eyesight.includes('low') || persona.eyesight.includes('presbyopia')) {
      if (heuristic.category === 'Contrast') {
        reasons.push(`Users with ${persona.eyesight} require higher contrast ratios to distinguish elements`)
      }
      if (heuristic.category === 'Text Readability') {
        reasons.push(`Visual impairments make font size and spacing critical for readability`)
      }
    }

    // Tech literacy reasoning
    if (persona.tech_literacy === 'low') {
      if (heuristic.category === 'Navigation') {
        reasons.push(`Users with low tech literacy need clear, obvious navigation patterns`)
      }
      if (heuristic.category === 'Error Prevention') {
        reasons.push(`Less tech-savvy users benefit from proactive error prevention`)
      }
    }

    // Cognitive load reasoning
    if (persona.cognitive_load === 'low') {
      if (heuristic.category === 'Cognitive Load') {
        reasons.push(`Users with limited cognitive capacity need simplified, focused interfaces`)
      }
    }

    return reasons.length > 0 
      ? reasons.join('. ') 
      : `This guideline applies to ${persona.name} based on general UX best practices`
  }

  /**
   * Initialize curated heuristics database
   * Focus: Persona-relevant guidelines, not exhaustive UX catalog
   */
  private initializeDefaultHeuristics(): UXHeuristic[] {
    return [
      // === BAYMARD INSTITUTE - E-COMMERCE FOCUSED ===
      {
        id: 'BAY-001',
        source: 'baymard',
        category: 'Touch Targets',
        title: 'Minimum Touch Target Size',
        description: 'Touch targets should be at least 44x44 CSS pixels to ensure easy tapping, especially for users with motor impairments or on mobile devices.',
        context: ['mobile', 'buttons', 'links', 'forms'],
        severityWeight: 0.9,
        personaRelevance: {
          'senior_casual': 1.0,
          'accessibility_focused': 1.0,
          'middle_age_moderate': 0.7,
          'young_power_user': 0.3
        },
        examples: [
          'Button too small: 28x28px',
          'Link spacing insufficient: 8px between targets'
        ],
        citationUrl: 'https://baymard.com/blog/touch-target-size'
      },
      {
        id: 'BAY-002',
        source: 'baymard',
        category: 'Form Design',
        title: 'Inline Form Validation',
        description: 'Provide immediate, inline validation feedback as users complete form fields. Show success indicators for valid input and clear error messages for invalid input.',
        context: ['forms', 'checkout', 'registration'],
        severityWeight: 0.8,
        personaRelevance: {
          'senior_casual': 0.9,
          'accessibility_focused': 0.8,
          'middle_age_moderate': 0.8,
          'young_power_user': 0.6
        },
        examples: [
          'No validation until form submission',
          'Error messages appear only at top of page'
        ],
        citationUrl: 'https://baymard.com/blog/inline-form-validation'
      },
      {
        id: 'BAY-003',
        source: 'baymard',
        category: 'Checkout',
        title: 'Guest Checkout Option',
        description: 'Always offer a guest checkout option. Forced account creation is a major cause of cart abandonment, especially for first-time or infrequent shoppers.',
        context: ['checkout', 'registration'],
        severityWeight: 0.9,
        personaRelevance: {
          'senior_casual': 0.9,
          'accessibility_focused': 0.6,
          'middle_age_moderate': 0.8,
          'young_power_user': 0.7
        },
        examples: [
          'Forced account creation before purchase',
          'No clear "Continue as Guest" button'
        ],
        citationUrl: 'https://baymard.com/blog/guest-checkout'
      },
      {
        id: 'BAY-004',
        source: 'baymard',
        category: 'Navigation',
        title: 'Clear Category Labels',
        description: 'Use plain language for navigation labels. Avoid marketing jargon, clever wordplay, or ambiguous terms that require users to guess what they mean.',
        context: ['navigation', 'menu', 'product'],
        severityWeight: 0.7,
        personaRelevance: {
          'senior_casual': 1.0,
          'accessibility_focused': 0.8,
          'middle_age_moderate': 0.7,
          'young_power_user': 0.4
        },
        examples: [
          'Menu item labeled "Lifestyle" instead of "Clothing"',
          'Ambiguous category names like "Essentials"'
        ],
        citationUrl: 'https://baymard.com/blog/category-names'
      },

      // === NIELSEN NORMAN GROUP - USABILITY FOCUSED ===
      {
        id: 'NNG-001',
        source: 'nng',
        category: 'Text Readability',
        title: 'Readable Font Size',
        description: 'Body text should be at least 16px on desktop and mobile. Smaller text creates eye strain and is particularly difficult for older users or those with vision impairments.',
        context: ['text', 'content', 'mobile'],
        severityWeight: 0.8,
        personaRelevance: {
          'senior_casual': 1.0,
          'accessibility_focused': 1.0,
          'middle_age_moderate': 0.8,
          'young_power_user': 0.4
        },
        examples: [
          'Body text at 12px or 14px',
          'Fine print at 10px or smaller'
        ],
        citationUrl: 'https://www.nngroup.com/articles/font-size/'
      },
      {
        id: 'NNG-002',
        source: 'nng',
        category: 'Error Prevention',
        title: 'Prevent Errors Before They Occur',
        description: 'Design interfaces to prevent errors rather than just detecting them. Use constraints, defaults, and clear affordances to guide users toward correct actions.',
        context: ['forms', 'interaction', 'buttons'],
        severityWeight: 0.9,
        personaRelevance: {
          'senior_casual': 1.0,
          'accessibility_focused': 0.9,
          'middle_age_moderate': 0.8,
          'young_power_user': 0.5
        },
        examples: [
          'No input masking for phone/credit card fields',
          'Destructive actions without confirmation dialogs'
        ],
        citationUrl: 'https://www.nngroup.com/articles/slips/'
      },
      {
        id: 'NNG-003',
        source: 'nng',
        category: 'Contrast',
        title: 'Sufficient Color Contrast',
        description: 'Text and interactive elements must have sufficient contrast against their background. Minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA).',
        context: ['text', 'buttons', 'links', 'accessibility'],
        severityWeight: 0.9,
        personaRelevance: {
          'senior_casual': 1.0,
          'accessibility_focused': 1.0,
          'middle_age_moderate': 0.8,
          'young_power_user': 0.5
        },
        examples: [
          'Light gray text on white background',
          'Low-contrast buttons that blend into page'
        ],
        citationUrl: 'https://www.nngroup.com/articles/low-contrast/'
      },
      {
        id: 'NNG-004',
        source: 'nng',
        category: 'Cognitive Load',
        title: 'Minimize Cognitive Load',
        description: 'Reduce the amount of information users must process at once. Break complex tasks into steps, use progressive disclosure, and avoid overwhelming users with choices.',
        context: ['forms', 'checkout', 'navigation'],
        severityWeight: 0.8,
        personaRelevance: {
          'senior_casual': 1.0,
          'accessibility_focused': 0.8,
          'middle_age_moderate': 0.9,
          'young_power_user': 0.4
        },
        examples: [
          'Single-page form with 30+ fields',
          'Too many navigation options (>7 items)'
        ],
        citationUrl: 'https://www.nngroup.com/articles/minimize-cognitive-load/'
      },

      // === WCAG 2.1 - ACCESSIBILITY FOCUSED ===
      {
        id: 'WCAG-001',
        source: 'wcag',
        category: 'Keyboard Navigation',
        title: 'Keyboard Accessible',
        description: 'All interactive elements must be accessible via keyboard alone. Users should be able to navigate, activate, and interact without a mouse.',
        context: ['accessibility', 'forms', 'buttons', 'navigation'],
        severityWeight: 1.0,
        personaRelevance: {
          'senior_casual': 0.6,
          'accessibility_focused': 1.0,
          'middle_age_moderate': 0.5,
          'young_power_user': 0.7
        },
        examples: [
          'Custom dropdowns not keyboard accessible',
          'Modal dialogs that trap focus'
        ],
        citationUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html'
      },
      {
        id: 'WCAG-002',
        source: 'wcag',
        category: 'ARIA Labels',
        title: 'Meaningful ARIA Labels',
        description: 'Interactive elements must have descriptive ARIA labels or accessible names. Screen reader users rely on these to understand element purpose.',
        context: ['accessibility', 'buttons', 'links', 'forms'],
        severityWeight: 1.0,
        personaRelevance: {
          'senior_casual': 0.4,
          'accessibility_focused': 1.0,
          'middle_age_moderate': 0.3,
          'young_power_user': 0.3
        },
        examples: [
          'Icon buttons with no aria-label',
          'Generic "Click here" link text'
        ],
        citationUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html'
      },
      {
        id: 'WCAG-003',
        source: 'wcag',
        category: 'Visual Hierarchy',
        title: 'Proper Heading Structure',
        description: 'Use semantic HTML headings (h1-h6) in logical order. This helps all users understand page structure, especially screen reader users.',
        context: ['accessibility', 'content', 'navigation'],
        severityWeight: 0.7,
        personaRelevance: {
          'senior_casual': 0.6,
          'accessibility_focused': 1.0,
          'middle_age_moderate': 0.5,
          'young_power_user': 0.3
        },
        examples: [
          'Skipping heading levels (h1 to h3)',
          'Using <div> with CSS instead of semantic headings'
        ],
        citationUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html'
      }
    ]
  }
}
