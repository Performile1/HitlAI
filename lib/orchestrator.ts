import { SupabaseClient } from '@supabase/supabase-js'
import { MissionPlanner } from './agents/missionPlanner'
import { VisionSpecialist } from './agents/visionSpecialist'
import { TechnicalExecutor } from './agents/technicalExecutor'
import { MemoryManager } from './memory/memoryManager'
import { getAgentMonitor } from './monitoring/agentMonitor'
import { getCircuitBreaker } from './security/circuitBreaker'
import { pruneForAgent } from './optimization/contextPruner'

interface TestConfig {
  testRunId: string
  url: string
  mission: string
  persona: string
  platform: 'web' | 'mobile'
}

interface TestResult {
  success: boolean
  sentimentScore?: number
  report?: string
  error?: string
}

export class HitlAIOrchestrator {
  private supabase: SupabaseClient
  private missionPlanner: MissionPlanner
  private visionSpecialist: VisionSpecialist
  private technicalExecutor: TechnicalExecutor
  private memoryManager: MemoryManager
  private monitor = getAgentMonitor()
  private breaker = getCircuitBreaker()

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.missionPlanner = new MissionPlanner()
    this.visionSpecialist = new VisionSpecialist()
    this.technicalExecutor = new TechnicalExecutor()
    this.memoryManager = new MemoryManager(supabase)
  }

  async executeTest(config: TestConfig): Promise<TestResult> {
    // Initialize cost tracking
    this.breaker.initializeTestRun(config.testRunId)
    
    try {
      const { data: persona } = await this.supabase
        .from('personas')
        .select('*')
        .eq('name', config.persona)
        .single()

      if (!persona) {
        throw new Error(`Persona ${config.persona} not found`)
      }
      const typedPersona = persona as any

      // Scout page with monitoring
      const scoutId = this.monitor.registerExecution('ScoutPage', config.testRunId, 30000)
      let crawlResult
      try {
        this.monitor.heartbeat(scoutId, 10, 'Fetching page...')
        crawlResult = await this.scoutPage(config.url)
        this.monitor.heartbeat(scoutId, 100, 'Page fetched')
        await this.monitor.completeExecution(scoutId)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        await this.monitor.failExecution(scoutId, errorMessage)
        throw error
      }
      await this.updateTestRun(config.testRunId, {
        crawl_context: crawlResult.markdown
      })

      const semanticSchema = await this.mapSchema(config.url, crawlResult.html)
      await this.updateTestRun(config.testRunId, {
        semantic_schema: semanticSchema
      })

      const memoryLessons = await this.memoryManager.retrieveLessons(
        `${config.mission} on ${config.url}`,
        config.platform
      )

      // Plan mission with monitoring and budget check
      const plannerId = this.monitor.registerExecution('MissionPlanner', config.testRunId, 60000)
      let missionPlan
      try {
        this.monitor.heartbeat(plannerId, 20, 'Planning mission...')
        
        // Check budget before LLM call
        const budgetCheck = await this.breaker.recordCall(config.testRunId, 'gpt-4', 2000, 1000)
        if (!budgetCheck.allowed) {
          throw new Error(budgetCheck.reason)
        }
        
        missionPlan = await this.missionPlanner.planMission(
          config.mission,
          persona,
          crawlResult.markdown
        )
        
        this.monitor.heartbeat(plannerId, 100, 'Mission planned')
        await this.monitor.completeExecution(plannerId)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        await this.monitor.failExecution(plannerId, errorMessage)
        throw error
      }

      await this.updateTestRun(config.testRunId, {
        total_steps: missionPlan.steps.length
      })

      for (const step of missionPlan.steps) {
        await this.insertMissionStep(config.testRunId, step)
      }

      // UX audit with monitoring and budget check
      const auditId = this.monitor.registerExecution('VisionSpecialist', config.testRunId, 90000)
      let auditResults
      try {
        this.monitor.heartbeat(auditId, 30, 'Auditing UX...')
        
        // Check budget before LLM call
        const budgetCheck = await this.breaker.recordCall(config.testRunId, 'claude-3.5-sonnet', 3000, 1500)
        if (!budgetCheck.allowed) {
          throw new Error(budgetCheck.reason)
        }
        
        // Prune context to avoid token bloat
        const prunedContext = pruneForAgent(
          config.mission,
          [],
          crawlResult.html,
          []
        )
        
        auditResults = await this.visionSpecialist.auditUX(
          persona,
          semanticSchema,
          prunedContext.relevantDOM
        )
        
        this.monitor.heartbeat(auditId, 100, 'UX audit complete')
        await this.monitor.completeExecution(auditId)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        await this.monitor.failExecution(auditId, errorMessage)
        throw error
      }

      await this.updateTestRun(config.testRunId, {
        audit_results: auditResults,
        sentiment_score: auditResults.sentimentScore
      })

      for (const frictionPoint of auditResults.frictionPoints) {
        await this.insertFrictionPoint(config.testRunId, frictionPoint, config.platform)
      }

      let currentStepIndex = 0
      let failureCount = 0
      const maxRetries = 3

      for (const step of missionPlan.steps) {
        let stepSuccess = false

        while (!stepSuccess && failureCount < maxRetries) {
          // Generate script with monitoring
          const scriptId = this.monitor.registerExecution('TechnicalExecutor', config.testRunId, 60000)
          let script
          try {
            this.monitor.heartbeat(scriptId, 40, `Generating script for step ${currentStepIndex + 1}...`)
            
            // Check budget
            const budgetCheck = await this.breaker.recordCall(config.testRunId, 'gpt-4o', 2500, 800)
            if (!budgetCheck.allowed) {
              throw new Error(budgetCheck.reason)
            }
            
            // Prune context
            const prunedContext = pruneForAgent(
              config.mission,
              await this.getRecentActions(config.testRunId),
              crawlResult.html,
              auditResults.frictionPoints
            )
            
            script = await this.technicalExecutor.generateScript(
              step.action,
              semanticSchema,
              auditResults,
              memoryLessons
            )
            
            await this.monitor.completeExecution(scriptId)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            await this.monitor.failExecution(scriptId, errorMessage)
            throw error
          }

          // Execute script with monitoring
          const execId = this.monitor.registerExecution('PlaywrightExecutor', config.testRunId, 120000)
          let executionResult
          try {
            this.monitor.heartbeat(execId, 50, 'Executing Playwright script...')
            
            executionResult = await this.executePlaywrightScript(
              config.url,
              script
            )
            
            this.monitor.heartbeat(execId, 100, 'Script executed')
            await this.monitor.completeExecution(execId)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            await this.monitor.failExecution(execId, errorMessage)
            executionResult = { success: false, error: errorMessage }
          }

          await this.insertActionAttempt(config.testRunId, {
            step_index: currentStepIndex,
            action_type: step.action,
            success: executionResult.success,
            error_message: executionResult.error
          })

          if (executionResult.success) {
            stepSuccess = true
            failureCount = 0
          } else {
            failureCount++
            
            if (failureCount >= maxRetries) {
              await this.updateTestRun(config.testRunId, {
                status: 'hitl_paused',
                failure_count: failureCount
              })
              
              return {
                success: false,
                error: 'HITL intervention required'
              }
            }
          }
        }

        currentStepIndex++
        await this.updateTestRun(config.testRunId, {
          current_step_index: currentStepIndex
        })
      }

      const report = await this.generateReport(config.testRunId)

      return {
        success: true,
        sentimentScore: auditResults.sentimentScore,
        report
      }

    } catch (error) {
      console.error('Test execution error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async scoutPage(url: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/crawl`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url,
          extractLinks: true,
          waitTime: 3
        })
      }
    )

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to crawl page')
    }

    return result
  }

  private async mapSchema(url: string, html: string) {
    return {
      interactive_elements: [],
      navigation: {},
      accessibility: {}
    }
  }

  private async executePlaywrightScript(url: string, script: string) {
    return {
      success: true,
      error: null
    }
  }

  private async updateTestRun(testRunId: string, updates: any) {
    await this.supabase
      .from('test_runs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', testRunId)
  }

  private async insertMissionStep(testRunId: string, step: any) {
    await this.supabase
      .from('mission_steps')
      .insert({
        test_run_id: testRunId,
        step_number: step.stepNumber,
        action: step.action,
        target_element: step.targetElement,
        validation: step.validation,
        cognitive_notes: step.cognitiveNotes
      })
  }

  private async insertFrictionPoint(testRunId: string, friction: any, platform: string) {
    await this.supabase
      .from('friction_points')
      .insert({
        test_run_id: testRunId,
        element: friction.element,
        issue_type: friction.issueType,
        severity: friction.severity,
        persona_impact: friction.personaImpact,
        resolution: friction.resolution,
        guideline_citation: friction.guidelineCitation || null,
        platform
      })
  }

  private async insertActionAttempt(testRunId: string, attempt: any) {
    await this.supabase
      .from('action_attempts')
      .insert({
        test_run_id: testRunId,
        ...attempt
      })
  }

  private async getRecentActions(testRunId: string): Promise<any[]> {
    const { data: actions } = await this.supabase
      .from('action_attempts')
      .select('*')
      .eq('test_run_id', testRunId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    return actions || []
  }

  private async generateReport(testRunId: string): Promise<string> {
    const { data: testRun } = await this.supabase
      .from('test_runs')
      .select('*, friction_points(*)')
      .eq('id', testRunId)
      .single()

    if (!testRun) return ''

    return `# HitlAI Test Report

**URL**: ${testRun.url}
**Mission**: ${testRun.mission}
**Persona**: ${testRun.persona}
**Sentiment Score**: ${testRun.sentiment_score?.toFixed(2) || 'N/A'}

## Friction Points

${testRun.friction_points.map((fp: any) => `
### ${fp.severity.toUpperCase()}: ${fp.element}
- **Issue**: ${fp.issue_type}
- **Persona Impact**: ${fp.persona_impact}
- **Guideline**: ${fp.guideline_citation || 'No citation'}
- **Resolution**: ${fp.resolution || 'Pending'}
`).join('\n')}

---
*Generated by HitlAI Cloud*
`
  }
}
