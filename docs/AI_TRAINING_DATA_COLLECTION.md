# AI Training Data Collection Service

## Overview
Complete RLHF (Reinforcement Learning from Human Feedback) system for collecting human corrections, tracking AI alignment metrics, and improving model performance through continuous feedback loops.

## Components Created

### 1. **HumanFeedbackForm** (`components/training/HumanFeedbackForm.tsx`)
**Purpose:** Collect human feedback on AI test results

**Features:**
- Binary rating system (Helpful / Not Helpful)
- Issue type categorization (7 types)
- Detailed correction text input
- Feedback quality scoring
- Success confirmation
- Error handling
- Loading states

**Issue Types:**
1. **Incorrect Finding** - AI identified wrong issues
2. **Missed Issue** - AI failed to catch real problems
3. **Wrong Priority** - AI misjudged severity/importance
4. **Poor Recommendation** - AI suggested unhelpful solutions
5. **Hallucination** - AI made up information
6. **Bias** - AI showed unfair or biased analysis
7. **Other** - General issues

**Usage:**
```tsx
import HumanFeedbackForm from '@/components/training/HumanFeedbackForm'

<HumanFeedbackForm 
  testRunId="uuid"
  aiResponse={{
    findings: ["Issue 1", "Issue 2"],
    recommendations: ["Fix A", "Fix B"],
    sentiment: "positive"
  }}
  onSubmitSuccess={() => console.log('Feedback submitted')}
/>
```

**Props:**
- `testRunId` - UUID of the test run being reviewed
- `aiResponse` - AI's original analysis
- `onSubmitSuccess` - Optional callback after successful submission

---

### 2. **TrainingDataAnalytics** (`components/admin/TrainingDataAnalytics.tsx`)
**Purpose:** Admin dashboard for monitoring training data quality

**Features:**
- Statistics overview (total, helpful rate, alignment score, hallucination rate)
- Common issues breakdown with percentages
- Recent corrections timeline
- Training progress visualization
- Quality score tracking
- Auto-refresh capability

**Metrics Displayed:**
- **Total Feedback** - Number of training samples collected
- **Helpful Rate** - Percentage of positive feedback
- **Alignment Score** - Overall AI alignment (0-100%)
- **Hallucination Rate** - Frequency of made-up information
- **Top Issue Types** - Most common problems reported
- **Recent Corrections** - Latest 10 feedback submissions

**Usage:**
```tsx
import TrainingDataAnalytics from '@/components/admin/TrainingDataAnalytics'

<TrainingDataAnalytics />
```

---

## Pages

### **Training Data Admin Page** (`app/admin/training/page.tsx`)
**Route:** `/admin/training`

**Features:**
- Server-side authentication check
- Displays TrainingDataAnalytics component
- Admin-only access

**Access:** Requires authenticated admin user

---

## API Endpoints

### **POST /api/training/feedback**
**Purpose:** Submit human feedback on AI performance

**Request Body:**
```json
{
  "testRunId": "uuid",
  "rating": "not_helpful",
  "correctionText": "The AI missed the critical security vulnerability in the login form...",
  "issueType": "missed_issue",
  "aiResponse": {
    "findings": ["UI looks good", "Navigation works"],
    "recommendations": ["Add more colors"],
    "sentiment": "positive"
  }
}
```

**Response:**
```json
{
  "success": true,
  "correction": {
    "id": "uuid",
    "created_at": "2026-01-19T16:00:00Z"
  }
}
```

**Validation:**
- Test run must exist
- Rating is required
- Correction text required if rating is "not_helpful"
- Issue type optional but recommended

**Side Effects:**
1. Saves correction to `human_corrections` table
2. Updates `ai_alignment_metrics` with alignment score
3. Tracks hallucination rate if issue type is "hallucination"
4. Calculates feedback quality score

**Feedback Quality Score Calculation:**
- Base: 50 points
- Helpful rating: +20 points
- Correction text length:
  - >100 chars: +20 points
  - >50 chars: +10 points
  - >20 chars: +5 points
- Issue type specified: +10 points
- Max: 100 points

---

### **GET /api/training/stats**
**Purpose:** Fetch training data analytics and metrics

**Response:**
```json
{
  "stats": {
    "total_corrections": 150,
    "helpful_count": 120,
    "not_helpful_count": 30,
    "avg_alignment_score": 0.85,
    "hallucination_rate": 0.03,
    "top_issue_types": [
      { "type": "missed_issue", "count": 12 },
      { "type": "incorrect_finding", "count": 8 },
      { "type": "poor_recommendation", "count": 5 }
    ],
    "recent_corrections": [
      {
        "id": "uuid",
        "test_run_id": "uuid",
        "correction_type": "missed_issue",
        "is_helpful": false,
        "feedback_quality_score": 85,
        "created_at": "2026-01-19T16:00:00Z"
      }
    ]
  }
}
```

**Calculations:**
- **Helpful Rate** = (helpful_count / total_corrections) × 100
- **Avg Alignment Score** = Average of all alignment_score values
- **Hallucination Rate** = Average of hallucination_rate metrics
- **Top Issue Types** = Most frequent correction types (top 5)

---

## Database Tables Used

### `human_corrections`
**Purpose:** Store human feedback and corrections

**Key Fields:**
- `test_run_id` - Reference to test run
- `original_output` - AI's original response (JSON)
- `corrected_output` - Human's correction (JSON)
- `correction_type` - Type of issue
- `is_helpful` - Boolean rating
- `corrected_by` - User who provided feedback
- `feedback_quality_score` - Quality rating (0-100)

### `ai_alignment_metrics`
**Purpose:** Track AI alignment over time

**Key Fields:**
- `model_version` - AI model identifier
- `alignment_score` - Alignment metric (0-1)
- `safety_violations` - Count of safety issues
- `human_override_count` - Times humans corrected AI
- `hallucination_rate` - Frequency of hallucinations (0-1)
- `bias_score` - Bias detection metric (0-1)
- `measured_at` - Timestamp

---

## RLHF Workflow

### **1. AI Generates Response**
```
Test Run → AI Analysis → Findings + Recommendations
```

### **2. Human Reviews**
```
Human Tester → Reviews AI Output → Provides Feedback
```

### **3. Feedback Collection**
```
HumanFeedbackForm → API → Database → Metrics Update
```

### **4. Training Data Creation**
```
Corrections → Training Dataset → Model Fine-tuning
```

### **5. Continuous Improvement**
```
Updated Model → Better Predictions → Higher Alignment
```

---

## Integration Points

### **Test Results Page**
Add feedback form after test results:
```tsx
import HumanFeedbackForm from '@/components/training/HumanFeedbackForm'

// In test results component
{testRun.status === 'completed' && (
  <HumanFeedbackForm 
    testRunId={testRun.id}
    aiResponse={{
      findings: testRun.friction_points,
      recommendations: testRun.recommendations,
      sentiment: testRun.sentiment_score
    }}
  />
)}
```

### **Admin Navigation**
Add link to training analytics:
```tsx
<Link href="/admin/training">
  <Brain className="h-4 w-4" />
  Training Data
</Link>
```

---

## Metrics & KPIs

### **Quality Metrics**
- **Alignment Score** - How well AI matches human judgment (target: >85%)
- **Helpful Rate** - Percentage of helpful AI responses (target: >80%)
- **Hallucination Rate** - Frequency of made-up info (target: <5%)
- **Feedback Quality** - Average quality score (target: >70)

### **Volume Metrics**
- **Total Corrections** - Number of training samples
- **Daily Feedback** - Corrections per day
- **Coverage** - Percentage of tests with feedback
- **Response Time** - Time to provide feedback

### **Issue Tracking**
- **Top Issues** - Most common problems
- **Issue Trends** - Changes over time
- **Resolution Rate** - Issues fixed in next version
- **Recurrence** - Same issues appearing repeatedly

---

## Best Practices

### **For Human Reviewers:**
1. **Be Specific** - Provide detailed corrections
2. **Be Constructive** - Explain what AI should have said
3. **Be Consistent** - Use similar standards across reviews
4. **Be Timely** - Provide feedback soon after test completion
5. **Be Thorough** - Review all aspects of AI output

### **For Administrators:**
1. **Monitor Trends** - Watch for patterns in feedback
2. **Act on Data** - Use insights to improve prompts/models
3. **Reward Quality** - Incentivize detailed feedback
4. **Track Progress** - Measure improvement over time
5. **Close Loop** - Share improvements with reviewers

---

## Data Privacy & Security

### **PII Handling**
- No personal information in corrections
- Anonymize sensitive test data
- Secure storage of feedback

### **Access Control**
- Only authenticated users can submit feedback
- Admin-only access to analytics
- Audit trail for all corrections

### **Data Retention**
- Keep corrections indefinitely for training
- Archive old metrics after 1 year
- Backup training data regularly

---

## Training Pipeline

### **Phase 1: Collection** (Current)
- Collect human feedback via UI
- Store corrections in database
- Track alignment metrics

### **Phase 2: Preparation** (Next)
- Export corrections to training format
- Clean and validate data
- Create train/test splits

### **Phase 3: Fine-tuning** (Future)
- Fine-tune model on corrections
- Validate on held-out test set
- Deploy improved model

### **Phase 4: Evaluation** (Future)
- A/B test old vs new model
- Measure improvement in metrics
- Roll out if successful

---

## Export Training Data

### **SQL Query for Export:**
```sql
SELECT 
  hc.test_run_id,
  hc.original_output,
  hc.corrected_output,
  hc.correction_type,
  hc.is_helpful,
  hc.feedback_quality_score,
  tr.url,
  tr.mission,
  tr.persona_id
FROM human_corrections hc
JOIN test_runs tr ON hc.test_run_id = tr.id
WHERE hc.feedback_quality_score >= 70
  AND hc.created_at >= NOW() - INTERVAL '30 days'
ORDER BY hc.created_at DESC;
```

### **Export Format (JSONL):**
```jsonl
{"prompt": "Test this login page", "completion": "Found 3 critical issues...", "metadata": {"quality": 85}}
{"prompt": "Review checkout flow", "completion": "UX is smooth but...", "metadata": {"quality": 90}}
```

---

## Future Enhancements

1. **Active Learning**
   - Prioritize uncertain predictions for review
   - Request feedback on edge cases
   - Smart sampling of test runs

2. **Automated Quality Checks**
   - Detect low-quality feedback
   - Flag inconsistent corrections
   - Suggest improvements

3. **Feedback Incentives**
   - Gamification (points, badges)
   - Leaderboards for reviewers
   - Rewards for high-quality feedback

4. **Real-time Training**
   - Continuous model updates
   - Online learning from feedback
   - Instant improvement deployment

5. **Multi-model Comparison**
   - Compare different AI models
   - Track performance by model version
   - A/B test model improvements

6. **Collaborative Review**
   - Multiple reviewers per test
   - Consensus building
   - Dispute resolution

7. **Advanced Analytics**
   - Prediction confidence tracking
   - Error pattern analysis
   - Reviewer agreement metrics

---

## Testing Checklist

- [ ] Feedback form displays correctly
- [ ] Rating selection works
- [ ] Issue type selection works
- [ ] Correction text validation works
- [ ] Form submission succeeds
- [ ] Success state displays
- [ ] Error handling works
- [ ] Analytics dashboard loads
- [ ] Stats calculate correctly
- [ ] Recent corrections display
- [ ] Issue breakdown shows properly
- [ ] Mobile responsive design

---

## Status
✅ **Complete** - Core RLHF system ready for deployment

## Next Steps
1. Deploy to production
2. Train team on feedback process
3. Set feedback quality targets
4. Monitor alignment metrics
5. Export first training dataset
6. Plan model fine-tuning
7. Implement automated quality checks
