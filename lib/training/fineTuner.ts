import OpenAI from 'openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import * as fs from 'fs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface FineTuneJobConfig {
  modelType: string
  baseModel: string
  trainingFilePath: string
  suffix?: string
  hyperparameters?: {
    n_epochs?: number
    batch_size?: number
    learning_rate_multiplier?: number
  }
}

export class FineTuner {
  /**
   * Start a fine-tuning job with OpenAI
   */
  static async startFineTuning(config: FineTuneJobConfig): Promise<{
    success: boolean
    jobId?: string
    batchId?: string
    error?: string
  }> {
    try {
      const supabase = getSupabaseAdmin()
      // Create training batch record
      const { data: batch, error: batchError } = await supabase
        .from('training_batches')
        .insert({
          batch_name: `${config.modelType}_${Date.now()}`,
          model_type: config.modelType,
          fine_tune_status: 'uploading',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (batchError || !batch) {
        console.error('Error creating training batch:', batchError)
        return { success: false, error: batchError?.message || 'Failed to create batch' }
      }

      // Upload training file to OpenAI
      const fileStream = fs.createReadStream(config.trainingFilePath)
      const file = await openai.files.create({
        file: fileStream,
        purpose: 'fine-tune'
      })

      // Update batch with file ID
      await supabase
        .from('training_batches')
        .update({
          openai_file_id: file.id,
          training_file_path: config.trainingFilePath,
          fine_tune_status: 'training'
        })
        .eq('id', batch.id)

      // Create fine-tuning job
      const fineTuneJob = await openai.fineTuning.jobs.create({
        training_file: file.id,
        model: config.baseModel,
        suffix: config.suffix || `hitlai-${config.modelType}`,
        hyperparameters: config.hyperparameters || {}
      })

      // Update batch with job ID
      await supabase
        .from('training_batches')
        .update({
          fine_tune_job_id: fineTuneJob.id
        })
        .eq('id', batch.id)

      return {
        success: true,
        jobId: fineTuneJob.id,
        batchId: batch.id
      }
    } catch (error: any) {
      console.error('Error starting fine-tuning:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Check the status of a fine-tuning job
   */
  static async checkFineTuningStatus(jobId: string): Promise<{
    status: string
    fineTunedModel?: string
    error?: string
  }> {
    try {
      const supabase = getSupabaseAdmin()
      const job = await openai.fineTuning.jobs.retrieve(jobId)

      // Update batch status in database
      await supabase
        .from('training_batches')
        .update({
          fine_tune_status: job.status as any,
          updated_at: new Date().toISOString()
        })
        .eq('fine_tune_job_id', jobId)

      return {
        status: job.status,
        fineTunedModel: job.fine_tuned_model || undefined,
        error: job.error?.message
      }
    } catch (error: any) {
      console.error('Error checking fine-tuning status:', error)
      return {
        status: 'error',
        error: error.message
      }
    }
  }

  /**
   * Deploy a fine-tuned model
   */
  static async deployFineTunedModel(
    jobId: string,
    modelName: string,
    phase: string = 'phase2'
  ): Promise<{ success: boolean; modelId?: string; error?: string }> {
    try {
      const supabase = getSupabaseAdmin()
      // Get job status
      const status = await this.checkFineTuningStatus(jobId)

      if (status.status !== 'succeeded' || !status.fineTunedModel) {
        return {
          success: false,
          error: `Fine-tuning not complete. Status: ${status.status}`
        }
      }

      // Get batch info
      const { data: batch } = await supabase
        .from('training_batches')
        .select('*')
        .eq('fine_tune_job_id', jobId)
        .single()

      if (!batch) {
        return { success: false, error: 'Training batch not found' }
      }

      // Create model record
      const { data: model, error: modelError } = await supabase
        .from('ai_models')
        .insert({
          model_name: modelName,
          model_type: 'fine-tuned',
          base_model: 'gpt-4o-mini',
          provider: 'openai',
          model_id: status.fineTunedModel,
          training_batch_id: batch.id,
          trained_on_count: batch.training_data_count,
          status: 'deployed',
          deployed_at: new Date().toISOString(),
          phase,
          cost_per_1k_tokens: 0.0003
        })
        .select()
        .single()

      if (modelError || !model) {
        console.error('Error creating model record:', modelError)
        return { success: false, error: modelError?.message || 'Failed to create model' }
      }

      // Update batch with resulting model
      await supabase
        .from('training_batches')
        .update({
          resulting_model_id: model.id,
          completed_at: new Date().toISOString(),
          fine_tune_status: 'completed'
        })
        .eq('id', batch.id)

      return {
        success: true,
        modelId: model.id
      }
    } catch (error: any) {
      console.error('Error deploying fine-tuned model:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * List all fine-tuning jobs
   */
  static async listFineTuningJobs(limit: number = 20): Promise<any[]> {
    try {
      const jobs = await openai.fineTuning.jobs.list({ limit })
      return jobs.data
    } catch (error) {
      console.error('Error listing fine-tuning jobs:', error)
      return []
    }
  }

  /**
   * Cancel a fine-tuning job
   */
  static async cancelFineTuning(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseAdmin()
      await openai.fineTuning.jobs.cancel(jobId)

      // Update batch status
      await supabase
        .from('training_batches')
        .update({
          fine_tune_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('fine_tune_job_id', jobId)

      return { success: true }
    } catch (error: any) {
      console.error('Error canceling fine-tuning:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get fine-tuning job events (logs)
   */
  static async getFineTuningEvents(jobId: string): Promise<any[]> {
    try {
      const events = await openai.fineTuning.jobs.listEvents(jobId)
      return events.data
    } catch (error) {
      console.error('Error getting fine-tuning events:', error)
      return []
    }
  }

  /**
   * Estimate fine-tuning cost
   */
  static estimateFineTuningCost(trainingExamples: number, epochs: number = 3): {
    estimatedTokens: number
    estimatedCost: number
  } {
    // Rough estimate: ~1000 tokens per example
    const tokensPerExample = 1000
    const totalTokens = trainingExamples * tokensPerExample * epochs

    // OpenAI fine-tuning cost: $0.008 per 1K tokens for gpt-4o-mini
    const costPer1kTokens = 0.008
    const estimatedCost = (totalTokens / 1000) * costPer1kTokens

    return {
      estimatedTokens: totalTokens,
      estimatedCost: Math.round(estimatedCost * 100) / 100
    }
  }

  /**
   * Get deployed models
   */
  static async getDeployedModels(phase?: string): Promise<any[]> {
    try {
      const supabase = getSupabaseAdmin()
      let query = supabase
        .from('ai_models')
        .select('*')
        .eq('status', 'deployed')
        .order('deployed_at', { ascending: false })

      if (phase) {
        query = query.eq('phase', phase)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error getting deployed models:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Exception getting deployed models:', error)
      return []
    }
  }

  /**
   * Test a fine-tuned model
   */
  static async testFineTunedModel(
    modelId: string,
    testPrompt: string
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: testPrompt
          }
        ],
        max_tokens: 500
      })

      return {
        success: true,
        response: completion.choices[0]?.message?.content || 'No response'
      }
    } catch (error: any) {
      console.error('Error testing fine-tuned model:', error)
      return { success: false, error: error.message }
    }
  }
}
