import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/settings
 * Fetch current platform settings
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

    // Fetch platform settings
    const { data: settings, error } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .single() as { data: any; error: any }

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Fetch budget status
    const { data: budgetStatus } = await supabase
      .from('hitlai_budget_status')
      .select('*')
      .limit(1)
      .single() as { data: any; error: any }

    return NextResponse.json({
      settings,
      budgetStatus
    })

  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings
 * Update platform settings
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

    // Validate percentages add up to 100
    if (body.default_ai_percentage + body.default_human_percentage !== 100) {
      return NextResponse.json(
        { error: 'AI and Human percentages must add up to 100' },
        { status: 400 }
      )
    }

    // Update settings
    const { data: settings, error } = await (supabase
      .from('platform_settings') as any)
      .update({
        default_ai_percentage: body.default_ai_percentage,
        default_human_percentage: body.default_human_percentage,
        allow_custom_ratio: body.allow_custom_ratio,
        min_human_tests_per_batch: body.min_human_tests_per_batch,
        human_test_price: body.human_test_price,
        ai_test_price: body.ai_test_price,
        platform_fee_percent: body.platform_fee_percent,
        hitlai_funded_enabled: body.hitlai_funded_enabled,
        hitlai_monthly_budget: body.hitlai_monthly_budget,
        cash_payment_enabled: body.cash_payment_enabled,
        equity_payment_enabled: body.equity_payment_enabled,
        hybrid_payment_enabled: body.hybrid_payment_enabled,
        equity_shares_per_test: body.equity_shares_per_test,
        auto_retrain_threshold: body.auto_retrain_threshold,
        confidence_threshold: body.confidence_threshold,
        human_tester_flag_threshold: body.human_tester_flag_threshold,
        human_tester_disable_threshold: body.human_tester_disable_threshold,
        ai_tester_flag_threshold: body.ai_tester_flag_threshold,
        ai_tester_disable_threshold: body.ai_tester_disable_threshold,
        min_ratings_before_action: body.min_ratings_before_action,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({ settings })

  } catch (error) {
    console.error('Error in PUT /api/admin/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
