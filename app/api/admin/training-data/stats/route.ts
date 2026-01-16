import { NextRequest, NextResponse } from 'next/server'
import { TrainingDataCollector } from '@/lib/training/dataCollector'
import { TrainingDataExporter, ModelType } from '@/lib/training/dataExporter'

export async function GET(request: NextRequest) {
  try {
    // Get overall training data stats
    const overallStats = await TrainingDataCollector.getTrainingDataStats()

    // Get stats per model type
    const modelTypes: ModelType[] = ['issue_detector', 'strategy_planner', 'persona_matcher', 'sentiment_analyzer']
    
    const modelTypeStats = await Promise.all(
      modelTypes.map(async (type) => {
        const stats = await TrainingDataExporter.getExportStats(type)
        return {
          modelType: type,
          ...stats
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        overall: overallStats,
        byModelType: modelTypeStats
      }
    })
  } catch (error: any) {
    console.error('Error getting training data stats:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
