# Test Request Best Practices

Guide for companies to create effective test requests that yield actionable insights.

---

## 🎯 Essential Information

### **1. Clear Objective**
**What to provide:**
- **Business Objective**: What business problem are you solving?
  - ❌ Bad: "Test our website"
  - ✅ Good: "Reduce cart abandonment rate from 70% to 50%"
  
- **Mission/Task**: What should users accomplish?
  - ❌ Bad: "Use the site"
  - ✅ Good: "Find a product, add to cart, and complete checkout"

- **Success Criteria**: How will you measure success?
  - ❌ Bad: "Find bugs"
  - ✅ Good: "Identify top 5 friction points preventing checkout completion"

---

### **2. Target Audience**
**Why it matters**: Helps match the right testers and personas

**What to specify:**
- **Primary Audience**: Who is your main user?
  - "Seniors 65+ with low tech literacy"
  - "Tech-savvy millennials 25-35"
  - "Small business owners"
  
- **Demographics**:
  - Age range: 25-65
  - Tech literacy: Low, Medium, High
  - Locations: US, UK, Canada
  - Languages: English, Spanish
  
- **User Goals**: What do they want to achieve?
  - "Purchase a product"
  - "Find customer support"
  - "Compare pricing plans"

**Example:**
```json
{
  "primary": "Seniors 65+ shopping for health products",
  "secondary": "Caregivers 40-60 shopping for parents",
  "demographics": {
    "age_range": "40-80",
    "tech_literacy": ["low", "medium"],
    "locations": ["US", "UK"],
    "languages": ["en"]
  },
  "user_goals": [
    "Find vitamin supplements",
    "Read product reviews",
    "Complete purchase with insurance"
  ]
}
```

---

### **3. Application Context**
**Why it matters**: Different app types have different UX expectations

**What to specify:**
- **App Type**: 
  - E-commerce, SaaS, Blog, Portfolio, Documentation, Social Media, etc.
  
- **Industry**: 
  - Retail, Healthcare, Finance, Education, Real Estate, etc.
  
- **App Stage**: 
  - Prototype, Beta, Production, Redesign
  
- **Traffic Volume**: 
  - Low (<1k visitors/month)
  - Medium (1k-10k)
  - High (10k-100k)
  - Very High (100k+)

**Why this helps:**
- E-commerce → Focus on checkout, product discovery
- SaaS → Focus on onboarding, feature discovery
- Healthcare → Focus on accessibility, trust signals
- Finance → Focus on security, clarity

---

## 🔍 Recommended Information

### **4. Critical User Flows**
**What to specify**: The most important journeys users take

**Examples:**
- E-commerce: `["product_search", "add_to_cart", "checkout", "account_creation"]`
- SaaS: `["signup", "onboarding", "first_feature_use", "upgrade"]`
- Blog: `["find_article", "read_content", "subscribe"]`

**Why it helps**: Focuses testing on what matters most to your business

---

### **5. Focus Areas**
**What to specify**: Specific aspects to emphasize

**Common focus areas:**
- `accessibility` - WCAG compliance, screen reader support
- `mobile_responsiveness` - Mobile UX, touch targets
- `checkout_flow` - Cart, payment, confirmation
- `first_time_user_experience` - Onboarding, clarity
- `senior_friendliness` - Large text, simple navigation
- `page_speed` - Loading times, performance
- `trust_signals` - Security, credibility
- `search_functionality` - Search UX, filters
- `form_usability` - Input fields, validation

**Example:**
```json
[
  "accessibility",
  "senior_friendliness",
  "checkout_flow",
  "mobile_responsiveness"
]
```

---

### **6. Known Issues**
**What to specify**: Problems you're already aware of

**Why it helps**: 
- Validates if issues are real
- Measures severity
- Identifies root causes

**Example:**
```json
[
  {
    "issue": "Checkout slow on mobile",
    "priority": "high",
    "context": "Reported by 15% of users"
  },
  {
    "issue": "Navigation confusing for new users",
    "priority": "medium",
    "context": "High bounce rate on homepage"
  }
]
```

---

### **7. Business Goal**
**What to specify**: Primary business objective

**Options:**
- `brand_awareness` - Increase recognition, first impressions
- `conversion` - Drive sales, signups, downloads
- `engagement` - Increase time on site, page views
- `retention` - Reduce churn, increase repeat visits
- `support_efficiency` - Help users self-serve
- `trust_building` - Establish credibility

**Why it helps**: Enables **Dynamic Heuristic Weighting**
- "Conversion" → Checkout speed weighted higher
- "Brand Awareness" → Visual clarity weighted higher
- "Engagement" → Content clarity weighted higher

---

### **8. Device & Browser Requirements**
**What to specify**: Where your users are

**Devices:**
- Desktop, Laptop, Tablet, Mobile

**Browsers:**
- Chrome, Firefox, Safari, Edge

**Screen Sizes:**
- Small (<768px), Medium (768-1024px), Large (1024-1440px), Extra Large (>1440px)

**Example:**
```json
{
  "required_devices": ["desktop", "mobile"],
  "required_browsers": ["chrome", "safari"],
  "screen_sizes": ["small", "medium", "large"]
}
```

---

## 💡 Additional Context (Optional but Valuable)

### **9. Recent Changes**
**What to specify**: What's new since last test

**Examples:**
- "Redesigned checkout flow"
- "Added new payment method"
- "Migrated to new framework"
- "Launched mobile app"

**Why it helps**: Focuses testing on new features

---

### **10. Competitor Benchmarking**
**What to specify**: Competitors to compare against

**Example:**
```json
{
  "competitor_urls": [
    "https://competitor1.com",
    "https://competitor2.com"
  ],
  "benchmark_against": "Industry standard for e-commerce checkout"
}
```

**Why it helps**: Provides context for recommendations

---

### **11. Special Instructions**
**What to specify**: Unique requirements

**Examples:**
- "Test with screen reader enabled"
- "Simulate slow 3G connection"
- "Test with ad blocker enabled"
- "Focus on Spanish language version"
- "Test as returning customer (not first-time)"

---

### **12. Requested Deliverables**
**What to specify**: What outputs you want

**Options:**
- `friction_points` - List of UX issues
- `video_recording` - Screen recording of test
- `heatmap` - Attention heatmap (eye tracking)
- `accessibility_report` - WCAG compliance report
- `competitive_analysis` - Comparison with competitors
- `persona_recommendations` - Suggested persona updates
- `executive_summary` - High-level overview

**Example:**
```json
[
  "friction_points",
  "video_recording",
  "heatmap",
  "accessibility_report",
  "executive_summary"
]
```

---

## 📋 Complete Example

### **E-Commerce Checkout Test**

```json
{
  "title": "Senior-Friendly Checkout Flow Test",
  "url": "https://healthsupplements.com",
  "mission": "Complete a purchase of vitamin supplements",
  
  "business_objective": "Reduce cart abandonment rate from 70% to 50% for senior users",
  "success_criteria": "Identify top 5 friction points preventing checkout completion",
  "business_goal": "conversion",
  
  "target_audience": {
    "primary": "Seniors 65+ with low tech literacy",
    "secondary": "Caregivers 40-60",
    "demographics": {
      "age_range": "40-80",
      "tech_literacy": ["low", "medium"],
      "locations": ["US"],
      "languages": ["en"]
    },
    "user_goals": [
      "Find vitamin supplements",
      "Complete purchase with insurance"
    ]
  },
  
  "app_type": "e-commerce",
  "industry": "healthcare",
  "app_stage": "production",
  "traffic_volume": "medium",
  
  "critical_user_flows": [
    "product_search",
    "add_to_cart",
    "checkout",
    "payment"
  ],
  
  "focus_areas": [
    "accessibility",
    "senior_friendliness",
    "checkout_flow",
    "trust_signals"
  ],
  
  "known_issues": [
    {
      "issue": "Checkout slow on mobile",
      "priority": "high"
    },
    {
      "issue": "Insurance field confusing",
      "priority": "medium"
    }
  ],
  
  "required_devices": ["desktop", "mobile"],
  "required_browsers": ["chrome", "safari"],
  
  "recent_changes": "Added insurance payment option",
  
  "competitor_urls": [
    "https://vitacost.com",
    "https://iherb.com"
  ],
  
  "special_instructions": "Test with screen reader enabled for accessibility validation",
  
  "requested_deliverables": [
    "friction_points",
    "video_recording",
    "accessibility_report",
    "executive_summary"
  ],
  
  "urgency": "high",
  "preferred_completion_date": "2026-01-15"
}
```

---

## ✅ Completeness Checklist

### **Minimum (Required)**
- [ ] Title
- [ ] URL
- [ ] Mission/objective
- [ ] Test type (AI, human, hybrid)

### **Recommended (60% completeness)**
- [ ] Business objective
- [ ] Target audience
- [ ] App type
- [ ] Critical user flows

### **Excellent (80%+ completeness)**
- [ ] Success criteria
- [ ] Business goal
- [ ] Focus areas
- [ ] Known issues
- [ ] Device/browser requirements
- [ ] Requested deliverables

---

## 🎯 Impact of Completeness

### **Poor (<40%)**
- Generic testing
- Mismatched testers
- Vague results
- Low actionability

### **Fair (40-60%)**
- Basic testing
- Some tester matching
- General findings
- Moderate actionability

### **Good (60-80%)**
- Focused testing
- Good tester matching
- Specific findings
- High actionability

### **Excellent (80%+)**
- Highly targeted testing
- Perfect tester matching
- Precise, prioritized findings
- Maximum actionability
- Dynamic heuristic weighting
- Business-goal-aligned insights

---

## 💡 Pro Tips

1. **Be Specific**: "Seniors 65+" is better than "older users"
2. **Prioritize**: List critical flows in order of importance
3. **Provide Context**: Explain why you're testing (recent changes, known issues)
4. **Set Clear Goals**: Define what success looks like
5. **Think User-First**: Focus on user goals, not features
6. **Include Competitors**: Benchmarking provides valuable context
7. **Request What You Need**: Specify deliverables upfront
8. **Update Regularly**: Add learnings from previous tests

---

## 🚫 Common Mistakes

### **Too Vague**
❌ "Test our website for bugs"
✅ "Test checkout flow for seniors to identify friction points preventing purchase completion"

### **No Audience**
❌ "Test for all users"
✅ "Test for seniors 65+ with low tech literacy using desktop"

### **No Business Context**
❌ "Find UX issues"
✅ "Reduce cart abandonment by identifying top 5 checkout friction points"

### **Missing Focus**
❌ "Test everything"
✅ "Focus on accessibility, checkout flow, and trust signals"

---

**The more context you provide, the better insights you'll receive!** 🎯
