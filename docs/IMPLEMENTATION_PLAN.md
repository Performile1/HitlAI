# HitlAI Training Pipeline Implementation Plan

## Overview

This plan outlines the step-by-step implementation of the AI training pipeline, from data collection to fine-tuned model deployment, aligned with the revised early adopter pricing (25% max discount).

---

## Revised Early Adopter Pricing (25% Max)

### Current Pricing:
- **AI Test:** $5 per test
- **Human Test:** $25 per test

### Early Adopter Pricing:

**Founding Partners (First 10 Companies):**
- AI Test: $3.75 (25% off)
- Human Test: $18.75 (25% off)
- **Lifetime 25% discount**
- Minimum: 100 tests over 3 months

**Early Adopters (Next 40 Companies):**
- AI Test: $4.00 (20% off)
- Human Test: $20.00 (20% off)
- **Lifetime 20% discount**
- Minimum: 50 tests over 3 months

**Beta Users (Next 150 Companies):**
- AI Test: $4.50 (10% off)
- Human Test: $22.50 (10% off)
- **Lifetime 10% discount**
- Minimum: 20 tests over 3 months

---

## Phase 1: Data Collection Infrastructure (Weeks 1-2)

### Goal: Start capturing training data from every test

### Tasks:

#### 1.1 Database Schema
**File:** `supabase/migrations/20260115_training_data_collection.sql`

```sql
-- Training data storage
CREATE TABLE ai_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Test reference
  test_run_id UUID REFERENCES test_runs(id),
  tester_id UUID REFERENCES human_testers(id),
  persona_id UUID REFERENCES personas(id),
  company_id UUID REFERENCES companies(id),
  
  -- Input data
  input_data JSONB NOT NULL,
  
  -- AI predictions
  ai_predictions JSONB NOT NULL,
  
  -- Human labels (ground truth)
  human_labels JSONB,
  
  -- Quality metrics
  is_high_quality BOOLEAN DEFAULT TRUE,
  human_verified BOOLEAN DEFAULT FALSE,
  company_rating INT,
  
  -- Model versioning
  model_version TEXT DEFAULT 'baseline',
  used_for_training BOOLEAN DEFAULT FALSE,
  training_batch_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_data_quality 
  ON ai_training_data(is_high_quality, human_verified) 
  WHERE is_high_quality = TRUE AND human_verified = TRUE;

CREATE INDEX idx_training_data_persona 
  ON ai_training_data(persona_id);

-- Track deployed models
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT NOT NULL UNIQUE,
  model_type TEXT NOT NULL,
  base_model TEXT,
  training_data_count INT,
  training_batch_id UUID,
  status TEXT DEFAULT 'training',
  performance_metrics JSONB,
  cost_per_1k_tokens DECIMAL(10,6),
  deployed_at TIMESTAMPTZ,
  deprecated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track training batches
CREATE TABLE training_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_name TEXT,
  model_type TEXT,
  data_count INT,
  quality_threshold DECIMAL(3,2),
  status TEXT DEFAULT 'preparing',
  openai_file_id TEXT,
  openai_job_id TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Deliverable:** Migration file created and tested
**Owner:** Backend team
**Timeline:** Day 1-2

---

#### 1.2 Data Collection Service
**File:** `lib/training/dataCollector.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TestRunData {
  test_run_id: string
  tester_id?: string
  persona_id: string
  company_id: string
  url: string
  mission: string
  test_type: string
  persona_config: any
  ai_predictions: {
    issues: any[]
    sentiment: number
    recommendations: string[]
    strategy: string
  }
  human_feedback?: {
    confirmed_issues: string[]
    missed_issues: any[]
    false_positives: string[]
    rating: number
    comments?: string
  }
  company_rating?: number
}

export async function captureTrainingData(testRun: TestRunData) {
  try {
    // Prepare input data
    const inputData = {
      url: testRun.url,
      mission: testRun.mission,
      test_type: testRun.test_type,
      persona: testRun.persona_config
    }
    
    // Determine quality
    const isHighQuality = 
      testRun.company_rating >= 4 &&
      testRun.human_feedback?.rating >= 4
    
    const humanVerified = !!testRun.human_feedback
    
    // Insert training data
    const { data, error } = await supabase
      .from('ai_training_data')
      .insert({
        test_run_id: testRun.test_run_id,
        tester_id: testRun.tester_id,
        persona_id: testRun.persona_id,
        company_id: testRun.company_id,
        input_data: inputData,
        ai_predictions: testRun.ai_predictions,
        human_labels: testRun.human_feedback,
        is_high_quality: isHighQuality,
        human_verified: humanVerified,
        company_rating: testRun.company_rating,
        model_version: 'baseline'
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Update training contribution if human tester
    if (testRun.tester_id && humanVerified) {
      await updateTrainingContribution(
        testRun.tester_id,
        testRun.persona_id
      )
    }
    
    console.log('[DataCollector] Training data captured:', data.id)
    return data
    
  } catch (error) {
    console.error('[DataCollector] Error capturing training data:', error)
    throw error
  }
}

async function updateTrainingContribution(
  testerId: string,
  personaId: string
) {
  // Check if contribution exists
  const { data: existing } = await supabase
    .from('ai_training_contributions')
    .select('id, training_tests_completed')
    .eq('tester_id', testerId)
    .eq('persona_id', personaId)
    .single()
  
  if (existing) {
    // Increment count
    await supabase
      .from('ai_training_contributions')
      .update({
        training_tests_completed: existing.training_tests_completed + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
  } else {
    // Create new contribution
    await supabase
      .from('ai_training_contributions')
      .insert({
        tester_id: testerId,
        persona_id: personaId,
        training_tests_completed: 1,
        contribution_weight: 0,
        is_active: true
      })
  }
}

export async function getTrainingDataStats() {
  const { data, error } = await supabase
    .from('ai_training_data')
    .select('id, is_high_quality, human_verified, created_at')
  
  if (error) throw error
  
  const total = data.length
  const highQuality = data.filter(d => d.is_high_quality).length
  const humanVerified = data.filter(d => d.human_verified).length
  const last30Days = data.filter(d => 
    new Date(d.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length
  
  return {
    total,
    highQuality,
    humanVerified,
    last30Days,
    readyForTraining: data.filter(d => 
      d.is_high_quality && d.human_verified
    ).length
  }
}
```

**Deliverable:** Data collection service with tests
**Owner:** Backend team
**Timeline:** Day 3-5

---

#### 1.3 Integration into Test Execution
**File:** `app/api/test-requests/execute/route.ts` (update existing)

```typescript
import { captureTrainingData } from '@/lib/training/dataCollector'

// After test execution completes
export async function POST(req: Request) {
  // ... existing test execution logic ...
  
  // Capture training data
  try {
    await captureTrainingData({
      test_run_id: testRun.id,
      tester_id: testRun.tester_id,
      persona_id: testRun.persona_id,
      company_id: testRequest.company_id,
      url: testRequest.url,
      mission: testRequest.mission,
      test_type: testRequest.test_type,
      persona_config: testRun.persona_config,
      ai_predictions: {
        issues: testRun.friction_points,
        sentiment: testRun.sentiment_score,
        recommendations: testRun.recommendations,
        strategy: testRun.strategy
      },
      human_feedback: testRun.human_feedback,
      company_rating: testRun.company_rating
    })
  } catch (error) {
    console.error('Failed to capture training data:', error)
    // Don't fail the test if training data capture fails
  }
  
  // ... rest of execution logic ...
}
```

**Deliverable:** Training data captured on every test
**Owner:** Backend team
**Timeline:** Day 6-7

---

#### 1.4 Admin Dashboard for Training Data
**File:** `app/admin/training-data/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TrainingDataPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  async function fetchStats() {
    const { data } = await fetch('/api/admin/training-data/stats').then(r => r.json())
    setStats(data)
    setLoading(false)
  }
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Training Data Dashboard</h1>
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Tests</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">High Quality</div>
          <div className="text-3xl font-bold text-green-600">{stats.highQuality}</div>
          <div className="text-xs text-gray-500">{Math.round(stats.highQuality / stats.total * 100)}%</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Human Verified</div>
          <div className="text-3xl font-bold text-blue-600">{stats.humanVerified}</div>
          <div className="text-xs text-gray-500">{Math.round(stats.humanVerified / stats.total * 100)}%</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Ready for Training</div>
          <div className="text-3xl font-bold text-purple-600">{stats.readyForTraining}</div>
          <div className="text-xs text-gray-500">
            {stats.readyForTraining >= 50 ? '✅ Ready!' : `Need ${50 - stats.readyForTraining} more`}
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-yellow-900 mb-2">Training Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-yellow-500 h-4 rounded-full transition-all"
            style={{ width: `${Math.min(stats.readyForTraining / 50 * 100, 100)}%` }}
          />
        </div>
        <p className="text-sm text-yellow-800 mt-2">
          {stats.readyForTraining}/50 tests ready for first fine-tuning
        </p>
      </div>
      
      {stats.readyForTraining >= 50 && (
        <button
          onClick={() => fetch('/api/admin/training/fine-tune', { method: 'POST' })}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Start Fine-Tuning
        </button>
      )}
    </div>
  )
}
```

**Deliverable:** Admin dashboard to monitor training data
**Owner:** Frontend team
**Timeline:** Day 8-10

---

## Phase 2: Fine-Tuning Pipeline (Weeks 3-4)

### Goal: Automate the fine-tuning process

### Tasks:

#### 2.1 Data Export Service
**File:** `lib/training/dataExporter.ts`

```typescript
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function exportTrainingData(
  modelType: 'issue_detector' | 'strategy_planner' | 'persona_matcher',
  minExamples: number = 50
) {
  // Fetch high-quality, human-verified data
  const { data: trainingData, error } = await supabase
    .from('ai_training_data')
    .select('*')
    .eq('is_high_quality', true)
    .eq('human_verified', true)
    .eq('used_for_training', false)
    .order('created_at', { ascending: false })
    .limit(1000)
  
  if (error) throw error
  
  if (trainingData.length < minExamples) {
    throw new Error(`Not enough training data. Have ${trainingData.length}, need ${minExamples}`)
  }
  
  // Format for OpenAI fine-tuning
  const formattedData = trainingData.map(d => {
    const systemPrompt = getSystemPrompt(modelType)
    const userPrompt = formatUserPrompt(modelType, d.input_data)
    const assistantResponse = formatAssistantResponse(modelType, d.human_labels)
    
    return {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: assistantResponse }
      ]
    }
  })
  
  // Save as JSONL
  const jsonl = formattedData.map(d => JSON.stringify(d)).join('\n')
  const filename = `training_${modelType}_${Date.now()}.jsonl`
  const filepath = path.join('/tmp', filename)
  
  fs.writeFileSync(filepath, jsonl)
  
  console.log(`[DataExporter] Exported ${trainingData.length} examples to ${filename}`)
  
  return {
    filepath,
    filename,
    count: trainingData.length,
    dataIds: trainingData.map(d => d.id)
  }
}

function getSystemPrompt(modelType: string): string {
  switch (modelType) {
    case 'issue_detector':
      return 'You are a UX testing AI specialized in detecting usability issues. Analyze the test scenario and identify friction points, accessibility issues, and user experience problems.'
    
    case 'strategy_planner':
      return 'You are a UX testing strategist. Create comprehensive test plans that cover all critical user journeys and potential issues.'
    
    case 'persona_matcher':
      return 'You are a persona matching AI. Recommend the best AI personas and human testers for a given test based on the requirements.'
    
    default:
      return 'You are a UX testing AI assistant.'
  }
}

function formatUserPrompt(modelType: string, inputData: any): string {
  return `Test this website: ${inputData.url}\nMission: ${inputData.mission}\nPersona: ${JSON.stringify(inputData.persona)}\nTest Type: ${inputData.test_type}`
}

function formatAssistantResponse(modelType: string, humanLabels: any): string {
  return JSON.stringify({
    issues: humanLabels.confirmed_issues,
    missed_by_ai: humanLabels.missed_issues,
    recommendations: humanLabels.recommendations || []
  })
}
```

**Deliverable:** Data export service
**Owner:** Backend team
**Timeline:** Day 11-13

---

#### 2.2 Fine-Tuning Service
**File:** `lib/training/fineTuner.ts`

```typescript
import OpenAI from 'openai'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function startFineTuning(
  modelType: 'issue_detector' | 'strategy_planner',
  trainingFilePath: string,
  dataIds: string[]
) {
  try {
    // Create training batch record
    const { data: batch } = await supabase
      .from('training_batches')
      .insert({
        batch_name: `${modelType}_${Date.now()}`,
        model_type: modelType,
        data_count: dataIds.length,
        quality_threshold: 4.0,
        status: 'uploading'
      })
      .select()
      .single()
    
    // Upload file to OpenAI
    const file = await openai.files.create({
      file: fs.createReadStream(trainingFilePath),
      purpose: 'fine-tune'
    })
    
    console.log('[FineTuner] File uploaded:', file.id)
    
    // Update batch with file ID
    await supabase
      .from('training_batches')
      .update({
        openai_file_id: file.id,
        status: 'starting'
      })
      .eq('id', batch.id)
    
    // Start fine-tuning job
    const fineTune = await openai.fineTuning.jobs.create({
      training_file: file.id,
      model: modelType === 'issue_detector' ? 'gpt-4o-mini' : 'gpt-4o',
      suffix: `hitlai-${modelType}-${Date.now()}`
    })
    
    console.log('[FineTuner] Fine-tuning started:', fineTune.id)
    
    // Update batch with job ID
    await supabase
      .from('training_batches')
      .update({
        openai_job_id: fineTune.id,
        status: 'training',
        started_at: new Date().toISOString()
      })
      .eq('id', batch.id)
    
    // Mark data as used for training
    await supabase
      .from('ai_training_data')
      .update({
        used_for_training: true,
        training_batch_id: batch.id
      })
      .in('id', dataIds)
    
    return {
      batchId: batch.id,
      jobId: fineTune.id,
      fileId: file.id
    }
    
  } catch (error) {
    console.error('[FineTuner] Error:', error)
    throw error
  }
}

export async function checkFineTuningStatus(jobId: string) {
  const job = await openai.fineTuning.jobs.retrieve(jobId)
  
  return {
    status: job.status,
    fineTunedModel: job.fine_tuned_model,
    trainedTokens: job.trained_tokens,
    error: job.error
  }
}

export async function deployFineTunedModel(
  batchId: string,
  fineTunedModelId: string
) {
  // Get batch info
  const { data: batch } = await supabase
    .from('training_batches')
    .select('*')
    .eq('id', batchId)
    .single()
  
  // Create model record
  const { data: model } = await supabase
    .from('ai_models')
    .insert({
      model_id: fineTunedModelId,
      model_type: batch.model_type,
      base_model: batch.model_type === 'issue_detector' ? 'gpt-4o-mini' : 'gpt-4o',
      training_data_count: batch.data_count,
      training_batch_id: batchId,
      status: 'deployed',
      cost_per_1k_tokens: batch.model_type === 'issue_detector' ? 0.0001 : 0.002,
      deployed_at: new Date().toISOString()
    })
    .select()
    .single()
  
  // Update batch status
  await supabase
    .from('training_batches')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', batchId)
  
  console.log('[FineTuner] Model deployed:', model.model_id)
  
  return model
}
```

**Deliverable:** Fine-tuning automation service
**Owner:** Backend team
**Timeline:** Day 14-17

---

#### 2.3 Fine-Tuning API Endpoint
**File:** `app/api/admin/training/fine-tune/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { exportTrainingData } from '@/lib/training/dataExporter'
import { startFineTuning } from '@/lib/training/fineTuner'

export async function POST(req: Request) {
  try {
    const { modelType = 'issue_detector', minExamples = 50 } = await req.json()
    
    // Export training data
    const { filepath, count, dataIds } = await exportTrainingData(modelType, minExamples)
    
    // Start fine-tuning
    const { batchId, jobId } = await startFineTuning(modelType, filepath, dataIds)
    
    return NextResponse.json({
      success: true,
      batchId,
      jobId,
      trainingExamples: count
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

**Deliverable:** API endpoint to trigger fine-tuning
**Owner:** Backend team
**Timeline:** Day 18-19

---

#### 2.4 Update Tiered Reasoning to Use Fine-Tuned Models
**File:** `lib/optimization/tieredReasoning.ts` (update)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class TieredReasoning {
  // ... existing code ...
  
  static async selectModel(
    taskType: string,
    complexity: TaskComplexity,
    requiresVision: boolean = false
  ) {
    // Check for deployed fine-tuned models
    if (taskType === 'issue_detection' && !requiresVision) {
      const fineTunedModel = await this.getLatestFineTunedModel('issue_detector')
      if (fineTunedModel) {
        return {
          modelKey: 'ft-ux-detector',
          config: {
            provider: 'openai',
            model: fineTunedModel.model_id,
            costPer1kTokens: fineTunedModel.cost_per_1k_tokens
          }
        }
      }
    }
    
    if (taskType === 'test_strategy' && complexity !== 'simple') {
      const fineTunedModel = await this.getLatestFineTunedModel('strategy_planner')
      if (fineTunedModel) {
        return {
          modelKey: 'ft-strategy-planner',
          config: {
            provider: 'openai',
            model: fineTunedModel.model_id,
            costPer1kTokens: fineTunedModel.cost_per_1k_tokens
          }
        }
      }
    }
    
    // Fallback to existing logic
    return this.selectPhase1Model(taskType, complexity, requiresVision)
  }
  
  private static async getLatestFineTunedModel(modelType: string) {
    const { data } = await supabase
      .from('ai_models')
      .select('*')
      .eq('model_type', modelType)
      .eq('status', 'deployed')
      .order('deployed_at', { ascending: false })
      .limit(1)
      .single()
    
    return data
  }
}
```

**Deliverable:** System automatically uses fine-tuned models when available
**Owner:** Backend team
**Timeline:** Day 20-21

---

## Phase 3: Early Adopter Program Launch (Week 5)

### Goal: Launch early adopter program and start collecting real training data

### Tasks:

#### 3.1 Update Pricing Pages
**Files to update:**
- `app/(marketing)/page.tsx` (homepage)
- `app/(marketing)/pricing/page.tsx`

Add Early Adopter card:

```typescript
// Early Adopter Card Component
<div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-8 mb-8">
  <div className="flex items-center gap-3 mb-4">
    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
      LIMITED TIME
    </span>
    <span className="text-purple-900 font-bold text-xl">
      Early Adopter Program
    </span>
  </div>
  
  <p className="text-gray-700 mb-6">
    Help us train our AI and get <strong>lifetime discounts</strong>. 
    First 50 companies only.
  </p>
  
  <div className="grid md:grid-cols-3 gap-4 mb-6">
    <div className="bg-white p-4 rounded-lg">
      <div className="text-sm text-gray-600">Founding Partners</div>
      <div className="text-2xl font-bold text-purple-600">25% OFF</div>
      <div className="text-xs text-gray-500">Lifetime • First 10</div>
      <div className="mt-2 text-sm">
        <div>AI: <span className="font-semibold">$3.75</span> <span className="line-through text-gray-400">$5</span></div>
        <div>Human: <span className="font-semibold">$18.75</span> <span className="line-through text-gray-400">$25</span></div>
      </div>
    </div>
    
    <div className="bg-white p-4 rounded-lg">
      <div className="text-sm text-gray-600">Early Adopters</div>
      <div className="text-2xl font-bold text-blue-600">20% OFF</div>
      <div className="text-xs text-gray-500">Lifetime • Next 40</div>
      <div className="mt-2 text-sm">
        <div>AI: <span className="font-semibold">$4.00</span> <span className="line-through text-gray-400">$5</span></div>
        <div>Human: <span className="font-semibold">$20.00</span> <span className="line-through text-gray-400">$25</span></div>
      </div>
    </div>
    
    <div className="bg-white p-4 rounded-lg">
      <div className="text-sm text-gray-600">Beta Users</div>
      <div className="text-2xl font-bold text-green-600">10% OFF</div>
      <div className="text-xs text-gray-500">Lifetime • Next 150</div>
      <div className="mt-2 text-sm">
        <div>AI: <span className="font-semibold">$4.50</span> <span className="line-through text-gray-400">$5</span></div>
        <div>Human: <span className="font-semibold">$22.50</span> <span className="line-through text-gray-400">$25</span></div>
      </div>
    </div>
  </div>
  
  <div className="flex items-center justify-between">
    <div className="text-sm text-gray-600">
      <strong>What you get:</strong> Lifetime discount, priority support, help train our AI
    </div>
    <Link 
      href="/early-adopter"
      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold"
    >
      Apply Now
    </Link>
  </div>
</div>
```

**Deliverable:** Early adopter card on homepage and pricing page
**Owner:** Frontend team
**Timeline:** Day 22-24

---

#### 3.2 Early Adopter Application Page
**File:** `app/early-adopter/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EarlyAdopterPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    website: '',
    industry: '',
    testingVolume: '',
    tier: 'founding'
  })
  const [submitted, setSubmitted] = useState(false)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    await fetch('/api/early-adopter/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    setSubmitted(true)
  }
  
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">
            We'll review your application and get back to you within 24 hours.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Early Adopter Program</h1>
        <p className="text-gray-600 mb-8">
          Help us train our AI and get lifetime discounts. Limited to first 50 companies.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Company Name</Label>
            <Input
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Website</Label>
            <Input
              type="url"
              required
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Industry</Label>
            <Input
              required
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Expected Monthly Testing Volume</Label>
            <select
              className="w-full border rounded p-2"
              value={formData.testingVolume}
              onChange={(e) => setFormData({ ...formData, testingVolume: e.target.value })}
            >
              <option value="10-50">10-50 tests/month</option>
              <option value="50-100">50-100 tests/month</option>
              <option value="100-500">100-500 tests/month</option>
              <option value="500+">500+ tests/month</option>
            </select>
          </div>
          
          <div>
            <Label>Preferred Tier</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="founding"
                  checked={formData.tier === 'founding'}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                />
                <span>Founding Partner (25% off, 100 tests min)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="early"
                  checked={formData.tier === 'early'}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                />
                <span>Early Adopter (20% off, 50 tests min)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="beta"
                  checked={formData.tier === 'beta'}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                />
                <span>Beta User (10% off, 20 tests min)</span>
              </label>
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Submit Application
          </Button>
        </form>
      </div>
    </div>
  )
}
```

**Deliverable:** Early adopter application page
**Owner:** Frontend team
**Timeline:** Day 25-27

---

#### 3.3 Early Adopter Database & Tracking
**File:** `supabase/migrations/20260115_early_adopter_program.sql`

```sql
CREATE TABLE early_adopter_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  testing_volume TEXT,
  tier TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE early_adopter_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  tier TEXT NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  min_tests_commitment INT NOT NULL,
  tests_completed INT DEFAULT 0,
  commitment_met BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_early_adopter_company ON early_adopter_companies(company_id);
```

**Deliverable:** Database schema for early adopter program
**Owner:** Backend team
**Timeline:** Day 28

---

## Phase 4: Monitoring & Iteration (Ongoing)

### Goal: Monitor AI improvements and iterate

### Tasks:

#### 4.1 Monthly Training Automation
**File:** `lib/training/scheduler.ts`

```typescript
// Cron job to run monthly fine-tuning
export async function monthlyFineTuning() {
  const stats = await getTrainingDataStats()
  
  if (stats.readyForTraining >= 50) {
    console.log('[Scheduler] Starting monthly fine-tuning...')
    
    // Fine-tune issue detector
    await startFineTuningWorkflow('issue_detector')
    
    // Fine-tune strategy planner if enough data
    if (stats.readyForTraining >= 100) {
      await startFineTuningWorkflow('strategy_planner')
    }
  } else {
    console.log(`[Scheduler] Not enough data yet: ${stats.readyForTraining}/50`)
  }
}
```

**Deliverable:** Automated monthly fine-tuning
**Owner:** Backend team
**Timeline:** Day 29-30

---

#### 4.2 Performance Tracking Dashboard
**File:** `app/admin/ai-performance/page.tsx`

Track:
- AI accuracy over time
- Cost savings from fine-tuned models
- Training data growth
- Model performance metrics

**Deliverable:** Performance dashboard
**Owner:** Frontend team
**Timeline:** Week 6

---

## Timeline Summary

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| **Week 1-2** | Data Collection | Database schema, data collector, integration, admin dashboard |
| **Week 3-4** | Fine-Tuning Pipeline | Data export, fine-tuning automation, API endpoints, model deployment |
| **Week 5** | Early Adopter Launch | Updated pricing pages, application page, program tracking |
| **Week 6+** | Monitoring | Automated training, performance tracking, iteration |

---

## Success Metrics

**Month 1:**
- 50+ high-quality training examples collected
- 5-10 early adopter companies signed up
- Data collection pipeline operational

**Month 2:**
- 150+ training examples
- First fine-tuned model deployed
- 15-20 early adopter companies

**Month 3:**
- 500+ training examples
- 2-3 fine-tuned models in production
- 30-40 early adopter companies
- 10-20% improvement in AI accuracy

**Month 6:**
- 1,000+ training examples
- 50+ early adopter companies
- 30-50% cost reduction from fine-tuned models
- 50%+ improvement in AI accuracy

---

## Budget

**Infrastructure:**
- Supabase: $25/month
- OpenAI API (training): ~$100-500/month
- Fine-tuning costs: ~$10-50 per model
- Total: ~$200-600/month

**Revenue (Conservative):**
- 10 early adopters × 50 tests × $4 avg = $2,000/month
- 30 early adopters × 50 tests × $4 avg = $6,000/month
- 50 early adopters × 50 tests × $4 avg = $10,000/month

**ROI:** Positive from Month 1

---

## Risk Mitigation

**Risk:** Not enough training data
**Mitigation:** Start with 50 examples, iterate quickly

**Risk:** Fine-tuned models perform worse
**Mitigation:** A/B test before full deployment, keep baseline as fallback

**Risk:** Early adopters unhappy with quality
**Mitigation:** Transparent communication, monthly progress reports, easy cancellation

**Risk:** OpenAI API changes
**Mitigation:** Abstract model layer, prepare for alternative providers (Groq, self-hosted)

---

## Next Steps

1. **This Week:** Create database migrations and data collector
2. **Next Week:** Build fine-tuning pipeline
3. **Week 3:** Launch early adopter program
4. **Week 4:** Collect first 50 training examples
5. **Week 5:** Deploy first fine-tuned model

**Let's start with Phase 1, Week 1 tasks!**
