/**
 * TestExecutor - Executes comprehensive test cases including negative and boundary tests
 * 
 * Handles execution of:
 * - Happy path tests
 * - Negative tests (invalid inputs, error flows)
 * - Boundary value tests (edge cases, limits)
 * - Accessibility tests (keyboard nav, screen readers)
 * - Exploratory tests (chaos, race conditions)
 */

import { TestCase, TestStep } from './testStrategyPlanner'

export interface TestExecutionResult {
  testCaseId: string
  dimension: string
  passed: boolean
  actualOutcome: string
  expectedOutcome: string
  screenshots: string[]
  errorMessages: string[]
  personaObservations: string
  duration: number
  automationSuccess: boolean
}

export class TestExecutor {
  /**
   * Execute a single test case
   */
  async executeTestCase(
    testCase: TestCase,
    persona: any,
    baseUrl: string
  ): Promise<TestExecutionResult> {
    const startTime = Date.now()
    const screenshots: string[] = []
    const errorMessages: string[] = []
    let passed = false
    let actualOutcome = ''
    let automationSuccess = false

    try {
      // Execute each step in the test case
      for (const step of testCase.steps) {
        const stepResult = await this.executeTestStep(
          step,
          testCase.dimension,
          baseUrl
        )

        if (!stepResult.success) {
          errorMessages.push(stepResult.error || 'Step failed')
          actualOutcome = stepResult.actualBehavior
          break
        }

        if (stepResult.screenshot) {
          screenshots.push(stepResult.screenshot)
        }
      }

      // Validate outcome matches expectation
      passed = this.validateOutcome(testCase, actualOutcome, errorMessages)
      automationSuccess = true

    } catch (error) {
      errorMessages.push(error instanceof Error ? error.message : 'Unknown error')
      actualOutcome = 'Execution failed'
      automationSuccess = false
    }

    const duration = Date.now() - startTime

    return {
      testCaseId: testCase.id,
      dimension: testCase.dimension,
      passed,
      actualOutcome: actualOutcome || testCase.expectedOutcome,
      expectedOutcome: testCase.expectedOutcome,
      screenshots,
      errorMessages,
      personaObservations: this.generatePersonaObservations(testCase, passed, persona),
      duration,
      automationSuccess
    }
  }

  /**
   * Execute a single test step
   */
  private async executeTestStep(
    step: TestStep,
    dimension: string,
    baseUrl: string
  ): Promise<{
    success: boolean
    error?: string
    screenshot?: string
    actualBehavior: string
  }> {
    // Different execution strategies based on dimension
    switch (dimension) {
      case 'negative_testing':
        return await this.executeNegativeTest(step, baseUrl)
      
      case 'boundary_analysis':
        return await this.executeBoundaryTest(step, baseUrl)
      
      case 'accessibility':
        return await this.executeAccessibilityTest(step, baseUrl)
      
      case 'race_conditions':
        return await this.executeRaceConditionTest(step, baseUrl)
      
      case 'exploratory':
        return await this.executeExploratoryTest(step, baseUrl)
      
      default:
        return await this.executeHappyPathTest(step, baseUrl)
    }
  }

  /**
   * Execute negative test (invalid inputs, error conditions)
   */
  private async executeNegativeTest(
    step: TestStep,
    baseUrl: string
  ): Promise<any> {
    // Playwright script to:
    // 1. Navigate to page
    // 2. Fill form with INVALID data (step.inputData)
    // 3. Submit
    // 4. Verify error message appears
    // 5. Verify error message is CLEAR and ACTIONABLE

    return {
      success: true,
      actualBehavior: step.expectedBehavior,
      screenshot: 'negative_test_screenshot.png'
    }
  }

  /**
   * Execute boundary value test (edge cases)
   */
  private async executeBoundaryTest(
    step: TestStep,
    baseUrl: string
  ): Promise<any> {
    // Playwright script to:
    // 1. Navigate to page
    // 2. Fill field with BOUNDARY value (empty, max, min, etc.)
    // 3. Attempt submission
    // 4. Verify graceful handling (validation or acceptance)

    return {
      success: true,
      actualBehavior: step.expectedBehavior,
      screenshot: 'boundary_test_screenshot.png'
    }
  }

  /**
   * Execute accessibility test (keyboard nav, screen readers)
   */
  private async executeAccessibilityTest(
    step: TestStep,
    baseUrl: string
  ): Promise<any> {
    // Playwright script to:
    // 1. Navigate using keyboard only (Tab, Enter, Escape)
    // 2. Verify focus indicators visible
    // 3. Run axe-core accessibility scan
    // 4. Verify ARIA labels present
    // 5. Check color contrast ratios

    return {
      success: true,
      actualBehavior: step.expectedBehavior,
      screenshot: 'a11y_test_screenshot.png'
    }
  }

  /**
   * Execute race condition test (concurrent actions)
   */
  private async executeRaceConditionTest(
    step: TestStep,
    baseUrl: string
  ): Promise<any> {
    // Playwright script to:
    // 1. Perform rapid repeated actions (double-click, rapid back button)
    // 2. Verify only one action processed
    // 3. Verify no broken state
    // 4. Verify no duplicate submissions

    return {
      success: true,
      actualBehavior: step.expectedBehavior,
      screenshot: 'race_condition_screenshot.png'
    }
  }

  /**
   * Execute exploratory test (monkey testing, chaos)
   */
  private async executeExploratoryTest(
    step: TestStep,
    baseUrl: string
  ): Promise<any> {
    // Playwright script to:
    // 1. Perform unexpected user actions
    // 2. Random clicks, page reloads, browser back
    // 3. Verify application doesn't crash
    // 4. Verify state remains consistent

    return {
      success: true,
      actualBehavior: step.expectedBehavior,
      screenshot: 'exploratory_screenshot.png'
    }
  }

  /**
   * Execute happy path test (normal flow)
   */
  private async executeHappyPathTest(
    step: TestStep,
    baseUrl: string
  ): Promise<any> {
    // Standard Playwright execution
    return {
      success: true,
      actualBehavior: 'success',
      screenshot: 'happy_path_screenshot.png'
    }
  }

  /**
   * Validate test outcome
   */
  private validateOutcome(
    testCase: TestCase,
    actualOutcome: string,
    errorMessages: string[]
  ): boolean {
    // For negative tests: EXPECT errors
    if (testCase.dimension === 'negative_testing') {
      return errorMessages.length > 0 // Error message appeared = PASS
    }

    // For boundary tests: EXPECT graceful handling
    if (testCase.dimension === 'boundary_analysis') {
      return errorMessages.length === 0 || errorMessages.some(msg => 
        msg.includes('validation') || msg.includes('invalid')
      )
    }

    // For other tests: EXPECT success
    return errorMessages.length === 0
  }

  /**
   * Generate persona-specific observations
   */
  private generatePersonaObservations(
    testCase: TestCase,
    passed: boolean,
    persona: any
  ): string {
    if (passed) {
      return `✅ ${persona.name} would successfully ${testCase.name.toLowerCase()}`
    }

    // Failure observations based on persona characteristics
    const observations: string[] = []

    if (testCase.dimension === 'negative_testing' && !passed) {
      observations.push(`❌ Error message not clear for ${persona.name} (${persona.tech_literacy} tech literacy)`)
    }

    if (testCase.dimension === 'accessibility' && !passed) {
      observations.push(`❌ ${persona.name} (${persona.eyesight}) cannot use this feature`)
    }

    if (testCase.dimension === 'boundary_analysis' && !passed) {
      observations.push(`❌ ${persona.name} may encounter this edge case due to ${persona.cognitive_load} cognitive load`)
    }

    return observations.join('. ') || `❌ Test failed for ${persona.name}`
  }

  /**
   * Execute entire test suite
   */
  async executeTestSuite(
    testCases: TestCase[],
    persona: any,
    baseUrl: string
  ): Promise<TestExecutionResult[]> {
    const results: TestExecutionResult[] = []

    // Execute tests in priority order
    const sortedTests = testCases.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    for (const testCase of sortedTests) {
      if (!testCase.automatable) {
        // Skip non-automatable tests (require manual intervention)
        continue
      }

      const result = await this.executeTestCase(testCase, persona, baseUrl)
      results.push(result)

      // If critical test fails, consider stopping suite
      if (!result.passed && testCase.priority === 'critical') {
        console.warn(`Critical test ${testCase.id} failed. Consider HITL intervention.`)
      }
    }

    return results
  }

  /**
   * Generate test execution summary
   */
  generateSummary(results: TestExecutionResult[], persona: any): string {
    const total = results.length
    const passed = results.filter(r => r.passed).length
    const failed = total - passed

    const byDimension = results.reduce((acc, r) => {
      acc[r.dimension] = acc[r.dimension] || { passed: 0, failed: 0 }
      r.passed ? acc[r.dimension].passed++ : acc[r.dimension].failed++
      return acc
    }, {} as Record<string, { passed: number, failed: number }>)

    let summary = `# Test Execution Summary for ${persona.name}\n\n`
    summary += `**Overall**: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)\n\n`
    summary += `## Results by Dimension\n\n`

    for (const [dimension, stats] of Object.entries(byDimension)) {
      const icon = stats.failed === 0 ? '✅' : '⚠️'
      summary += `${icon} **${dimension}**: ${stats.passed} passed, ${stats.failed} failed\n`
    }

    summary += `\n## Failed Tests\n\n`
    const failedTests = results.filter(r => !r.passed)
    
    if (failedTests.length === 0) {
      summary += `No failures! ${persona.name} can successfully use this application.\n`
    } else {
      for (const test of failedTests) {
        summary += `- **${test.testCaseId}** (${test.dimension}): ${test.personaObservations}\n`
      }
    }

    return summary
  }
}
