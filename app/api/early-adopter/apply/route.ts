import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const {
      companyName,
      contactName,
      email,
      phone,
      website,
      companySize,
      industry,
      tierRequested,
      monthlyTestCommitment,
      useCase
    } = body

    // Validate required fields
    if (!companyName || !contactName || !email || !tierRequested) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already applied
    const { data: existing } = await supabase
      .from('early_adopter_applications')
      .select('id, status')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Application already exists',
          status: existing.status
        },
        { status: 409 }
      )
    }

    // Check available spots for requested tier
    const { data: spots } = await supabase.rpc('get_available_spots')
    const tierSpots = spots?.find((s: any) => s.tier === tierRequested)

    if (!tierSpots || tierSpots.available_spots <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No spots available for ${tierRequested} tier`,
          availableSpots: 0
        },
        { status: 400 }
      )
    }

    // Create application
    const { data: application, error } = await supabase
      .from('early_adopter_applications')
      .insert({
        company_name: companyName,
        contact_name: contactName,
        email,
        phone: phone || null,
        website: website || null,
        company_size: companySize || null,
        industry: industry || null,
        tier_requested: tierRequested,
        monthly_test_commitment: monthlyTestCommitment || null,
        use_case: useCase || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating application:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application.id,
        status: application.status,
        tierRequested: application.tier_requested
      }
    })
  } catch (error: any) {
    console.error('Error processing application:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    // Get available spots for all tiers
    const { data: spots, error } = await supabase.rpc('get_available_spots')

    if (error) {
      console.error('Error getting available spots:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: spots
    })
  } catch (error: any) {
    console.error('Error getting spots:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
