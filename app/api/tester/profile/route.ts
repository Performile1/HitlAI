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

    // Get tester profile
    const { data: tester, error } = await supabaseAdmin
      .from('human_testers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !tester) {
      return NextResponse.json(
        { error: 'Tester profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tester
    })

  } catch (error: any) {
    console.error('Error fetching tester profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const updates = await request.json()

    // Get tester
    const { data: tester } = await supabaseAdmin
      .from('human_testers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!tester) {
      return NextResponse.json(
        { error: 'Tester not found' },
        { status: 404 }
      )
    }

    // Update allowed fields only
    const allowedFields = [
      'display_name',
      'age',
      'gender',
      'occupation',
      'education_level',
      'location_country',
      'tech_literacy',
      'primary_device',
      'languages',
      'years_of_testing_experience',
      'previous_platforms'
    ]

    const filteredUpdates: any = {}
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    filteredUpdates.updated_at = new Date().toISOString()

    const { data: updatedTester, error: updateError } = await supabaseAdmin
      .from('human_testers')
      .update(filteredUpdates)
      .eq('id', tester.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating tester profile:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedTester
    })

  } catch (error: any) {
    console.error('Error updating tester profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
