import { createClient } from '@/lib/supabase/client';

interface AIPerformanceMetrics {
  testRunId: string;
  agentName: string;
  stepsCompleted: number;
  totalSteps: number;
  errorCount: number;
  completionRate: number;
}

export class AIQualityMonitor {
  private supabase = createClient();
  private errorRateThreshold = 0.20;
  private completionThreshold = 0.80;

  async trackAgentPerformance(metrics: AIPerformanceMetrics): Promise<void> {
    const completionRate = metrics.stepsCompleted / metrics.totalSteps;
    
    if (completionRate < this.completionThreshold) {
      await this.flagLaziness(metrics);
    }

    const errorRate = metrics.errorCount / metrics.totalSteps;
    if (errorRate > this.errorRateThreshold) {
      await this.flagExhaustion(metrics);
    }

    await this.supabase.from('ai_learning_events').insert({
      event_type: 'performance_tracking',
      test_run_id: metrics.testRunId,
      details: {
        agent: metrics.agentName,
        completion_rate: completionRate,
        error_rate: errorRate,
        flagged_laziness: completionRate < this.completionThreshold,
        flagged_exhaustion: errorRate > this.errorRateThreshold
      }
    });
  }

  private async flagLaziness(metrics: AIPerformanceMetrics): Promise<void> {
    console.warn(`AI Laziness detected: ${metrics.agentName} completed only ${metrics.completionRate}% of steps`);
    
    await this.supabase.from('ai_learning_events').insert({
      event_type: 'laziness_detected',
      test_run_id: metrics.testRunId,
      details: {
        agent: metrics.agentName,
        completion_rate: metrics.completionRate,
        steps_completed: metrics.stepsCompleted,
        total_steps: metrics.totalSteps
      }
    });
  }

  private async flagExhaustion(metrics: AIPerformanceMetrics): Promise<void> {
    console.warn(`AI Exhaustion detected: ${metrics.agentName} error rate ${(metrics.errorCount / metrics.totalSteps * 100).toFixed(1)}%`);
    
    await this.supabase.from('ai_learning_events').insert({
      event_type: 'exhaustion_detected',
      test_run_id: metrics.testRunId,
      details: {
        agent: metrics.agentName,
        error_rate: metrics.errorCount / metrics.totalSteps,
        error_count: metrics.errorCount,
        total_steps: metrics.totalSteps,
        recommendation: 'Switch to fallback model'
      }
    });
  }

  async shouldSwitchModel(agentName: string): Promise<boolean> {
    const { data: recentEvents } = await this.supabase
      .from('ai_learning_events')
      .select('*')
      .eq('event_type', 'exhaustion_detected')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
      .limit(5);

    return (recentEvents?.length || 0) >= 3;
  }
}
