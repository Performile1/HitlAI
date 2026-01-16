import { NextRequest, NextResponse } from 'next/server'
import { TrainingDataExporter, ModelType } from '@/lib/training/dataExporter'
import { FineTuner } from '@/lib/training/fineTuner'
import { TrainingDataCollector } from '@/lib/training/dataCollector'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { modelType, minQuality, requireHumanVerification, baseModel } = body

    if (!modelType) {
      return NextResponse.json(
        { success: false, error: 'Model type is required' },
        { status: 400 }
      )
    }

    // Check if we have enough training data
    const stats = await TrainingDataCollector.getTrainingDataStats()
    
    if (stats.readyForTraining < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient training data. Need at least 50 examples, have ${stats.readyForTraining}` 
        },
        { status: 400 }
      )
    }

    // Export training data
    const exportResult = await TrainingDataExporter.exportForFineTuning(
      modelType as ModelType,
      {
        minQuality: minQuality || 4,
        requireHumanVerification: requireHumanVerification !== false,
        excludeUsed: true
      }
    )

    if (!exportResult.success || !exportResult.data) {
      return NextResponse.json(
        { success: false, error: exportResult.error || 'Failed to export training data' },
        { status: 500 }
      )
    }

    // Validate training data
    const validation = TrainingDataExporter.validateTrainingData(exportResult.data)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Training data validation failed',
          validationErrors: validation.errors
        },
        { status: 400 }
      )
    }

    // Save to JSONL file
    const filename = `${modelType}_${Date.now()}.jsonl`
    const saveResult = await TrainingDataExporter.saveToJSONL(exportResult.data, filename)

    if (!saveResult.success || !saveResult.filepath) {
      return NextResponse.json(
        { success: false, error: saveResult.error || 'Failed to save training file' },
        { status: 500 }
      )
    }

    // Estimate cost
    const costEstimate = FineTuner.estimateFineTuningCost(exportResult.data.length)

    // Start fine-tuning job
    const fineTuneResult = await FineTuner.startFineTuning({
      modelType,
      baseModel: baseModel || 'gpt-4o-mini-2024-07-18',
      trainingFilePath: saveResult.filepath,
      suffix: `hitlai-${modelType}`
    })

    if (!fineTuneResult.success) {
      return NextResponse.json(
        { success: false, error: fineTuneResult.error || 'Failed to start fine-tuning' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Fine-tuning job started',
      data: {
        jobId: fineTuneResult.jobId,
        batchId: fineTuneResult.batchId,
        trainingExamples: exportResult.data.length,
        estimatedCost: costEstimate.estimatedCost,
        estimatedTokens: costEstimate.estimatedTokens
      }
    })
  } catch (error: any) {
    console.error('Error starting fine-tuning:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get stats for all model types
    const modelTypes: ModelType[] = ['issue_detector', 'strategy_planner', 'persona_matcher', 'sentiment_analyzer']
    
    const stats = await Promise.all(
      modelTypes.map(async (type) => {
        const exportStats = await TrainingDataExporter.getExportStats(type)
        return {
          modelType: type,
          ...exportStats
        }
      })
    )

    // Get deployed models
    const deployedModels = await FineTuner.getDeployedModels()

    return NextResponse.json({
      success: true,
      data: {
        trainingDataStats: stats,
        deployedModels
      }
    })
  } catch (error: any) {
    console.error('Error getting fine-tuning stats:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
