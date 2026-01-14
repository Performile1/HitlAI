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

    // Check if user is HitlAI admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin@hitlai.com has admin access
    if (user.email !== 'admin@hitlai.com') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Fetch AI personas (AI testers)
    const { data: aiPersonas, error: aiError } = await supabase
      .from('personas')
      .select('*')
      .order('name')

    if (aiError) {
      console.error('Error fetching AI personas:', aiError)
    }

    // Fetch human testers
    const { data: humanTesters, error: humanError } = await supabase
      .from('human_testers')
      .select('*')
      .order('display_name')

    if (humanError) {
      console.error('Error fetching human testers:', humanError)
    }

    // Fetch digital twin performance metrics (if table exists)
    const { data: twinMetrics } = await supabase
      .from('digital_twin_performance')
      .select('*')
      .order('accuracy_percent', { ascending: false })

    return NextResponse.json({ 
      aiPersonas: aiPersonas || [],
      humanTesters: humanTesters || [],
      twinMetrics: twinMetrics || []
    })

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

    // Check if user is HitlAI admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin@hitlai.com has admin access
    if (user.email !== 'admin@hitlai.com') {
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
