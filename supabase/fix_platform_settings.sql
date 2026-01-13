-- Fix Platform Settings - Remove Duplicates
-- There should only be ONE row in platform_settings table

-- ============================================================================
-- CHECK CURRENT PLATFORM SETTINGS
-- ============================================================================

SELECT 
  'CURRENT PLATFORM SETTINGS' as check_type,
  id,
  default_ai_percentage,
  default_human_percentage,
  human_test_price,
  ai_test_price,
  created_at
FROM platform_settings
ORDER BY created_at;

-- ============================================================================
-- DELETE ALL PLATFORM SETTINGS
-- ============================================================================

DELETE FROM platform_settings;

-- ============================================================================
-- INSERT SINGLE PLATFORM SETTINGS ROW
-- ============================================================================

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
  -- Rating thresholds
  human_tester_flag_threshold,
  human_tester_disable_threshold,
  ai_tester_flag_threshold,
  ai_tester_disable_threshold,
  min_ratings_before_action,
  -- Revenue sharing
  ai_revenue_sharing_enabled,
  ai_revenue_pool_percent,
  trainer_share_per_ai_test,
  min_training_tests_for_share,
  revenue_sharing_terms_version,
  revenue_sharing_terms_updated_at
) VALUES (
  75,           -- default_ai_percentage
  25,           -- default_human_percentage
  true,         -- allow_custom_ratio
  5,            -- min_human_tests_per_batch
  25.00,        -- human_test_price
  5.00,         -- ai_test_price
  30,           -- platform_fee_percent
  true,         -- hitlai_funded_enabled
  5000.00,      -- hitlai_monthly_budget
  true,         -- cash_payment_enabled
  true,         -- equity_payment_enabled
  true,         -- hybrid_payment_enabled
  100,          -- equity_shares_per_test
  50,           -- auto_retrain_threshold
  0.85,         -- confidence_threshold
  -- Rating thresholds
  3.5,          -- human_tester_flag_threshold
  2.5,          -- human_tester_disable_threshold
  0.75,         -- ai_tester_flag_threshold
  0.60,         -- ai_tester_disable_threshold
  5,            -- min_ratings_before_action
  -- Revenue sharing
  true,         -- ai_revenue_sharing_enabled
  50.00,        -- ai_revenue_pool_percent
  10.00,        -- trainer_share_per_ai_test
  10,           -- min_training_tests_for_share
  1,            -- revenue_sharing_terms_version
  NOW()         -- revenue_sharing_terms_updated_at
);

-- ============================================================================
-- VERIFY SINGLE ROW
-- ============================================================================

SELECT 
  'VERIFICATION' as check_type,
  COUNT(*) as total_rows,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ Correct - Only 1 row'
    ELSE '❌ Error - Should have exactly 1 row'
  END as status
FROM platform_settings;

-- ============================================================================
-- SHOW FINAL SETTINGS
-- ============================================================================

SELECT 
  'FINAL PLATFORM SETTINGS' as check_type,
  *
FROM platform_settings;
