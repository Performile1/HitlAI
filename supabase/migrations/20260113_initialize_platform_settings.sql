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

-- Update existing digital twins with random performance data for demo
UPDATE digital_twin_performance
SET 
  accuracy_percent = (RANDOM() * 30 + 70)::NUMERIC(5,2), -- 70-100% accuracy
  confidence_score = (RANDOM() * 0.3 + 0.7)::NUMERIC(3,2), -- 0.70-1.00 confidence
  total_training_tests = FLOOR(RANDOM() * 100 + 20)::INT, -- 20-120 tests
  total_predictions = FLOOR(RANDOM() * 200 + 50)::INT, -- 50-250 predictions
  correct_predictions = FLOOR(RANDOM() * 180 + 40)::INT, -- 40-220 correct
  false_positives = FLOOR(RANDOM() * 20)::INT, -- 0-20 false positives
  false_negatives = FLOOR(RANDOM() * 20)::INT, -- 0-20 false negatives
  last_retrain_date = NOW() - (RANDOM() * INTERVAL '30 days'),
  next_retrain_date = NOW() + (RANDOM() * INTERVAL '30 days'),
  needs_more_data = RANDOM() > 0.7, -- 30% need more data
  recommended_tests_needed = FLOOR(RANDOM() * 50 + 10)::INT, -- 10-60 tests needed
  updated_at = NOW()
WHERE EXISTS (SELECT 1 FROM digital_twin_performance LIMIT 1);
