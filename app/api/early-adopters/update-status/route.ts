import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const UpdateStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'waitlisted']),
  reviewNotes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateStatusSchema.parse(body)

    const updateData: any = {
      status: validatedData.status,
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString()
    }

    if (validatedData.reviewNotes) {
      updateData.review_notes = validatedData.reviewNotes
    }

    if (validatedData.status === 'approved') {
      updateData.approved_at = new Date().toISOString()
    }

    const { data: application, error } = await supabase
      .from('early_adopter_applications')
      .update(updateData)
      .eq('id', validatedData.applicationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating application:', error)
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      )
    }

    if (validatedData.status === 'approved') {
      await sendApprovalEmail(application)
    } else if (validatedData.status === 'waitlisted') {
      await sendWaitlistEmail(application)
    }

    return NextResponse.json({
      success: true,
      application
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error in update-status API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendApprovalEmail(application: any) {
  try {
    console.log('Sending approval email to:', application.email)
  } catch (error) {
    console.error('Error sending approval email:', error)
  }
}

async function sendWaitlistEmail(application: any) {
  try {
    console.log('Sending waitlist email to:', application.email)
  } catch (error) {
    console.error('Error sending waitlist email:', error)
  }
}
