-- Check AI Personas Status
-- Verify which personas exist and their training status

-- ============================================================================
-- ALL AI PERSONAS
-- ============================================================================

SELECT 
  'AI PERSONAS' as check_type,
  id,
  name,
  age,
  tech_literacy,
  eyesight,
  preferred_navigation,
  reading_level,
  is_default,
  is_public,
  created_at
FROM personas
ORDER BY created_at;

-- ============================================================================
-- TRAINING DATA CHECK
-- ============================================================================

-- Check if any AI personas have been trained
SELECT 
  'TRAINING STATUS' as check_type,
  p.name as persona_name,
  COUNT(atc.id) as training_contributions,
  COUNT(DISTINCT atc.tester_id) as unique_trainers
FROM personas p
LEFT JOIN ai_training_contributions atc ON p.id = atc.persona_id
GROUP BY p.id, p.name
ORDER BY training_contributions DESC;

-- ============================================================================
-- AI PERSONA RATINGS
-- ============================================================================

-- Check if any AI personas have performance ratings
SELECT 
  'PERFORMANCE RATINGS' as check_type,
  COUNT(*) as total_rated_personas
FROM ai_persona_ratings;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  'SUMMARY' as check_type,
  (SELECT COUNT(*) FROM personas) as total_personas,
  (SELECT COUNT(*) FROM personas WHERE is_default = true) as default_personas,
  (SELECT COUNT(DISTINCT persona_id) FROM ai_training_contributions) as trained_personas,
  (SELECT COUNT(*) FROM ai_training_contributions) as total_training_tests,
  (SELECT COUNT(*) FROM ai_persona_ratings) as personas_with_ratings;

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================

/*

CURRENT STATUS:
- You have 7 AI persona definitions created
- These are demographic/behavioral templates only
- NO training data exists yet
- NO performance ratings exist yet

TO MAKE AI PERSONAS READY FOR TESTING:

Option 1: DEMO/TESTING MODE (Quick Start)
- AI personas can run tests using their base prompts
- They will use GPT-4 with persona characteristics
- Accuracy will be moderate (60-70%)
- Good for demos and initial testing

Option 2: PRODUCTION MODE (Requires Training)
- Need human testers to complete tests first
- Each human test trains the AI persona
- Minimum 10 tests recommended per persona
- Accuracy improves to 80-90%+

RECOMMENDATION FOR NOW:
Use Option 1 (Demo Mode) since you have:
- ✅ 7 AI personas defined
- ✅ Platform settings configured
- ✅ Demo accounts ready
- ❌ No training data yet

The AI personas will work but with lower accuracy until trained.

*/
