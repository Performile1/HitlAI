import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const EarlyAdopterSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().min(1, 'Company name is required'),
  role: z.string().optional(),
  companySize: z.string().min(1, 'Company size is required'),
  industry: z.string().optional(),
  testingNeeds: z.string().optional(),
  monthlyTestVolume: z.string().min(1, 'Monthly test volume is required'),
  currentTools: z.string().optional(),
  painPoints: z.string().optional(),
  interestedFeatures: z.array(z.string()),
  referralSource: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const validatedData = EarlyAdopterSchema.parse(body)

    const { data: existingApplication, error: checkError } = await supabase
      .from('early_adopter_applications')
      .select('id, status')
      .eq('email', validatedData.email)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing application:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing application' },
        { status: 500 }
      )
    }

    if (existingApplication) {
      if (existingApplication.status === 'approved') {
        return NextResponse.json(
          { error: 'You have already been approved for early access. Please check your email.' },
          { status: 400 }
        )
      } else if (existingApplication.status === 'pending') {
        return NextResponse.json(
          { error: 'Your application is already under review. We will contact you soon.' },
          { status: 400 }
        )
      }
    }

    const applicationData = {
      full_name: validatedData.fullName,
      email: validatedData.email,
      company: validatedData.company,
      role: validatedData.role || null,
      company_size: validatedData.companySize,
      industry: validatedData.industry || null,
      testing_needs: validatedData.testingNeeds || null,
      monthly_test_volume: validatedData.monthlyTestVolume,
      current_tools: validatedData.currentTools || null,
      pain_points: validatedData.painPoints || null,
      interested_features: validatedData.interestedFeatures,
      referral_source: validatedData.referralSource || null,
      status: 'pending',
      priority_score: calculatePriorityScore(validatedData),
      submitted_at: new Date().toISOString()
    }

    const { data: application, error: insertError } = await supabase
      .from('early_adopter_applications')
      .insert(applicationData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting application:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    await sendNotificationEmail(validatedData)

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        submitted_at: application.submitted_at
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error in early adopter application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculatePriorityScore(data: z.infer<typeof EarlyAdopterSchema>): number {
  let score = 50

  const volumeScores: Record<string, number> = {
    'Just starting (0-10 tests/month)': 5,
    'Small scale (10-50 tests/month)': 10,
    'Growing (50-200 tests/month)': 20,
    'Medium scale (200-500 tests/month)': 30,
    'Large scale (500-1000 tests/month)': 40,
    'Enterprise (1000+ tests/month)': 50
  }
  score += volumeScores[data.monthlyTestVolume] || 0

  const sizeScores: Record<string, number> = {
    '1-10 employees': 5,
    '11-50 employees': 10,
    '51-200 employees': 15,
    '201-500 employees': 20,
    '501-1000 employees': 25,
    '1000+ employees': 30
  }
  score += sizeScores[data.companySize] || 0

  if (data.interestedFeatures.length >= 5) score += 10
  else if (data.interestedFeatures.length >= 3) score += 5

  if (data.painPoints && data.painPoints.length > 50) score += 5
  if (data.testingNeeds && data.testingNeeds.length > 50) score += 5

  return Math.min(score, 100)
}

async function sendNotificationEmail(data: z.infer<typeof EarlyAdopterSchema>) {
  try {
    console.log('Sending notification email to:', data.email)
  } catch (error) {
    console.error('Error sending notification email:', error)
  }
}
