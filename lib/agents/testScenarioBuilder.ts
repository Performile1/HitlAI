/**
 * TestScenarioBuilder - Helps companies define comprehensive test scenarios
 * 
 * For cases where the app/software cannot be uploaded:
 * - Games (too large, proprietary engines)
 * - Enterprise software (security restrictions)
 * - Mobile apps (platform-specific)
 * - Hardware-dependent software
 * 
 * This agent guides companies through defining:
 * 1. Business objectives
 * 2. Happy paths
 * 3. Sad paths (negative testing)
 * 4. Edge cases (boundary testing)
 * 5. Environmental testing (connectivity, interrupts)
 * 6. Non-functional testing (load, accessibility, security)
 * 7. Chaos/Monkey testing scenarios
 */

import { ChatOpenAI } from '@langchain/openai'

export interface TestScenarioDefinition {
  appType: 'web' | 'mobile' | 'desktop' | 'game' | 'enterprise' | 'other'
  appDescription: string
  businessObjective: string
  happyPaths: HappyPathScenario[]
  sadPaths: SadPathScenario[]
  edgeCases: EdgeCaseScenario[]
  environmentalTests: EnvironmentalTestScenario[]
  nonFunctionalTests: NonFunctionalTestScenario[]
  chaosTests: ChaosTestScenario[]
  estimatedComplexity: 'low' | 'medium' | 'high' | 'very_high'
}

export interface HappyPathScenario {
  id: string
  name: string
  description: string
  userGoal: string
  steps: string[]
  successCriteria: string
  estimatedDuration: number
}

export interface SadPathScenario {
  id: string
  name: string
  description: string
  triggerCondition: string
  invalidInput?: string
  expectedSystemBehavior: string
  errorMessageRequirements: string
  recoveryPath: string
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface EdgeCaseScenario {
  id: string
  name: string
  description: string
  boundaryType: 'character_limit' | 'quantity_extreme' | 'zero_value' | 'time_zone' | 'empty_state' | 'other'
  testValue: string
  expectedBehavior: string
  systemConstraints: string
}

export interface EnvironmentalTestScenario {
  id: string
  name: string
  description: string
  environmentType: 'connectivity' | 'device_interrupt' | 'browser_compatibility' | 'os_compatibility' | 'network_speed'
  simulationSteps: string[]
  expectedSystemBehavior: string
  dataIntegrityRequirements: string
}

export interface NonFunctionalTestScenario {
  id: string
  name: string
  testType: 'load' | 'accessibility' | 'security' | 'performance' | 'usability'
  description: string
  metrics: string[]
  passCriteria: string
  toolsRequired: string[]
}

export interface ChaosTestScenario {
  id: string
  name: string
  description: string
  chaosType: 'monkey_testing' | 'random_input' | 'rapid_actions' | 'unexpected_sequence' | 'resource_exhaustion'
  executionStrategy: string
  breakConditions: string[]
  expectedResilience: string
}

export class TestScenarioBuilder {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 8192
    })
  }

  /**
   * Guide company through defining comprehensive test scenarios
   */
  async buildTestScenarios(
    appType: string,
    appDescription: string,
    businessObjective: string
  ): Promise<TestScenarioDefinition> {
    
    const prompt = `You are a senior QA consultant helping a company define comprehensive test scenarios for their application.

**Application Type**: ${appType}
**Application Description**: ${appDescription}
**Business Objective**: ${businessObjective}

The company CANNOT upload their app for automated testing (it's a game, too large, or has security restrictions).
You must help them define detailed test scenarios that human testers can execute.

Generate a COMPREHENSIVE test plan covering ALL of these dimensions:

---

## 1. HAPPY PATHS (Positive Testing)
Define 3-5 core user journeys that represent successful use cases.
For each happy path, include:
- Clear user goal
- Step-by-step actions
- Success criteria
- Estimated duration

Example for e-commerce checkout:
- Goal: "Complete purchase with valid payment"
- Steps: ["Add item to cart", "Proceed to checkout", "Enter shipping address", "Enter valid credit card", "Confirm order"]
- Success: "Order confirmation displayed, email sent, inventory updated"

---

## 2. SAD PATHS (Negative Testing)
Define 5-7 scenarios where things go WRONG. Focus on:

**Payment Failures**:
- Card declined (insufficient funds)
- Expired card
- Invalid CVV
- Network timeout during payment

**Invalid Inputs**:
- Special characters in name fields (<script>, emojis, SQL injection attempts)
- Negative numbers in quantity fields
- Email without @ symbol
- Phone number with letters

**Empty States**:
- Submitting form with required fields blank
- Proceeding to checkout with empty cart
- Searching with no query

**Authentication Issues**:
- Session timeout mid-flow
- Invalid token
- Accessing protected resource without login

For EACH sad path, specify:
- What triggers the error
- What the system SHOULD do (graceful failure, clear error message)
- How user can recover
- Priority level

---

## 3. EDGE CASES (Boundary Testing)
Define 5-7 extreme but VALID scenarios:

**Character Limits**:
- Name with 255 characters (max length)
- Address with special characters (Ñ, ü, 中文)
- Empty string where optional

**Quantity Extremes**:
- Adding 10,000 items to cart
- Setting quantity to 1 (minimum)
- Inventory at exactly 0

**Zero Values**:
- Discount code making total $0.00
- Free shipping threshold exactly met
- Tax calculation resulting in $0.00

**Time Zones & Dates**:
- Booking at exactly midnight
- Daylight Savings Time transition
- Leap year edge case (Feb 29)
- International Date Line crossing

---

## 4. ENVIRONMENTAL TESTING (Connectivity & Interrupts)
Define 4-6 scenarios testing real-world conditions:

**The "Elevator Effect"**:
- Internet cuts out during payment submission
- User retries - ensure no double charge
- Verify idempotency

**Device Interruptions**:
- Phone call received mid-flow
- Low battery warning appears
- App sent to background
- Switch from Wi-Fi to 5G mid-transaction

**Browser/OS Diversity**:
- Test on Safari 14 (older version)
- Test on small screen (iPhone SE)
- Test on tablet in landscape mode
- Test with browser extensions (ad blockers)

---

## 5. NON-FUNCTIONAL TESTING
Define requirements for:

**Load Testing**:
- Can 5,000 users checkout simultaneously during Black Friday?
- Response time under peak load
- Database connection pool limits

**Accessibility (WCAG 2.1 AA)**:
- Screen reader compatibility (NVDA, JAWS)
- Keyboard-only navigation
- Color contrast ratios (4.5:1 minimum)
- Text resize to 200%
- Focus indicators visible

**Security**:
- XSS prevention (can user inject <script> tags?)
- CSRF token validation
- SQL injection attempts
- Price manipulation (inspect element to change price)
- Session hijacking prevention

**Performance**:
- Page load time < 3 seconds
- Time to interactive < 5 seconds
- Lighthouse score > 90

---

## 6. CHAOS/MONKEY TESTING
Define 3-5 unpredictable scenarios:

**Rapid Random Actions**:
- Click random buttons 100 times
- Fill forms with random data
- Navigate back/forward rapidly

**Unexpected Sequences**:
- Skip steps in multi-step flow
- Access step 3 directly without completing step 1
- Submit form multiple times rapidly

**Resource Exhaustion**:
- Upload 1000 files simultaneously
- Open 50 browser tabs of the same page
- Fill localStorage to capacity

---

Return JSON in this EXACT format:
{
  "appType": "${appType}",
  "appDescription": "${appDescription}",
  "businessObjective": "${businessObjective}",
  "happyPaths": [
    {
      "id": "HP001",
      "name": "Complete Standard Checkout",
      "description": "User successfully purchases item with credit card",
      "userGoal": "Buy product and receive confirmation",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "successCriteria": "Order confirmed, payment processed",
      "estimatedDuration": 180
    }
  ],
  "sadPaths": [
    {
      "id": "SP001",
      "name": "Card Declined - Insufficient Funds",
      "description": "Payment fails due to insufficient balance",
      "triggerCondition": "Use test card 4000000000000002",
      "invalidInput": "Card number with insufficient funds",
      "expectedSystemBehavior": "Display clear error: 'Payment declined. Please use a different card.'",
      "errorMessageRequirements": "Plain language, no technical jargon, suggest next action",
      "recoveryPath": "User can try different payment method without losing cart",
      "priority": "critical"
    }
  ],
  "edgeCases": [
    {
      "id": "EC001",
      "name": "Maximum Character Name",
      "description": "User enters 255-character name",
      "boundaryType": "character_limit",
      "testValue": "A".repeat(255),
      "expectedBehavior": "Name accepted, displays correctly in UI and database",
      "systemConstraints": "Database field: VARCHAR(255)"
    }
  ],
  "environmentalTests": [
    {
      "id": "ENV001",
      "name": "Network Interruption During Payment",
      "description": "Internet disconnects exactly when user clicks Pay",
      "environmentType": "connectivity",
      "simulationSteps": ["Fill checkout form", "Click Pay button", "Disable network immediately", "Re-enable network", "Verify no double charge"],
      "expectedSystemBehavior": "Transaction rolled back OR idempotent retry succeeds",
      "dataIntegrityRequirements": "User charged exactly once, order created exactly once"
    }
  ],
  "nonFunctionalTests": [
    {
      "id": "NFT001",
      "name": "Black Friday Load Test",
      "testType": "load",
      "description": "Simulate 5,000 concurrent checkouts",
      "metrics": ["Response time", "Error rate", "Throughput", "CPU usage", "Database connections"],
      "passCriteria": "95th percentile response time < 5 seconds, error rate < 0.1%",
      "toolsRequired": ["JMeter", "LoadRunner", "k6"]
    }
  ],
  "chaosTests": [
    {
      "id": "CHAOS001",
      "name": "Monkey Testing - Random Button Clicks",
      "description": "Script clicks random UI elements 1000 times",
      "chaosType": "monkey_testing",
      "executionStrategy": "Use Selenium to click random coordinates, random intervals",
      "breakConditions": ["Application crash", "Unhandled exception", "Data corruption", "Infinite loop"],
      "expectedResilience": "No crashes, all errors handled gracefully, state remains consistent"
    }
  ],
  "estimatedComplexity": "high"
}`

    const response = await this.llm.invoke(prompt)
    
    try {
      const content = response.content as string
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Failed to parse test scenarios:', error)
    }

    return this.generateFallbackScenarios(appType, appDescription, businessObjective)
  }

  /**
   * Generate guided questions to help company define their test needs
   */
  async generateGuidedQuestions(appType: string): Promise<string[]> {
    const baseQuestions = [
      "What is the primary business objective of this application?",
      "Who are your target users? (demographics, tech literacy, accessibility needs)",
      "What are the 3 most critical user journeys that MUST work?",
      "What would cause the most business damage if it failed?",
      "Are there any compliance requirements? (WCAG, GDPR, PCI-DSS, HIPAA)",
      "What is your expected peak load? (concurrent users)",
      "What browsers/devices must you support?",
      "Are there any known pain points from user feedback?"
    ]

    const typeSpecificQuestions: Record<string, string[]> = {
      game: [
        "What game engine are you using? (Unity, Unreal, custom)",
        "Is this single-player, multiplayer, or both?",
        "What are the critical game mechanics that must work flawlessly?",
        "Are there in-game purchases or microtransactions?",
        "What happens if a player loses connection mid-game?"
      ],
      mobile: [
        "iOS, Android, or both?",
        "What happens when the app is backgrounded?",
        "How do you handle push notifications?",
        "What offline functionality is required?",
        "How do you handle different screen sizes and orientations?"
      ],
      enterprise: [
        "What are your SLAs? (uptime, response time)",
        "How many concurrent users do you expect?",
        "What are your data security requirements?",
        "Are there role-based access controls?",
        "What integrations with other systems exist?"
      ]
    }

    return [
      ...baseQuestions,
      ...(typeSpecificQuestions[appType] || [])
    ]
  }

  /**
   * Validate completeness of test scenario definition
   */
  validateScenarioCompleteness(scenarios: TestScenarioDefinition): {
    isComplete: boolean
    missingAreas: string[]
    recommendations: string[]
  } {
    const missingAreas: string[] = []
    const recommendations: string[] = []

    if (scenarios.happyPaths.length < 3) {
      missingAreas.push('Happy Paths')
      recommendations.push('Define at least 3 core user journeys')
    }

    if (scenarios.sadPaths.length < 5) {
      missingAreas.push('Sad Paths')
      recommendations.push('Add more negative test cases (payment failures, invalid inputs, empty states)')
    }

    if (scenarios.edgeCases.length < 5) {
      missingAreas.push('Edge Cases')
      recommendations.push('Consider boundary values: character limits, quantity extremes, zero values, time zones')
    }

    if (scenarios.environmentalTests.length < 3) {
      missingAreas.push('Environmental Tests')
      recommendations.push('Test connectivity issues, device interrupts, browser compatibility')
    }

    if (scenarios.nonFunctionalTests.length < 3) {
      missingAreas.push('Non-Functional Tests')
      recommendations.push('Include load testing, accessibility, and security tests')
    }

    if (scenarios.chaosTests.length < 2) {
      missingAreas.push('Chaos Tests')
      recommendations.push('Add monkey testing and unexpected sequence scenarios')
    }

    const hasAccessibilityTest = scenarios.nonFunctionalTests.some(t => t.testType === 'accessibility')
    if (!hasAccessibilityTest) {
      recommendations.push('CRITICAL: Add WCAG 2.1 AA accessibility testing')
    }

    const hasSecurityTest = scenarios.nonFunctionalTests.some(t => t.testType === 'security')
    if (!hasSecurityTest) {
      recommendations.push('CRITICAL: Add security testing (XSS, CSRF, SQL injection)')
    }

    return {
      isComplete: missingAreas.length === 0,
      missingAreas,
      recommendations
    }
  }

  /**
   * Fallback scenarios if LLM parsing fails
   */
  private generateFallbackScenarios(
    appType: string,
    appDescription: string,
    businessObjective: string
  ): TestScenarioDefinition {
    return {
      appType: appType as any,
      appDescription,
      businessObjective,
      happyPaths: [{
        id: 'HP001',
        name: 'Core User Journey',
        description: businessObjective,
        userGoal: businessObjective,
        steps: ['Step 1: Start', 'Step 2: Execute', 'Step 3: Complete'],
        successCriteria: 'User achieves their goal',
        estimatedDuration: 300
      }],
      sadPaths: [],
      edgeCases: [],
      environmentalTests: [],
      nonFunctionalTests: [],
      chaosTests: [],
      estimatedComplexity: 'medium'
    }
  }
}
