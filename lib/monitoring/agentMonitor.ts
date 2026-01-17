import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface AgentExecution {
  agentName: string
  testRunId: string
  startTime: number
  timeout: number // milliseconds
  status: 'running' | 'completed' | 'failed' | 'timeout'
  retryCount: number
  maxRetries: number
}

interface AgentHeartbeat {
  agentName: string
  testRunId: string
  timestamp: number
  progress: number // 0-100
  currentAction: string
}

/**
 * AgentMonitor - Observability and reliability for multi-agent orchestration
 * 
 * Prevents "Zombie Processes" where agents hang indefinitely:
 * - Tracks heartbeat of each agent
 * - Enforces timeouts (default 60s per agent)
 * - Triggers self-healing retries or HITL pause
 * - Logs failures for debugging
 * - Prevents infinite loops and credit drain
 * 
 * Critical for 99.9% reliability in production
 */
export class AgentMonitor {
  private activeExecutions: Map<string, AgentExecution> = new Map()
  private heartbeats: Map<string, AgentHeartbeat> = new Map()
  private monitoringInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL_MS = 5000 // Check every 5 seconds

  constructor() {
    this.startMonitoring()
  }

  /**
   * Registers an agent execution for monitoring
   */
  registerExecution(
    agentName: string,
    testRunId: string,
    timeout: number = 60000, // 60 seconds default
    maxRetries: number = 3
  ): string {
    const executionId = `${agentName}-${testRunId}-${Date.now()}`
    
    this.activeExecutions.set(executionId, {
      agentName,
      testRunId,
      startTime: Date.now(),
      timeout,
      status: 'running',
      retryCount: 0,
      maxRetries
    })

    console.log(`[AgentMonitor] Registered: ${agentName} for test ${testRunId}`)
    return executionId
  }

  /**
   * Updates heartbeat for an agent (call this periodically from agent)
   */
  heartbeat(
    executionId: string,
    progress: number,
    currentAction: string
  ): void {
    const execution = this.activeExecutions.get(executionId)
    if (!execution) return

    this.heartbeats.set(executionId, {
      agentName: execution.agentName,
      testRunId: execution.testRunId,
      timestamp: Date.now(),
      progress,
      currentAction
    })
  }

  /**
   * Marks an execution as completed
   */
  async completeExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId)
    if (!execution) return

    execution.status = 'completed'
    
    // Log success
    await this.logExecution(execution, 'completed')
    
    // Cleanup
    this.activeExecutions.delete(executionId)
    this.heartbeats.delete(executionId)
    
    console.log(`[AgentMonitor] Completed: ${execution.agentName}`)
  }

  /**
   * Marks an execution as failed
   */
  async failExecution(
    executionId: string,
    error: string
  ): Promise<void> {
    const execution = this.activeExecutions.get(executionId)
    if (!execution) return

    execution.status = 'failed'
    
    // Log failure
    await this.logExecution(execution, 'failed', error)
    
    // Check if should retry
    if (execution.retryCount < execution.maxRetries) {
      console.log(`[AgentMonitor] Retry ${execution.retryCount + 1}/${execution.maxRetries} for ${execution.agentName}`)
      execution.retryCount++
      execution.startTime = Date.now()
      execution.status = 'running'
      return
    }

    // Max retries exceeded - pause for HITL
    await this.pauseForHITL(execution, error)
    
    // Cleanup
    this.activeExecutions.delete(executionId)
    this.heartbeats.delete(executionId)
  }

  /**
   * Starts monitoring loop
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) return

    this.monitoringInterval = setInterval(() => {
      this.checkTimeouts()
    }, this.CHECK_INTERVAL_MS)

    console.log('[AgentMonitor] Monitoring started')
  }

  /**
   * Stops monitoring loop
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      console.log('[AgentMonitor] Monitoring stopped')
    }
  }

  /**
   * Checks for timed out executions
   */
  private async checkTimeouts(): Promise<void> {
    const now = Date.now()

    for (const [executionId, execution] of this.activeExecutions.entries()) {
      if (execution.status !== 'running') continue

      const elapsed = now - execution.startTime
      const heartbeat = this.heartbeats.get(executionId)

      // Check if timed out
      if (elapsed > execution.timeout) {
        console.error(`[AgentMonitor] TIMEOUT: ${execution.agentName} exceeded ${execution.timeout}ms`)
        
        execution.status = 'timeout'
        await this.handleTimeout(execution)
        
        this.activeExecutions.delete(executionId)
        this.heartbeats.delete(executionId)
        continue
      }

      // Check if heartbeat is stale (no update in 30 seconds)
      if (heartbeat && (now - heartbeat.timestamp) > 30000) {
        console.warn(`[AgentMonitor] STALE HEARTBEAT: ${execution.agentName} - last update ${Math.round((now - heartbeat.timestamp) / 1000)}s ago`)
        
        // Treat as timeout
        execution.status = 'timeout'
        await this.handleTimeout(execution)
        
        this.activeExecutions.delete(executionId)
        this.heartbeats.delete(executionId)
      }
    }
  }

  /**
   * Handles timeout - retry or pause for HITL
   */
  private async handleTimeout(execution: AgentExecution): Promise<void> {
    // Log timeout
    await this.logExecution(execution, 'timeout', 'Agent exceeded timeout or heartbeat stale')

    // Check if should retry
    if (execution.retryCount < execution.maxRetries) {
      console.log(`[AgentMonitor] Timeout retry ${execution.retryCount + 1}/${execution.maxRetries} for ${execution.agentName}`)
      
      const supabase = getSupabaseAdmin()
      // Update test run with retry info
      await supabase
        .from('test_runs')
        .update({
          failure_count: execution.retryCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', execution.testRunId)

      // Note: Actual retry logic should be handled by orchestrator
      // This just tracks the state
      return
    }

    // Max retries exceeded - pause for HITL
    await this.pauseForHITL(execution, 'Agent timeout - exceeded max retries')
  }

  /**
   * Pauses test for Human-in-the-Loop intervention
   */
  private async pauseForHITL(
    execution: AgentExecution,
    reason: string
  ): Promise<void> {
    console.error(`[AgentMonitor] HITL PAUSE: ${execution.agentName} - ${reason}`)

    const supabase = getSupabaseAdmin()
    await supabase
      .from('test_runs')
      .update({
        status: 'hitl_paused',
        failure_count: execution.retryCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', execution.testRunId)

    // Log HITL event
    await supabase
      .from('agent_executions')
      .insert({
        test_run_id: execution.testRunId,
        agent_name: execution.agentName,
        status: 'hitl_paused',
        error_message: reason,
        retry_count: execution.retryCount,
        duration_ms: Date.now() - execution.startTime
      })
  }

  /**
   * Logs agent execution to database
   */
  private async logExecution(
    execution: AgentExecution,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const supabase = getSupabaseAdmin()
      await supabase
        .from('agent_executions')
        .insert({
          test_run_id: execution.testRunId,
          agent_name: execution.agentName,
          status,
          error_message: errorMessage,
          retry_count: execution.retryCount,
          duration_ms: Date.now() - execution.startTime,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('[AgentMonitor] Failed to log execution:', error)
    }
  }

  /**
   * Gets current status of all active executions
   */
  getActiveExecutions(): Array<{
    agentName: string
    testRunId: string
    elapsed: number
    progress: number
    currentAction: string
    status: string
  }> {
    const now = Date.now()
    const results: Array<any> = []

    for (const [executionId, execution] of this.activeExecutions.entries()) {
      const heartbeat = this.heartbeats.get(executionId)
      
      results.push({
        agentName: execution.agentName,
        testRunId: execution.testRunId,
        elapsed: now - execution.startTime,
        progress: heartbeat?.progress || 0,
        currentAction: heartbeat?.currentAction || 'Unknown',
        status: execution.status
      })
    }

    return results
  }

  /**
   * Kills all executions for a specific test run
   */
  async killTestRun(testRunId: string, reason: string): Promise<void> {
    console.warn(`[AgentMonitor] KILL TEST RUN: ${testRunId} - ${reason}`)

    for (const [executionId, execution] of this.activeExecutions.entries()) {
      if (execution.testRunId === testRunId) {
        execution.status = 'failed'
        await this.logExecution(execution, 'killed', reason)
        this.activeExecutions.delete(executionId)
        this.heartbeats.delete(executionId)
      }
    }

    const supabase = getSupabaseAdmin()
    // Update test run status
    await supabase
      .from('test_runs')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', testRunId)
  }
}

// Singleton instance
let monitorInstance: AgentMonitor | null = null

export function getAgentMonitor(): AgentMonitor {
  if (!monitorInstance) {
    monitorInstance = new AgentMonitor()
  }
  return monitorInstance
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    if (monitorInstance) {
      monitorInstance.stopMonitoring()
    }
  })
}
