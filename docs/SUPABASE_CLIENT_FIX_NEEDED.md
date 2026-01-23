# Supabase Client Fix Required

## Problem
Multiple pages are using the wrong Supabase client, causing auth session issues.

## Files That Need Fixing

### Login/Signup Pages
- ✅ `app/admin/login/page.tsx` - FIXED
- ❌ `app/tester/login/page.tsx` - Uses wrong client
- ❌ `app/company/login/page.tsx` - Uses wrong client
- ❌ `app/tester/signup/page.tsx` - Uses wrong client
- ❌ `app/company/signup/page.tsx` - Uses wrong client

### Dashboard Pages
- ❌ `app/tester/dashboard/page.tsx` - Uses wrong client
- ❌ `app/company/dashboard/page.tsx` - Uses wrong client

### Other Pages
- ❌ `app/tester/performance/page.tsx` - Uses wrong client
- ❌ `app/tester/tests/[id]/page.tsx` - Uses wrong client
- ❌ `app/company/tests/[id]/page.tsx` - Uses wrong client
- ❌ `app/company/tests/[id]/rate/page.tsx` - Uses wrong client
- ❌ `app/company/tests/new/page.tsx` - Uses wrong client
- ❌ `app/admin/flagged-testers/page.tsx` - Uses wrong client

### API Routes
- ❌ `app/api/ai/suggest-test-paths/route.ts` - Uses wrong client
- ❌ `app/api/admin/applications/[id]/review/route.ts` - Uses wrong client

## Required Change

### Wrong (current):
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Correct (for client components):
```typescript
import { createClient } from '@/lib/supabase/client'

export default function MyPage() {
  const supabase = createClient()
  // ...
}
```

### Correct (for API routes):
```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  // ...
}
```

## Why This Matters
- The SSR client integrates with middleware for session management
- Direct imports bypass cookie handling
- Causes 401 errors and "must be logged in" issues
- Sessions don't persist across pages

## Priority
**HIGH** - This affects all user authentication flows
