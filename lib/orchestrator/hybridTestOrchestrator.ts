/**
 * HybridTestOrchestrator - Manages AI + Human testing workflow
 * 
 * Coordinates:
 * 1. AI tests (autonomous)
 * 2. Human tests (assigned to testers)
 * 3. Result comparison and learning
 */

import { createClient } from '@supabase/supabase-js'
import { HitlAIOrchestrator } from '../orchestrator'
import { BehaviorAnalyzer } from '../agents/behaviorAnalyzer'

interface TestRequest {
  id: string
  company_id: string
  title: string
  url: string
  mission: string
  test_type: 'ai_only' | 'human_only' | 'hybrid'
  personas: any[]
  test_dimensions: string[]
  required_testers: number
  tester_requirements: any
  status: string
}

interface HumanTestAssignment {
  id: string
  test_request_id: string
  tester_id: string
  assigned_persona_id: string
  status: string
}

export class HybridTestOrchestrator {
  private supabase: ReturnType<typeof createClient>
  private aiOrchestrator: HitlAIOrchestrator
  private behaviorAnalyzer: BehaviorAnalyzer

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    this.aiOrchestrator = new HitlAIOrchestrator(this.supabase)
    this.behaviorAnalyzer = new BehaviorAnalyzer()
  }

  /**
   * Execute a test request (AI, human, or hybrid)
   */
  async executeTestRequest(testRequestId: string): Promise<void> {
    // 1. Fetch test request
    const { data: testRequest, error } = await this.supabase
      .from('test_requests')
      .select('*')
      .eq('id', testRequestId)
      .single() as { data: any; error: any }

    if (error || !testRequest) {
      throw new Error('Test request not found')
    }

    // 2. Update status
    await this.updateTestRequestStatus(testRequestId, 'in_progress')

    // 3. Execute based on test type
    switch (testRequest.test_type) {
      case 'ai_only':
        await this.executeAITests(testRequest)
        break
      
      case 'human_only':
        await this.executeHumanTests(testRequest)
        break
      
      case 'hybrid':
        await this.executeHybridTests(testRequest)
        break
    }

    // 4. Mark as completed
    await this.updateTestRequestStatus(testRequestId, 'completed')
  }

  /**
   * Execute AI-only tests
   */
  private async executeAITests(testRequest: TestRequest): Promise<void> {
    const testRunIds: string[] = []

    // Run AI test for each persona
    for (const persona of testRequest.personas) {
      // Create test run
      const { data: testRun } = await this.supabase
        .from('test_runs')
        .insert({
          url: testRequest.url,
          mission: testRequest.mission,
          persona: persona.name,
          platform: 'web',
          status: 'queued',
          test_request_id: testRequest.id,
          test_type: 'ai_only',
          company_id: testRequest.company_id
        } as any)
        .select()
        .single() as { data: any; error: any }

      if (testRun) {
        testRunIds.push(testRun.id)

        // Execute AI test
        await this.aiOrchestrator.executeTest({
          testRunId: testRun.id,
          url: testRequest.url,
          mission: testRequest.mission,
          persona: persona.name,
          platform: 'web'
        })
      }
    }

    // Update test request with AI run IDs
    await this.supabase
      .from('test_requests')
      .update({ ai_test_run_ids: testRunIds } as any)
      .eq('id', testRequest.id)
  }

  /**
   * Execute human-only tests
   */
  private async executeHumanTests(testRequest: TestRequest): Promise<void> {
    const assignmentIds: string[] = []

    // Find matching testers
    const { data: testers } = await this.supabase
      .rpc('match_available_testers', {
        requirements: testRequest.tester_requirements,
        limit_count: testRequest.required_testers
      })

    if (!testers || testers.length === 0) {
      throw new Error('No available testers matching requirements')
    }

    // Assign tests to testers
    for (let i = 0; i < Math.min(testers.length, testRequest.required_testers); i++) {
      const tester = testers[i]
      const persona = testRequest.personas[i % testRequest.personas.length]

      const { data: assignment } = await this.supabase
        .from('human_test_assignments')
        .insert({
          test_request_id: testRequest.id,
          tester_id: tester.tester_id,
          assigned_persona_id: persona.id,
          instructions: this.generateInstructions(testRequest, persona),
          status: 'assigned'
        } as any)
        .select()
        .single() as { data: any; error: any }

      if (assignment) {
        assignmentIds.push(assignment.id)
        
        // Send notification to tester (email/push)
        await this.notifyTester(tester.tester_id, assignment.id)
      }
    }

    // Update test request
    await this.supabase
      .from('test_requests')
      .update({ human_test_assignment_ids: assignmentIds } as any)
      .eq('id', testRequest.id)
  }

  /**
   * Execute hybrid tests (AI + human)
   */
  private async executeHybridTests(testRequest: TestRequest): Promise<void> {
    // Run AI tests first (fast)
    await this.executeAITests(testRequest)

    // Assign human tests (slower, but more accurate)
    await this.executeHumanTests(testRequest)

    // Wait for human tests to complete, then compare results
    // (This would be triggered by webhook when humans complete their tests)
  }

  /**
   * Compare AI vs Human test results
   */
  async compareResults(testRequestId: string): Promise<void> {
    // 1. Fetch test request
    const { data: testRequest } = await this.supabase
      .from('test_requests')
      .select('*')
      .eq('id', testRequestId)
      .single()

    if (!testRequest) return

    // 2. Fetch AI results
    const { data: aiRuns } = await this.supabase
      .from('test_runs')
      .select('*')
      .in('id', testRequest.ai_test_run_ids || [])

    // 3. Fetch human results
    const { data: humanAssignments } = await this.supabase
      .from('human_test_assignments')
      .select('*')
      .in('id', testRequest.human_test_assignment_ids || [])
      .eq('status', 'completed')

    if (!aiRuns || !humanAssignments) return

    // 4. Calculate metrics
    const aiAvgSentiment = aiRuns.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / aiRuns.length
    const humanAvgSentiment = humanAssignments.reduce((sum, a) => sum + (a.sentiment_score || 0), 0) / humanAssignments.length

    const aiFrictionPoints = aiRuns.reduce((sum, r) => sum + (r.friction_points_count || 0), 0)
    const humanFrictionPoints = humanAssignments.reduce((sum, a) => sum + (a.friction_points_found || 0), 0)

    // 5. Calculate agreement score (how similar are AI and human findings?)
    const agreementScore = 1 - Math.abs(aiAvgSentiment - humanAvgSentiment)

    // 6. Store comparison
    await this.supabase
      .from('test_result_comparisons')
      .insert({
        test_request_id: testRequestId,
        ai_friction_points: aiFrictionPoints,
        ai_sentiment_score: aiAvgSentiment,
        ai_completion_time_seconds: aiRuns.reduce((sum, r) => sum + (r.duration_seconds || 0), 0),
        human_friction_points_avg: humanFrictionPoints / humanAssignments.length,
        human_sentiment_score_avg: humanAvgSentiment,
        human_completion_time_avg: humanAssignments.reduce((sum, a) => sum + (a.completion_time_seconds || 0), 0) / humanAssignments.length,
        human_testers_count: humanAssignments.length,
        agreement_score: agreementScore,
        insights: {
          summary: agreementScore > 0.8 
            ? 'AI and human testers largely agree on findings' 
            : 'Significant differences between AI and human findings - review for learning opportunities'
        }
      } as any)

    // 7. If low agreement, trigger learning
    if (agreementScore < 0.7) {
      await this.learnFromDiscrepancies(testRequestId, aiRuns, humanAssignments)
    }
  }

  /**
   * Learn from discrepancies between AI and human results
   */
  private async learnFromDiscrepancies(
    testRequestId: string,
    aiRuns: any[],
    humanAssignments: any[]
  ): Promise<void> {
    // Extract insights from human feedback
    const humanInsights = humanAssignments
      .filter(a => a.notes || a.tester_feedback)
      .map(a => ({
        notes: a.notes,
        feedback: a.tester_feedback,
        friction_points: a.friction_points_found
      }))

    // Store as memory lesson for AI to learn from
    for (const insight of humanInsights) {
      if (insight.notes) {
        await this.supabase
          .from('memory_lessons')
          .insert({
            lesson_text: `Human tester observation: ${insight.notes}`,
            url: aiRuns[0]?.url,
            platform: 'web',
            friction_type: 'human_observed',
            resolution: 'Incorporate human feedback into future tests',
            metadata: {
              source: 'human_tester',
              test_request_id: testRequestId
            }
          } as any)
      }
    }

    console.log(`Stored ${humanInsights.length} human insights for AI learning`)
  }

  /**
   * Generate instructions for human testers
   */
  private generateInstructions(testRequest: TestRequest, persona: any): string {
    return `
# Test Instructions

**Website**: ${testRequest.url}
**Mission**: ${testRequest.mission}

## Your Persona
You are testing as: **${persona.name}**
- Age: ${persona.age}
- Tech Literacy: ${persona.tech_literacy}
- Special Needs: ${persona.eyesight}

## What to Do
1. Navigate to the website
2. Attempt to complete the mission: "${testRequest.mission}"
3. Act as if you have the characteristics of ${persona.name}
4. Report any friction points, confusing elements, or errors
5. Note your overall experience (positive/negative)

## What to Report
- Elements that were hard to find or use
- Error messages that were unclear
- Steps that felt confusing or frustrating
- Anything that would be difficult for someone with ${persona.tech_literacy} tech literacy

Take your time and be thorough. Your feedback helps improve UX for everyone!
    `.trim()
  }

  /**
   * Notify tester of new assignment
   */
  private async notifyTester(testerId: string, assignmentId: string): Promise<void> {
    // TODO: Implement email/push notification
    console.log(`Notifying tester ${testerId} of assignment ${assignmentId}`)
  }

  /**
   * Update test request status
   */
  private async updateTestRequestStatus(testRequestId: string, status: string): Promise<void> {
    await this.supabase
      .from('test_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', testRequestId)
  }
}
