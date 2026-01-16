import { NextRequest, NextResponse } from 'next/server'
import { MilestoneProgressTracker } from '@/lib/milestones/progressTracker'

export async function GET(request: NextRequest) {
  try {
    const summary = await MilestoneProgressTracker.getProgressSummary()
    
    return NextResponse.json({
      success: true,
      data: summary
    })
  } catch (error: any) {
    console.error('Error getting milestone progress:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Manually trigger milestone update
    await MilestoneProgressTracker.updateMilestoneProgress()
    
    const summary = await MilestoneProgressTracker.getProgressSummary()
    
    return NextResponse.json({
      success: true,
      message: 'Milestone progress updated',
      data: summary
    })
  } catch (error: any) {
    console.error('Error updating milestone progress:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
