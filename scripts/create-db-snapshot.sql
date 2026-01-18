-- Database Snapshot Script
-- Created: 2026-01-18
-- Purpose: Export current database schema and structure for backup/comparison

-- =====================================================
-- 1. LIST ALL TABLES
-- =====================================================

SELECT 
  'TABLE INVENTORY' as section,
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 2. TABLE DETAILS WITH ROW COUNTS
-- =====================================================

SELECT 
  'TABLE DETAILS' as section,
  table_name,
  (xpath('/row/cnt/text()', 
    query_to_xml(format('select count(*) as cnt from %I.%I', 
    table_schema, table_name), false, true, '')))[1]::text::int as row_count
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 3. COLUMN DETAILS
-- =====================================================

SELECT 
  'COLUMN DETAILS' as section,
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 4. CONSTRAINTS
-- =====================================================

SELECT 
  'CONSTRAINTS' as section,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- =====================================================
-- 5. INDEXES
-- =====================================================

SELECT 
  'INDEXES' as section,
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 6. ENUMS
-- =====================================================

SELECT 
  'ENUMS' as section,
  t.typname as enum_name,
  e.enumlabel as enum_value,
  e.enumsortorder
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- =====================================================
-- 7. FUNCTIONS
-- =====================================================

SELECT 
  'FUNCTIONS' as section,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

SELECT 
  'TRIGGERS' as section,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 9. VIEWS
-- =====================================================

SELECT 
  'VIEWS' as section,
  table_name as view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 10. RLS POLICIES
-- =====================================================

SELECT 
  'RLS POLICIES' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 11. MIGRATION HISTORY (if exists)
-- =====================================================

-- Check if supabase_migrations table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'supabase_migrations' 
    AND table_name = 'schema_migrations'
  ) THEN
    RAISE NOTICE 'Migration history available';
  END IF;
END $$;

-- =====================================================
-- SUMMARY STATISTICS
-- =====================================================

SELECT 
  'SUMMARY' as section,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as total_columns,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'public') as total_constraints,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(DISTINCT typname) FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public') as total_enums,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_functions,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_rls_policies;
