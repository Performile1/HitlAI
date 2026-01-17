import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
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

    // Get test run with related data
    const { data: testRun, error } = await supabaseAdmin
      .from('test_runs')
      .select(`
        *,
        companies (
          id,
          name,
          email
        ),
        human_testers (
          id,
          display_name,
          average_rating
        )
      `)
      .eq('id', testRunId)
      .single()

    if (error || !testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      )
    }

    // Check authorization - user must be company owner or assigned tester
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { data: tester } = await supabaseAdmin
      .from('human_testers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const isCompanyOwner = company && testRun.company_id === company.id
    const isAssignedTester = tester && testRun.tester_id === tester.id

    if (!isCompanyOwner && !isAssignedTester) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get issues for this test run
    const { data: issues } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('test_run_id', testRunId)
      .order('severity', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        ...testRun,
        issues: issues || []
      }
    })

  } catch (error: any) {
    console.error('Error fetching test run:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
