import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type ModelType = 'issue_detector' | 'strategy_planner' | 'persona_matcher' | 'sentiment_analyzer'

export interface TrainingExample {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
}

export class TrainingDataExporter {
  /**
   * Export training data in OpenAI fine-tuning format (JSONL)
   */
  static async exportForFineTuning(
    modelType: ModelType,
    options: {
      minQuality?: number
      requireHumanVerification?: boolean
      limit?: number
      excludeUsed?: boolean
    } = {}
  ): Promise<{ success: boolean; data?: TrainingExample[]; error?: string }> {
    try {
      const {
        minQuality = 4,
        requireHumanVerification = true,
        limit = 10000,
        excludeUsed = true
      } = options

      // Build query
      let query = supabase
        .from('ai_training_data')
        .select('*')
        .eq('is_high_quality', true)
        .gte('company_rating', minQuality)

      if (requireHumanVerification) {
        query = query.eq('human_verified', true)
      }

      if (excludeUsed) {
        query = query.eq('used_for_training', false)
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(limit)

      const { data, error } = await query

      if (error) {
        console.error('Error fetching training data:', error)
        return { success: false, error: error.message }
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'No training data available' }
      }

      // Format data based on model type
      const trainingExamples = data
        .map(item => this.formatTrainingExample(item, modelType))
        .filter(ex => ex !== null) as TrainingExample[]

      return { success: true, data: trainingExamples }
    } catch (error: any) {
      console.error('Exception exporting training data:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Format a single training example based on model type
   */
  private static formatTrainingExample(
    data: any,
    modelType: ModelType
  ): TrainingExample | null {
    try {
      const inputData = data.input_data
      const aiOutput = data.ai_output
      const humanLabels = data.human_labels

      // Use human labels if available, otherwise use AI output
      const groundTruth = humanLabels || aiOutput

      switch (modelType) {
        case 'issue_detector':
          return {
            messages: [
              {
                role: 'system',
                content: 'You are a UX testing AI specialized in detecting usability issues. Analyze the test results and identify friction points, bugs, and UX problems.'
              },
              {
                role: 'user',
                content: JSON.stringify({
                  url: inputData.url,
                  mission: inputData.mission,
                  persona: inputData.persona,
                  testType: inputData.testType
                })
              },
              {
                role: 'assistant',
                content: JSON.stringify({
                  issues: groundTruth.issuesConfirmed || aiOutput.issuesFound || [],
                  severity: groundTruth.severity || 'medium',
                  recommendations: groundTruth.recommendations || aiOutput.recommendations || []
                })
              }
            ]
          }

        case 'strategy_planner':
          return {
            messages: [
              {
                role: 'system',
                content: 'You are a test strategy planner. Create comprehensive test plans based on the mission and persona.'
              },
              {
                role: 'user',
                content: JSON.stringify({
                  url: inputData.url,
                  mission: inputData.mission,
                  persona: inputData.persona
                })
              },
              {
                role: 'assistant',
                content: JSON.stringify(aiOutput.strategy || {})
              }
            ]
          }

        case 'sentiment_analyzer':
          return {
            messages: [
              {
                role: 'system',
                content: 'You are a sentiment analyzer for UX testing. Analyze user experience and provide sentiment scores.'
              },
              {
                role: 'user',
                content: JSON.stringify({
                  testResults: aiOutput.testResults || {},
                  issues: aiOutput.issuesFound || []
                })
              },
              {
                role: 'assistant',
                content: JSON.stringify({
                  sentiment: groundTruth.sentiment || aiOutput.sentiment || 0,
                  reasoning: groundTruth.feedback || 'Analysis based on test results'
                })
              }
            ]
          }

        case 'persona_matcher':
          return {
            messages: [
              {
                role: 'system',
                content: 'You are a persona matching AI. Match test requirements with appropriate user personas.'
              },
              {
                role: 'user',
                content: JSON.stringify({
                  mission: inputData.mission,
                  testType: inputData.testType,
                  targetAudience: inputData.additionalContext?.targetAudience
                })
              },
              {
                role: 'assistant',
                content: JSON.stringify(inputData.persona)
              }
            ]
          }

        default:
          return null
      }
    } catch (error) {
      console.error('Error formatting training example:', error)
      return null
    }
  }

  /**
   * Save training data to JSONL file
   */
  static async saveToJSONL(
    trainingExamples: TrainingExample[],
    filename: string
  ): Promise<{ success: boolean; filepath?: string; error?: string }> {
    try {
      const jsonl = trainingExamples
        .map(example => JSON.stringify(example))
        .join('\n')

      const filepath = path.join(process.cwd(), 'training_data', filename)
      const dir = path.dirname(filepath)

      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(filepath, jsonl, 'utf-8')

      return { success: true, filepath }
    } catch (error: any) {
      console.error('Error saving JSONL file:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Validate training data format
   */
  static validateTrainingData(examples: TrainingExample[]): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (examples.length === 0) {
      errors.push('No training examples provided')
      return { valid: false, errors }
    }

    if (examples.length < 10) {
      errors.push('Minimum 10 training examples required for fine-tuning')
    }

    examples.forEach((example, index) => {
      if (!example.messages || example.messages.length === 0) {
        errors.push(`Example ${index}: No messages found`)
      }

      if (example.messages.length < 2) {
        errors.push(`Example ${index}: At least 2 messages required (user + assistant)`)
      }

      const hasUser = example.messages.some(m => m.role === 'user')
      const hasAssistant = example.messages.some(m => m.role === 'assistant')

      if (!hasUser) {
        errors.push(`Example ${index}: Missing user message`)
      }

      if (!hasAssistant) {
        errors.push(`Example ${index}: Missing assistant message`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get training data statistics
   */
  static async getExportStats(modelType: ModelType): Promise<{
    totalAvailable: number
    highQuality: number
    humanVerified: number
    unused: number
    readyForExport: number
  }> {
    try {
      const { data: all } = await supabase
        .from('ai_training_data')
        .select('id, is_high_quality, human_verified, used_for_training')

      if (!all) {
        return {
          totalAvailable: 0,
          highQuality: 0,
          humanVerified: 0,
          unused: 0,
          readyForExport: 0
        }
      }

      return {
        totalAvailable: all.length,
        highQuality: all.filter(d => d.is_high_quality).length,
        humanVerified: all.filter(d => d.human_verified).length,
        unused: all.filter(d => !d.used_for_training).length,
        readyForExport: all.filter(d => d.is_high_quality && d.human_verified && !d.used_for_training).length
      }
    } catch (error) {
      console.error('Error getting export stats:', error)
      return {
        totalAvailable: 0,
        highQuality: 0,
        humanVerified: 0,
        unused: 0,
        readyForExport: 0
      }
    }
  }
}
