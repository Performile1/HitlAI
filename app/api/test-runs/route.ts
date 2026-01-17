import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      url,
      mission,
      testType = 'ai',
      persona = 'casual_user',
      platform,
      additionalContext
    } = body

    if (!url || !mission) {
      return NextResponse.json(
        { error: 'url and mission are required' },
        { status: 400 }
      )
    }

    // Get company_id from user
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Check quota
    const { data: companyData } = await supabaseAdmin
      .from('companies')
      .select('tests_used_this_month, monthly_test_quota')
      .eq('id', company.id)
      .single()

    if (companyData && companyData.tests_used_this_month >= companyData.monthly_test_quota) {
      return NextResponse.json(
        { error: 'Monthly test quota exceeded' },
        { status: 403 }
      )
    }

    // Determine cost based on test type and current phase
    const { data: phaseData } = await supabaseAdmin.rpc('get_current_phase')
    const currentPhase = phaseData || 'phase1'
    
    let cost = 5 // Default Phase 1 AI cost
    if (testType === 'human') cost = 25
    if (testType === 'hybrid') cost = 30
    
    // Apply phase discounts
    if (currentPhase === 'phase2') cost = cost * 0.6 // 40% discount
    if (currentPhase === 'phase3') cost = cost * 0.3 // 70% discount
    if (currentPhase === 'phase4') cost = cost * 0.2 // 80% discount

    // Create test_run
    const { data: testRun, error } = await supabaseAdmin
      .from('test_runs')
      .insert({
        company_id: company.id,
        url,
        mission,
        test_type: testType,
        persona,
        platform_details: platform || {},
        additional_context: additionalContext,
        status: 'pending',
        cost
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating test run:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Increment tests_used_this_month
    await supabaseAdmin
      .from('companies')
      .update({
        tests_used_this_month: (companyData?.tests_used_this_month || 0) + 1
      })
      .eq('id', company.id)

    return NextResponse.json({
      success: true,
      testRun: {
        id: testRun.id,
        status: testRun.status,
        cost: testRun.cost,
        createdAt: testRun.created_at
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating test run:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get company_id from user
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    // Build query
    let query = supabaseAdmin
      .from('test_runs')
      .select('*', { count: 'exact' })
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: testRuns, error, count } = await query

    if (error) {
      console.error('Error fetching test runs:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: testRuns,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error: any) {
    console.error('Error fetching test runs:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
