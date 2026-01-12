# HitlAI Database Schema Reference

**Last Updated:** 2026-01-12  
**Purpose:** Quick reference for all table names and relationships to prevent migration errors

---

## Core Tables

### Companies & Users

| Table Name | Description | Key Columns |
|------------|-------------|-------------|
| `companies` | Company accounts | `id`, `name`, `slug`, `plan_type` |
| `company_members` | Users belonging to companies | `company_id`, `user_id`, `role` |
| `human_testers` | Human tester profiles | `id`, `user_id`, `display_name` |

**Important:** 
- ❌ `company_profiles` does NOT exist
- ✅ Use `company_members` for user roles
- ❌ `tester_profiles` does NOT exist  
- ✅ Use `human_testers` for tester data

---

## Testing Tables

| Table Name | Description | References |
|------------|-------------|------------|
| `test_requests` | Company test requests | `company_id` → `companies(id)` |
| `test_runs` | AI test executions | `test_request_id` → `test_requests(id)` |
| `human_test_assignments` | Human tester assignments | `test_request_id`, `tester_id` → `human_testers(id)` |
| `test_result_comparisons` | AI vs Human comparisons | `test_request_id` → `test_requests(id)` |

---

## Admin Control Tables (New)

| Table Name | Description | References |
|------------|-------------|------------|
| `platform_settings` | Global platform configuration | `updated_by` → `auth.users(id)` |
| `hitlai_funded_tests` | Platform-funded tests | `test_request_id` → `test_requests(id)` |
| `tester_equity` | Equity compensation for testers | `tester_id` → `human_testers(id)` |
| `digital_twin_performance` | AI model performance metrics | None |

---

## Personas & Learning

| Table Name | Description | References |
|------------|-------------|------------|
| `personas` | AI-generated user personas | None |
| `persona_from_tester` | Personas learned from testers | `tester_id` → `human_testers(id)` |
| `human_insights` | Learning data from human tests | `persona_id` → `personas(id)` |
| `tester_annotations` | Tester feedback annotations | `tester_id` → `human_testers(id)` |

---

## Security & Monitoring

| Table Name | Description | References |
|------------|-------------|------------|
| `api_rate_limits` | Rate limiting tracking | `user_id` → `auth.users(id)` |
| `security_events` | Security audit log | `user_id` → `auth.users(id)` |
| `company_credits` | Company credit balances | `company_id` → `companies(id)` |

---

## Common Migration Errors & Fixes

### ❌ Error: `relation "company_profiles" does not exist`
**Fix:** Use `company_members` instead
```sql
-- Wrong
SELECT 1 FROM company_profiles WHERE user_id = auth.uid()

-- Correct
SELECT 1 FROM company_members WHERE user_id = auth.uid()
```

### ❌ Error: `relation "tester_profiles" does not exist`
**Fix:** Use `human_testers` instead
```sql
-- Wrong
tester_id UUID REFERENCES tester_profiles(id)

-- Correct
tester_id UUID REFERENCES human_testers(id)
```

---

## Admin Role Checking Pattern

**Correct way to check if user is admin:**
```sql
CREATE POLICY admin_only_policy ON some_table
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Foreign Key Reference Patterns

### Company References
```sql
company_id UUID REFERENCES companies(id) ON DELETE CASCADE
```

### User References
```sql
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
created_by UUID REFERENCES auth.users(id)
```

### Tester References
```sql
tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE
```

### Test Request References
```sql
test_request_id UUID REFERENCES test_requests(id) ON DELETE CASCADE
```

---

## Migration Checklist

Before running a new migration:

- [ ] Check all table names match this reference
- [ ] Verify foreign key references use correct table names
- [ ] Test RLS policies reference correct tables
- [ ] Confirm `company_members` (not `company_profiles`) for roles
- [ ] Confirm `human_testers` (not `tester_profiles`) for testers
- [ ] Run migration in development first
- [ ] Check for `relation does not exist` errors

---

## Quick Table Lookup

**Need to reference a company?** → `companies`  
**Need to check user role?** → `company_members`  
**Need tester data?** → `human_testers`  
**Need test request?** → `test_requests`  
**Need AI test run?** → `test_runs`  
**Need human assignment?** → `human_test_assignments`

---

## Migration Files Location

All migrations are in: `supabase/migrations/`

**Key migrations:**
- `20260108_initial_schema.sql` - Base schema
- `20260109_platform_infrastructure.sql` - Companies, testers, test requests
- `20260109_enhanced_persona_recording.sql` - Persona learning
- `20260111_gemini_enhancements.sql` - Credits, insights
- `20260112_admin_controls.sql` - Admin settings, equity, digital twins

---

## Need to Add a New Table?

1. Create migration file: `supabase/migrations/YYYYMMDD_description.sql`
2. Add table to this reference document
3. Update foreign key patterns if needed
4. Test migration locally first
5. Commit and push

---

**Questions?** Check existing migrations in `supabase/migrations/` for examples.
