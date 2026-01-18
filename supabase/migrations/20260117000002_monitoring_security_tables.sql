-- Migration: Monitoring and Security Infrastructure
-- Description: Tables for performance monitoring, rate limiting, velocity checking, and circuit breakers
-- Created: 2026-01-17

-- =====================================================
-- 1. PERFORMANCE METRICS
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Context
  metric_type TEXT NOT NULL, -- 'api_latency', 'db_query', 'ai_inference', 'page_load'
  endpoint TEXT,
  operation TEXT,
  
  -- Metrics
  duration_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  
  -- Resource usage
  memory_mb INTEGER,
  cpu_percent DECIMAL(5,2),
  
  -- User context
  user_id UUID, -- References auth.users
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_endpoint ON performance_metrics(endpoint);
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX idx_performance_metrics_duration ON performance_metrics(duration_ms DESC);
CREATE INDEX idx_performance_metrics_failed ON performance_metrics(success) WHERE success = FALSE;

-- Partition by month for performance
-- ALTER TABLE performance_metrics PARTITION BY RANGE (created_at);

-- =====================================================
-- 2. AGENT EXECUTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Agent info
  agent_name TEXT NOT NULL, -- 'PersonaAgent', 'GlobalInsightsAgent', etc.
  agent_version TEXT NOT NULL,
  execution_type TEXT NOT NULL, -- 'scheduled', 'on_demand', 'triggered'
  
  -- Context
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Execution
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  status TEXT NOT NULL, -- 'running', 'completed', 'failed', 'timeout'
  
  -- Input/Output
  input_params JSONB NOT NULL,
  output_result JSONB,
  error_details TEXT,
  
  -- Performance
  tokens_used INTEGER,
  api_calls_made INTEGER,
  cost_usd DECIMAL(10,6),
  
  -- Quality
  output_quality_score DECIMAL(3,2),
  human_reviewed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_executions_agent ON agent_executions(agent_name);
CREATE INDEX idx_agent_executions_test_run ON agent_executions(test_run_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_started_at ON agent_executions(started_at DESC);
CREATE INDEX idx_agent_executions_failed ON agent_executions(status) WHERE status = 'failed';

-- =====================================================
-- 3. API RATE LIMITS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identifier
  user_id UUID, -- References auth.users
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  ip_address INET,
  
  -- Endpoint
  endpoint TEXT NOT NULL,
  
  -- Rate limit tracking
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  
  -- Limit configuration
  max_requests INTEGER NOT NULL,
  window_minutes INTEGER NOT NULL,
  
  -- Status
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_rate_limits_user ON api_rate_limits(user_id);
CREATE INDEX idx_api_rate_limits_company ON api_rate_limits(company_id);
CREATE INDEX idx_api_rate_limits_endpoint ON api_rate_limits(endpoint);
CREATE INDEX idx_api_rate_limits_window ON api_rate_limits(window_start, window_end);
CREATE INDEX idx_api_rate_limits_blocked ON api_rate_limits(is_blocked) WHERE is_blocked = TRUE;

-- =====================================================
-- 4. VELOCITY ANALYSIS
-- =====================================================

CREATE TABLE IF NOT EXISTS velocity_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  session_id TEXT NOT NULL,
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  
  -- Interaction metrics
  total_interactions INTEGER NOT NULL,
  time_span_seconds INTEGER NOT NULL,
  interactions_per_minute DECIMAL(6,2) NOT NULL,
  
  -- Pattern analysis
  click_velocity DECIMAL(6,2),
  scroll_velocity DECIMAL(6,2),
  typing_velocity DECIMAL(6,2),
  
  -- Timing patterns
  avg_time_between_actions_ms INTEGER,
  min_time_between_actions_ms INTEGER,
  max_time_between_actions_ms INTEGER,
  stddev_time_between_actions_ms INTEGER,
  
  -- Suspicious patterns
  uniform_timing_detected BOOLEAN DEFAULT FALSE,
  superhuman_speed_detected BOOLEAN DEFAULT FALSE,
  no_hesitation_detected BOOLEAN DEFAULT FALSE,
  perfect_accuracy_detected BOOLEAN DEFAULT FALSE,
  
  -- Bot probability
  bot_probability_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  is_likely_bot BOOLEAN NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  reasoning TEXT NOT NULL,
  
  -- Action taken
  flagged_for_review BOOLEAN DEFAULT FALSE,
  reviewed_by UUID, -- References auth.users
  review_decision TEXT, -- 'legitimate', 'bot', 'suspicious'
  review_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_velocity_analysis_session ON velocity_analysis(session_id);
CREATE INDEX idx_velocity_analysis_tester ON velocity_analysis(tester_id);
CREATE INDEX idx_velocity_analysis_test_run ON velocity_analysis(test_run_id);
CREATE INDEX idx_velocity_analysis_bot_score ON velocity_analysis(bot_probability_score DESC);
CREATE INDEX idx_velocity_analysis_flagged ON velocity_analysis(flagged_for_review) WHERE flagged_for_review = TRUE;
CREATE INDEX idx_velocity_analysis_likely_bot ON velocity_analysis(is_likely_bot) WHERE is_likely_bot = TRUE;

-- =====================================================
-- 5. CIRCUIT BREAKER EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS circuit_breaker_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Circuit breaker info
  service_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  
  -- Event
  event_type TEXT NOT NULL, -- 'opened', 'closed', 'half_open', 'failure', 'success'
  state_before TEXT NOT NULL,
  state_after TEXT NOT NULL,
  
  -- Metrics
  failure_count INTEGER NOT NULL,
  failure_threshold INTEGER NOT NULL,
  success_count INTEGER,
  
  -- Error details
  error_message TEXT,
  error_stack TEXT,
  
  -- Timing
  opened_at TIMESTAMPTZ,
  will_retry_at TIMESTAMPTZ,
  
  -- Impact
  requests_rejected INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_circuit_breaker_events_service ON circuit_breaker_events(service_name);
CREATE INDEX idx_circuit_breaker_events_type ON circuit_breaker_events(event_type);
CREATE INDEX idx_circuit_breaker_events_created_at ON circuit_breaker_events(created_at DESC);
CREATE INDEX idx_circuit_breaker_events_opened ON circuit_breaker_events(event_type) WHERE event_type = 'opened';

-- =====================================================
-- 6. API CALL LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Request info
  method TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  path TEXT NOT NULL,
  query_params JSONB,
  
  -- User context
  user_id UUID, -- References auth.users
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Request/Response
  request_body JSONB,
  response_status INTEGER NOT NULL,
  response_body JSONB,
  
  -- Performance
  duration_ms INTEGER NOT NULL,
  
  -- Security
  auth_method TEXT, -- 'jwt', 'api_key', 'session'
  rate_limited BOOLEAN DEFAULT FALSE,
  
  -- Errors
  error_occurred BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_call_logs_endpoint ON api_call_logs(endpoint);
CREATE INDEX idx_api_call_logs_user ON api_call_logs(user_id);
CREATE INDEX idx_api_call_logs_company ON api_call_logs(company_id);
CREATE INDEX idx_api_call_logs_status ON api_call_logs(response_status);
CREATE INDEX idx_api_call_logs_created_at ON api_call_logs(created_at DESC);
CREATE INDEX idx_api_call_logs_errors ON api_call_logs(error_occurred) WHERE error_occurred = TRUE;
CREATE INDEX idx_api_call_logs_slow ON api_call_logs(duration_ms DESC) WHERE duration_ms > 1000;

-- Partition by month for performance
-- ALTER TABLE api_call_logs PARTITION BY RANGE (created_at);

-- =====================================================
-- 7. SECURITY INCIDENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Incident details
  incident_type TEXT NOT NULL, -- 'rate_limit_exceeded', 'suspicious_activity', 'bot_detected', 'unauthorized_access'
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Context
  user_id UUID, -- References auth.users
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ip_address INET,
  
  -- Evidence
  evidence JSONB NOT NULL,
  related_logs UUID[],
  
  -- Response
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  action_taken TEXT,
  resolved_by UUID, -- References auth.users
  resolved_at TIMESTAMPTZ,
  
  -- Notifications
  notified_users UUID[],
  notified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_incidents_type ON security_incidents(incident_type);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_security_incidents_status ON security_incidents(status);
CREATE INDEX idx_security_incidents_user ON security_incidents(user_id);
CREATE INDEX idx_security_incidents_open ON security_incidents(status) WHERE status IN ('open', 'investigating');

-- =====================================================
-- 8. SYSTEM HEALTH CHECKS
-- =====================================================

CREATE TABLE IF NOT EXISTS system_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Service
  service_name TEXT NOT NULL,
  check_type TEXT NOT NULL, -- 'database', 'api', 'ai_model', 'storage', 'queue'
  
  -- Status
  is_healthy BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  
  -- Details
  status_message TEXT,
  error_details TEXT,
  
  -- Metrics
  metrics JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_health_checks_service ON system_health_checks(service_name);
CREATE INDEX idx_system_health_checks_type ON system_health_checks(check_type);
CREATE INDEX idx_system_health_checks_created_at ON system_health_checks(created_at DESC);
CREATE INDEX idx_system_health_checks_unhealthy ON system_health_checks(is_healthy) WHERE is_healthy = FALSE;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE performance_metrics IS 'Tracks performance metrics for APIs, database queries, and AI inferences';
COMMENT ON TABLE agent_executions IS 'Logs all AI agent executions with input/output and performance data';
COMMENT ON TABLE api_rate_limits IS 'Tracks API rate limiting per user/company/endpoint';
COMMENT ON TABLE velocity_analysis IS 'Bot detection through interaction velocity and pattern analysis';
COMMENT ON TABLE circuit_breaker_events IS 'Circuit breaker state changes and failure tracking';
COMMENT ON TABLE api_call_logs IS 'Complete audit log of all API calls';
COMMENT ON TABLE security_incidents IS 'Security incidents and suspicious activity tracking';
COMMENT ON TABLE system_health_checks IS 'System health monitoring and uptime tracking';
