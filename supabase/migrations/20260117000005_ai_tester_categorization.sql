-- Migration: AI Tester Categorization
-- Description: Add support for categorizing testers as human vs AI (third-party vs HitlAI-trained)
-- Created: 2026-01-17

-- =====================================================
-- 1. ADD TESTER CATEGORY ENUM
-- =====================================================

-- Create enum for tester categories
DO $$ BEGIN
  CREATE TYPE tester_category AS ENUM ('human', 'ai_third_party', 'ai_hitl_trained');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for AI model providers
DO $$ BEGIN
  CREATE TYPE ai_model_provider AS ENUM (
    'grok',
    'openai_gpt4',
    'openai_gpt4_turbo',
    'gemini',
    'claude',
    'hitl_finetuned',
    'hitl_selfhosted_mixtral',
    'hitl_selfhosted_llama'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. ALTER HUMAN_TESTERS TABLE
-- =====================================================

-- Add category columns to human_testers table
ALTER TABLE human_testers 
  ADD COLUMN IF NOT EXISTS tester_category tester_category DEFAULT 'human',
  ADD COLUMN IF NOT EXISTS ai_model_provider ai_model_provider,
  ADD COLUMN IF NOT EXISTS ai_model_version TEXT,
  ADD COLUMN IF NOT EXISTS ai_configuration JSONB DEFAULT '{}'::jsonb;

-- Add index for filtering by category
CREATE INDEX IF NOT EXISTS idx_human_testers_category ON human_testers(tester_category);
CREATE INDEX IF NOT EXISTS idx_human_testers_ai_provider ON human_testers(ai_model_provider) WHERE ai_model_provider IS NOT NULL;

-- Add comment
COMMENT ON COLUMN human_testers.tester_category IS 'Type of tester: human, ai_third_party, or ai_hitl_trained';
COMMENT ON COLUMN human_testers.ai_model_provider IS 'AI model provider if tester is AI-based';
COMMENT ON COLUMN human_testers.ai_model_version IS 'Specific version of AI model';
COMMENT ON COLUMN human_testers.ai_configuration IS 'AI-specific configuration (temperature, max_tokens, etc.)';

-- =====================================================
-- 3. AI TESTER PERFORMANCE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_tester_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- AI Tester
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  ai_model_provider ai_model_provider NOT NULL,
  model_version TEXT NOT NULL,
  
  -- Time period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Performance metrics
  total_tests_completed INTEGER DEFAULT 0,
  avg_test_duration_minutes DECIMAL(6,2),
  avg_quality_score DECIMAL(3,2),
  
  -- Quality breakdown
  issues_found INTEGER DEFAULT 0,
  false_positives INTEGER DEFAULT 0,
  false_negatives INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2),
  
  -- Human corrections
  human_corrections_count INTEGER DEFAULT 0,
  correction_rate DECIMAL(5,2),
  
  -- Cost tracking
  total_cost_usd DECIMAL(10,2),
  cost_per_test_usd DECIMAL(8,4),
  tokens_used INTEGER,
  
  -- Comparison to human baseline
  vs_human_speed_ratio DECIMAL(5,2), -- 2.0 means 2x faster than human
  vs_human_quality_ratio DECIMAL(5,2), -- 1.0 means same quality as human
  vs_human_cost_ratio DECIMAL(5,2), -- 0.5 means half the cost of human
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_tester_performance_tester ON ai_tester_performance(tester_id);
CREATE INDEX idx_ai_tester_performance_provider ON ai_tester_performance(ai_model_provider);
CREATE INDEX idx_ai_tester_performance_period ON ai_tester_performance(period_start DESC);

-- =====================================================
-- 4. AI VS HUMAN COMPARISON
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_vs_human_comparison (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Test context
  test_request_id UUID REFERENCES test_requests(id) ON DELETE CASCADE,
  
  -- Human tester results
  human_test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  human_issues_found INTEGER,
  human_test_duration_minutes INTEGER,
  human_quality_score DECIMAL(3,2),
  
  -- AI tester results
  ai_test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  ai_model_provider ai_model_provider NOT NULL,
  ai_issues_found INTEGER,
  ai_test_duration_minutes INTEGER,
  ai_quality_score DECIMAL(3,2),
  ai_cost_usd DECIMAL(8,4),
  
  -- Comparison
  issues_overlap INTEGER, -- Issues found by both
  issues_only_human INTEGER, -- Issues only human found
  issues_only_ai INTEGER, -- Issues only AI found
  
  agreement_rate DECIMAL(5,2), -- How much they agreed
  
  -- Winner
  better_performer TEXT, -- 'human', 'ai', 'tie'
  reasoning TEXT,
  
  -- Validation
  validated_by UUID, -- References auth.users
  validation_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_vs_human_comparison_test ON ai_vs_human_comparison(test_request_id);
CREATE INDEX idx_ai_vs_human_comparison_provider ON ai_vs_human_comparison(ai_model_provider);
CREATE INDEX idx_ai_vs_human_comparison_winner ON ai_vs_human_comparison(better_performer);

-- =====================================================
-- 5. AI TESTER PRICING TIERS
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_tester_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Tester category
  tester_category tester_category NOT NULL,
  ai_model_provider ai_model_provider,
  
  -- Pricing
  base_price_per_test_usd DECIMAL(8,2) NOT NULL,
  price_per_minute_usd DECIMAL(6,4),
  
  -- Cost structure
  platform_fee_percent DECIMAL(5,2) NOT NULL,
  tester_payout_percent DECIMAL(5,2) NOT NULL,
  
  -- Discounts
  volume_discount_threshold INTEGER, -- Tests per month
  volume_discount_percent DECIMAL(5,2),
  
  -- Effective dates
  effective_from TIMESTAMPTZ NOT NULL,
  effective_until TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Notes
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_tester_pricing_category ON ai_tester_pricing(tester_category);
CREATE INDEX idx_ai_tester_pricing_provider ON ai_tester_pricing(ai_model_provider);
CREATE INDEX idx_ai_tester_pricing_active ON ai_tester_pricing(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_ai_tester_pricing_effective ON ai_tester_pricing(effective_from, effective_until);

-- =====================================================
-- 6. AI MODEL CAPABILITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_model_capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Model
  ai_model_provider ai_model_provider NOT NULL,
  model_version TEXT NOT NULL,
  
  -- Capabilities
  supports_web_testing BOOLEAN DEFAULT TRUE,
  supports_mobile_testing BOOLEAN DEFAULT FALSE,
  supports_accessibility BOOLEAN DEFAULT TRUE,
  supports_performance BOOLEAN DEFAULT TRUE,
  supports_security BOOLEAN DEFAULT FALSE,
  
  -- Test types
  supported_test_types TEXT[] NOT NULL,
  
  -- Languages
  supported_languages TEXT[] NOT NULL,
  
  -- Limitations
  max_test_duration_minutes INTEGER,
  max_pages_per_test INTEGER,
  requires_screenshots BOOLEAN DEFAULT TRUE,
  
  -- Performance characteristics
  avg_response_time_seconds DECIMAL(6,2),
  context_window_tokens INTEGER,
  
  -- Quality metrics
  typical_accuracy_rate DECIMAL(5,2),
  typical_false_positive_rate DECIMAL(5,2),
  
  -- Cost
  cost_per_1k_tokens_usd DECIMAL(6,4),
  estimated_tokens_per_test INTEGER,
  
  -- Status
  is_available BOOLEAN DEFAULT TRUE,
  is_recommended BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  description TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_model_capabilities_provider ON ai_model_capabilities(ai_model_provider);
CREATE INDEX idx_ai_model_capabilities_available ON ai_model_capabilities(is_available) WHERE is_available = TRUE;
CREATE INDEX idx_ai_model_capabilities_recommended ON ai_model_capabilities(is_recommended) WHERE is_recommended = TRUE;

-- =====================================================
-- 7. ALTER TEST_RUNS TABLE
-- =====================================================

-- Add AI-specific columns to test_runs
ALTER TABLE test_runs
  ADD COLUMN IF NOT EXISTS tester_category tester_category,
  ADD COLUMN IF NOT EXISTS ai_model_provider ai_model_provider,
  ADD COLUMN IF NOT EXISTS ai_model_version TEXT,
  ADD COLUMN IF NOT EXISTS ai_tokens_used INTEGER,
  ADD COLUMN IF NOT EXISTS ai_cost_usd DECIMAL(8,4),
  ADD COLUMN IF NOT EXISTS ai_inference_time_ms INTEGER;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_test_runs_tester_category ON test_runs(tester_category);
CREATE INDEX IF NOT EXISTS idx_test_runs_ai_provider ON test_runs(ai_model_provider) WHERE ai_model_provider IS NOT NULL;

-- Add comments
COMMENT ON COLUMN test_runs.tester_category IS 'Category of tester that executed this test';
COMMENT ON COLUMN test_runs.ai_model_provider IS 'AI model provider if test was run by AI';
COMMENT ON COLUMN test_runs.ai_tokens_used IS 'Total tokens consumed by AI for this test';
COMMENT ON COLUMN test_runs.ai_cost_usd IS 'Cost of AI inference for this test';

-- =====================================================
-- 8. AI TESTER ASSIGNMENT PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_tester_assignment_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Preferences
  allow_ai_testers BOOLEAN DEFAULT TRUE,
  allow_third_party_ai BOOLEAN DEFAULT TRUE,
  allow_hitl_ai BOOLEAN DEFAULT TRUE,
  
  -- Preferred providers
  preferred_ai_providers ai_model_provider[],
  blocked_ai_providers ai_model_provider[],
  
  -- Quality requirements
  min_ai_quality_score DECIMAL(3,2) DEFAULT 0.70,
  require_human_validation BOOLEAN DEFAULT FALSE,
  
  -- Cost preferences
  max_cost_per_test_usd DECIMAL(8,2),
  prefer_cost_over_speed BOOLEAN DEFAULT FALSE,
  
  -- Test type preferences
  ai_for_test_types TEXT[], -- Which test types to use AI for
  human_only_for_test_types TEXT[], -- Which test types require human
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_ai_tester_assignment_prefs_company ON ai_tester_assignment_preferences(company_id);

-- =====================================================
-- 9. INSERT DEFAULT PRICING
-- =====================================================

-- Human tester pricing (existing baseline)
INSERT INTO ai_tester_pricing (tester_category, base_price_per_test_usd, platform_fee_percent, tester_payout_percent, effective_from)
VALUES 
  ('human', 15.00, 20.00, 80.00, NOW())
ON CONFLICT DO NOTHING;

-- Third-party AI pricing (cheaper, faster)
INSERT INTO ai_tester_pricing (tester_category, ai_model_provider, base_price_per_test_usd, platform_fee_percent, tester_payout_percent, effective_from, description)
VALUES 
  ('ai_third_party', 'openai_gpt4', 5.00, 30.00, 0.00, NOW(), 'OpenAI GPT-4 - High quality, general purpose'),
  ('ai_third_party', 'openai_gpt4_turbo', 3.00, 30.00, 0.00, NOW(), 'OpenAI GPT-4 Turbo - Faster, cost-effective'),
  ('ai_third_party', 'grok', 4.00, 30.00, 0.00, NOW(), 'Grok - Real-time data, creative insights'),
  ('ai_third_party', 'gemini', 4.50, 30.00, 0.00, NOW(), 'Google Gemini - Multimodal capabilities'),
  ('ai_third_party', 'claude', 5.50, 30.00, 0.00, NOW(), 'Anthropic Claude - Safety-focused, detailed analysis')
ON CONFLICT DO NOTHING;

-- HitlAI trained AI pricing (premium, specialized)
INSERT INTO ai_tester_pricing (tester_category, ai_model_provider, base_price_per_test_usd, platform_fee_percent, tester_payout_percent, effective_from, description)
VALUES 
  ('ai_hitl_trained', 'hitl_finetuned', 8.00, 100.00, 0.00, NOW(), 'HitlAI Fine-tuned - Specialized for testing, trained on our data'),
  ('ai_hitl_trained', 'hitl_selfhosted_mixtral', 6.00, 100.00, 0.00, NOW(), 'HitlAI Mixtral - Self-hosted, fast, cost-effective'),
  ('ai_hitl_trained', 'hitl_selfhosted_llama', 6.50, 100.00, 0.00, NOW(), 'HitlAI LLaMA - Self-hosted, high quality')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. INSERT DEFAULT CAPABILITIES
-- =====================================================

-- OpenAI GPT-4
INSERT INTO ai_model_capabilities (
  ai_model_provider, model_version, supported_test_types, supported_languages,
  typical_accuracy_rate, context_window_tokens, cost_per_1k_tokens_usd,
  description, strengths, weaknesses, is_available, is_recommended
)
VALUES (
  'openai_gpt4', 'gpt-4-0125-preview',
  ARRAY['functional', 'usability', 'accessibility', 'content'],
  ARRAY['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'],
  85.00, 128000, 0.03,
  'OpenAI GPT-4 - Industry-leading language model with strong reasoning',
  ARRAY['Excellent reasoning', 'Broad knowledge', 'Multilingual'],
  ARRAY['Higher cost', 'Slower response time'],
  TRUE, TRUE
)
ON CONFLICT DO NOTHING;

-- Grok
INSERT INTO ai_model_capabilities (
  ai_model_provider, model_version, supported_test_types, supported_languages,
  typical_accuracy_rate, context_window_tokens, cost_per_1k_tokens_usd,
  description, strengths, weaknesses, is_available
)
VALUES (
  'grok', 'grok-1',
  ARRAY['functional', 'usability', 'content'],
  ARRAY['en'],
  80.00, 8192, 0.02,
  'Grok - Real-time data access and creative insights',
  ARRAY['Real-time data', 'Creative analysis', 'Fast'],
  ARRAY['Limited language support', 'Less formal'],
  TRUE
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE ai_tester_performance IS 'Performance tracking for AI testers vs human baseline';
COMMENT ON TABLE ai_vs_human_comparison IS 'Direct comparison of AI vs human test results';
COMMENT ON TABLE ai_tester_pricing IS 'Pricing tiers for different tester categories';
COMMENT ON TABLE ai_model_capabilities IS 'Capabilities and characteristics of each AI model';
COMMENT ON TABLE ai_tester_assignment_preferences IS 'Company preferences for AI tester assignment';
