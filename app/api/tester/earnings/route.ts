import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

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

    // Get tester
    const { data: tester, error: testerError } = await supabaseAdmin
      .from('human_testers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (testerError || !tester) {
      return NextResponse.json(
        { error: 'Tester not found' },
        { status: 404 }
      )
    }

    // Get completed tests
    const { data: completedTests } = await supabaseAdmin
      .from('test_runs')
      .select('id, test_type, cost, completed_at, created_at')
      .eq('tester_id', tester.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })

    // Calculate earnings breakdown
    const earningsBreakdown = completedTests?.map(test => {
      let baseEarnings = 0
      if (test.test_type === 'human') {
        baseEarnings = 15
      } else if (test.test_type === 'hybrid') {
        baseEarnings = 10
      }

      // Apply founding tester bonus
      let bonus = 0
      if (tester.founding_tester_tier && tester.revenue_share_pct) {
        bonus = baseEarnings * (tester.revenue_share_pct / 100)
      }

      return {
        testId: test.id,
        testType: test.test_type,
        baseEarnings,
        bonus,
        totalEarnings: baseEarnings + bonus,
        completedAt: test.completed_at,
        createdAt: test.created_at
      }
    }) || []

    // Calculate totals
    const totalEarnings = earningsBreakdown.reduce((sum, e) => sum + e.totalEarnings, 0)
    const totalBonus = earningsBreakdown.reduce((sum, e) => sum + e.bonus, 0)
    const totalBase = earningsBreakdown.reduce((sum, e) => sum + e.baseEarnings, 0)

    // Get this month's earnings
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEarnings = earningsBreakdown
      .filter(e => new Date(e.completedAt) >= firstDayOfMonth)
      .reduce((sum, e) => sum + e.totalEarnings, 0)

    // Get last 30 days earnings
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const last30DaysEarnings = earningsBreakdown
      .filter(e => new Date(e.completedAt) >= thirtyDaysAgo)
      .reduce((sum, e) => sum + e.totalEarnings, 0)

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEarnings: Math.round(totalEarnings * 100) / 100,
          totalBase: Math.round(totalBase * 100) / 100,
          totalBonus: Math.round(totalBonus * 100) / 100,
          thisMonth: Math.round(thisMonthEarnings * 100) / 100,
          last30Days: Math.round(last30DaysEarnings * 100) / 100,
          testsCompleted: completedTests?.length || 0,
          averagePerTest: completedTests?.length 
            ? Math.round((totalEarnings / completedTests.length) * 100) / 100 
            : 0
        },
        testerInfo: {
          foundingTesterTier: tester.founding_tester_tier,
          revenueSharePct: tester.revenue_share_pct,
          equityPercentage: tester.equity_percentage,
          averageRating: tester.average_rating
        },
        recentEarnings: earningsBreakdown.slice(0, 20) // Last 20 tests
      }
    })

  } catch (error: any) {
    console.error('Error fetching earnings:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
