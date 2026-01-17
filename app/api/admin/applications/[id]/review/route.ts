import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
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

    const applicationId = params.id
    const { action, notes, applicationType } = await request.json()

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    if (!applicationType || !['company', 'tester'].includes(applicationType)) {
      return NextResponse.json(
        { error: 'applicationType must be "company" or "tester"' },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const tableName = applicationType === 'company' 
      ? 'early_adopter_applications' 
      : 'founding_tester_applications'

    // Update application status
    const { data: application, error: updateError } = await supabaseAdmin
      .from(tableName)
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || null
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating application:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // If approved, create company or update tester record
    if (action === 'approve') {
      if (applicationType === 'company') {
        // Create company account
        const { data: existingCompany } = await supabaseAdmin
          .from('companies')
          .select('id')
          .eq('email', application.email)
          .single()

        if (!existingCompany) {
          // Calculate discount based on tier
          let discountPercentage = 0
          if (application.tier_requested === 'founding_partner') {
            discountPercentage = 25
          } else if (application.tier_requested === 'early_adopter') {
            discountPercentage = 15
          }

          const { error: companyError } = await supabaseAdmin
            .from('companies')
            .insert({
              name: application.company_name,
              email: application.email,
              industry: application.industry,
              company_size: application.company_size,
              early_adopter_tier: application.tier_requested,
              discount_percentage: discountPercentage,
              plan_type: 'early_adopter',
              monthly_test_quota: 100
            })

          if (companyError) {
            console.error('Error creating company:', companyError)
          }
        }
      } else if (applicationType === 'tester') {
        // Update tester record if they already signed up
        const { data: existingTester } = await supabaseAdmin
          .from('human_testers')
          .select('id')
          .eq('email', application.email)
          .single()

        if (existingTester) {
          // Calculate revenue share based on tier
          let revenueSharePct = 0
          let equityPct = 0
          if (application.tier_requested === 'founding_partner') {
            revenueSharePct = 40
            equityPct = 0.05
          } else if (application.tier_requested === 'founding_tester') {
            revenueSharePct = 25
            equityPct = 0.01
          }

          await supabaseAdmin
            .from('human_testers')
            .update({
              founding_tester_tier: application.tier_requested,
              revenue_share_pct: revenueSharePct,
              equity_percentage: equityPct
            })
            .eq('id', existingTester.id)
        }
      }

      // TODO: Send approval email notification
      // This would integrate with SendGrid/Resend
    }

    return NextResponse.json({
      success: true,
      message: `Application ${action}ed successfully`,
      data: {
        applicationId,
        status: newStatus,
        applicationType
      }
    })

  } catch (error: any) {
    console.error('Error reviewing application:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
