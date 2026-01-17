import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { HybridTestOrchestrator } from '@/lib/orchestrator/hybridTestOrchestrator'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { testRequestId } = await request.json()

    if (!testRequestId) {
      return NextResponse.json(
        { error: 'testRequestId is required' },
        { status: 400 }
      )
    }

    // Execute test in background
    const orchestrator = new HybridTestOrchestrator()
    
    // Don't await - let it run async
    orchestrator.executeTestRequest(testRequestId).catch(error => {
      console.error('Test execution failed:', error)
      
      // Update test request status to failed
      supabase
        .from('test_requests')
        .update({ status: 'failed' })
        .eq('id', testRequestId)
        .then()
    })

    return NextResponse.json({ 
      success: true,
      message: 'Test execution started'
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
