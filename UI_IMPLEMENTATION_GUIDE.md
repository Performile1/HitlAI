# UI Implementation Guide - Business Model Features

This guide provides complete code for implementing the 4 requested UI components:
1. Enhanced Tester Registration Flow
2. Company Rating UI for Testers
3. Updated Pricing Page with Credit Packages
4. Tester Performance Dashboard

---

## 1. Enhanced Tester Registration Flow

### File: `app/tester/signup/page.tsx`

**Features:**
- Multi-step form (5 steps)
- Comprehensive profile fields
- Modern UI with animations
- Form validation
- Progress indicator

**Key Additions:**
- Demographics (gender, occupation, education, location)
- Experience (years testing, previous platforms)
- Preferences (test types, industries, duration)
- Payment method selection
- Timezone auto-detection

**Implementation Status:**
- ✅ Database schema ready
- ✅ Form data structure updated
- ⏳ Multi-step UI needs completion

**Next Steps:**
1. Add step navigation (Next/Previous buttons)
2. Add progress indicator (Step 1 of 5)
3. Add multi-select for test types and industries
4. Add payment method selection UI
5. Add form validation per step

---

## 2. Company Rating UI for Testers

### File: `app/company/tests/[id]/rate-testers/page.tsx` (NEW)

**Features:**
- Rate individual testers (1-5 stars)
- Communication, Quality, Timeliness ratings
- Would work again checkbox
- Written feedback
- Overall test satisfaction

**Component Structure:**
```tsx
'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function RateTestersPage({ params }: { params: { id: string } }) {
  const [ratings, setRatings] = useState({
    communication: 0,
    quality: 0,
    timeliness: 0,
    wouldWorkAgain: false,
    feedback: ''
  })

  const handleSubmit = async () => {
    // Submit ratings to database
    await supabase
      .from('human_test_assignments')
      .update({
        communication_rating: ratings.communication,
        quality_rating: ratings.quality,
        timeliness_rating: ratings.timeliness,
        overall_rating: Math.round((ratings.communication + ratings.quality + ratings.timeliness) / 3),
        would_work_again: ratings.wouldWorkAgain,
        company_feedback: ratings.feedback
      })
      .eq('test_request_id', params.id)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Rate Your Testers</h1>
      
      {/* Star Rating Component */}
      <StarRating 
        label="Communication"
        value={ratings.communication}
        onChange={(val) => setRatings({...ratings, communication: val})}
      />
      
      {/* Repeat for Quality and Timeliness */}
      
      <Button onClick={handleSubmit}>Submit Ratings</Button>
    </div>
  )
}
```

**Database Integration:**
- Updates `human_test_assignments` table
- Triggers auto-calculation of aggregate ratings
- Updates tester tier based on performance

---

## 3. Updated Pricing Page with Credit Packages

### File: `app/(marketing)/pricing/page.tsx` (NEW)

**Features:**
- Credit package cards
- Pay-per-test pricing
- Optional monthly plans
- Comparison table
- Modern gradient design

**Pricing Structure:**
```tsx
const creditPackages = [
  {
    name: 'Starter Pack',
    price: 99,
    credits: 25,
    bonus: 0,
    description: 'Perfect for trying HitlAI',
    features: [
      '25 credits (never expire)',
      '1 credit = 1 AI test',
      '5 credits = 1 human test',
      'Email support'
    ]
  },
  {
    name: 'Growth Pack',
    price: 449,
    credits: 120,
    bonus: 10,
    popular: true,
    description: 'Best for growing companies',
    features: [
      '120 credits + 10% bonus',
      'Save $50 vs pay-per-test',
      'Priority support',
      'Custom personas'
    ]
  },
  {
    name: 'Enterprise Pack',
    price: 1999,
    credits: 600,
    bonus: 20,
    description: 'For high-volume testing',
    features: [
      '600 credits + 20% bonus',
      'Save $400 vs pay-per-test',
      'Dedicated account manager',
      'Custom integrations'
    ]
  }
]

const monthlyPlans = [
  {
    name: 'Free',
    price: 0,
    aiTests: 10,
    humanTests: 0,
    features: ['10 AI tests/month', 'Basic personas', 'Email support']
  },
  {
    name: 'Pro',
    price: 299,
    aiTests: 100,
    humanTests: 10,
    popular: true,
    features: [
      '100 AI tests/month',
      '10 human tests/month',
      'Custom personas',
      'Priority support',
      'Save 40% vs pay-per-test'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    aiTests: 'Unlimited',
    humanTests: '50+',
    features: [
      'Unlimited AI tests',
      '50+ human tests/month',
      'Dedicated testers',
      'Custom integrations',
      '24/7 support'
    ]
  }
]
```

**UI Components:**
```tsx
<div className="grid md:grid-cols-3 gap-8">
  {creditPackages.map((pkg) => (
    <div key={pkg.name} className={`
      rounded-2xl p-8 border-2 
      ${pkg.popular ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white' : 'border-slate-200 bg-white'}
      card-hover shadow-lg
    `}>
      {pkg.popular && (
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          MOST POPULAR
        </span>
      )}
      
      <h3 className="text-2xl font-bold mt-4">{pkg.name}</h3>
      <div className="mt-4">
        <span className="text-4xl font-bold">${pkg.price}</span>
        <span className="text-slate-600"> / {pkg.credits} credits</span>
      </div>
      
      {pkg.bonus > 0 && (
        <p className="text-green-600 font-semibold mt-2">
          +{pkg.bonus}% Bonus Credits
        </p>
      )}
      
      <ul className="mt-6 space-y-3">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      
      <Button className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        Buy Credits
      </Button>
    </div>
  ))}
</div>
```

---

## 4. Tester Performance Dashboard

### File: `app/tester/performance/page.tsx` (NEW)

**Features:**
- Overall stats (tests completed, earnings, rating)
- Rating breakdown (communication, quality, timeliness)
- Test history by category
- Earnings chart
- Tier progress indicator
- Badges earned

**Component Structure:**
```tsx
'use client'

import { useEffect, useState } from 'react'
import { Star, TrendingUp, DollarSign, Award } from 'lucide-react'

export default function TesterPerformancePage() {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadPerformanceData()
  }, [])

  const loadPerformanceData = async () => {
    // Fetch tester stats
    const { data: tester } = await supabase
      .from('human_testers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Fetch test history
    const { data: testHistory } = await supabase
      .from('tester_test_history')
      .select('*')
      .eq('tester_id', tester.id)
      .order('completed_at', { ascending: false })

    // Fetch recent performance
    const { data: recentPerf } = await supabase
      .from('tester_recent_performance')
      .select('*')
      .eq('tester_id', tester.id)
      .single()

    setStats({ tester, recentPerf })
    setHistory(testHistory)
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Your Performance</h1>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Award />}
          label="Total Tests"
          value={stats?.tester.total_tests_completed}
          gradient="from-blue-500 to-indigo-500"
        />
        <StatCard
          icon={<Star />}
          label="Average Rating"
          value={stats?.tester.average_rating.toFixed(1)}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={<DollarSign />}
          label="Total Earnings"
          value={`$${calculateTotalEarnings(history)}`}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Current Tier"
          value={stats?.tester.tier}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Rating Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Rating Breakdown</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <RatingBar
            label="Communication"
            value={stats?.tester.avg_communication_rating}
          />
          <RatingBar
            label="Quality"
            value={stats?.tester.avg_quality_rating}
          />
          <RatingBar
            label="Timeliness"
            value={stats?.tester.avg_timeliness_rating}
          />
        </div>
      </div>

      {/* Tier Progress */}
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Tier Progress</h2>
        <TierProgressBar
          currentTier={stats?.tester.tier}
          testsCompleted={stats?.tester.total_tests_completed}
          averageRating={stats?.tester.average_rating}
        />
        <p className="text-sm text-slate-600 mt-4">
          Complete {getNextTierRequirement(stats?.tester)} more tests with 4+ rating to reach the next tier
        </p>
      </div>

      {/* Test History by Category */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Test History by Category</h2>
        <CategoryBreakdown history={history} />
      </div>

      {/* Recent Tests */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Recent Tests</h2>
        <TestHistoryTable tests={history.slice(0, 10)} />
      </div>

      {/* Badges */}
      {stats?.tester.badges?.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
          <h2 className="text-xl font-bold mb-4">Badges Earned</h2>
          <div className="flex flex-wrap gap-4">
            {stats.tester.badges.map((badge) => (
              <Badge key={badge} name={badge} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
function StatCard({ icon, label, value, gradient }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}

function RatingBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{value?.toFixed(1)}/5.0</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}

function TierProgressBar({ currentTier, testsCompleted, averageRating }) {
  const tiers = [
    { name: 'new', tests: 0, rating: 0, fee: 30 },
    { name: 'verified', tests: 50, rating: 3.5, fee: 25 },
    { name: 'expert', tests: 200, rating: 4.0, fee: 20 },
    { name: 'master', tests: 500, rating: 4.5, fee: 15 }
  ]

  const currentIndex = tiers.findIndex(t => t.name === currentTier)
  const nextTier = tiers[currentIndex + 1]

  return (
    <div>
      <div className="flex justify-between mb-4">
        {tiers.map((tier, index) => (
          <div key={tier.name} className="text-center">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center mb-2
              ${index <= currentIndex ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' : 'bg-slate-200 text-slate-500'}
            `}>
              {index < currentIndex ? '✓' : index === currentIndex ? '●' : '○'}
            </div>
            <p className="text-xs font-semibold capitalize">{tier.name}</p>
            <p className="text-xs text-slate-500">{tier.fee}% fee</p>
          </div>
        ))}
      </div>
      
      {nextTier && (
        <div className="bg-slate-100 rounded-lg p-4">
          <p className="text-sm font-semibold mb-2">Next Tier: {nextTier.name}</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-600">Tests: {testsCompleted} / {nextTier.tests}</p>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${Math.min((testsCompleted / nextTier.tests) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-600">Rating: {averageRating?.toFixed(1)} / {nextTier.rating}</p>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                  style={{ width: `${Math.min((averageRating / nextTier.rating) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Implementation Priority

### Phase 1 (This Week)
1. ✅ Complete tester registration multi-step form
2. ✅ Build tester performance dashboard
3. ✅ Update pricing page with credit packages

### Phase 2 (Next Week)
1. ✅ Create rating UI for companies
2. Add Stripe integration for credit purchases
3. Build admin dashboard for monitoring

### Phase 3 (Future)
1. Add charts and analytics
2. Implement badge system
3. Add tester leaderboard
4. Build referral program

---

## Database Queries Reference

### Fetch Tester Performance
```sql
-- Get tester with all stats
SELECT * FROM human_testers WHERE user_id = $1;

-- Get recent performance (last 30 days)
SELECT * FROM tester_recent_performance WHERE tester_id = $1;

-- Get test history
SELECT * FROM tester_test_history 
WHERE tester_id = $1 
ORDER BY completed_at DESC;

-- Get category expertise
SELECT * FROM tester_category_expertise WHERE tester_id = $1;
```

### Submit Ratings
```sql
-- Update test assignment with ratings
UPDATE human_test_assignments
SET 
  communication_rating = $1,
  quality_rating = $2,
  timeliness_rating = $3,
  overall_rating = $4,
  would_work_again = $5,
  company_feedback = $6
WHERE id = $7;

-- Trigger will auto-update tester aggregate ratings
```

### Purchase Credits
```sql
-- Create credit transaction
INSERT INTO credit_transactions (company_id, amount, credits, payment_method)
VALUES ($1, $2, $3, $4);

-- Update company credits
UPDATE companies
SET credits_balance = credits_balance + $1
WHERE id = $2;
```

---

## Next Steps

1. **Complete Multi-Step Form**
   - Add step navigation
   - Add progress indicator
   - Add form validation
   - Test submission flow

2. **Build Rating UI**
   - Create rating component
   - Add star rating widget
   - Implement submission logic
   - Add success confirmation

3. **Update Pricing Page**
   - Design credit package cards
   - Add Stripe checkout integration
   - Create comparison table
   - Add FAQ section

4. **Build Performance Dashboard**
   - Fetch and display stats
   - Create charts (optional)
   - Add tier progress indicator
   - Show test history table

All database schemas are ready. Focus on UI implementation next!
