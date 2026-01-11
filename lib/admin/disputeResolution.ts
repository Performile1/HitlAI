// Confidence Guarantee - Dispute Resolution Logic
import { SupabaseClient } from '@supabase/supabase-js'

export class DisputeResolutionManager {
  constructor(private supabase: SupabaseClient) {}

  async createDispute(
    testRunId: string,
    companyId: string,
    reason: string
  ): Promise<{ disputeId: string; humanCreditsGranted: number }> {
    // Get admin settings
    const { data: settings } = await this.supabase
      .from('admin_dispute_settings')
      .select('*')
      .single()

    const humanCredits = settings?.credit_multiplier || 10

    // Create dispute
    const { data: dispute } = await this.supabase
      .from('test_disputes')
      .insert({
        test_run_id: testRunId,
        company_id: companyId,
        reason,
        status: 'pending',
        human_validation_credits: humanCredits
      })
      .select()
      .single()

    // Grant credits for validation
    await this.supabase.rpc('add_credits', {
      p_company_id: companyId,
      p_amount: humanCredits
    })

    return {
      disputeId: dispute.id,
      humanCreditsGranted: humanCredits
    }
  }

  async resolveDispute(
    disputeId: string,
    aiWasCorrect: boolean,
    humanFindings: any[]
  ): Promise<{ refundAmount: number; penaltyFee: number }> {
    const { data: settings } = await this.supabase
      .from('admin_dispute_settings')
      .select('*')
      .single()

    const { data: dispute } = await this.supabase
      .from('test_disputes')
      .select('*, company_id')
      .eq('id', disputeId)
      .single()

    let refundAmount = 0
    let penaltyFee = 0

    if (aiWasCorrect) {
      // Company pays penalty for false dispute
      penaltyFee = settings?.penalty_fee || 5.00
      
      await this.supabase.from('credit_transactions').insert({
        company_id: dispute.company_id,
        amount: -Math.ceil(penaltyFee / 1.5), // Convert $ to credits
        type: 'penalty',
        description: 'False dispute penalty'
      })
    } else {
      // Company keeps human report for free (refund)
      refundAmount = dispute.human_validation_credits
      
      // Retrain AI with human evidence
      await this.retrainAIWithHumanData(dispute.test_run_id, humanFindings)
    }

    // Record resolution
    await this.supabase.from('dispute_resolutions').insert({
      dispute_id: disputeId,
      resolution: aiWasCorrect ? 'ai_correct' : 'ai_wrong',
      ai_was_correct: aiWasCorrect,
      penalty_fee: penaltyFee,
      refund_amount: refundAmount
    })

    await this.supabase
      .from('test_disputes')
      .update({ status: 'resolved' })
      .eq('id', disputeId)

    return { refundAmount, penaltyFee }
  }

  private async retrainAIWithHumanData(testRunId: string, humanFindings: any[]) {
    // Store human corrections as high-priority evidence
    for (const finding of humanFindings) {
      await this.supabase.from('human_insights').insert({
        test_run_id: testRunId,
        content: finding.description,
        severity_score: 5,
        evidence_type: 'ai_correction',
        validated_by_ai: false
      })
    }

    // Log AI learning event
    await this.supabase.from('ai_learning_events').insert({
      event_type: 'dispute_correction',
      test_run_id: testRunId,
      details: { human_findings: humanFindings }
    })
  }
}
