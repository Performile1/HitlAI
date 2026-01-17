import { getSupabaseAdmin } from '@/lib/supabase/admin'

export interface TrainingDataInput {
  testRunId: string
  testerId?: string
  companyId?: string
  inputData: {
    url: string
    mission: string
    persona: any
    testType: string
    additionalContext?: any
  }
  aiOutput: {
    strategy?: any
    issuesFound?: any[]
    sentiment?: number
    recommendations?: any[]
    testResults?: any
  }
  humanLabels?: {
    issuesConfirmed?: string[]
    issuesMissed?: string[]
    falsePositives?: string[]
    rating?: number
    feedback?: string
  }
  companyRating?: number
  modelVersion?: string
}

export class TrainingDataCollector {
  /**
   * Capture training data from a completed test run
   */
  static async captureTrainingData(data: TrainingDataInput): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseAdmin()
      const { error } = await supabase.from('ai_training_data').insert({
        test_run_id: data.testRunId,
        tester_id: data.testerId || null,
        company_id: data.companyId || null,
        input_data: data.inputData,
        ai_output: data.aiOutput,
        human_labels: data.humanLabels || null,
        company_rating: data.companyRating || null,
        is_high_quality: data.companyRating ? data.companyRating >= 4 : false,
        human_verified: !!data.humanLabels,
        model_version: data.modelVersion || 'v1',
        test_type: data.inputData.testType,
        used_for_training: false
      })

      if (error) {
        console.error('Error capturing training data:', error)
        return { success: false, error: error.message }
      }

      // Update tester's training contribution if tester exists
      if (data.testerId) {
        await this.updateTrainingContribution(data.testerId)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Exception capturing training data:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update a tester's training contribution count
   */
  static async updateTrainingContribution(testerId: string): Promise<void> {
    try {
      const supabase = getSupabaseAdmin()
      // Get current training contribution stats
      const { data: stats } = await supabase
        .from('ai_training_data')
        .select('id, is_high_quality, human_verified')
        .eq('tester_id', testerId)

      if (!stats) return

      const totalContributions = stats.length
      const highQualityContributions = stats.filter(s => s.is_high_quality).length
      const verifiedContributions = stats.filter(s => s.human_verified).length

      // Update ai_training_contributions table if it exists
      const { error } = await supabase
        .from('ai_training_contributions')
        .upsert({
          tester_id: testerId,
          training_tests_completed: totalContributions,
          high_quality_contributions: highQualityContributions,
          verified_contributions: verifiedContributions,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'tester_id'
        })

      if (error) {
        console.error('Error updating training contribution:', error)
      }
    } catch (error) {
      console.error('Exception updating training contribution:', error)
    }
  }

  /**
   * Get training data statistics
   */
  static async getTrainingDataStats(): Promise<{
    total: number
    highQuality: number
    humanVerified: number
    readyForTraining: number
  }> {
    try {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase.rpc('get_training_data_stats')

      if (error) {
        console.error('Error getting training data stats:', error)
        return {
          total: 0,
          highQuality: 0,
          humanVerified: 0,
          readyForTraining: 0
        }
      }

      return {
        total: Number(data[0]?.total_count || 0),
        highQuality: Number(data[0]?.high_quality_count || 0),
        humanVerified: Number(data[0]?.human_verified_count || 0),
        readyForTraining: Number(data[0]?.ready_for_training || 0)
      }
    } catch (error) {
      console.error('Exception getting training data stats:', error)
      return {
        total: 0,
        highQuality: 0,
        humanVerified: 0,
        readyForTraining: 0
      }
    }
  }

  /**
   * Get training data for a specific test run
   */
  static async getTrainingDataByTestRun(testRunId: string) {
    try {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('ai_training_data')
        .select('*')
        .eq('test_run_id', testRunId)
        .single()

      if (error) {
        console.error('Error getting training data:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Exception getting training data:', error)
      return null
    }
  }

  /**
   * Mark training data as used for training
   */
  static async markAsUsedForTraining(trainingDataIds: string[], batchId: string): Promise<void> {
    try {
      const supabase = getSupabaseAdmin()
      const { error } = await supabase
        .from('ai_training_data')
        .update({
          used_for_training: true,
          training_batch_id: batchId,
          updated_at: new Date().toISOString()
        })
        .in('id', trainingDataIds)

      if (error) {
        console.error('Error marking data as used:', error)
      }
    } catch (error) {
      console.error('Exception marking data as used:', error)
    }
  }

  /**
   * Add human verification to training data
   */
  static async addHumanVerification(
    testRunId: string,
    humanLabels: {
      issuesConfirmed?: string[]
      issuesMissed?: string[]
      falsePositives?: string[]
      rating?: number
      feedback?: string
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseAdmin()
      const { error } = await supabase
        .from('ai_training_data')
        .update({
          human_labels: humanLabels,
          human_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('test_run_id', testRunId)

      if (error) {
        console.error('Error adding human verification:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Exception adding human verification:', error)
      return { success: false, error: error.message }
    }
  }
}
