import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: corrections, error: correctionsError } = await supabase
      .from('human_corrections')
      .select('*')
      .order('created_at', { ascending: false })

    if (correctionsError) {
      console.error('Error fetching corrections:', correctionsError)
      return NextResponse.json(
        { error: 'Failed to fetch training data' },
        { status: 500 }
      )
    }

    const { data: alignmentMetrics, error: metricsError } = await supabase
      .from('ai_alignment_metrics')
      .select('alignment_score, hallucination_rate')
      .order('measured_at', { ascending: false })
      .limit(100)

    if (metricsError) {
      console.error('Error fetching alignment metrics:', metricsError)
    }

    const totalCorrections = corrections?.length || 0
    const helpfulCount = corrections?.filter(c => c.is_helpful).length || 0
    const notHelpfulCount = totalCorrections - helpfulCount

    const issueTypeCounts: Record<string, number> = {}
    corrections?.forEach(c => {
      if (c.correction_type) {
        issueTypeCounts[c.correction_type] = (issueTypeCounts[c.correction_type] || 0) + 1
      }
    })

    const topIssueTypes = Object.entries(issueTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const avgAlignmentScore = alignmentMetrics && alignmentMetrics.length > 0
      ? alignmentMetrics.reduce((sum, m) => sum + (m.alignment_score || 0), 0) / alignmentMetrics.length
      : 0

    const hallucinationMetrics = alignmentMetrics?.filter(m => m.hallucination_rate !== null) || []
    const avgHallucinationRate = hallucinationMetrics.length > 0
      ? hallucinationMetrics.reduce((sum, m) => sum + (m.hallucination_rate || 0), 0) / hallucinationMetrics.length
      : 0

    const recentCorrections = corrections?.slice(0, 10).map(c => ({
      id: c.id,
      test_run_id: c.test_run_id,
      correction_type: c.correction_type,
      is_helpful: c.is_helpful,
      feedback_quality_score: c.feedback_quality_score,
      created_at: c.created_at
    })) || []

    const stats = {
      total_corrections: totalCorrections,
      helpful_count: helpfulCount,
      not_helpful_count: notHelpfulCount,
      avg_alignment_score: avgAlignmentScore,
      hallucination_rate: avgHallucinationRate,
      top_issue_types: topIssueTypes,
      recent_corrections: recentCorrections
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in training stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
