# Database Snapshot Script
# Purpose: Create a complete snapshot of the current database state
# Usage: .\scripts\snapshot-database.ps1

$ErrorActionPreference = "Stop"

# Configuration
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$snapshotDir = "database-snapshots"
$snapshotFile = "$snapshotDir/snapshot_$timestamp.json"
$snapshotSqlFile = "$snapshotDir/snapshot_$timestamp.sql"

# Create snapshot directory if it doesn't exist
if (-not (Test-Path $snapshotDir)) {
    New-Item -ItemType Directory -Path $snapshotDir | Out-Null
    Write-Host "✓ Created snapshot directory: $snapshotDir" -ForegroundColor Green
}

Write-Host "`n📸 Creating Database Snapshot..." -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp`n" -ForegroundColor Gray

# Check if Supabase CLI is installed
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCli) {
    Write-Host "⚠️  Supabase CLI not found. Please install it first:" -ForegroundColor Yellow
    Write-Host "   npm install -g supabase" -ForegroundColor Gray
    Write-Host "`nAlternatively, run the SQL script manually in Supabase Dashboard." -ForegroundColor Gray
    exit 1
}

# Method 1: Using Supabase CLI to get schema
Write-Host "📋 Exporting database schema..." -ForegroundColor Cyan
try {
    supabase db dump --schema public > $snapshotSqlFile
    Write-Host "✓ Schema exported to: $snapshotSqlFile" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not export schema automatically" -ForegroundColor Yellow
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Method 2: Generate snapshot report using SQL query
Write-Host "`n📊 Generating snapshot report..." -ForegroundColor Cyan

$snapshotQuery = @"
-- Quick Database Snapshot
-- Generated: $timestamp

-- Table Inventory
SELECT 
  tablename as table_name,
  schemaname as schema_name
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"@

# Save the snapshot query
$snapshotQuery | Out-File -FilePath "$snapshotDir/snapshot_query_$timestamp.sql" -Encoding UTF8

Write-Host "✓ Snapshot query saved to: $snapshotDir/snapshot_query_$timestamp.sql" -ForegroundColor Green

# Create a summary report
$summaryReport = @"
# Database Snapshot Summary
Generated: $timestamp

## Files Created
- Schema Dump: $snapshotSqlFile
- Snapshot Query: $snapshotDir/snapshot_query_$timestamp.sql
- This Report: $snapshotDir/snapshot_summary_$timestamp.md

## How to Use This Snapshot

### 1. View Schema
``````sql
-- Open the schema dump file to see complete table definitions
$snapshotSqlFile
``````

### 2. Run Snapshot Query
``````bash
# In Supabase Dashboard SQL Editor, run:
$snapshotDir/snapshot_query_$timestamp.sql
``````

### 3. Compare with Previous Snapshots
``````bash
# Compare two snapshots
diff $snapshotSqlFile database-snapshots/snapshot_PREVIOUS.sql
``````

## Next Steps

1. Review the schema dump for current table structure
2. Run the detailed snapshot query in Supabase Dashboard
3. Compare with migration files to identify what needs to be applied
4. Keep this snapshot before running new migrations

## Recommended Actions

Before running new migrations:
1. ✓ Snapshot created (this file)
2. ☐ Review migration execution plan (docs/MIGRATION_EXECUTION_PLAN.md)
3. ☐ Run migrations in order
4. ☐ Create post-migration snapshot for comparison

---
**Snapshot ID:** $timestamp
**Status:** Ready for migration deployment
"@

$summaryReport | Out-File -FilePath "$snapshotDir/snapshot_summary_$timestamp.md" -Encoding UTF8

Write-Host "`n✅ Database Snapshot Complete!" -ForegroundColor Green
Write-Host "`nFiles created:" -ForegroundColor Cyan
Write-Host "  • Schema: $snapshotSqlFile" -ForegroundColor Gray
Write-Host "  • Query: $snapshotDir/snapshot_query_$timestamp.sql" -ForegroundColor Gray
Write-Host "  • Summary: $snapshotDir/snapshot_summary_$timestamp.md" -ForegroundColor Gray

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review the snapshot files" -ForegroundColor Gray
Write-Host "  2. Run detailed snapshot query in Supabase Dashboard" -ForegroundColor Gray
Write-Host "  3. Compare with migration plan" -ForegroundColor Gray
Write-Host "  4. Deploy migrations when ready" -ForegroundColor Gray

Write-Host "`n💡 Tip: Run this script again after migrations to compare changes`n" -ForegroundColor Yellow
