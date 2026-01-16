import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface Milestone {
  id: string
  milestoneName: string
  milestoneType: string
  targetValue: number
  currentValue: number
  unlockPhase: string
  isUnlocked: boolean
  unlockedAt?: string
  progress: number
}

export interface PhaseStatus {
  phase: string
  unlocked: boolean
  unlockedAt?: string
  milestones: Milestone[]
  overallProgress: number
}

export class MilestoneProgressTracker {
  /**
   * Get all milestone progress
   */
  static async getMilestoneProgress(): Promise<Milestone[]> {
    try {
      const { data, error } = await supabase
        .from('platform_milestones')
        .select('*')
        .order('target_value', { ascending: true })

      if (error) {
        console.error('Error getting milestone progress:', error)
        return []
      }

      return data.map(m => ({
        id: m.id,
        milestoneName: m.milestone_name,
        milestoneType: m.milestone_type,
        targetValue: m.target_value,
        currentValue: m.current_value,
        unlockPhase: m.unlock_phase,
        isUnlocked: m.is_unlocked,
        unlockedAt: m.unlocked_at,
        progress: Math.round((m.current_value / m.target_value) * 100)
      }))
    } catch (error) {
      console.error('Exception getting milestone progress:', error)
      return []
    }
  }

  /**
   * Get progress for a specific phase
   */
  static async getPhaseProgress(phase: string): Promise<PhaseStatus | null> {
    try {
      const { data, error } = await supabase
        .from('platform_milestones')
        .select('*')
        .eq('unlock_phase', phase)
        .order('target_value', { ascending: true })

      if (error) {
        console.error('Error getting phase progress:', error)
        return null
      }

      const milestones = data.map(m => ({
        id: m.id,
        milestoneName: m.milestone_name,
        milestoneType: m.milestone_type,
        targetValue: m.target_value,
        currentValue: m.current_value,
        unlockPhase: m.unlock_phase,
        isUnlocked: m.is_unlocked,
        unlockedAt: m.unlocked_at,
        progress: Math.round((m.current_value / m.target_value) * 100)
      }))

      const allUnlocked = milestones.every(m => m.isUnlocked)
      const overallProgress = Math.round(
        milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
      )

      return {
        phase,
        unlocked: allUnlocked,
        unlockedAt: allUnlocked ? milestones[0]?.unlockedAt : undefined,
        milestones,
        overallProgress
      }
    } catch (error) {
      console.error('Exception getting phase progress:', error)
      return null
    }
  }

  /**
   * Get the next unlock milestone
   */
  static async getNextUnlock(): Promise<{
    phase: string
    milestone: Milestone
    daysEstimate: number
  } | null> {
    try {
      const milestones = await this.getMilestoneProgress()
      const nextMilestone = milestones.find(m => !m.isUnlocked)

      if (!nextMilestone) {
        return null
      }

      // Estimate days to unlock based on current progress rate
      const daysEstimate = await this.estimateUnlockDate(nextMilestone)

      return {
        phase: nextMilestone.unlockPhase,
        milestone: nextMilestone,
        daysEstimate
      }
    } catch (error) {
      console.error('Exception getting next unlock:', error)
      return null
    }
  }

  /**
   * Get current active phase
   */
  static async getCurrentPhase(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('get_current_phase')

      if (error) {
        console.error('Error getting current phase:', error)
        return 'phase1'
      }

      return data || 'phase1'
    } catch (error) {
      console.error('Exception getting current phase:', error)
      return 'phase1'
    }
  }

  /**
   * Estimate days until milestone unlock
   */
  static async estimateUnlockDate(milestone: Milestone): Promise<number> {
    try {
      // Get test completion rate from last 7 days
      const { data, error } = await supabase
        .from('test_runs')
        .select('created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (error || !data || data.length === 0) {
        return 999
      }

      const testsPerDay = data.length / 7
      const remainingTests = milestone.targetValue - milestone.currentValue

      if (testsPerDay === 0) {
        return 999
      }

      return Math.ceil(remainingTests / testsPerDay)
    } catch (error) {
      console.error('Exception estimating unlock date:', error)
      return 999
    }
  }

  /**
   * Get all phase statuses
   */
  static async getAllPhaseStatuses(): Promise<PhaseStatus[]> {
    try {
      const phases = ['phase2', 'phase3', 'phase4']
      const statuses: PhaseStatus[] = []

      for (const phase of phases) {
        const status = await this.getPhaseProgress(phase)
        if (status) {
          statuses.push(status)
        }
      }

      return statuses
    } catch (error) {
      console.error('Exception getting all phase statuses:', error)
      return []
    }
  }

  /**
   * Manually trigger milestone progress update
   */
  static async updateMilestoneProgress(): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_milestone_progress')

      if (error) {
        console.error('Error updating milestone progress:', error)
      }
    } catch (error) {
      console.error('Exception updating milestone progress:', error)
    }
  }

  /**
   * Get milestone progress summary for display
   */
  static async getProgressSummary(): Promise<{
    currentPhase: string
    nextUnlock: {
      phase: string
      milestoneName: string
      progress: number
      daysEstimate: number
    } | null
    phases: {
      phase1: { active: true }
      phase2: PhaseStatus | null
      phase3: PhaseStatus | null
      phase4: PhaseStatus | null
    }
  }> {
    try {
      const currentPhase = await this.getCurrentPhase()
      const nextUnlock = await this.getNextUnlock()
      const phase2 = await this.getPhaseProgress('phase2')
      const phase3 = await this.getPhaseProgress('phase3')
      const phase4 = await this.getPhaseProgress('phase4')

      return {
        currentPhase,
        nextUnlock: nextUnlock ? {
          phase: nextUnlock.phase,
          milestoneName: nextUnlock.milestone.milestoneName,
          progress: nextUnlock.milestone.progress,
          daysEstimate: nextUnlock.daysEstimate
        } : null,
        phases: {
          phase1: { active: true },
          phase2,
          phase3,
          phase4
        }
      }
    } catch (error) {
      console.error('Exception getting progress summary:', error)
      return {
        currentPhase: 'phase1',
        nextUnlock: null,
        phases: {
          phase1: { active: true },
          phase2: null,
          phase3: null,
          phase4: null
        }
      }
    }
  }
}
