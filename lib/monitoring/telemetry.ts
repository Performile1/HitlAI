import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface PerformanceMetric {
  testRunId: string
  agentName: string
  operation: string
  duration: number
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

/**
 * Telemetry - Performance logging and monitoring
 * 
 * Tracks:
 * - Agent execution times
 * - API latencies
 * - Success/failure rates
 * - Resource usage
 * - Performance bottlenecks
 */
export class Telemetry {
  private metrics: PerformanceMetric[] = []
  private readonly FLUSH_INTERVAL_MS = 10000
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startAutoFlush()
  }

  /**
   * Records a performance metric
   */
  record(metric: PerformanceMetric): void {
    this.metrics.push({
      ...metric,
      metadata: {
        ...metric.metadata,
        timestamp: new Date().toISOString()
      }
    })

    if (this.metrics.length >= 100) {
      this.flush()
    }
  }

  /**
   * Flushes metrics to database
   */
  async flush(): Promise<void> {
    if (this.metrics.length === 0) return

    const batch = [...this.metrics]
    this.metrics = []

    try {
      const supabase = getSupabaseAdmin()
      await supabase.from('performance_metrics').insert(
        batch.map(m => ({
          test_run_id: m.testRunId,
          agent_name: m.agentName,
          operation: m.operation,
          duration_ms: m.duration,
          success: m.success,
          error_message: m.errorMessage,
          metadata: m.metadata,
          created_at: m.metadata?.timestamp || new Date().toISOString()
        }))
      )
    } catch (error) {
      console.error('[Telemetry] Failed to flush metrics:', error)
    }
  }

  /**
   * Starts auto-flush interval
   */
  private startAutoFlush(): void {
    if (this.flushInterval) return
    this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS)
  }

  /**
   * Stops auto-flush
   */
  stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
      this.flush()
    }
  }
}

let telemetryInstance: Telemetry | null = null

export function getTelemetry(): Telemetry {
  if (!telemetryInstance) {
    telemetryInstance = new Telemetry()
  }
  return telemetryInstance
}
