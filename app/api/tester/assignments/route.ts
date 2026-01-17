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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (testerError || !tester) {
      return NextResponse.json(
        { error: 'Tester not found' },
        { status: 404 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending,running'
    const statuses = status.split(',')

    // Get assigned test runs
    const { data: assignments, error } = await supabaseAdmin
      .from('test_runs')
      .select(`
        *,
        companies (
          id,
          name,
          email
        )
      `)
      .eq('tester_id', tester.id)
      .in('status', statuses)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Calculate earnings for each assignment
    const assignmentsWithEarnings = assignments?.map(assignment => {
      let earnings = 0
      if (assignment.test_type === 'human') {
        earnings = 15
      } else if (assignment.test_type === 'hybrid') {
        earnings = 10
      }

      return {
        ...assignment,
        estimatedEarnings: earnings
      }
    })

    return NextResponse.json({
      success: true,
      data: assignmentsWithEarnings || []
    })

  } catch (error: any) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
