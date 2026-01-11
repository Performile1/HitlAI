-- Archival Strategy for Database Bloat Prevention
-- Addresses concern: Vector embeddings for every interaction can grow large

-- ============================================================================
-- ARCHIVED DATA TABLES
-- ============================================================================

-- Archived test runs (older than 90 days)
CREATE TABLE IF NOT EXISTS archived_test_runs (
  id UUID PRIMARY KEY,
  original_id UUID NOT NULL,
  test_request_id UUID,
  persona TEXT,
  status TEXT,
  sentiment_score NUMERIC,
  duration_seconds INTEGER,
  total_steps INTEGER,
  current_step_index INTEGER,
  failure_count INTEGER,
  crawl_context TEXT,
  semantic_schema JSONB,
  audit_results JSONB,
  report TEXT,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archived user interactions (older than 90 days)
CREATE TABLE IF NOT EXISTS archived_user_interactions (
  id UUID PRIMARY KEY,
  original_id UUID NOT NULL,
  session_id UUID,
  event_type TEXT,
  timestamp TIMESTAMPTZ,
  x INTEGER,
  y INTEGER,
  target TEXT,
  value TEXT,
  metadata JSONB,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archived friction points (older than 90 days)
CREATE TABLE IF NOT EXISTS archived_friction_points (
  id UUID PRIMARY KEY,
  original_id UUID NOT NULL,
  test_run_id UUID,
  element TEXT,
  issue_type TEXT,
  severity TEXT,
  persona_impact TEXT,
  resolution TEXT,
  guideline_citation TEXT,
  created_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for archived tables
CREATE INDEX idx_archived_test_runs_created ON archived_test_runs(created_at DESC);
CREATE INDEX idx_archived_interactions_session ON archived_user_interactions(session_id);
CREATE INDEX idx_archived_friction_test_run ON archived_friction_points(test_run_id);

-- ============================================================================
-- ARCHIVAL FUNCTIONS
-- ============================================================================

-- Archive old test runs
CREATE OR REPLACE FUNCTION archive_old_test_runs(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Move test runs to archive
  WITH archived AS (
    INSERT INTO archived_test_runs (
      original_id, test_request_id, persona, status, sentiment_score,
      duration_seconds, total_steps, current_step_index, failure_count,
      crawl_context, semantic_schema, audit_results, report,
      created_at, completed_at
    )
    SELECT 
      id, test_request_id, persona, status, sentiment_score,
      duration_seconds, total_steps, current_step_index, failure_count,
      crawl_context, semantic_schema, audit_results, report,
      created_at, completed_at
    FROM test_runs
    WHERE created_at < NOW() - (days_old || ' days')::INTERVAL
    AND status IN ('completed', 'failed', 'cancelled')
    RETURNING original_id
  )
  DELETE FROM test_runs
  WHERE id IN (SELECT original_id FROM archived)
  RETURNING id INTO archived_count;

  RETURN COALESCE(archived_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Archive old user interactions
CREATE OR REPLACE FUNCTION archive_old_interactions(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  WITH archived AS (
    INSERT INTO archived_user_interactions (
      original_id, session_id, event_type, timestamp,
      x, y, target, value, metadata
    )
    SELECT 
      id, session_id, event_type, timestamp,
      x, y, target, value, metadata
    FROM user_interactions
    WHERE timestamp < NOW() - (days_old || ' days')::INTERVAL
    RETURNING original_id
  )
  DELETE FROM user_interactions
  WHERE id IN (SELECT original_id FROM archived)
  RETURNING id INTO archived_count;

  RETURN COALESCE(archived_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Archive old friction points
CREATE OR REPLACE FUNCTION archive_old_friction_points(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  WITH archived AS (
    INSERT INTO archived_friction_points (
      original_id, test_run_id, element, issue_type, severity,
      persona_impact, resolution, guideline_citation, created_at
    )
    SELECT 
      id, test_run_id, element, issue_type, severity,
      persona_impact, resolution, guideline_citation, created_at
    FROM friction_points
    WHERE created_at < NOW() - (days_old || ' days')::INTERVAL
    AND test_run_id IN (
      SELECT id FROM test_runs 
      WHERE status IN ('completed', 'failed', 'cancelled')
    )
    RETURNING original_id
  )
  DELETE FROM friction_points
  WHERE id IN (SELECT original_id FROM archived)
  RETURNING id INTO archived_count;

  RETURN COALESCE(archived_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Master archival function (runs all archival tasks)
CREATE OR REPLACE FUNCTION run_archival_maintenance(days_old INTEGER DEFAULT 90)
RETURNS JSONB AS $$
DECLARE
  test_runs_archived INTEGER;
  interactions_archived INTEGER;
  friction_points_archived INTEGER;
BEGIN
  test_runs_archived := archive_old_test_runs(days_old);
  interactions_archived := archive_old_interactions(days_old);
  friction_points_archived := archive_old_friction_points(days_old);

  RETURN jsonb_build_object(
    'test_runs_archived', test_runs_archived,
    'interactions_archived', interactions_archived,
    'friction_points_archived', friction_points_archived,
    'total_archived', test_runs_archived + interactions_archived + friction_points_archived,
    'archived_at', NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEDULED ARCHIVAL (via pg_cron extension)
-- ============================================================================

-- Note: Requires pg_cron extension
-- Run archival every Sunday at 2 AM
-- SELECT cron.schedule('weekly-archival', '0 2 * * 0', 'SELECT run_archival_maintenance(90)');

-- ============================================================================
-- ARCHIVAL STATISTICS
-- ============================================================================

-- View archival statistics
CREATE OR REPLACE VIEW archival_stats AS
SELECT
  'test_runs' AS table_name,
  COUNT(*) AS active_records,
  (SELECT COUNT(*) FROM archived_test_runs) AS archived_records,
  pg_size_pretty(pg_total_relation_size('test_runs')) AS active_size,
  pg_size_pretty(pg_total_relation_size('archived_test_runs')) AS archived_size
FROM test_runs
UNION ALL
SELECT
  'user_interactions' AS table_name,
  COUNT(*) AS active_records,
  (SELECT COUNT(*) FROM archived_user_interactions) AS archived_records,
  pg_size_pretty(pg_total_relation_size('user_interactions')) AS active_size,
  pg_size_pretty(pg_total_relation_size('archived_user_interactions')) AS archived_size
FROM user_interactions
UNION ALL
SELECT
  'friction_points' AS table_name,
  COUNT(*) AS active_records,
  (SELECT COUNT(*) FROM archived_friction_points) AS archived_records,
  pg_size_pretty(pg_total_relation_size('friction_points')) AS active_size,
  pg_size_pretty(pg_total_relation_size('archived_friction_points')) AS archived_size
FROM friction_points;

-- ============================================================================
-- RESTORE FUNCTIONS (if needed)
-- ============================================================================

-- Restore archived test run
CREATE OR REPLACE FUNCTION restore_test_run(archived_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO test_runs (
    id, test_request_id, persona, status, sentiment_score,
    duration_seconds, total_steps, current_step_index, failure_count,
    crawl_context, semantic_schema, audit_results, report,
    created_at, completed_at
  )
  SELECT 
    original_id, test_request_id, persona, status, sentiment_score,
    duration_seconds, total_steps, current_step_index, failure_count,
    crawl_context, semantic_schema, audit_results, report,
    created_at, completed_at
  FROM archived_test_runs
  WHERE id = archived_id;

  DELETE FROM archived_test_runs WHERE id = archived_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE archived_test_runs IS 'Archived test runs older than 90 days to prevent database bloat';
COMMENT ON TABLE archived_user_interactions IS 'Archived user interactions older than 90 days';
COMMENT ON TABLE archived_friction_points IS 'Archived friction points older than 90 days';
COMMENT ON FUNCTION run_archival_maintenance IS 'Master function to archive old data across all tables';
COMMENT ON VIEW archival_stats IS 'Statistics showing active vs archived data sizes';
