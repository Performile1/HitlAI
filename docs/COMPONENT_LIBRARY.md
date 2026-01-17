# HitlAI - Component Library Documentation

**Version:** 1.0  
**Last Updated:** January 16, 2026  
**Total Components:** 18

---

## Table of Contents

1. [Custom Components](#custom-components)
2. [UI Components (shadcn/ui)](#ui-components-shadcnui)
3. [Component Patterns](#component-patterns)
4. [Styling Guidelines](#styling-guidelines)

---

## Custom Components

### 1. ProgressBanner
**File:** `components/ProgressBanner.tsx`

**Purpose:** Display progress toward next phase unlock

**Props:** None (fetches data internally)

**Usage:**
```tsx
import ProgressBanner from '@/components/ProgressBanner'
<ProgressBanner />
```

**Features:**
- Fetches milestone data from `/api/milestones`
- Shows progress bar with percentage
- Displays tests remaining and estimated days
- Animated gradient background
- Responsive design

---

### 2. PhaseProgressCard
**File:** `components/PhaseProgressCard.tsx`

**Purpose:** Display all 4 phases with milestone progress

**Props:** None (fetches data internally)

**Usage:**
```tsx
import PhaseProgressCard from '@/components/PhaseProgressCard'
<PhaseProgressCard />
```

**Features:**
- Shows all 4 phases in timeline
- Individual milestone progress per phase
- Unlock status indicators
- Benefits list for each phase
- Cost reduction visualization

---

### 3. EarlyAdopterCard
**File:** `components/EarlyAdopterCard.tsx`

**Purpose:** Display early adopter program tiers with spots remaining

**Props:**
```typescript
interface EarlyAdopterCardProps {
  type: 'company' | 'tester'
}
```

**Usage:**
```tsx
import EarlyAdopterCard from '@/components/EarlyAdopterCard'
<EarlyAdopterCard type="company" />
<EarlyAdopterCard type="tester" />
```

**Features:**
- Fetches live spots remaining
- Tier comparison cards
- Benefits breakdown
- Apply now CTA
- Responsive grid layout

---

### 4. MarketingHeader
**File:** `components/MarketingHeader.tsx`

**Purpose:** Navigation header for marketing pages

**Features:**
- Logo with link to homepage
- Desktop navigation menu
- Programs dropdown (Early Adopter, Founding Tester)
- Mobile hamburger menu
- Login buttons (Company, Tester)
- Sticky header on scroll

**Navigation Links:**
- Features, Pricing, Programs, Demo, About
- Auth buttons for Company and Tester login

---

### 5. Footer
**File:** `components/Footer.tsx`

**Purpose:** Site-wide footer

**Features:**
- Company info and logo
- Link columns (Product, Company, Resources, Legal)
- Social media links
- Newsletter signup
- Copyright notice

---

### 6. HybridSlider
**File:** `components/HybridSlider.tsx`

**Purpose:** Interactive slider showing AI vs Human test mix

**Props:**
```typescript
interface HybridSliderProps {
  aiPercentage: number
  onAiPercentageChange: (value: number) => void
}
```

**Usage:**
```tsx
const [aiPercentage, setAiPercentage] = useState(70)
<HybridSlider 
  aiPercentage={aiPercentage}
  onAiPercentageChange={setAiPercentage}
/>
```

---

### 7. NotificationBell
**File:** `components/NotificationBell.tsx`

**Purpose:** Display notifications with badge count

**Features:**
- Notification count badge
- Dropdown menu with notifications
- Mark as read functionality
- Real-time updates

---

### 8. ScreenshotMarkup
**File:** `components/ScreenshotMarkup.tsx`

**Purpose:** Annotate screenshots with markup tools

**Features:**
- Drawing tools (arrow, rectangle, circle, text)
- Color picker
- Undo/redo
- Save annotations

---

### 9. SocialShare
**File:** `components/SocialShare.tsx`

**Purpose:** Share content on social media

**Props:**
```typescript
interface SocialShareProps {
  url: string
  title: string
  description?: string
}
```

**Features:**
- Share to Twitter, Facebook, LinkedIn
- Copy link to clipboard
- Email share

---

### 10. AppUpload
**File:** `components/AppUpload.tsx`

**Purpose:** Upload mobile app files for testing

**Features:**
- Drag and drop upload
- File type validation (.apk, .ipa)
- Upload progress
- File preview

---

### 11. TestScenarioBuilder
**File:** `components/test-scenario-builder.tsx`

**Purpose:** Build custom test scenarios

**Features:**
- Step-by-step builder
- Condition branching
- Expected outcomes
- Export to JSON

---

## UI Components (shadcn/ui)

### Button
**File:** `components/ui/button.tsx`

**Variants:**
- `default` - Primary button
- `destructive` - Danger/delete actions
- `outline` - Secondary button
- `ghost` - Minimal button
- `link` - Link-styled button

**Sizes:** `default`, `sm`, `lg`, `icon`

**Usage:**
```tsx
import { Button } from '@/components/ui/button'
<Button variant="default" size="lg">Click me</Button>
```

---

### Card
**File:** `components/ui/card.tsx`

**Components:**
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title
- `CardDescription` - Description
- `CardContent` - Main content
- `CardFooter` - Footer section

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

### Input
**File:** `components/ui/input.tsx`

**Usage:**
```tsx
import { Input } from '@/components/ui/input'
<Input type="email" placeholder="Email" />
```

---

### Label
**File:** `components/ui/label.tsx`

**Usage:**
```tsx
import { Label } from '@/components/ui/label'
<Label htmlFor="email">Email</Label>
```

---

### Textarea
**File:** `components/ui/textarea.tsx`

**Usage:**
```tsx
import { Textarea } from '@/components/ui/textarea'
<Textarea placeholder="Enter text" rows={4} />
```

---

### Slider
**File:** `components/ui/slider.tsx`

**Usage:**
```tsx
import { Slider } from '@/components/ui/slider'
<Slider defaultValue={[50]} max={100} step={1} />
```

---

### Switch
**File:** `components/ui/switch.tsx`

**Usage:**
```tsx
import { Switch } from '@/components/ui/switch'
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

---

## Component Patterns

### Data Fetching Pattern
```tsx
'use client'
import { useEffect, useState } from 'react'

export default function Component() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/endpoint')
        const json = await response.json()
        setData(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return <div>{/* Render data */}</div>
}
```

### Form Handling Pattern
```tsx
const [formData, setFormData] = useState({})
const [errors, setErrors] = useState({})

const handleSubmit = async (e) => {
  e.preventDefault()
  // Validate
  // Submit
  // Handle response
}

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value })
}
```

### Real-time Subscription Pattern
```tsx
useEffect(() => {
  const subscription = supabase
    .channel('updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'test_runs',
      filter: `id=eq.${testId}`
    }, (payload) => {
      setData(payload.new)
    })
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [testId])
```

---

## Styling Guidelines

### Tailwind Classes
- Use utility-first approach
- Prefer Tailwind classes over custom CSS
- Use `@apply` sparingly

### Color Palette
- Primary: `blue-600`
- Secondary: `green-600`
- Accent: `purple-600`
- Danger: `red-600`
- Success: `green-500`
- Warning: `yellow-500`

### Spacing
- Use consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64px)
- Gap between sections: `mb-8` or `mb-12`
- Padding inside cards: `p-6`

### Typography
- Headings: `font-bold` with gradient backgrounds
- Body: `text-slate-700`
- Muted: `text-slate-500`
- Font sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`

### Animations
- Hover effects: `hover:scale-105 transition-transform`
- Fade in: `animate-fade-in-up`
- Loading: `animate-pulse`

---

**End of Component Library Documentation**
