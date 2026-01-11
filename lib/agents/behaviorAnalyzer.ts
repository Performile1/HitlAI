/**
 * BehaviorAnalyzer - Extracts patterns from real user sessions
 * 
 * Analyzes recorded user interactions to:
 * - Identify common friction points
 * - Discover navigation patterns
 * - Extract error recovery behaviors
 * - Refine persona characteristics
 */

import { ChatOpenAI } from '@langchain/openai'
import { createClient } from '@supabase/supabase-js'

interface UserSession {
  id: string
  url: string
  duration_seconds: number
  total_clicks: number
  total_errors: number
  total_hesitations: number
  completion_status: string
  estimated_age_range?: string
  estimated_tech_literacy?: string
  device_type?: string
}

interface UserInteraction {
  event_type: string
  timestamp_ms: number
  element_selector?: string
  element_text?: string
  is_error: boolean
  is_hesitation: boolean
  is_rage_click: boolean
  error_message?: string
}

interface BehaviorPattern {
  pattern_type: string
  pattern_name: string
  description: string
  url_pattern: string
  element_pattern?: string
  frequency: number
  typical_sequence: string[]
  avg_duration_seconds: number
  success_rate: number
  friction_score: number
  common_errors: string[]
  confidence_score: number
  sample_size: number
  age_range?: string
  tech_literacy?: string
  device_type?: string
}

export class BehaviorAnalyzer {
  private llm: ChatOpenAI
  private supabase: ReturnType<typeof createClient>

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3
    })

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Analyze a batch of user sessions to extract patterns
   */
  async analyzeSessions(
    url: string,
    minSessions: number = 10
  ): Promise<BehaviorPattern[]> {
    // 1. Fetch sessions for this URL
    const { data: sessions, error } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('url', url)
      .order('started_at', { ascending: false })
      .limit(100)

    if (error || !sessions || sessions.length < minSessions) {
      console.log(`Insufficient sessions for analysis: ${sessions?.length || 0}/${minSessions}`)
      return []
    }

    // 2. Fetch interactions for these sessions
    const sessionIds = (sessions as UserSession[]).map(s => s.id)
    const { data: interactions } = await this.supabase
      .from('user_interactions')
      .select('*')
      .in('session_id', sessionIds)
      .order('timestamp_ms', { ascending: true })

    if (!interactions || interactions.length === 0) {
      return []
    }

    // 3. Group sessions by user characteristics
    const sessionGroups = this.groupSessions(sessions)

    // 4. Extract patterns for each group
    const patterns: BehaviorPattern[] = []

    for (const [groupKey, groupSessions] of Object.entries(sessionGroups)) {
      const groupInteractions = interactions.filter(i =>
        groupSessions.some(s => s.id === i.session_id)
      )

      // Detect friction points
      const frictionPatterns = await this.detectFrictionPatterns(
        groupSessions,
        groupInteractions,
        groupKey
      )
      patterns.push(...frictionPatterns)

      // Detect navigation flows
      const navigationPatterns = await this.detectNavigationPatterns(
        groupSessions,
        groupInteractions,
        groupKey
      )
      patterns.push(...navigationPatterns)

      // Detect error recovery behaviors
      const errorPatterns = await this.detectErrorRecoveryPatterns(
        groupSessions,
        groupInteractions,
        groupKey
      )
      patterns.push(...errorPatterns)
    }

    // 5. Store patterns in database
    for (const pattern of patterns) {
      await this.storePattern(pattern)
    }

    return patterns
  }

  /**
   * Group sessions by user characteristics
   */
  private groupSessions(sessions: UserSession[]): Record<string, UserSession[]> {
    const groups: Record<string, UserSession[]> = {}

    for (const session of sessions) {
      const key = `${session.estimated_age_range || 'unknown'}_${session.estimated_tech_literacy || 'unknown'}_${session.device_type || 'unknown'}`
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(session)
    }

    return groups
  }

  /**
   * Detect common friction points
   */
  private async detectFrictionPatterns(
    sessions: UserSession[],
    interactions: UserInteraction[],
    groupKey: string
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = []

    // Find elements with high error rates
    const elementErrors = new Map<string, { count: number, total: number, errors: string[] }>()

    for (const interaction of interactions) {
      if (!interaction.element_selector) continue

      const key = interaction.element_selector
      if (!elementErrors.has(key)) {
        elementErrors.set(key, { count: 0, total: 0, errors: [] })
      }

      const stats = elementErrors.get(key)!
      stats.total++
      
      if (interaction.is_error) {
        stats.count++
        if (interaction.error_message) {
          stats.errors.push(interaction.error_message)
        }
      }
    }

    // Create patterns for high-friction elements
    for (const [selector, stats] of elementErrors.entries()) {
      const errorRate = stats.count / stats.total
      
      if (errorRate > 0.3 && stats.total > 5) { // 30% error rate, min 5 interactions
        const [ageRange, techLiteracy, deviceType] = groupKey.split('_')

        patterns.push({
          pattern_type: 'common_friction',
          pattern_name: `High error rate on ${selector}`,
          description: `${(errorRate * 100).toFixed(1)}% of users encounter errors on this element`,
          url_pattern: sessions[0].url,
          element_pattern: selector,
          frequency: stats.count,
          typical_sequence: ['click', 'error'],
          avg_duration_seconds: 0,
          success_rate: 1 - errorRate,
          friction_score: errorRate,
          common_errors: [...new Set(stats.errors)],
          confidence_score: Math.min(stats.total / 20, 1.0), // Higher confidence with more samples
          sample_size: stats.total,
          age_range: ageRange !== 'unknown' ? ageRange : undefined,
          tech_literacy: techLiteracy !== 'unknown' ? techLiteracy : undefined,
          device_type: deviceType !== 'unknown' ? deviceType : undefined
        })
      }
    }

    return patterns
  }

  /**
   * Detect common navigation flows
   */
  private async detectNavigationPatterns(
    sessions: UserSession[],
    interactions: UserInteraction[],
    groupKey: string
  ): Promise<BehaviorPattern[]> {
    // Group interactions by session to analyze sequences
    const sessionSequences = new Map<string, UserInteraction[]>()

    for (const interaction of interactions) {
      const sessionId = interaction.session_id
      if (!sessionSequences.has(sessionId)) {
        sessionSequences.set(sessionId, [])
      }
      sessionSequences.get(sessionId)!.push(interaction)
    }

    // Find common sequences (simplified - could use sequence mining algorithms)
    const sequences = Array.from(sessionSequences.values())
      .map(seq => seq.map(i => i.event_type).join('->'))

    const sequenceCounts = new Map<string, number>()
    for (const seq of sequences) {
      sequenceCounts.set(seq, (sequenceCounts.get(seq) || 0) + 1)
    }

    // Create patterns for common flows
    const patterns: BehaviorPattern[] = []
    const [ageRange, techLiteracy, deviceType] = groupKey.split('_')

    for (const [sequence, count] of sequenceCounts.entries()) {
      if (count >= 3) { // Seen in at least 3 sessions
        const steps = sequence.split('->')
        
        patterns.push({
          pattern_type: 'navigation_flow',
          pattern_name: `Common flow: ${steps.slice(0, 3).join(' → ')}`,
          description: `${count} users followed this navigation pattern`,
          url_pattern: sessions[0].url,
          frequency: count,
          typical_sequence: steps,
          avg_duration_seconds: 0,
          success_rate: 0.8, // Placeholder
          friction_score: 0.2,
          common_errors: [],
          confidence_score: Math.min(count / 10, 1.0),
          sample_size: count,
          age_range: ageRange !== 'unknown' ? ageRange : undefined,
          tech_literacy: techLiteracy !== 'unknown' ? techLiteracy : undefined,
          device_type: deviceType !== 'unknown' ? deviceType : undefined
        })
      }
    }

    return patterns
  }

  /**
   * Detect error recovery behaviors
   */
  private async detectErrorRecoveryPatterns(
    sessions: UserSession[],
    interactions: UserInteraction[],
    groupKey: string
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = []

    // Find sessions with errors and analyze what happened after
    const sessionSequences = new Map<string, UserInteraction[]>()

    for (const interaction of interactions) {
      const sessionId = interaction.session_id
      if (!sessionSequences.has(sessionId)) {
        sessionSequences.set(sessionId, [])
      }
      sessionSequences.get(sessionId)!.push(interaction)
    }

    let recoveryCount = 0
    let abandonCount = 0

    for (const [sessionId, sequence] of sessionSequences.entries()) {
      const errorIndex = sequence.findIndex(i => i.is_error)
      if (errorIndex === -1) continue

      const session = sessions.find(s => s.id === sessionId)
      if (!session) continue

      // Check if user recovered or abandoned
      if (session.completion_status === 'completed') {
        recoveryCount++
      } else if (session.completion_status === 'abandoned') {
        abandonCount++
      }
    }

    const total = recoveryCount + abandonCount
    if (total > 0) {
      const [ageRange, techLiteracy, deviceType] = groupKey.split('_')
      const recoveryRate = recoveryCount / total

      patterns.push({
        pattern_type: 'error_recovery',
        pattern_name: `Error recovery behavior`,
        description: `${(recoveryRate * 100).toFixed(1)}% of users recover from errors`,
        url_pattern: sessions[0].url,
        frequency: total,
        typical_sequence: ['error', recoveryRate > 0.5 ? 'retry' : 'abandon'],
        avg_duration_seconds: 0,
        success_rate: recoveryRate,
        friction_score: 1 - recoveryRate,
        common_errors: [],
        confidence_score: Math.min(total / 20, 1.0),
        sample_size: total,
        age_range: ageRange !== 'unknown' ? ageRange : undefined,
        tech_literacy: techLiteracy !== 'unknown' ? techLiteracy : undefined,
        device_type: deviceType !== 'unknown' ? deviceType : undefined
      })
    }

    return patterns
  }

  /**
   * Store pattern in database
   */
  private async storePattern(pattern: BehaviorPattern): Promise<void> {
    const { error } = await this.supabase
      .from('behavior_patterns')
      .upsert({
        pattern_type: pattern.pattern_type,
        pattern_name: pattern.pattern_name,
        description: pattern.description,
        url_pattern: pattern.url_pattern,
        element_pattern: pattern.element_pattern,
        frequency: pattern.frequency,
        typical_sequence: pattern.typical_sequence,
        avg_duration_seconds: pattern.avg_duration_seconds,
        success_rate: pattern.success_rate,
        friction_score: pattern.friction_score,
        common_errors: pattern.common_errors,
        confidence_score: pattern.confidence_score,
        sample_size: pattern.sample_size,
        age_range: pattern.age_range,
        tech_literacy: pattern.tech_literacy,
        device_type: pattern.device_type,
        last_observed_at: new Date().toISOString()
      }, {
        onConflict: 'pattern_name,url_pattern'
      })

    if (error) {
      console.error('Failed to store pattern:', error)
    }
  }

  /**
   * Generate persona refinement suggestions based on patterns
   */
  async suggestPersonaRefinements(
    personaId: string,
    patterns: BehaviorPattern[]
  ): Promise<void> {
    // Get current persona
    const { data: persona } = await this.supabase
      .from('personas')
      .select('*')
      .eq('id', personaId)
      .single()

    if (!persona) return

    // Analyze patterns relevant to this persona
    const relevantPatterns = patterns.filter(p => 
      p.age_range === this.getAgeRange(persona.age) &&
      p.tech_literacy === persona.tech_literacy
    )

    if (relevantPatterns.length === 0) return

    // Use LLM to suggest refinements
    const prompt = `Analyze these behavior patterns and suggest persona refinements:

**Current Persona**: ${persona.name}
- Age: ${persona.age}
- Tech Literacy: ${persona.tech_literacy}
- Attention Rules: ${JSON.stringify(persona.attention_rules)}

**Observed Patterns**:
${relevantPatterns.map(p => `
- ${p.pattern_name}
  Type: ${p.pattern_type}
  Friction Score: ${p.friction_score}
  Sample Size: ${p.sample_size}
  Description: ${p.description}
`).join('\n')}

Suggest specific refinements to attention_rules, cognitive_load, or other persona attributes based on these real user behaviors.

Return JSON:
{
  "refinements": [
    {
      "attribute": "attention_rules",
      "old_value": [...],
      "new_value": [...],
      "reason": "explanation"
    }
  ]
}`

    const response = await this.llm.invoke(prompt)
    const content = response.content as string
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return

      const parsed = JSON.parse(jsonMatch[0])

      // Store refinement suggestions
      for (const refinement of parsed.refinements) {
        await this.supabase
          .from('persona_refinements')
          .insert({
            persona_id: personaId,
            refinement_type: refinement.attribute,
            old_value: refinement.old_value,
            new_value: refinement.new_value,
            reason: refinement.reason,
            evidence_sessions: relevantPatterns.reduce((sum, p) => sum + p.sample_size, 0),
            confidence_score: Math.min(relevantPatterns.length / 5, 1.0),
            behavior_pattern_ids: relevantPatterns.map(p => p.id),
            status: 'pending'
          })
      }
    } catch (error) {
      console.error('Failed to parse refinement suggestions:', error)
    }
  }

  /**
   * Helper to convert age to age range
   */
  private getAgeRange(age: number): string {
    if (age < 18) return '0-17'
    if (age < 25) return '18-24'
    if (age < 35) return '25-34'
    if (age < 45) return '35-44'
    if (age < 55) return '45-54'
    if (age < 65) return '55-64'
    return '65+'
  }
}
