import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { data: unlocks, error } = await supabase
      .from('unlocked_features')
      .select('*')
      .eq('company_id', companyId)
      .gte('unlocked_at', twentyFourHoursAgo.toISOString())
      .order('unlocked_at', { ascending: false })

    if (error) {
      console.error('Error fetching recent unlocks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recent unlocks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ unlocks: unlocks || [] })
  } catch (error) {
    console.error('Error in recent-unlocks API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
