import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { TrainingDataCollector } from '@/lib/training/dataCollector'

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
    const { rating, feedback } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get test run
    const { data: testRun, error: fetchError } = await supabaseAdmin
      .from('test_runs')
      .select('*, companies(user_id)')
      .eq('id', testRunId)
      .single()

    if (fetchError || !testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      )
    }

    // Check authorization - must be company owner
    if (testRun.companies.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Update rating
    const { error: updateError } = await supabaseAdmin
      .from('test_runs')
      .update({
        company_ai_rating: rating,
        company_feedback: feedback || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', testRunId)

    if (updateError) {
      console.error('Error updating rating:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // If rating is 4 or 5, capture training data
    if (rating >= 4 && testRun.status === 'completed') {
      try {
        await TrainingDataCollector.captureTrainingData({
          testRunId: testRun.id,
          testerId: testRun.tester_id,
          companyId: testRun.company_id,
          inputData: {
            url: testRun.url,
            mission: testRun.mission,
            persona: testRun.persona,
            testType: testRun.test_type || 'ai',
            additionalContext: testRun.additional_context
          },
          aiOutput: {
            sentiment: testRun.sentiment_score,
            issuesFound: testRun.final_report?.issues || [],
            recommendations: testRun.final_report?.recommendations || [],
            testResults: testRun.final_report
          },
          companyRating: rating,
          modelVersion: testRun.ai_model_used || 'v1'
        })
      } catch (trainingError) {
        console.error('Failed to capture training data:', trainingError)
        // Don't fail the rating if training data capture fails
      }
    }

    // If test has a tester, update their stats
    if (testRun.tester_id && rating >= 4) {
      const { data: tester } = await supabaseAdmin
        .from('human_testers')
        .select('tests_completed, average_rating')
        .eq('id', testRun.tester_id)
        .single()

      if (tester) {
        const newAverage = ((tester.average_rating * tester.tests_completed) + rating) / (tester.tests_completed + 1)
        
        await supabaseAdmin
          .from('human_testers')
          .update({
            average_rating: newAverage
          })
          .eq('id', testRun.tester_id)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating,
        trainingDataCaptured: rating >= 4
      }
    })

  } catch (error: any) {
    console.error('Error rating test run:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
