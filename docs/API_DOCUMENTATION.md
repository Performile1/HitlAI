# HitlAI - Complete API Documentation

**Version:** 1.0  
**Last Updated:** January 16, 2026  
**Base URL:** `https://hitlai.com/api` (production) or `http://localhost:3000/api` (development)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Test Execution API](#test-execution-api)
3. [Milestone API](#milestone-api)
4. [Early Adopter API](#early-adopter-api)
5. [Founding Tester API](#founding-tester-api)
6. [Training & Fine-Tuning API](#training--fine-tuning-api)
7. [Admin API](#admin-api)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Webhooks](#webhooks)

---

## Authentication

All API requests require authentication via Supabase JWT tokens.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting a Token

```typescript
// Client-side
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

---

## Test Execution API

### POST /api/test/execute

Execute a test run (AI or human).

**Authentication:** Required  
**Rate Limit:** 10 requests/minute

**Request:**
```json
{
  "testRunId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Success):**
```json
{
  "success": true,
  "testRunId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed"
}
```

**Response (Error):**
```json
{
  "error": "Test run not found",
  "code": "NOT_FOUND"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing testRunId)
- `404` - Test run not found
- `500` - Execution failed

**Process Flow:**
1. Validates testRunId
2. Fetches test run from database
3. Updates status to 'running'
4. Executes via HybridTestOrchestrator
5. Captures training data (if completed)
6. Updates milestone progress
7. Returns final status

**Example:**
```typescript
const response = await fetch('/api/test/execute', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    testRunId: '550e8400-e29b-41d4-a716-446655440000'
  })
})

const data = await response.json()
```

---

## Milestone API

### GET /api/milestones

Get current milestone progress and phase status.

**Authentication:** Optional (public data)  
**Rate Limit:** 100 requests/minute

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPhase": "phase1",
    "milestones": [
      {
        "id": "uuid",
        "name": "Total Tests Completed",
        "type": "test_count",
        "current": 4,
        "target": 1000,
        "progress": 0.4,
        "isUnlocked": false,
        "unlockPhase": "phase2"
      },
      {
        "id": "uuid",
        "name": "High Quality Tests (4+ stars)",
        "type": "quality",
        "current": 3,
        "target": 500,
        "progress": 0.6,
        "isUnlocked": false,
        "unlockPhase": "phase2"
      }
    ],
    "nextUnlock": {
      "phase": "phase2",
      "milestoneName": "Total Tests Completed",
      "testsRemaining": 996,
      "estimatedDays": 249,
      "estimatedDate": "2026-09-22T00:00:00Z"
    },
    "phases": {
      "phase1": { "unlocked": true, "unlockedAt": "2026-01-01T00:00:00Z" },
      "phase2": { "unlocked": false, "progress": 0.4 },
      "phase3": { "unlocked": false, "progress": 0.08 },
      "phase4": { "unlocked": false, "progress": 0.04 }
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

### POST /api/milestones

Manually trigger milestone progress update.

**Authentication:** Required (Admin only)  
**Rate Limit:** 10 requests/minute

**Response:**
```json
{
  "success": true,
  "message": "Milestones updated successfully"
}
```

---

## Early Adopter API

### GET /api/early-adopter/apply

Get available spots for each company tier.

**Authentication:** Optional  
**Rate Limit:** 100 requests/minute

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tier": "founding_partner",
      "maxSpots": 10,
      "filledSpots": 0,
      "availableSpots": 10,
      "discount": "25%",
      "benefits": [
        "Lifetime 25% discount",
        "Priority support",
        "Product roadmap input"
      ]
    },
    {
      "tier": "early_adopter",
      "maxSpots": 40,
      "filledSpots": 5,
      "availableSpots": 35,
      "discount": "15%",
      "benefits": [
        "Lifetime 15% discount",
        "Priority support",
        "Early feature access"
      ]
    },
    {
      "tier": "beta_user",
      "maxSpots": 150,
      "filledSpots": 20,
      "availableSpots": 130,
      "discount": "10%",
      "benefits": [
        "First year 10% discount",
        "Beta user badge"
      ]
    }
  ]
}
```

### POST /api/early-adopter/apply

Submit a company application for early adopter program.

**Authentication:** Optional  
**Rate Limit:** 5 requests/hour per IP

**Request:**
```json
{
  "companyName": "Acme Inc",
  "contactName": "John Doe",
  "email": "john@acme.com",
  "phone": "+1-555-0123",
  "website": "https://acme.com",
  "tier": "early_adopter",
  "companySize": "11-50",
  "industry": "SaaS",
  "monthlyTestVolume": "51-100",
  "currentTestingApproach": "Manual testing with QA team",
  "whyInterested": "Looking to scale testing with AI..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "applicationId": "uuid",
  "message": "Application submitted successfully",
  "nextSteps": "We'll review your application within 48 hours"
}
```

**Response (Error - No spots):**
```json
{
  "success": false,
  "error": "No spots available for this tier",
  "code": "NO_SPOTS_AVAILABLE"
}
```

**Validation Rules:**
- `companyName`: Required, 2-100 characters
- `contactName`: Required, 2-100 characters
- `email`: Required, valid email format
- `tier`: Required, one of: `founding_partner`, `early_adopter`, `beta_user`
- `companySize`: Required, one of: `1-10`, `11-50`, `51-200`, `201-500`, `501+`
- `monthlyTestVolume`: Required, one of: `10-50`, `51-100`, `101-500`, `501+`

**Status Codes:**
- `201` - Application created
- `400` - Validation error
- `409` - No spots available
- `429` - Rate limit exceeded
- `500` - Server error

---

## Founding Tester API

### GET /api/founding-tester/apply

Get available spots for each tester tier.

**Authentication:** Optional  
**Rate Limit:** 100 requests/minute

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tier": "founding_tester",
      "maxSpots": 20,
      "filledSpots": 2,
      "availableSpots": 18,
      "revenueShare": "40%",
      "equity": "0.05%",
      "benefits": [
        "40% revenue share per test",
        "0.05% equity with 4-year vesting",
        "Founding Tester badge"
      ]
    },
    {
      "tier": "early_tester",
      "maxSpots": 30,
      "filledSpots": 8,
      "availableSpots": 22,
      "revenueShare": "35%",
      "equity": "0.01%",
      "benefits": [
        "35% revenue share per test",
        "0.01% equity with 4-year vesting"
      ]
    },
    {
      "tier": "beta_tester",
      "maxSpots": 50,
      "filledSpots": 15,
      "availableSpots": 35,
      "revenueShare": "32%",
      "equity": null,
      "benefits": [
        "32% revenue share per test",
        "Beta Tester badge"
      ]
    }
  ]
}
```

### POST /api/founding-tester/apply

Submit a tester application for founding tester program.

**Authentication:** Optional  
**Rate Limit:** 5 requests/hour per IP

**Request:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0456",
  "location": "San Francisco, CA",
  "linkedinUrl": "https://linkedin.com/in/janesmith",
  "portfolioUrl": "https://janesmith.com",
  "tier": "early_tester",
  "yearsOfExperience": "3-5",
  "testingSpecialties": ["UX Testing", "Mobile Apps", "E-commerce"],
  "platforms": ["Web", "iOS", "Android"],
  "availability": "10-20",
  "whyInterested": "Passionate about UX and want to help train AI...",
  "relevantExperience": "5 years of QA testing at tech companies...",
  "sampleWork": "https://github.com/janesmith/test-reports"
}
```

**Response (Success):**
```json
{
  "success": true,
  "applicationId": "uuid",
  "message": "Application submitted successfully",
  "nextSteps": "We'll review your application within 48 hours"
}
```

**Validation Rules:**
- `fullName`: Required, 2-100 characters
- `email`: Required, valid email format
- `tier`: Required, one of: `founding_tester`, `early_tester`, `beta_tester`
- `yearsOfExperience`: Required, one of: `0-1`, `1-3`, `3-5`, `5-10`, `10+`
- `testingSpecialties`: Required, array with at least 1 item
- `platforms`: Required, array with at least 1 item
- `availability`: Required, one of: `5-10`, `10-20`, `20-30`, `30+`

**Status Codes:**
- `201` - Application created
- `400` - Validation error
- `409` - No spots available
- `429` - Rate limit exceeded
- `500` - Server error

---

## Training & Fine-Tuning API

### GET /api/admin/training-data/stats

Get training data statistics.

**Authentication:** Required (Admin only)  
**Rate Limit:** 100 requests/minute

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "total": 150,
      "highQuality": 75,
      "humanVerified": 50,
      "readyForTraining": 50
    },
    "byModelType": {
      "issue_detector": {
        "total": 50,
        "highQuality": 25,
        "humanVerified": 20,
        "readyForTraining": 20
      },
      "strategy_planner": {
        "total": 50,
        "highQuality": 25,
        "humanVerified": 15,
        "readyForTraining": 15
      },
      "sentiment_analyzer": {
        "total": 50,
        "highQuality": 25,
        "humanVerified": 15,
        "readyForTraining": 15
      }
    }
  }
}
```

### POST /api/admin/training/fine-tune

Start a fine-tuning job.

**Authentication:** Required (Admin only)  
**Rate Limit:** 5 requests/day

**Request:**
```json
{
  "modelType": "issue_detector",
  "minQuality": 4,
  "requireHumanVerification": true,
  "baseModel": "gpt-4o-mini-2024-07-18"
}
```

**Response (Success):**
```json
{
  "success": true,
  "jobId": "ftjob-abc123xyz",
  "batchId": "uuid",
  "estimatedCost": 12.50,
  "examplesCount": 50,
  "trainingFileUrl": "/training-data/issue_detector_20260116.jsonl",
  "message": "Fine-tuning job started successfully"
}
```

**Response (Error - Insufficient data):**
```json
{
  "success": false,
  "error": "Insufficient training examples",
  "code": "INSUFFICIENT_DATA",
  "details": {
    "required": 50,
    "available": 20
  }
}
```

**Parameters:**
- `modelType`: Required, one of: `issue_detector`, `strategy_planner`, `sentiment_analyzer`
- `minQuality`: Optional, default: 4 (1-5)
- `requireHumanVerification`: Optional, default: true
- `baseModel`: Optional, default: `gpt-4o-mini-2024-07-18`

**Status Codes:**
- `201` - Job started
- `400` - Validation error
- `409` - Insufficient data
- `429` - Rate limit exceeded
- `500` - Server error

### GET /api/admin/training/status/[jobId]

Check fine-tuning job status.

**Authentication:** Required (Admin only)  
**Rate Limit:** 100 requests/minute

**Response (Training):**
```json
{
  "success": true,
  "data": {
    "jobId": "ftjob-abc123xyz",
    "status": "running",
    "progress": 45,
    "createdAt": "2026-01-16T10:00:00Z",
    "estimatedCompletion": "2026-01-16T10:45:00Z"
  }
}
```

**Response (Succeeded):**
```json
{
  "success": true,
  "data": {
    "jobId": "ftjob-abc123xyz",
    "status": "succeeded",
    "fineTunedModel": "ft:gpt-4o-mini-2024-07-18:hitlai::abc123",
    "trainedTokens": 125000,
    "createdAt": "2026-01-16T10:00:00Z",
    "finishedAt": "2026-01-16T10:45:00Z",
    "canDeploy": true
  }
}
```

**Response (Failed):**
```json
{
  "success": true,
  "data": {
    "jobId": "ftjob-abc123xyz",
    "status": "failed",
    "error": "Training data validation failed",
    "createdAt": "2026-01-16T10:00:00Z",
    "failedAt": "2026-01-16T10:05:00Z"
  }
}
```

**Status Values:**
- `validating_files` - Validating training data
- `queued` - Waiting to start
- `running` - Training in progress
- `succeeded` - Training completed successfully
- `failed` - Training failed
- `cancelled` - Job was cancelled

### POST /api/admin/training/status/[jobId]

Deploy or cancel a fine-tuning job.

**Authentication:** Required (Admin only)  
**Rate Limit:** 10 requests/minute

**Request (Deploy):**
```json
{
  "action": "deploy",
  "modelName": "hitlai-issue-detector-v1",
  "phase": "phase2"
}
```

**Request (Cancel):**
```json
{
  "action": "cancel"
}
```

**Response (Deploy Success):**
```json
{
  "success": true,
  "message": "Model deployed successfully",
  "modelId": "uuid",
  "modelName": "hitlai-issue-detector-v1",
  "fineTunedModelId": "ft:gpt-4o-mini-2024-07-18:hitlai::abc123"
}
```

**Response (Cancel Success):**
```json
{
  "success": true,
  "message": "Job cancelled successfully"
}
```

**Actions:**
- `deploy` - Deploy a succeeded model
- `cancel` - Cancel a running job

**Status Codes:**
- `200` - Action completed
- `400` - Invalid action or job not ready
- `404` - Job not found
- `500` - Server error

---

## Admin API

### GET /api/admin/applications

Get all pending applications.

**Authentication:** Required (Admin only)  
**Rate Limit:** 100 requests/minute

**Response:**
```json
{
  "success": true,
  "data": {
    "earlyAdopter": [
      {
        "id": "uuid",
        "companyName": "Acme Inc",
        "contactName": "John Doe",
        "email": "john@acme.com",
        "tier": "early_adopter",
        "status": "pending",
        "createdAt": "2026-01-16T10:00:00Z"
      }
    ],
    "foundingTester": [
      {
        "id": "uuid",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "tier": "early_tester",
        "status": "pending",
        "createdAt": "2026-01-16T11:00:00Z"
      }
    ]
  }
}
```

### POST /api/admin/applications/[id]/review

Approve or reject an application.

**Authentication:** Required (Admin only)  
**Rate Limit:** 100 requests/minute

**Request (Approve):**
```json
{
  "action": "approve",
  "notes": "Great fit for early adopter program"
}
```

**Request (Reject):**
```json
{
  "action": "reject",
  "reason": "Company size doesn't meet minimum requirements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application approved successfully"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INSUFFICIENT_DATA` | Not enough training data | 409 |
| `NO_SPOTS_AVAILABLE` | Program tier is full | 409 |
| `INTERNAL_ERROR` | Server error | 500 |

---

## Rate Limiting

### Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/test/execute` | 10 requests | 1 minute |
| `/api/milestones` | 100 requests | 1 minute |
| `/api/early-adopter/apply` | 5 requests | 1 hour |
| `/api/founding-tester/apply` | 5 requests | 1 hour |
| `/api/admin/training/fine-tune` | 5 requests | 1 day |
| All other endpoints | 100 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642348800
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 100,
    "window": "1 minute",
    "resetAt": "2026-01-16T10:01:00Z"
  }
}
```

---

## Webhooks

### Webhook Events

| Event | Description |
|-------|-------------|
| `test.completed` | Test execution completed |
| `milestone.unlocked` | Phase milestone unlocked |
| `application.submitted` | New application received |
| `application.approved` | Application approved |
| `training.completed` | Fine-tuning job completed |

### Webhook Payload

```json
{
  "event": "test.completed",
  "timestamp": "2026-01-16T10:00:00Z",
  "data": {
    "testRunId": "uuid",
    "status": "completed",
    "companyId": "uuid"
  }
}
```

### Webhook Configuration

Configure webhooks in company settings:

```json
{
  "preferences": {
    "webhook": "https://your-domain.com/webhooks/hitlai",
    "events": ["test.completed", "milestone.unlocked"]
  }
}
```

---

**End of API Documentation**
