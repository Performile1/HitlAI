/**
 * TestStrategyPlanner - Comprehensive test coverage planning
 * 
 * Generates multi-dimensional test strategies that combine:
 * 1. Persona-driven UX testing (existing)
 * 2. Negative testing & error flows
 * 3. Boundary value analysis
 * 4. Non-functional testing (performance, security, accessibility)
 * 5. Exploratory & chaos testing
 */

import { ChatOpenAI } from '@langchain/openai'

export type TestDimension = 
  | 'happy_path'           // Normal user flow
  | 'negative_testing'     // Invalid inputs, error conditions
  | 'boundary_analysis'    // Edge cases, limits, empty states
  | 'business_logic'       // Calculations, workflows, state transitions
  | 'accessibility'        // WCAG compliance, screen readers, keyboard nav
  | 'performance'          // Load times, responsiveness
  | 'security'             // XSS, CSRF, injection attacks
  | 'race_conditions'      // Concurrent actions, interrupts
  | 'data_persistence'     // State preservation, reload behavior
  | 'exploratory'          // Monkey testing, random interactions

export interface TestStrategy {
  objective: string
  persona: any
  dimensions: TestDimension[]
  testCases: TestCase[]
  riskAreas: string[]
  estimatedDuration: number
}

export interface TestCase {
  id: string
  dimension: TestDimension
  name: string
  description: string
  steps: TestStep[]
  expectedOutcome: string
  personaRelevance: string // Why this matters for THIS persona
  priority: 'critical' | 'high' | 'medium' | 'low'
  automatable: boolean
}

export interface TestStep {
  stepNumber: number
  action: string
  targetElement: string
  inputData?: string | null // For negative testing: invalid, boundary, or null values
  validation: string
  cognitiveNotes: string
  expectedBehavior: 'success' | 'graceful_failure' | 'error_message' | 'state_change'
}

export class TestStrategyPlanner {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 8192
    })
  }

  /**
   * Generate comprehensive test strategy for a given objective and persona
   */
  async planTestStrategy(
    objective: string,
    persona: any,
    pageContext: string,
    dimensions: TestDimension[] = ['happy_path', 'negative_testing', 'boundary_analysis']
  ): Promise<TestStrategy> {
    
    const dimensionDescriptions = this.getDimensionDescriptions(dimensions)
    
    const prompt = `You are a comprehensive QA strategist planning tests for a REAL HUMAN persona.

**Test Objective**: ${objective}

**Persona Profile**:
- Name: ${persona.name}
- Age: ${persona.age}
- Tech Literacy: ${persona.tech_literacy}
- Eyesight: ${persona.eyesight}
- Cognitive Load: ${persona.cognitive_load}
- Attention Rules: ${JSON.stringify(persona.attention_rules)}

**Page Context**:
${pageContext.substring(0, 3000)}

**Test Dimensions to Cover**:
${dimensionDescriptions}

**CRITICAL INSTRUCTIONS**:
1. Generate test cases for ALL specified dimensions, not just happy path
2. For EACH test case, explain why it matters for THIS persona specifically
3. Include negative tests (wrong data, missing fields, invalid formats)
4. Include boundary tests (empty, max length, special characters, off-by-one)
5. Consider how THIS persona would experience errors (e.g., seniors may not understand technical error messages)
6. Prioritize tests based on persona risk (e.g., seniors more likely to make input errors)

**Example Test Cases**:

HAPPY PATH:
- "Complete checkout with valid credit card"
- Persona Relevance: "Tests if ${persona.name} can navigate standard flow"

NEGATIVE TESTING:
- "Submit form with empty required fields"
- Persona Relevance: "${persona.name} (low tech literacy) may not notice required field indicators"
- Expected: Graceful error with clear messaging

BOUNDARY ANALYSIS:
- "Enter 999999 in quantity field"
- Persona Relevance: "${persona.name} may accidentally type extra digits due to motor impairment"
- Expected: Validation prevents unrealistic values

ACCESSIBILITY:
- "Navigate checkout using only keyboard"
- Persona Relevance: "${persona.name} may use keyboard due to arthritis making mouse difficult"

Return JSON:
{
  "objective": "${objective}",
  "dimensions": ${JSON.stringify(dimensions)},
  "testCases": [
    {
      "id": "TC001",
      "dimension": "happy_path|negative_testing|boundary_analysis|etc",
      "name": "Brief test name",
      "description": "What this test validates",
      "steps": [
        {
          "stepNumber": 1,
          "action": "Click submit button",
          "targetElement": "Submit button",
          "inputData": "valid@email.com" or null or "invalid data",
          "validation": "Form submits successfully",
          "cognitiveNotes": "Persona-specific considerations",
          "expectedBehavior": "success|graceful_failure|error_message|state_change"
        }
      ],
      "expectedOutcome": "What should happen",
      "personaRelevance": "WHY this test matters for ${persona.name}",
      "priority": "critical|high|medium|low",
      "automatable": true|false
    }
  ],
  "riskAreas": ["Areas where ${persona.name} is most likely to encounter issues"],
  "estimatedDuration": 300
}`

    const response = await this.llm.invoke(prompt)
    
    try {
      const content = response.content as string
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          objective: parsed.objective || objective,
          persona: persona,
          dimensions: parsed.dimensions || dimensions,
          testCases: parsed.testCases || [],
          riskAreas: parsed.riskAreas || [],
          estimatedDuration: parsed.estimatedDuration || 300
        }
      }
    } catch (error) {
      console.error('Failed to parse test strategy:', error)
    }

    // Fallback: Generate basic test cases
    return this.generateFallbackStrategy(objective, persona, dimensions)
  }

  /**
   * Generate specific negative test cases for error flow validation
   */
  async generateNegativeTests(
    formContext: string,
    persona: any
  ): Promise<TestCase[]> {
    const negativeScenarios = [
      {
        name: 'Empty Required Fields',
        inputData: null,
        personaRisk: 'May not notice required field indicators'
      },
      {
        name: 'Invalid Email Format',
        inputData: 'notanemail',
        personaRisk: 'May not understand email format requirements'
      },
      {
        name: 'Special Characters in Name',
        inputData: '<script>alert("xss")</script>',
        personaRisk: 'Accidental paste from other sources'
      },
      {
        name: 'Expired Credit Card',
        inputData: '12/2020',
        personaRisk: 'May use old card without checking expiry'
      },
      {
        name: 'Mismatched Password Confirmation',
        inputData: 'password123 vs password124',
        personaRisk: 'Typos common with low vision or motor impairment'
      }
    ]

    return negativeScenarios.map((scenario, idx) => ({
      id: `NEG-${String(idx + 1).padStart(3, '0')}`,
      dimension: 'negative_testing',
      name: scenario.name,
      description: `Test error handling when user provides: ${scenario.inputData}`,
      steps: [{
        stepNumber: 1,
        action: 'Submit form with invalid data',
        targetElement: 'Form',
        inputData: scenario.inputData,
        validation: 'Error message displayed clearly',
        cognitiveNotes: `${persona.name}: ${scenario.personaRisk}`,
        expectedBehavior: 'error_message'
      }],
      expectedOutcome: 'Clear, actionable error message in plain language',
      personaRelevance: `${persona.name} (age ${persona.age}, ${persona.tech_literacy} tech literacy) needs clear error guidance. ${scenario.personaRisk}.`,
      priority: 'high',
      automatable: true
    }))
  }

  /**
   * Generate boundary value test cases
   */
  async generateBoundaryTests(
    fieldContext: string,
    persona: any
  ): Promise<TestCase[]> {
    const boundaryScenarios = [
      {
        name: 'Empty String',
        value: '',
        risk: 'Accidental submission without input'
      },
      {
        name: 'Single Character',
        value: 'A',
        risk: 'Minimum length validation'
      },
      {
        name: 'Maximum Length',
        value: 'A'.repeat(255),
        risk: 'Copy-paste from long text'
      },
      {
        name: 'Maximum Length + 1',
        value: 'A'.repeat(256),
        risk: 'Off-by-one error in validation'
      },
      {
        name: 'Zero Quantity',
        value: '0',
        risk: 'Accidental zero entry'
      },
      {
        name: 'Negative Number',
        value: '-1',
        risk: 'Typo or confusion'
      },
      {
        name: 'Very Large Number',
        value: '999999999',
        risk: 'Extra digits due to motor impairment'
      },
      {
        name: 'Decimal in Integer Field',
        value: '1.5',
        risk: 'Misunderstanding field type'
      }
    ]

    return boundaryScenarios.map((scenario, idx) => ({
      id: `BND-${String(idx + 1).padStart(3, '0')}`,
      dimension: 'boundary_analysis',
      name: scenario.name,
      description: `Test field behavior with boundary value: ${scenario.value}`,
      steps: [{
        stepNumber: 1,
        action: 'Enter boundary value',
        targetElement: 'Input field',
        inputData: scenario.value,
        validation: 'System handles boundary gracefully',
        cognitiveNotes: `${persona.name}: ${scenario.risk}`,
        expectedBehavior: 'graceful_failure'
      }],
      expectedOutcome: 'Validation prevents invalid submission with helpful message',
      personaRelevance: `${persona.name} may encounter this due to: ${scenario.risk}`,
      priority: 'medium',
      automatable: true
    }))
  }

  /**
   * Generate accessibility-focused test cases
   */
  async generateAccessibilityTests(
    pageContext: string,
    persona: any
  ): Promise<TestCase[]> {
    const a11yTests = [
      {
        name: 'Keyboard-Only Navigation',
        action: 'Navigate entire flow using Tab/Enter/Escape',
        relevance: 'Motor impairments may require keyboard-only interaction'
      },
      {
        name: 'Screen Reader Compatibility',
        action: 'Complete flow with NVDA/JAWS screen reader',
        relevance: 'Visual impairments require proper ARIA labels'
      },
      {
        name: 'Focus Indicators Visible',
        action: 'Tab through interactive elements',
        relevance: 'Low vision users need clear focus indicators'
      },
      {
        name: 'Color Contrast Sufficient',
        action: 'Verify all text meets WCAG AA (4.5:1)',
        relevance: 'Presbyopia and low vision require high contrast'
      },
      {
        name: 'Text Resize to 200%',
        action: 'Zoom page to 200% and verify usability',
        relevance: 'Vision impairments often require text scaling'
      },
      {
        name: 'Error Announcements',
        action: 'Trigger validation error and verify screen reader announcement',
        relevance: 'Blind users need auditory error feedback'
      }
    ]

    return a11yTests.map((test, idx) => ({
      id: `A11Y-${String(idx + 1).padStart(3, '0')}`,
      dimension: 'accessibility',
      name: test.name,
      description: test.action,
      steps: [{
        stepNumber: 1,
        action: test.action,
        targetElement: 'Entire page',
        validation: 'WCAG 2.1 AA compliance',
        cognitiveNotes: test.relevance,
        expectedBehavior: 'success'
      }],
      expectedOutcome: 'Feature works correctly with assistive technology',
      personaRelevance: `${persona.name}: ${test.relevance}`,
      priority: persona.eyesight.includes('low') || persona.eyesight.includes('screen_reader') ? 'critical' : 'medium',
      automatable: idx < 4 // First 4 can be automated with axe-core
    }))
  }

  /**
   * Generate exploratory/chaos test cases
   */
  async generateExploratoryTests(
    objective: string,
    persona: any
  ): Promise<TestCase[]> {
    return [
      {
        id: 'EXP-001',
        dimension: 'exploratory' as TestDimension,
        name: 'Rapid Back Button Clicks',
        description: 'Click browser back button repeatedly during multi-step flow',
        steps: [{
          stepNumber: 1,
          action: 'Navigate forward 3 steps, then click back 5 times rapidly',
          targetElement: 'Browser back button',
          validation: 'Application state remains consistent',
          cognitiveNotes: `${persona.name} may click back multiple times if confused`,
          expectedBehavior: 'state_change'
        }],
        expectedOutcome: 'No broken state, no data loss',
        personaRelevance: `${persona.name} (${persona.cognitive_load} cognitive load) may use back button when confused`,
        priority: 'high',
        automatable: true
      },
      {
        id: 'EXP-002',
        dimension: 'race_conditions' as TestDimension,
        name: 'Double Submit Click',
        description: 'Click submit button twice in rapid succession',
        steps: [{
          stepNumber: 1,
          action: 'Double-click submit button',
          targetElement: 'Submit button',
          validation: 'Only one submission processed',
          cognitiveNotes: `${persona.name} may double-click due to slow response time`,
          expectedBehavior: 'graceful_failure'
        }],
        expectedOutcome: 'Duplicate submission prevented',
        personaRelevance: `${persona.name} may double-click if button doesn't provide immediate feedback`,
        priority: 'critical',
        automatable: true
      },
      {
        id: 'EXP-003',
        dimension: 'data_persistence' as TestDimension,
        name: 'Session Timeout Recovery',
        description: 'Wait for session timeout, then attempt to continue',
        steps: [{
          stepNumber: 1,
          action: 'Fill form halfway, wait 30 minutes, then submit',
          targetElement: 'Form',
          validation: 'Data preserved or clear re-authentication flow',
          cognitiveNotes: `${persona.name} may take breaks during long forms`,
          expectedBehavior: 'state_change'
        }],
        expectedOutcome: 'Graceful session handling with data preservation',
        personaRelevance: `${persona.name} (age ${persona.age}) may need breaks during complex tasks`,
        priority: 'high',
        automatable: true
      },
      {
        id: 'EXP-004',
        dimension: 'exploratory' as TestDimension,
        name: 'Page Reload Mid-Flow',
        description: 'Refresh page during multi-step process',
        steps: [{
          stepNumber: 1,
          action: 'Complete step 2 of 4, then press F5',
          targetElement: 'Browser',
          validation: 'Progress preserved or clear restart',
          cognitiveNotes: `${persona.name} may accidentally refresh`,
          expectedBehavior: 'state_change'
        }],
        expectedOutcome: 'State preserved or user guided to restart',
        personaRelevance: `Accidental refresh common with ${persona.tech_literacy} tech literacy`,
        priority: 'medium',
        automatable: true
      }
    ]
  }

  /**
   * Get human-readable descriptions for test dimensions
   */
  private getDimensionDescriptions(dimensions: TestDimension[]): string {
    const descriptions: Record<TestDimension, string> = {
      happy_path: 'Normal user flow with valid inputs and expected behavior',
      negative_testing: 'Invalid inputs, missing data, wrong formats, error conditions',
      boundary_analysis: 'Edge cases: empty states, max/min values, off-by-one errors',
      business_logic: 'Calculations, workflows, state transitions, business rules',
      accessibility: 'WCAG compliance, keyboard nav, screen readers, color contrast',
      performance: 'Load times, responsiveness, resource usage under stress',
      security: 'XSS, CSRF, SQL injection, authentication bypass attempts',
      race_conditions: 'Concurrent actions, rapid clicks, interrupts, timing issues',
      data_persistence: 'State preservation, reload behavior, session management',
      exploratory: 'Monkey testing, random interactions, unexpected user behavior'
    }

    return dimensions.map(dim => `- **${dim}**: ${descriptions[dim]}`).join('\n')
  }

  /**
   * Fallback strategy if LLM parsing fails
   */
  private generateFallbackStrategy(
    objective: string,
    persona: any,
    dimensions: TestDimension[]
  ): TestStrategy {
    return {
      objective,
      persona,
      dimensions,
      testCases: [{
        id: 'TC001',
        dimension: 'happy_path',
        name: objective,
        description: `Complete ${objective} with valid inputs`,
        steps: [{
          stepNumber: 1,
          action: objective,
          targetElement: 'unknown',
          validation: 'manual',
          cognitiveNotes: 'Fallback test case',
          expectedBehavior: 'success'
        }],
        expectedOutcome: 'Task completed successfully',
        personaRelevance: `Standard flow for ${persona.name}`,
        priority: 'high',
        automatable: false
      }],
      riskAreas: ['Unable to generate detailed strategy'],
      estimatedDuration: 300
    }
  }
}
