import { NextRequest, NextResponse } from 'next/server'
import { FineTuner } from '@/lib/training/fineTuner'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Check job status
    const status = await FineTuner.checkFineTuningStatus(jobId)

    // Get job events/logs
    const events = await FineTuner.getFineTuningEvents(jobId)

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        status: status.status,
        fineTunedModel: status.fineTunedModel,
        error: status.error,
        events: events.slice(0, 10) // Last 10 events
      }
    })
  } catch (error: any) {
    console.error('Error checking fine-tuning status:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    const body = await request.json()
    const { action, modelName, phase } = body

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    if (action === 'deploy') {
      // Deploy the fine-tuned model
      if (!modelName) {
        return NextResponse.json(
          { success: false, error: 'Model name is required for deployment' },
          { status: 400 }
        )
      }

      const result = await FineTuner.deployFineTunedModel(jobId, modelName, phase || 'phase2')

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Model deployed successfully',
        data: {
          modelId: result.modelId
        }
      })
    } else if (action === 'cancel') {
      // Cancel the fine-tuning job
      const result = await FineTuner.cancelFineTuning(jobId)

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Fine-tuning job cancelled'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "deploy" or "cancel"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error processing fine-tuning action:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
