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

    // Check if user is admin
    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabaseAdmin
      .from('test_runs')
      .select(`
        *,
        companies (
          id,
          name,
          email,
          plan_type
        ),
        human_testers (
          id,
          display_name,
          email,
          average_rating
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: tests, error, count } = await query

    if (error) {
      console.error('Error fetching tests:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Get aggregate statistics
    const { data: stats } = await supabaseAdmin
      .from('test_runs')
      .select('status, test_type, cost, sentiment_score')

    const totalTests = stats?.length || 0
    const completedTests = stats?.filter(t => t.status === 'completed').length || 0
    const totalRevenue = stats?.reduce((sum, t) => sum + (t.cost || 0), 0) || 0
    const avgSentiment = stats && stats.length > 0
      ? stats
          .filter(t => t.sentiment_score !== null)
          .reduce((sum, t) => sum + (t.sentiment_score || 0), 0) / 
          stats.filter(t => t.sentiment_score !== null).length
      : 0

    return NextResponse.json({
      success: true,
      data: tests,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      stats: {
        totalTests,
        completedTests,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgSentiment: Math.round(avgSentiment * 100) / 100
      }
    })

  } catch (error: any) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
