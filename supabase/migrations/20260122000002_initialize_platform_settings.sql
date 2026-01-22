-- Initialize Platform Settings if empty
-- Ensures admin settings page has data to display

-- Check if platform_settings exists and has data, if not create initial record
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
) VALUES (
  gen_random_uuid(),
  70,  -- 70% AI by default
  30,  -- 30% human by default
  true,  -- Allow custom ratio
  5,  -- Min 5 human tests per batch
  15.00,  -- $15 per human test
  5.00,  -- $5 per AI test
  10,  -- 10% platform fee
  true,  -- HitlAI funded enabled
  10000.00,  -- $10k monthly budget
  true,  -- Cash payment enabled
  true,  -- Equity payment enabled
  true,  -- Hybrid payment enabled
  0.001,  -- 0.001 shares per test
  100,  -- Retrain after 100 corrections
  0.85,  -- 85% confidence threshold
  3,  -- Flag after 3 bad ratings
  5,  -- Disable after 5 bad ratings
  3,  -- Flag AI after 3 bad ratings
  5,  -- Disable AI after 5 bad ratings
  10,  -- Need 10 ratings before action
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Ensure at least one record exists (use first record if multiple exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM platform_settings LIMIT 1) THEN
    INSERT INTO platform_settings (
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
      min_ratings_before_action
    ) VALUES (
      70, 30, true, 5, 15.00, 5.00, 10, true, 10000.00,
      true, true, true, 0.001, 100, 0.85, 3, 5, 3, 5, 10
    );
  END IF;
END $$;

-- Initialize budget status if empty
INSERT INTO hitlai_budget_status (
  id,
  monthly_budget,
  current_spend,
  remaining_budget,
  spend_percent,
  reset_date,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  10000.00,
  0.00,
  10000.00,
  0.0,
  DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
