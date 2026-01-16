import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      fullName,
      email,
      phone,
      yearsOfExperience,
      portfolioUrl,
      linkedinUrl,
      previousTestingPlatforms,
      tierRequested,
      weeklyTestCommitment,
      specializations,
      whyJoin
    } = body

    // Validate required fields
    if (!fullName || !email || !tierRequested) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already applied
    const { data: existing } = await supabase
      .from('founding_tester_applications')
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
    const { data: spots } = await supabase.rpc('get_founding_tester_spots')
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
      .from('founding_tester_applications')
      .insert({
        full_name: fullName,
        email,
        phone: phone || null,
        years_of_experience: yearsOfExperience || null,
        portfolio_url: portfolioUrl || null,
        linkedin_url: linkedinUrl || null,
        previous_testing_platforms: previousTestingPlatforms || null,
        tier_requested: tierRequested,
        weekly_test_commitment: weeklyTestCommitment || null,
        specializations: specializations || null,
        why_join: whyJoin || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tester application:', error)
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
    console.error('Error processing tester application:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get available spots for all tiers
    const { data: spots, error } = await supabase.rpc('get_founding_tester_spots')

    if (error) {
      console.error('Error getting founding tester spots:', error)
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
    console.error('Error getting tester spots:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
