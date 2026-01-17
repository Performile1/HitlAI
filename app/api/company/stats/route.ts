import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    // Get company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Get test statistics
    const { data: testStats } = await supabaseAdmin
      .from('test_runs')
      .select('id, status, sentiment_score, cost, test_type, created_at')
      .eq('company_id', company.id)

    const totalTests = testStats?.length || 0
    const completedTests = testStats?.filter(t => t.status === 'completed').length || 0
    const pendingTests = testStats?.filter(t => t.status === 'pending').length || 0
    const runningTests = testStats?.filter(t => t.status === 'running').length || 0
    const failedTests = testStats?.filter(t => t.status === 'failed').length || 0

    const totalSpent = testStats?.reduce((sum, t) => sum + (t.cost || 0), 0) || 0
    
    const avgSentiment = testStats && testStats.length > 0
      ? testStats
          .filter(t => t.sentiment_score !== null)
          .reduce((sum, t) => sum + (t.sentiment_score || 0), 0) / 
          testStats.filter(t => t.sentiment_score !== null).length
      : 0

    // Get issues count
    const { count: issuesCount } = await supabaseAdmin
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .in('test_run_id', testStats?.map(t => t.id) || [])

    // Get test breakdown by type
    const aiTests = testStats?.filter(t => t.test_type === 'ai').length || 0
    const humanTests = testStats?.filter(t => t.test_type === 'human').length || 0
    const hybridTests = testStats?.filter(t => t.test_type === 'hybrid').length || 0

    // Get recent tests (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentTests = testStats?.filter(t => 
      new Date(t.created_at) >= sevenDaysAgo
    ).length || 0

    // Get milestone progress
    const { data: milestones } = await supabaseAdmin
      .from('platform_milestones')
      .select('*')
      .order('target_value', { ascending: true })

    const currentPhase = await supabaseAdmin.rpc('get_current_phase')

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.name,
          planType: company.plan_type,
          testsUsedThisMonth: company.tests_used_this_month,
          monthlyTestQuota: company.monthly_test_quota,
          earlyAdopterTier: company.early_adopter_tier,
          discountPercentage: company.discount_percentage
        },
        tests: {
          total: totalTests,
          completed: completedTests,
          pending: pendingTests,
          running: runningTests,
          failed: failedTests,
          recentTests
        },
        breakdown: {
          ai: aiTests,
          human: humanTests,
          hybrid: hybridTests
        },
        metrics: {
          totalSpent: Math.round(totalSpent * 100) / 100,
          avgSentiment: Math.round(avgSentiment * 100) / 100,
          issuesFound: issuesCount || 0,
          avgIssuesPerTest: totalTests > 0 ? Math.round((issuesCount || 0) / totalTests * 10) / 10 : 0
        },
        platform: {
          currentPhase: currentPhase.data || 'phase1',
          milestones: milestones || []
        }
      }
    })

  } catch (error: any) {
    console.error('Error fetching company stats:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
