-- Migration: API Health Monitoring Infrastructure
-- Description: Tables for API health tracking, incidents, and status pages
-- Created: 2026-01-17

-- =====================================================
-- 1. API HEALTH METRICS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Endpoint
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL, -- 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
  
  -- Health status
  is_healthy BOOLEAN NOT NULL,
  status_code INTEGER,
  
  -- Performance
  response_time_ms INTEGER NOT NULL,
  
  -- Availability
  uptime_percent DECIMAL(5,2),
  
  -- Error tracking
  error_count INTEGER DEFAULT 0,
  error_rate DECIMAL(5,2),
  last_error_message TEXT,
  last_error_at TIMESTAMPTZ,
  
  -- Cost tracking
  cost_per_request_usd DECIMAL(10,6),
  total_cost_usd DECIMAL(10,2),
  
  -- Request volume
  request_count INTEGER DEFAULT 0,
  requests_per_minute DECIMAL(8,2),
  
  -- Time window
  measured_at TIMESTAMPTZ NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_health_metrics_endpoint ON api_health_metrics(endpoint);
CREATE INDEX idx_api_health_metrics_measured_at ON api_health_metrics(measured_at DESC);
CREATE INDEX idx_api_health_metrics_unhealthy ON api_health_metrics(is_healthy) WHERE is_healthy = FALSE;
CREATE INDEX idx_api_health_metrics_slow ON api_health_metrics(response_time_ms DESC) WHERE response_time_ms > 1000;

-- =====================================================
-- 2. API INCIDENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Incident details
  endpoint TEXT NOT NULL,
  incident_type TEXT NOT NULL, -- 'downtime', 'degraded_performance', 'high_error_rate', 'timeout'
  severity TEXT NOT NULL, -- 'critical', 'major', 'minor', 'maintenance'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'investigating', -- 'investigating', 'identified', 'monitoring', 'resolved'
  
  -- Description
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Impact
  affected_users_count INTEGER,
  affected_companies_count INTEGER,
  impact_description TEXT,
  
  -- Timeline
  started_at TIMESTAMPTZ NOT NULL,
  identified_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Resolution
  root_cause TEXT,
  resolution_steps TEXT,
  resolved_by UUID, -- References auth.users
  
  -- Communication
  public_message TEXT,
  internal_notes TEXT,
  notified_users BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  
  -- Metrics during incident
  avg_response_time_ms INTEGER,
  error_rate DECIMAL(5,2),
  requests_affected INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_incidents_endpoint ON api_incidents(endpoint);
CREATE INDEX idx_api_incidents_status ON api_incidents(status);
CREATE INDEX idx_api_incidents_severity ON api_incidents(severity);
CREATE INDEX idx_api_incidents_started_at ON api_incidents(started_at DESC);
CREATE INDEX idx_api_incidents_active ON api_incidents(status) WHERE status IN ('investigating', 'identified', 'monitoring');

-- =====================================================
-- 3. API ENDPOINT CONFIGURATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_endpoint_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Endpoint
  endpoint TEXT NOT NULL UNIQUE,
  method TEXT NOT NULL,
  
  -- Display
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'authentication', 'tests', 'testers', 'companies', 'admin', 'public'
  
  -- Health check configuration
  health_check_enabled BOOLEAN DEFAULT TRUE,
  health_check_interval_seconds INTEGER DEFAULT 60,
  health_check_timeout_ms INTEGER DEFAULT 5000,
  
  -- Thresholds
  response_time_warning_ms INTEGER DEFAULT 1000,
  response_time_critical_ms INTEGER DEFAULT 3000,
  error_rate_warning_percent DECIMAL(5,2) DEFAULT 5.00,
  error_rate_critical_percent DECIMAL(5,2) DEFAULT 10.00,
  
  -- SLA
  sla_uptime_percent DECIMAL(5,2) DEFAULT 99.90,
  sla_response_time_ms INTEGER DEFAULT 500,
  
  -- Cost tracking
  estimated_cost_per_request_usd DECIMAL(10,6),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT FALSE, -- Show on public status page
  
  -- Maintenance
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,
  maintenance_scheduled_start TIMESTAMPTZ,
  maintenance_scheduled_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_endpoint_configs_category ON api_endpoint_configs(category);
CREATE INDEX idx_api_endpoint_configs_active ON api_endpoint_configs(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_api_endpoint_configs_public ON api_endpoint_configs(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_api_endpoint_configs_maintenance ON api_endpoint_configs(maintenance_mode) WHERE maintenance_mode = TRUE;

-- =====================================================
-- 4. API STATUS SUBSCRIPTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_status_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Subscriber
  email TEXT NOT NULL,
  user_id UUID, -- References auth.users
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Subscription preferences
  subscribe_to_all BOOLEAN DEFAULT TRUE,
  subscribed_endpoints TEXT[], -- If not all, specific endpoints
  
  -- Notification preferences
  notify_on_incidents BOOLEAN DEFAULT TRUE,
  notify_on_maintenance BOOLEAN DEFAULT TRUE,
  notify_on_resolution BOOLEAN DEFAULT TRUE,
  
  -- Severity filter
  min_severity TEXT DEFAULT 'minor', -- 'critical', 'major', 'minor'
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  
  -- Unsubscribe
  unsubscribe_token TEXT UNIQUE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_status_subscriptions_email ON api_status_subscriptions(email);
CREATE INDEX idx_api_status_subscriptions_user ON api_status_subscriptions(user_id);
CREATE INDEX idx_api_status_subscriptions_company ON api_status_subscriptions(company_id);
CREATE INDEX idx_api_status_subscriptions_active ON api_status_subscriptions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_api_status_subscriptions_unsubscribe ON api_status_subscriptions(unsubscribe_token);

-- =====================================================
-- 5. API INCIDENT UPDATES
-- =====================================================

CREATE TABLE IF NOT EXISTS api_incident_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Incident
  incident_id UUID REFERENCES api_incidents(id) ON DELETE CASCADE,
  
  -- Update
  status TEXT NOT NULL, -- 'investigating', 'identified', 'monitoring', 'resolved'
  message TEXT NOT NULL,
  
  -- Author
  posted_by UUID, -- References auth.users
  posted_by_name TEXT NOT NULL,
  
  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_incident_updates_incident ON api_incident_updates(incident_id);
CREATE INDEX idx_api_incident_updates_created_at ON api_incident_updates(created_at DESC);
CREATE INDEX idx_api_incident_updates_public ON api_incident_updates(is_public) WHERE is_public = TRUE;

-- =====================================================
-- 6. API UPTIME SUMMARY
-- =====================================================

CREATE TABLE IF NOT EXISTS api_uptime_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Endpoint
  endpoint TEXT NOT NULL,
  
  -- Time period
  period_type TEXT NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Uptime metrics
  uptime_percent DECIMAL(5,2) NOT NULL,
  total_checks INTEGER NOT NULL,
  successful_checks INTEGER NOT NULL,
  failed_checks INTEGER NOT NULL,
  
  -- Performance
  avg_response_time_ms INTEGER,
  min_response_time_ms INTEGER,
  max_response_time_ms INTEGER,
  p50_response_time_ms INTEGER,
  p95_response_time_ms INTEGER,
  p99_response_time_ms INTEGER,
  
  -- Requests
  total_requests INTEGER,
  successful_requests INTEGER,
  failed_requests INTEGER,
  error_rate DECIMAL(5,2),
  
  -- Cost
  total_cost_usd DECIMAL(10,2),
  
  -- Incidents
  incident_count INTEGER DEFAULT 0,
  total_downtime_minutes INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_uptime_summary_endpoint ON api_uptime_summary(endpoint);
CREATE INDEX idx_api_uptime_summary_period ON api_uptime_summary(period_type, period_start DESC);
CREATE INDEX idx_api_uptime_summary_uptime ON api_uptime_summary(uptime_percent);
CREATE UNIQUE INDEX idx_api_uptime_summary_unique ON api_uptime_summary(endpoint, period_type, period_start);

-- =====================================================
-- 7. API MAINTENANCE WINDOWS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_maintenance_windows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Maintenance details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Affected endpoints
  affected_endpoints TEXT[] NOT NULL,
  impact_level TEXT NOT NULL, -- 'full_outage', 'partial_outage', 'degraded_performance', 'no_impact'
  
  -- Schedule
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  
  -- Communication
  public_message TEXT,
  internal_notes TEXT,
  
  -- Notifications
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  
  -- Created by
  created_by UUID, -- References auth.users
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_maintenance_windows_status ON api_maintenance_windows(status);
CREATE INDEX idx_api_maintenance_windows_scheduled ON api_maintenance_windows(scheduled_start DESC);
-- Note: Cannot use NOW() in index predicate as it's not immutable
-- Query upcoming maintenance windows directly: WHERE status = 'scheduled' AND scheduled_start > NOW()

-- =====================================================
-- 8. API ALERT RULES
-- =====================================================

CREATE TABLE IF NOT EXISTS api_alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Rule
  rule_name TEXT NOT NULL,
  description TEXT,
  
  -- Scope
  endpoint TEXT, -- NULL means all endpoints
  
  -- Condition
  metric_type TEXT NOT NULL, -- 'response_time', 'error_rate', 'uptime', 'request_count'
  operator TEXT NOT NULL, -- 'greater_than', 'less_than', 'equals'
  threshold_value DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 5, -- Condition must persist for this long
  
  -- Severity
  severity TEXT NOT NULL, -- 'critical', 'warning', 'info'
  
  -- Actions
  create_incident BOOLEAN DEFAULT FALSE,
  send_email BOOLEAN DEFAULT TRUE,
  send_slack BOOLEAN DEFAULT FALSE,
  
  -- Recipients
  notify_users UUID[],
  notify_emails TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Tracking
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  
  created_by UUID, -- References auth.users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_alert_rules_endpoint ON api_alert_rules(endpoint);
CREATE INDEX idx_api_alert_rules_active ON api_alert_rules(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_api_alert_rules_metric ON api_alert_rules(metric_type);

-- =====================================================
-- 9. API ALERT HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS api_alert_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Alert rule
  alert_rule_id UUID REFERENCES api_alert_rules(id) ON DELETE CASCADE,
  
  -- Trigger details
  endpoint TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  threshold_value DECIMAL(10,2) NOT NULL,
  
  -- Status
  severity TEXT NOT NULL,
  
  -- Incident
  incident_created BOOLEAN DEFAULT FALSE,
  incident_id UUID REFERENCES api_incidents(id),
  
  -- Notifications
  notifications_sent BOOLEAN DEFAULT FALSE,
  notification_details JSONB,
  
  -- Resolution
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  triggered_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_alert_history_rule ON api_alert_history(alert_rule_id);
CREATE INDEX idx_api_alert_history_endpoint ON api_alert_history(endpoint);
CREATE INDEX idx_api_alert_history_triggered_at ON api_alert_history(triggered_at DESC);
CREATE INDEX idx_api_alert_history_unresolved ON api_alert_history(resolved) WHERE resolved = FALSE;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE api_health_metrics IS 'Real-time API health metrics per endpoint';
COMMENT ON TABLE api_incidents IS 'API incidents and outages tracking';
COMMENT ON TABLE api_endpoint_configs IS 'Configuration and thresholds for each API endpoint';
COMMENT ON TABLE api_status_subscriptions IS 'User subscriptions to API status updates';
COMMENT ON TABLE api_incident_updates IS 'Timeline updates for incidents';
COMMENT ON TABLE api_uptime_summary IS 'Aggregated uptime statistics by time period';
COMMENT ON TABLE api_maintenance_windows IS 'Scheduled maintenance windows';
COMMENT ON TABLE api_alert_rules IS 'Configurable alert rules for API monitoring';
COMMENT ON TABLE api_alert_history IS 'History of triggered alerts';
