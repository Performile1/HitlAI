import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { HitlAIOrchestrator } from '@/lib/orchestrator'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      testRunId,
      status: finalStatus
    })

  } catch (error) {
    console.error('Test execution error:', error)
    
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

    return NextResponse.json({ error: 'Execution failed' }, { status: 500 })
  }
}
