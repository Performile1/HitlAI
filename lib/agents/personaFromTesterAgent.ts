import { ChatOpenAI } from '@langchain/openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TesterProfile {
  id: string
  age: number
  gender: string
  location: string
  nativeLanguage: string
  educationLevel: string
  occupation: string
  techExperience: string
  visualImpairment: string
  hearingImpairment: string
  motorImpairment: string
  cognitiveImpairment: string
  usesScreenReader: boolean
  usesMagnification: boolean
  usesVoiceControl: boolean
  usesKeyboardOnly: boolean
  colorBlindness: string
  primaryDevice: string
  screenSize: string
  internetSpeed: string
}

interface BehaviorPatterns {
  avgSessionDuration: number
  avgClicksPerSession: number
  avgScrollDistance: number
  commonFrustrationTriggers: string[]
  attentionPatterns: {
    focusAreas: string[]
    ignoredAreas: string[]
    avgFixationDuration: number
  }
  interactionStyle: {
    clickSpeed: string // slow, medium, fast
    scrollBehavior: string // smooth, jumpy, erratic
    navigationPreference: string // mouse, keyboard, mixed
  }
}

/**
 * PersonaFromTesterAgent - Converts human tester data into AI personas
 * 
 * This agent analyzes a human tester's:
 * - Demographics and accessibility needs
 * - Recorded sessions (screen, cursor, eye tracking)
 * - Behavior patterns
 * - Frustration triggers
 * 
 * And generates a persona that AI can use to simulate similar users.
 * This creates a feedback loop: Human testers → Personas → AI testers
 */
export class PersonaFromTesterAgent {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.3
    })
  }

  /**
   * Generates a persona from a human tester's data
   */
  async generatePersonaFromTester(
    testerId: string,
    sessionIds: string[]
  ): Promise<{
    personaId: string
    confidence: number
    summary: string
  }> {
    // Get tester profile
    const { data: tester } = await supabase
      .from('human_testers')
      .select('*')
      .eq('id', testerId)
      .single()

    if (!tester) {
      throw new Error('Tester not found')
    }

    // Get behavior patterns from sessions
    const behaviorPatterns = await this.analyzeBehaviorPatterns(sessionIds)

    // Get frustration moments
    const { data: frustrations } = await supabase
      .from('frustration_moments')
      .select('*')
      .in('session_id', sessionIds)

    // Get attention data
    const { data: attentionData } = await supabase
      .from('attention_heatmap')
      .select('*')
      .in('session_id', sessionIds)

    // Generate persona using LLM
    const persona = await this.synthesizePersona(
      tester,
      behaviorPatterns,
      frustrations || [],
      attentionData || []
    )

    // Save persona to database
    const { data: savedPersona } = await supabase
      .from('personas')
      .insert({
        name: persona.name,
        age: tester.age,
        tech_literacy: this.mapTechExperience(tester.tech_experience),
        eyesight: this.mapVisualImpairment(tester.visual_impairment),
        cognitive_load: this.mapCognitiveImpairment(tester.cognitive_impairment),
        attention_rules: persona.attentionRules,
        behavior_profile: persona.behaviorProfile,
        disabilities: persona.disabilities,
        device_context: {
          primaryDevice: tester.primary_device,
          screenSize: tester.screen_size,
          internetSpeed: tester.internet_speed
        }
      })
      .select()
      .single()

    if (!savedPersona) {
      throw new Error('Failed to save persona')
    }

    // Link tester to persona
    await supabase
      .from('persona_from_tester')
      .insert({
        tester_id: testerId,
        persona_id: savedPersona.id,
        created_from_sessions: sessionIds,
        confidence_score: persona.confidence,
        behavior_summary: behaviorPatterns,
        used_for_training: true,
        training_date: new Date().toISOString()
      })

    return {
      personaId: savedPersona.id,
      confidence: persona.confidence,
      summary: persona.summary
    }
  }

  /**
   * Analyzes behavior patterns from recorded sessions
   */
  private async analyzeBehaviorPatterns(
    sessionIds: string[]
  ): Promise<BehaviorPatterns> {
    // Get cursor tracking data
    const { data: cursorData } = await supabase
      .from('cursor_tracking')
      .select('*')
      .in('session_id', sessionIds)

    // Get eye tracking data
    const { data: eyeData } = await supabase
      .from('eye_tracking_data')
      .select('*')
      .in('session_id', sessionIds)

    // Get user sessions
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .in('id', sessionIds)

    // Calculate metrics
    const avgSessionDuration = sessions
      ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length
      : 0

    const clicks = cursorData?.filter(c => c.event_type === 'click') || []
    const avgClicksPerSession = clicks.length / sessionIds.length

    const scrollEvents = cursorData?.filter(c => c.event_type === 'scroll') || []
    const avgScrollDistance = scrollEvents.length > 0
      ? scrollEvents.reduce((sum, s) => sum + Math.abs(s.y || 0), 0) / scrollEvents.length
      : 0

    // Analyze click speed
    let clickSpeed = 'medium'
    if (clicks.length > 1) {
      const intervals = []
      for (let i = 1; i < clicks.length; i++) {
        const diff = new Date(clicks[i].timestamp).getTime() - new Date(clicks[i - 1].timestamp).getTime()
        intervals.push(diff)
      }
      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length
      if (avgInterval < 500) clickSpeed = 'fast'
      else if (avgInterval > 2000) clickSpeed = 'slow'
    }

    // Analyze fixation duration from eye tracking
    const avgFixationDuration = eyeData && eyeData.length > 0
      ? eyeData.reduce((sum, e) => sum + (e.fixation_duration || 0), 0) / eyeData.length
      : 300 // Default 300ms

    return {
      avgSessionDuration,
      avgClicksPerSession,
      avgScrollDistance,
      commonFrustrationTriggers: [], // Populated from frustration_moments
      attentionPatterns: {
        focusAreas: [],
        ignoredAreas: [],
        avgFixationDuration
      },
      interactionStyle: {
        clickSpeed,
        scrollBehavior: 'smooth', // TODO: Calculate from scroll events
        navigationPreference: 'mouse' // TODO: Detect from interaction patterns
      }
    }
  }

  /**
   * Synthesizes persona using LLM
   */
  private async synthesizePersona(
    tester: any,
    behavior: BehaviorPatterns,
    frustrations: any[],
    attentionData: any[]
  ): Promise<{
    name: string
    attentionRules: any
    behaviorProfile: any
    disabilities: any
    confidence: number
    summary: string
  }> {
    const prompt = `Create a UX testing persona based on real human tester data.

**Tester Demographics:**
- Age: ${tester.age}
- Gender: ${tester.gender}
- Tech Experience: ${tester.tech_experience}
- Visual Impairment: ${tester.visual_impairment}
- Motor Impairment: ${tester.motor_impairment}
- Cognitive Impairment: ${tester.cognitive_impairment}
- Uses Screen Reader: ${tester.uses_screen_reader}
- Uses Keyboard Only: ${tester.uses_keyboard_only}
- Color Blindness: ${tester.color_blindness}

**Behavior Patterns:**
- Avg Session Duration: ${behavior.avgSessionDuration}s
- Avg Clicks Per Session: ${behavior.avgClicksPerSession}
- Click Speed: ${behavior.interactionStyle.clickSpeed}
- Avg Fixation Duration: ${behavior.attentionPatterns.avgFixationDuration}ms

**Frustration Triggers:**
${frustrations.slice(0, 5).map(f => `- ${f.frustration_type}: ${f.likely_cause}`).join('\n')}

**Your Task:**
Generate a persona that AI can use to simulate this user's behavior.

Return JSON:
{
  "name": "descriptive_persona_name",
  "attentionRules": {
    "focusOn": ["elements they focus on"],
    "ignore": ["elements they ignore"],
    "fixationDuration": milliseconds
  },
  "behaviorProfile": {
    "clickSpeed": "slow|medium|fast",
    "scrollBehavior": "description",
    "navigationStyle": "description",
    "errorProne": true/false,
    "patienceLevel": "low|medium|high"
  },
  "disabilities": {
    "visual": "description",
    "motor": "description",
    "cognitive": "description",
    "assistiveTech": ["list of tools used"]
  },
  "confidence": 0.0-1.0,
  "summary": "2-3 sentence persona description"
}`

    try {
      const response = await this.llm.invoke(prompt)
      const content = response.content as string
      
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error('Failed to parse persona')
    } catch (error) {
      console.error('Persona synthesis failed:', error)
      
      // Return default persona
      return {
        name: `tester_${tester.age}_${tester.tech_experience}`,
        attentionRules: {},
        behaviorProfile: {},
        disabilities: {},
        confidence: 0.5,
        summary: 'Persona generated from tester data'
      }
    }
  }

  /**
   * Maps tech experience to tech literacy
   */
  private mapTechExperience(experience: string): string {
    const map: Record<string, string> = {
      'beginner': 'low',
      'intermediate': 'medium',
      'advanced': 'high',
      'expert': 'high'
    }
    return map[experience] || 'medium'
  }

  /**
   * Maps visual impairment to eyesight level
   */
  private mapVisualImpairment(impairment: string): string {
    const map: Record<string, string> = {
      'none': 'perfect',
      'mild': 'good',
      'moderate': 'poor',
      'severe': 'very_poor',
      'blind': 'blind'
    }
    return map[impairment] || 'good'
  }

  /**
   * Maps cognitive impairment to cognitive load
   */
  private mapCognitiveImpairment(impairment: string): string {
    const map: Record<string, string> = {
      'none': 'low',
      'mild': 'medium',
      'moderate': 'high',
      'severe': 'very_high'
    }
    return map[impairment] || 'medium'
  }
}
