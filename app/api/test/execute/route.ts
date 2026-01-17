import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { HitlAIOrchestrator } from '@/lib/orchestrator'
import { TrainingDataCollector } from '@/lib/training/dataCollector'

const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { testRunId } = await request.json()

    if (!testRunId) {
      return NextResponse.json({ error: 'testRunId required' }, { status: 400 })
    }

    const { data: testRun, error } = await supabaseAdmin
      .from('test_runs')
      .select('*')
      .eq('id', testRunId)
      .single()

    if (error || !testRun) {
      return NextResponse.json({ error: 'Test run not found' }, { status: 404 })
    }

    await supabaseAdmin
      .from('test_runs')
      .update({ status: 'running', updated_at: new Date().toISOString() })
      .eq('id', testRunId)

    const orchestrator = new HitlAIOrchestrator(supabaseAdmin)
    
    const result = await orchestrator.executeTest({
      testRunId: testRun.id,
      url: testRun.url,
      mission: testRun.mission,
      persona: testRun.persona,
      platform: testRun.platform
    })

    const finalStatus = result.success ? 'completed' : 'failed'
    
    await supabaseAdmin
      .from('test_runs')
      .update({
        status: finalStatus,
        sentiment_score: result.sentimentScore,
        final_report: result.report,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', testRunId)

    // Capture training data if test completed successfully
    if (finalStatus === 'completed') {
      await TrainingDataCollector.captureTrainingData({
        testRunId: testRun.id,
        testerId: testRun.tester_id,
        companyId: testRun.company_id,
        inputData: {
          url: testRun.url,
          mission: testRun.mission,
          persona: testRun.persona,
          testType: testRun.test_type || 'ai_only',
          additionalContext: testRun.additional_context
        },
        aiOutput: {
          sentiment: result.sentimentScore,
          issuesFound: (result.report as any)?.issues || [],
          recommendations: (result.report as any)?.recommendations || [],
          testResults: result.report
        },
        companyRating: testRun.company_ai_rating,
        modelVersion: 'v1'
      }).catch(err => {
        console.error('Failed to capture training data:', err)
        // Don't fail the test if training data capture fails
      })
    }

    return NextResponse.json({
      success: true,
      testRunId,
      status: finalStatus
    })

  } catch (error) {
    console.error('Test execution error:', error)
    
    try {
      const supabaseAdmin = getSupabaseAdmin()
      const { testRunId } = await request.json()
      if (testRunId) {
        await supabaseAdmin
          .from('test_runs')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', testRunId)
      }
    } catch (updateError) {
      console.error('Failed to update test status:', updateError)
    }

    return NextResponse.json({ error: 'Execution failed' }, { status: 500 })
  }
}
