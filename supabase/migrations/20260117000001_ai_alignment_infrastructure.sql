-- Migration: AI Alignment Infrastructure
-- Description: Tables for RLHF, Constitutional AI, Red Teaming, and AGI Governance
-- Created: 2026-01-17

-- =====================================================
-- 1. AI ALIGNMENT METRICS
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_alignment_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_version TEXT NOT NULL,
  alignment_score DECIMAL(3,2) CHECK (alignment_score >= 0 AND alignment_score <= 1),
  safety_violations INTEGER DEFAULT 0,
  human_override_count INTEGER DEFAULT 0,
  hallucination_rate DECIMAL(5,4),
  bias_score DECIMAL(3,2),
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Detailed metrics
  metrics JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alignment_metrics_version ON ai_alignment_metrics(model_version);
CREATE INDEX idx_alignment_metrics_measured_at ON ai_alignment_metrics(measured_at DESC);

-- =====================================================
-- 2. HUMAN CORRECTIONS (RLHF)
-- =====================================================

CREATE TABLE IF NOT EXISTS human_corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Test context
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE SET NULL,
  
  -- AI output
  ai_finding TEXT NOT NULL,
  ai_severity TEXT,
  ai_confidence DECIMAL(3,2),
  
  -- Human correction
  corrected_finding TEXT NOT NULL,
  corrected_severity TEXT,
  correction_type TEXT NOT NULL, -- 'false_positive', 'false_negative', 'severity_adjustment', 'wording_improvement'
  correction_reasoning TEXT,
  
  -- Quality
  correction_quality_score INTEGER CHECK (correction_quality_score >= 1 AND correction_quality_score <= 5),
  verified_by UUID, -- References auth.users
  verified_at TIMESTAMPTZ,
  
  -- Training
  used_for_training BOOLEAN DEFAULT FALSE,
  training_batch_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_human_corrections_test_run ON human_corrections(test_run_id);
CREATE INDEX idx_human_corrections_tester ON human_corrections(tester_id);
CREATE INDEX idx_human_corrections_type ON human_corrections(correction_type);
CREATE INDEX idx_human_corrections_training ON human_corrections(used_for_training) WHERE used_for_training = TRUE;

-- =====================================================
-- 3. CONSTITUTIONAL RULES (Dynamic Rulebase)
-- =====================================================

CREATE TABLE IF NOT EXISTS constitutional_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Rule hierarchy
  rule_level TEXT NOT NULL, -- 'universal', 'platform', 'company', 'tester'
  priority INTEGER NOT NULL DEFAULT 100,
  
  -- Scope
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  platform TEXT, -- 'web', 'mobile', 'desktop', etc.
  
  -- Rule definition
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'safety', 'quality', 'content', 'behavior'
  
  -- Implementation
  rule_condition JSONB NOT NULL, -- Condition to check
  rule_action TEXT NOT NULL, -- 'block', 'warn', 'flag', 'require_human_review'
  enforcement_level TEXT NOT NULL DEFAULT 'strict', -- 'strict', 'moderate', 'advisory'
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID, -- References auth.users
  approved_by UUID, -- References auth.users
  
  -- Metadata
  violation_count INTEGER DEFAULT 0,
  last_violation_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_constitutional_rules_level ON constitutional_rules(rule_level);
CREATE INDEX idx_constitutional_rules_company ON constitutional_rules(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_constitutional_rules_active ON constitutional_rules(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_constitutional_rules_priority ON constitutional_rules(priority DESC);

-- =====================================================
-- 4. CONSTITUTIONAL RULE VIOLATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS constitutional_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Context
  rule_id UUID REFERENCES constitutional_rules(id) ON DELETE CASCADE,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  
  -- Violation details
  violation_type TEXT NOT NULL,
  violation_severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  violation_description TEXT NOT NULL,
  
  -- AI context
  ai_output TEXT,
  ai_confidence DECIMAL(3,2),
  
  -- Resolution
  action_taken TEXT NOT NULL, -- 'blocked', 'flagged', 'human_review_required'
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID, -- References auth.users
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_constitutional_violations_rule ON constitutional_violations(rule_id);
CREATE INDEX idx_constitutional_violations_test ON constitutional_violations(test_run_id);
CREATE INDEX idx_constitutional_violations_severity ON constitutional_violations(violation_severity);
CREATE INDEX idx_constitutional_violations_unresolved ON constitutional_violations(resolved) WHERE resolved = FALSE;

-- =====================================================
-- 5. RED TEAM TESTS
-- =====================================================

CREATE TABLE IF NOT EXISTS red_team_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Test definition
  test_name TEXT NOT NULL,
  test_category TEXT NOT NULL, -- 'prompt_injection', 'jailbreak', 'hallucination', 'bias', 'privacy', 'dos'
  attack_vector TEXT NOT NULL,
  test_description TEXT NOT NULL,
  
  -- Test execution
  model_version TEXT NOT NULL,
  test_input JSONB NOT NULL,
  expected_behavior TEXT NOT NULL,
  
  -- Results
  test_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'passed', 'failed', 'error'
  actual_output TEXT,
  vulnerability_found BOOLEAN DEFAULT FALSE,
  severity TEXT, -- 'critical', 'high', 'medium', 'low'
  
  -- Metadata
  executed_by UUID, -- References auth.users
  executed_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_red_team_tests_category ON red_team_tests(test_category);
CREATE INDEX idx_red_team_tests_status ON red_team_tests(test_status);
CREATE INDEX idx_red_team_tests_vulnerability ON red_team_tests(vulnerability_found) WHERE vulnerability_found = TRUE;
CREATE INDEX idx_red_team_tests_model ON red_team_tests(model_version);

-- =====================================================
-- 6. RED TEAM VULNERABILITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS red_team_vulnerabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Vulnerability details
  test_id UUID REFERENCES red_team_tests(id) ON DELETE CASCADE,
  vulnerability_type TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Impact
  impact_description TEXT NOT NULL,
  affected_models TEXT[] NOT NULL,
  reproducibility TEXT NOT NULL, -- 'always', 'sometimes', 'rare'
  
  -- Remediation
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'fixed', 'wont_fix'
  remediation_plan TEXT,
  fixed_in_version TEXT,
  fixed_by UUID, -- References auth.users
  fixed_at TIMESTAMPTZ,
  
  -- Tracking
  reported_by UUID, -- References auth.users
  assigned_to UUID, -- References auth.users
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_red_team_vulnerabilities_test ON red_team_vulnerabilities(test_id);
CREATE INDEX idx_red_team_vulnerabilities_severity ON red_team_vulnerabilities(severity);
CREATE INDEX idx_red_team_vulnerabilities_status ON red_team_vulnerabilities(status);
CREATE INDEX idx_red_team_vulnerabilities_open ON red_team_vulnerabilities(status) WHERE status = 'open';

-- =====================================================
-- 7. AI INFERENCE LOGS (Complete Logging)
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_inference_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Context
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  model_provider TEXT NOT NULL, -- 'openai', 'anthropic', 'self_hosted'
  
  -- Input
  input_prompt TEXT NOT NULL,
  input_tokens INTEGER,
  input_context JSONB,
  
  -- Output
  output_text TEXT NOT NULL,
  output_tokens INTEGER,
  confidence_score DECIMAL(3,2),
  
  -- Performance
  latency_ms INTEGER NOT NULL,
  cost_usd DECIMAL(10,6),
  
  -- Quality flags
  flagged_for_review BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  human_reviewed BOOLEAN DEFAULT FALSE,
  human_rating INTEGER CHECK (human_rating >= 1 AND human_rating <= 5),
  
  -- Constitutional check
  constitutional_check_passed BOOLEAN DEFAULT TRUE,
  violated_rules UUID[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_inference_logs_test_run ON ai_inference_logs(test_run_id);
CREATE INDEX idx_ai_inference_logs_model ON ai_inference_logs(model_version);
CREATE INDEX idx_ai_inference_logs_flagged ON ai_inference_logs(flagged_for_review) WHERE flagged_for_review = TRUE;
CREATE INDEX idx_ai_inference_logs_created_at ON ai_inference_logs(created_at DESC);

-- Partition by month for performance
-- ALTER TABLE ai_inference_logs PARTITION BY RANGE (created_at);

-- =====================================================
-- 8. QUALITY GATES (Hallucination & Laziness Detection)
-- =====================================================

CREATE TABLE IF NOT EXISTS quality_gate_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Context
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  inference_log_id UUID REFERENCES ai_inference_logs(id) ON DELETE CASCADE,
  
  -- Check type
  gate_type TEXT NOT NULL, -- 'hallucination', 'laziness', 'completeness', 'specificity'
  
  -- Results
  passed BOOLEAN NOT NULL,
  confidence DECIMAL(3,2),
  score DECIMAL(5,2), -- 0-100
  
  -- Details
  issues_found TEXT[],
  evidence JSONB,
  reasoning TEXT,
  
  -- Action taken
  action TEXT NOT NULL, -- 'approved', 'flagged', 'rejected', 'human_review_required'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quality_gate_checks_test_run ON quality_gate_checks(test_run_id);
CREATE INDEX idx_quality_gate_checks_type ON quality_gate_checks(gate_type);
CREATE INDEX idx_quality_gate_checks_failed ON quality_gate_checks(passed) WHERE passed = FALSE;

-- =====================================================
-- 9. BIAS DETECTION RESULTS
-- =====================================================

CREATE TABLE IF NOT EXISTS bias_detection_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Context
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  
  -- Bias categories
  demographic_bias_score DECIMAL(3,2),
  platform_bias_score DECIMAL(3,2),
  language_bias_score DECIMAL(3,2),
  temporal_bias_score DECIMAL(3,2),
  
  -- Overall
  overall_bias_score DECIMAL(3,2) NOT NULL,
  bias_detected BOOLEAN DEFAULT FALSE,
  
  -- Details
  bias_categories TEXT[],
  bias_evidence JSONB,
  affected_groups TEXT[],
  
  -- Mitigation
  mitigation_applied BOOLEAN DEFAULT FALSE,
  mitigation_strategy TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bias_detection_test_run ON bias_detection_results(test_run_id);
CREATE INDEX idx_bias_detection_model ON bias_detection_results(model_version);
CREATE INDEX idx_bias_detection_detected ON bias_detection_results(bias_detected) WHERE bias_detected = TRUE;

-- =====================================================
-- 10. AGI CAPABILITY MILESTONES
-- =====================================================

CREATE TABLE IF NOT EXISTS agi_capability_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Capability
  capability_name TEXT NOT NULL,
  capability_level INTEGER NOT NULL CHECK (capability_level >= 1 AND capability_level <= 5), -- 1=Narrow AI, 5=AGI
  capability_description TEXT NOT NULL,
  
  -- Assessment
  demonstrated BOOLEAN DEFAULT FALSE,
  validated_by UUID, -- References auth.users
  validation_date TIMESTAMPTZ,
  validation_evidence TEXT,
  
  -- Safety
  safety_audit_passed BOOLEAN DEFAULT FALSE,
  alignment_verified BOOLEAN DEFAULT FALSE,
  red_team_passed BOOLEAN DEFAULT FALSE,
  
  -- Governance
  approved_for_deployment BOOLEAN DEFAULT FALSE,
  approved_by UUID, -- References auth.users
  approval_date TIMESTAMPTZ,
  
  -- Monitoring
  monitoring_requirements JSONB,
  rollback_procedure TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agi_milestones_level ON agi_capability_milestones(capability_level);
CREATE INDEX idx_agi_milestones_demonstrated ON agi_capability_milestones(demonstrated);
CREATE INDEX idx_agi_milestones_approved ON agi_capability_milestones(approved_for_deployment);

-- =====================================================
-- 11. AGI SAFETY DECISIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS agi_safety_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Decision context
  decision_type TEXT NOT NULL, -- 'capability_approval', 'deployment', 'rollback', 'emergency_shutdown'
  capability_milestone_id UUID REFERENCES agi_capability_milestones(id),
  
  -- Decision
  decision TEXT NOT NULL, -- 'approved', 'rejected', 'conditional'
  reasoning TEXT NOT NULL,
  conditions JSONB,
  
  -- Board members (safety board)
  decided_by UUID[] NOT NULL,
  unanimous BOOLEAN NOT NULL,
  vote_breakdown JSONB,
  
  -- Follow-up
  requires_review_in_days INTEGER,
  next_review_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agi_safety_decisions_type ON agi_safety_decisions(decision_type);
CREATE INDEX idx_agi_safety_decisions_milestone ON agi_safety_decisions(capability_milestone_id);
CREATE INDEX idx_agi_safety_decisions_review ON agi_safety_decisions(next_review_date) WHERE next_review_date IS NOT NULL;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE ai_alignment_metrics IS 'Tracks alignment scores and safety metrics for AI models';
COMMENT ON TABLE human_corrections IS 'RLHF data - human corrections of AI outputs for training';
COMMENT ON TABLE constitutional_rules IS 'Dynamic rulebase for Constitutional AI - 4-level hierarchy';
COMMENT ON TABLE constitutional_violations IS 'Tracks violations of constitutional rules';
COMMENT ON TABLE red_team_tests IS 'Adversarial testing of AI models for security vulnerabilities';
COMMENT ON TABLE red_team_vulnerabilities IS 'Discovered vulnerabilities from red team testing';
COMMENT ON TABLE ai_inference_logs IS 'Complete logging of all AI inferences for audit and training';
COMMENT ON TABLE quality_gate_checks IS 'Hallucination and laziness detection results';
COMMENT ON TABLE bias_detection_results IS 'Bias detection across demographics, platforms, languages';
COMMENT ON TABLE agi_capability_milestones IS 'Tracks progress toward AGI capabilities';
COMMENT ON TABLE agi_safety_decisions IS 'AGI safety board decisions and governance';
