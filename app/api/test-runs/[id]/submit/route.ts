import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testRunId = params.id
    const body = await request.json()
    const {
      sentimentScore,
      issues = [],
      recommendations = [],
      positives = [],
      additionalNotes
    } = body

    if (sentimentScore === undefined || sentimentScore < 0 || sentimentScore > 1) {
      return NextResponse.json(
        { error: 'sentimentScore must be between 0 and 1' },
        { status: 400 }
      )
    }

    // Get test run
    const { data: testRun, error: fetchError } = await supabaseAdmin
      .from('test_runs')
      .select('*, human_testers(user_id)')
      .eq('id', testRunId)
      .single()

    if (fetchError || !testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      )
    }

    // Check authorization - must be assigned tester
    if (!testRun.human_testers || testRun.human_testers.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - not assigned to this test' },
        { status: 403 }
      )
    }

    // Check if already submitted
    if (testRun.status === 'completed') {
      return NextResponse.json(
        { error: 'Test already submitted' },
        { status: 400 }
      )
    }

    // Insert issues into issues table
    const issuesWithTestRunId = issues.map((issue: any) => ({
      test_run_id: testRunId,
      title: issue.title,
      description: issue.description,
      severity: issue.severity || 'medium',
      category: issue.category || 'functionality',
      element_selector: issue.elementSelector || null,
      screenshot_url: issue.screenshotUrl || null,
      metadata: issue.metadata || {}
    }))

    if (issuesWithTestRunId.length > 0) {
      const { error: issuesError } = await supabaseAdmin
        .from('issues')
        .insert(issuesWithTestRunId)

      if (issuesError) {
        console.error('Error inserting issues:', issuesError)
      }
    }

    // Calculate earnings based on test type
    let earnings = 0
    if (testRun.test_type === 'human') {
      earnings = 15 // $15 for human-only tests
    } else if (testRun.test_type === 'hybrid') {
      earnings = 10 // $10 for hybrid tests
    }

    // Apply founding tester bonus if applicable
    const { data: tester } = await supabaseAdmin
      .from('human_testers')
      .select('founding_tester_tier, revenue_share_pct, tests_completed, total_earnings')
      .eq('id', testRun.tester_id)
      .single()

    if (tester?.founding_tester_tier) {
      const bonus = earnings * (tester.revenue_share_pct / 100)
      earnings += bonus
    }

    // Update test run
    const { error: updateError } = await supabaseAdmin
      .from('test_runs')
      .update({
        status: 'completed',
        sentiment_score: sentimentScore,
        final_report: {
          issues,
          recommendations,
          positives,
          additionalNotes,
          submittedBy: 'human_tester',
          submittedAt: new Date().toISOString()
        },
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', testRunId)

    if (updateError) {
      console.error('Error updating test run:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Update tester stats
    if (tester) {
      await supabaseAdmin
        .from('human_testers')
        .update({
          tests_completed: (tester.tests_completed || 0) + 1,
          total_earnings: (tester.total_earnings || 0) + earnings,
          updated_at: new Date().toISOString()
        })
        .eq('id', testRun.tester_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Test report submitted successfully',
      data: {
        testRunId,
        earnings,
        issuesReported: issues.length,
        status: 'completed'
      }
    })

  } catch (error: any) {
    console.error('Error submitting test report:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
