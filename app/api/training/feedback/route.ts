import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const FeedbackSchema = z.object({
  testRunId: z.string().uuid(),
  rating: z.enum(['helpful', 'not_helpful']),
  correctionText: z.string().nullable(),
  issueType: z.string().nullable(),
  aiResponse: z.object({
    findings: z.array(z.string()),
    recommendations: z.array(z.string()),
    sentiment: z.string()
  })
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = FeedbackSchema.parse(body)

    const { data: testRun, error: testRunError } = await supabase
      .from('test_runs')
      .select('id, tester_type')
      .eq('id', validatedData.testRunId)
      .single()

    if (testRunError || !testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      )
    }

    const correctionData = {
      test_run_id: validatedData.testRunId,
      original_output: validatedData.aiResponse,
      corrected_output: validatedData.correctionText 
        ? { correction: validatedData.correctionText, issue_type: validatedData.issueType }
        : null,
      correction_type: validatedData.issueType || 'general',
      is_helpful: validatedData.rating === 'helpful',
      corrected_by: session.user.id,
      feedback_quality_score: calculateFeedbackQuality(validatedData),
      created_at: new Date().toISOString()
    }

    const { data: correction, error: insertError } = await supabase
      .from('human_corrections')
      .insert(correctionData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting correction:', insertError)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    await supabase
      .from('ai_alignment_metrics')
      .insert({
        model_version: 'gpt-4',
        alignment_score: validatedData.rating === 'helpful' ? 1.0 : 0.0,
        human_override_count: validatedData.rating === 'not_helpful' ? 1 : 0,
        measured_at: new Date().toISOString()
      })

    if (validatedData.rating === 'not_helpful' && validatedData.issueType === 'hallucination') {
      await supabase
        .from('ai_alignment_metrics')
        .insert({
          model_version: 'gpt-4',
          hallucination_rate: 1.0,
          measured_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      success: true,
      correction: {
        id: correction.id,
        created_at: correction.created_at
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error in training feedback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateFeedbackQuality(data: z.infer<typeof FeedbackSchema>): number {
  let score = 50

  if (data.rating === 'helpful') {
    score += 20
  }

  if (data.correctionText) {
    const length = data.correctionText.length
    if (length > 100) score += 20
    else if (length > 50) score += 10
    else if (length > 20) score += 5
  }

  if (data.issueType) {
    score += 10
  }

  return Math.min(score, 100)
}
