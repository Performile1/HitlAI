-- Monitoring and Observability Tables
-- Supports AgentMonitor, CircuitBreaker, and Telemetry systems

-- ============================================================================
-- AGENT EXECUTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  
  -- Agent details
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL, -- running, completed, failed, timeout, hitl_paused, killed
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_executions_test_run ON agent_executions(test_run_id);
CREATE INDEX idx_agent_executions_agent ON agent_executions(agent_name);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_created_at ON agent_executions(created_at DESC);

-- ============================================================================
-- CIRCUIT BREAK EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS circuit_break_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE SET NULL,
  
  -- Cost details
  total_cost NUMERIC(10, 4) NOT NULL,
  call_count INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  cost_by_model JSONB DEFAULT '{}'::jsonb,
  
  -- Threshold
  threshold NUMERIC(10, 4) NOT NULL,
  reason TEXT NOT NULL,
  
  -- Global vs test-specific
  is_global BOOLEAN DEFAULT false,
  
  -- Alert status
  alert_sent BOOLEAN DEFAULT false,
  alert_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_circuit_break_events_test_run ON circuit_break_events(test_run_id);
CREATE INDEX idx_circuit_break_events_is_global ON circuit_break_events(is_global) WHERE is_global = true;
CREATE INDEX idx_circuit_break_events_created_at ON circuit_break_events(created_at DESC);

-- ============================================================================
-- API CALL LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  
  -- Model details
  model TEXT NOT NULL,
  
  -- Token usage
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  
  -- Cost
  cost NUMERIC(10, 6) NOT NULL,
  
  -- Timing
  latency_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_call_logs_test_run ON api_call_logs(test_run_id);
CREATE INDEX idx_api_call_logs_model ON api_call_logs(model);
CREATE INDEX idx_api_call_logs_created_at ON api_call_logs(created_at DESC);

-- ============================================================================
-- PERFORMANCE METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  
  -- Operation details
  agent_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  
  -- Performance
  duration_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_test_run ON performance_metrics(test_run_id);
CREATE INDEX idx_performance_metrics_agent ON performance_metrics(agent_name);
CREATE INDEX idx_performance_metrics_operation ON performance_metrics(operation);
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get cost summary for a test run
CREATE OR REPLACE FUNCTION get_test_run_cost_summary(p_test_run_id UUID)
RETURNS TABLE (
  total_cost NUMERIC,
  total_calls INTEGER,
  cost_by_model JSONB,
  avg_latency_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(cost)::NUMERIC as total_cost,
    COUNT(*)::INTEGER as total_calls,
    jsonb_object_agg(model, model_cost) as cost_by_model,
    AVG(latency_ms)::NUMERIC as avg_latency_ms
  FROM (
    SELECT
      model,
      SUM(cost) as model_cost,
      AVG(latency_ms) as latency_ms
    FROM api_call_logs
    WHERE test_run_id = p_test_run_id
    GROUP BY model
  ) subquery;
END;
$$ LANGUAGE plpgsql;

-- Get agent performance summary
CREATE OR REPLACE FUNCTION get_agent_performance_summary(
  p_agent_name TEXT,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_executions BIGINT,
  successful_executions BIGINT,
  failed_executions BIGINT,
  avg_duration_ms NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_executions,
    COUNT(*) FILTER (WHERE success = true)::BIGINT as successful_executions,
    COUNT(*) FILTER (WHERE success = false)::BIGINT as failed_executions,
    AVG(duration_ms)::NUMERIC as avg_duration_ms,
    (COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*)::NUMERIC * 100) as success_rate
  FROM performance_metrics
  WHERE agent_name = p_agent_name
  AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Get daily cost summary
CREATE OR REPLACE FUNCTION get_daily_cost_summary()
RETURNS TABLE (
  date DATE,
  total_cost NUMERIC,
  total_calls INTEGER,
  unique_test_runs INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    SUM(cost)::NUMERIC as total_cost,
    COUNT(*)::INTEGER as total_calls,
    COUNT(DISTINCT test_run_id)::INTEGER as unique_test_runs
  FROM api_call_logs
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_break_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Companies can view their own monitoring data
CREATE POLICY "Companies can view their agent executions"
ON agent_executions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM test_runs
    JOIN test_requests ON test_requests.id = test_runs.test_request_id
    WHERE test_runs.id = agent_executions.test_run_id
    AND is_member_of_company(test_requests.company_id)
  )
);

CREATE POLICY "Companies can view their circuit break events"
ON circuit_break_events FOR SELECT
USING (
  test_run_id IS NULL -- Global events visible to all
  OR EXISTS (
    SELECT 1 FROM test_runs
    JOIN test_requests ON test_requests.id = test_runs.test_request_id
    WHERE test_runs.id = circuit_break_events.test_run_id
    AND is_member_of_company(test_requests.company_id)
  )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE agent_executions IS 'Tracks execution of individual agents for monitoring and debugging';
COMMENT ON TABLE circuit_break_events IS 'Logs circuit breaker triggers for cost protection';
COMMENT ON TABLE api_call_logs IS 'Detailed logs of all AI API calls with token usage and cost';
COMMENT ON TABLE performance_metrics IS 'Performance telemetry for agents and operations';
COMMENT ON COLUMN agent_executions.retry_count IS 'Number of retries attempted before success or HITL pause';
COMMENT ON COLUMN circuit_break_events.is_global IS 'True if global daily limit exceeded, false if test-specific';
COMMENT ON COLUMN api_call_logs.cost IS 'Cost in USD for this API call';
