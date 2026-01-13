-- Initialize Platform Settings with Default Values
-- This ensures the admin dashboard loads correctly

-- Insert default platform settings if none exist
INSERT INTO platform_settings (
  id,
  default_ai_percentage,
  default_human_percentage,
  allow_custom_ratio,
  min_human_tests_per_batch,
  human_test_price,
  ai_test_price,
  platform_fee_percent,
  hitlai_funded_enabled,
  hitlai_monthly_budget,
  cash_payment_enabled,
  equity_payment_enabled,
  hybrid_payment_enabled,
  equity_shares_per_test,
  auto_retrain_threshold,
  confidence_threshold,
  human_tester_flag_threshold,
  human_tester_disable_threshold,
  ai_tester_flag_threshold,
  ai_tester_disable_threshold,
  min_ratings_before_action,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  70, -- 70% AI by default
  30, -- 30% human by default
  true, -- Allow custom ratio
  5, -- Minimum 5 human tests per batch
  25.00, -- $25 per human test
  5.00, -- $5 per AI test
  20, -- 20% platform fee
  true, -- Enable HitlAI-funded tests
  5000.00, -- $5000 monthly budget
  true, -- Cash payment enabled
  true, -- Equity payment enabled
  true, -- Hybrid payment enabled
  100, -- 100 shares per test
  50, -- Retrain after 50 new tests
  0.75, -- 75% confidence threshold
  3.5, -- Flag human testers below 3.5/5.0
  2.5, -- Auto-disable human testers below 2.5/5.0
  0.75, -- Flag AI testers below 0.75 accuracy
  0.60, -- Auto-disable AI testers below 0.60 accuracy
  5, -- Minimum 5 ratings before action
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM platform_settings LIMIT 1);

-- Note: hitlai_budget_status is a VIEW that automatically calculates from platform_settings
-- No need to insert data - it's derived from the platform_settings table above

-- Create some sample digital twins for demo purposes
INSERT INTO digital_twin_performance (
  id,
  persona_id,
  persona_name,
  total_tests,
  successful_tests,
  failed_tests,
  accuracy_percent,
  confidence_score,
  avg_test_duration_seconds,
  last_trained_at,
  training_data_count,
  status,
  needs_more_data,
  recommended_tests_needed,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  ap.id,
  ap.name,
  FLOOR(RANDOM() * 100 + 20)::INT, -- 20-120 total tests
  FLOOR(RANDOM() * 80 + 15)::INT, -- 15-95 successful
  FLOOR(RANDOM() * 20)::INT, -- 0-20 failed
  (RANDOM() * 30 + 70)::NUMERIC(5,2), -- 70-100% accuracy
  (RANDOM() * 0.3 + 0.7)::NUMERIC(3,2), -- 0.70-1.00 confidence
  FLOOR(RANDOM() * 300 + 120)::INT, -- 120-420 seconds
  NOW() - (RANDOM() * INTERVAL '30 days'), -- Last trained within 30 days
  FLOOR(RANDOM() * 200 + 50)::INT, -- 50-250 training samples
  CASE 
    WHEN RANDOM() > 0.8 THEN 'needs_training'
    WHEN RANDOM() > 0.9 THEN 'inactive'
    ELSE 'active'
  END,
  RANDOM() > 0.7, -- 30% need more data
  FLOOR(RANDOM() * 50 + 10)::INT, -- 10-60 tests needed
  NOW() - (RANDOM() * INTERVAL '90 days'),
  NOW()
FROM ai_personas ap
WHERE NOT EXISTS (
  SELECT 1 FROM digital_twin_performance dtp WHERE dtp.persona_id = ap.id
)
LIMIT 10;
