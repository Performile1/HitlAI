import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

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

    // Check if user is admin
    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const type = searchParams.get('type') // 'company' or 'tester'

    let applications = []

    // Get early adopter applications (companies)
    if (!type || type === 'company') {
      const { data: companyApps } = await supabaseAdmin
        .from('early_adopter_applications')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (companyApps) {
        applications.push(...companyApps.map(app => ({
          ...app,
          applicationType: 'company'
        })))
      }
    }

    // Get founding tester applications
    if (!type || type === 'tester') {
      const { data: testerApps } = await supabaseAdmin
        .from('founding_tester_applications')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (testerApps) {
        applications.push(...testerApps.map(app => ({
          ...app,
          applicationType: 'tester'
        })))
      }
    }

    // Sort by created_at
    applications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      data: applications
    })

  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
