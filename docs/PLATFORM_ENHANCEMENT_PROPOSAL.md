# Platform & Device Enhancement Proposal

## Current State
The `test_runs` table has a simple `platform` enum:
```sql
CREATE TYPE platform_type AS ENUM ('web', 'mobile');
```

## Problem
This is too generic. We can't track:
- Browser differences (Chrome vs Firefox vs Safari)
- Mobile OS (iOS vs Android)
- Device types (iPhone 15 vs Samsung Galaxy)
- Console platforms (PlayStation, Xbox, Nintendo Switch)

## Proposed Solution

### Option 1: Expand Enum (Simple but Limited)
```sql
ALTER TYPE platform_type ADD VALUE 'console';
ALTER TYPE platform_type ADD VALUE 'desktop';
ALTER TYPE platform_type ADD VALUE 'tablet';
```

Add new columns:
```sql
ALTER TABLE test_runs ADD COLUMN browser TEXT;
ALTER TABLE test_runs ADD COLUMN device_model TEXT;
ALTER TABLE test_runs ADD COLUMN os_version TEXT;
```

**Pros:** Simple migration, backward compatible
**Cons:** Not very structured, hard to query

### Option 2: Structured Platform Data (Recommended)
Replace the enum with a JSONB column for flexibility:

```sql
-- Migration
ALTER TABLE test_runs ADD COLUMN platform_details JSONB;

-- Update existing data
UPDATE test_runs 
SET platform_details = jsonb_build_object(
  'type', platform::text,
  'browser', null,
  'os', null,
  'device', null
);

-- Eventually drop old column (after migration)
-- ALTER TABLE test_runs DROP COLUMN platform;
```

**Example platform_details:**
```json
// Web Desktop
{
  "type": "web",
  "browser": "chrome",
  "browserVersion": "120.0",
  "os": "windows",
  "osVersion": "11",
  "screenSize": "1920x1080"
}

// Mobile
{
  "type": "mobile",
  "os": "ios",
  "osVersion": "17.2",
  "device": "iPhone 15 Pro",
  "screenSize": "393x852",
  "browser": "safari"
}

// Console
{
  "type": "console",
  "platform": "playstation",
  "model": "PS5",
  "firmwareVersion": "8.00"
}

// VR
{
  "type": "vr",
  "platform": "meta_quest",
  "model": "Quest 3"
}
```

**Pros:** 
- Flexible - can add new fields without migrations
- Structured - easy to query with JSONB operators
- Future-proof - supports any platform type

**Cons:** 
- Requires migration of existing data
- Slightly more complex queries

### Option 3: Separate Platform Table (Most Structured)
```sql
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('web', 'mobile', 'console', 'vr', 'desktop')),
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  device_model TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE test_runs ADD COLUMN platform_id UUID REFERENCES platforms(id);
```

**Pros:** 
- Most structured
- Easy to reuse platform configs
- Best for analytics

**Cons:** 
- More complex
- Requires joins for queries

## Recommendation

**Use Option 2 (JSONB)** for now because:
1. Flexible enough for any platform type
2. No complex joins needed
3. Easy to migrate existing data
4. Can always normalize to Option 3 later if needed

## Implementation Plan

### Phase 1: Add platform_details column (Non-breaking)
```sql
-- Add new column
ALTER TABLE test_runs ADD COLUMN platform_details JSONB;

-- Create index for queries
CREATE INDEX idx_test_runs_platform_details ON test_runs USING GIN (platform_details);

-- Migrate existing data
UPDATE test_runs 
SET platform_details = jsonb_build_object('type', platform::text)
WHERE platform_details IS NULL;
```

### Phase 2: Update application code
- Update test creation forms to capture platform details
- Update AI test executor to detect/specify platform
- Update analytics to use platform_details

### Phase 3: Deprecate old column (Breaking)
```sql
-- After all code updated
ALTER TABLE test_runs DROP COLUMN platform;
```

## Platform Detection Examples

### Web
```typescript
const platformDetails = {
  type: 'web',
  browser: navigator.userAgent.includes('Chrome') ? 'chrome' : 'firefox',
  browserVersion: navigator.appVersion,
  os: navigator.platform,
  screenSize: `${window.screen.width}x${window.screen.height}`
}
```

### Mobile (from test request)
```typescript
const platformDetails = {
  type: 'mobile',
  os: 'ios', // or 'android'
  osVersion: '17.2',
  device: 'iPhone 15 Pro',
  screenSize: '393x852'
}
```

### Console (manual specification)
```typescript
const platformDetails = {
  type: 'console',
  platform: 'playstation',
  model: 'PS5'
}
```

## Benefits

1. **Better Bug Tracking**: "This bug only happens on Safari iOS 16"
2. **Platform-Specific Personas**: Test with "Chrome user on Windows" vs "Safari user on Mac"
3. **Analytics**: "Most issues found on mobile Android devices"
4. **Training Data**: AI learns platform-specific patterns
5. **Future-Proof**: Can add VR, AR, smartwatch, etc.

## Migration Timeline

- **Week 1**: Add platform_details column, migrate data
- **Week 2**: Update UI to capture platform details
- **Week 3**: Update AI executor to use platform details
- **Week 4**: Update analytics and reports
- **Week 5**: Deprecate old platform column

## Questions to Consider

1. Should we auto-detect browser/OS or let users specify?
2. Do we need a predefined list of platforms or allow free-form?
3. Should console emulation be a separate feature or part of platform selection?
4. How do we handle VR/AR platforms?

## Next Steps

1. Review and approve this proposal
2. Create migration file
3. Update TypeScript types
4. Update UI components
5. Update documentation
