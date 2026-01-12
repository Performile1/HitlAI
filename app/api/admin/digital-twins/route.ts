import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/digital-twins
 * Fetch all digital twin performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('company_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Fetch all digital twins
    const { data: twins, error } = await supabase
      .from('digital_twin_performance')
      .select('*')
      .order('accuracy_percent', { ascending: false }) as { data: any; error: any }

    if (error) {
      console.error('Error fetching digital twins:', error)
      return NextResponse.json({ error: 'Failed to fetch digital twins' }, { status: 500 })
    }

    return NextResponse.json({ twins })

  } catch (error) {
    console.error('Error in GET /api/admin/digital-twins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/digital-twins/:id
 * Update digital twin performance metrics
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('company_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()

    // Update twin
    const { data: twin, error } = await (supabase
      .from('digital_twin_performance') as any)
      .update({
        accuracy_percent: body.accuracy_percent,
        confidence_score: body.confidence_score,
        status: body.status,
        needs_more_data: body.needs_more_data,
        recommended_tests_needed: body.recommended_tests_needed,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating digital twin:', error)
      return NextResponse.json({ error: 'Failed to update digital twin' }, { status: 500 })
    }

    return NextResponse.json({ twin })

  } catch (error) {
    console.error('Error in PUT /api/admin/digital-twins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
