/**
 * Milestone Tracker Service
 * Tracks company progress toward milestones and manages feature unlocks
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type MilestoneLevel = '1k' | '5k' | '10k'

export interface MilestoneProgress {
  companyId: string
  currentTests: number
  nextMilestone: MilestoneLevel | null
  testsUntilNext: number
  unlockedFeatures: string[]
  progress: {
    to1k: number
    to5k: number
    to10k: number
  }
}

export interface UnlockedFeature {
  featureKey: string
  featureName: string
  description: string
  unlockedAt: string
  milestoneLevel: MilestoneLevel
}

const MILESTONE_THRESHOLDS = {
  '1k': 1000,
  '5k': 5000,
  '10k': 10000
} as const

const MILESTONE_FEATURES = {
  '1k': [
    {
      key: 'advanced_analytics',
      name: 'Advanced Analytics Dashboard',
      description: 'Detailed insights, trends, and predictive analytics'
    },
    {
      key: 'custom_personas',
      name: 'Custom Persona Creation',
      description: 'Create unlimited custom testing personas'
    },
    {
      key: 'api_access',
      name: 'API Access',
      description: 'Full REST API access for integrations'
    },
    {
      key: 'priority_support',
      name: 'Priority Support',
      description: '24/7 priority customer support'
    }
  ],
  '5k': [
    {
      key: 'white_label',
      name: 'White Label Reports',
      description: 'Branded test reports with your company logo'
    },
    {
      key: 'dedicated_account_manager',
      name: 'Dedicated Account Manager',
      description: 'Personal account manager for strategic guidance'
    },
    {
      key: 'custom_integrations',
      name: 'Custom Integrations',
      description: 'Custom integration development support'
    },
    {
      key: 'advanced_ai_models',
      name: 'Advanced AI Models',
      description: 'Access to premium AI testing models'
    }
  ],
  '10k': [
    {
      key: 'enterprise_sla',
      name: 'Enterprise SLA',
      description: '99.99% uptime guarantee with dedicated infrastructure'
    },
    {
      key: 'custom_ai_training',
      name: 'Custom AI Model Training',
      description: 'Train AI models on your specific product and requirements'
    },
    {
      key: 'unlimited_seats',
      name: 'Unlimited Team Seats',
      description: 'Add unlimited team members at no extra cost'
    },
    {
      key: 'strategic_partnership',
      name: 'Strategic Partnership',
      description: 'Co-development opportunities and product roadmap influence'
    }
  ]
} as const

export class MilestoneTracker {
  /**
   * Get current milestone progress for a company
   */
  static async getProgress(companyId: string): Promise<MilestoneProgress> {
    const supabase = getSupabaseAdmin()

    // Get total completed tests
    const { data: testData, error: testError } = await supabase
      .from('test_runs')
      .select('id')
      .eq('company_id', companyId)
      .eq('status', 'completed')

    if (testError) throw testError

    const currentTests = testData?.length || 0

    // Get unlocked features
    const { data: unlockData } = await supabase
      .from('milestone_unlocks')
      .select('feature_key')
      .eq('company_id', companyId)

    const unlockedFeatures = unlockData?.map(u => u.feature_key) || []

    // Calculate next milestone
    let nextMilestone: MilestoneLevel | null = null
    let testsUntilNext = 0

    if (currentTests < MILESTONE_THRESHOLDS['1k']) {
      nextMilestone = '1k'
      testsUntilNext = MILESTONE_THRESHOLDS['1k'] - currentTests
    } else if (currentTests < MILESTONE_THRESHOLDS['5k']) {
      nextMilestone = '5k'
      testsUntilNext = MILESTONE_THRESHOLDS['5k'] - currentTests
    } else if (currentTests < MILESTONE_THRESHOLDS['10k']) {
      nextMilestone = '10k'
      testsUntilNext = MILESTONE_THRESHOLDS['10k'] - currentTests
    }

    return {
      companyId,
      currentTests,
      nextMilestone,
      testsUntilNext,
      unlockedFeatures,
      progress: {
        to1k: Math.min((currentTests / MILESTONE_THRESHOLDS['1k']) * 100, 100),
        to5k: Math.min((currentTests / MILESTONE_THRESHOLDS['5k']) * 100, 100),
        to10k: Math.min((currentTests / MILESTONE_THRESHOLDS['10k']) * 100, 100)
      }
    }
  }

  /**
   * Check if a company has unlocked a specific feature
   */
  static async hasFeature(companyId: string, featureKey: string): Promise<boolean> {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('milestone_unlocks')
      .select('id')
      .eq('company_id', companyId)
      .eq('feature_key', featureKey)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return !!data
  }

  /**
   * Check milestones and unlock features when thresholds are reached
   */
  static async checkAndUnlockMilestones(companyId: string): Promise<UnlockedFeature[]> {
    const supabase = getSupabaseAdmin()
    const progress = await this.getProgress(companyId)
    const newlyUnlocked: UnlockedFeature[] = []

    // Check each milestone level
    for (const [level, threshold] of Object.entries(MILESTONE_THRESHOLDS)) {
      if (progress.currentTests >= threshold) {
        const milestoneLevel = level as MilestoneLevel

        // Check if milestone progress record exists
        const { data: milestoneData } = await supabase
          .from('milestone_progress')
          .select('*')
          .eq('company_id', companyId)
          .eq('milestone_level', milestoneLevel)
          .single()

        if (!milestoneData) {
          // Create milestone progress record
          await supabase
            .from('milestone_progress')
            .insert({
              company_id: companyId,
              milestone_level: milestoneLevel,
              tests_completed: progress.currentTests,
              achieved: true,
              achieved_at: new Date().toISOString()
            })

          // Unlock all features for this milestone
          const features = MILESTONE_FEATURES[milestoneLevel]
          
          for (const feature of features) {
            // Check if already unlocked
            const hasFeature = await this.hasFeature(companyId, feature.key)
            
            if (!hasFeature) {
              const { data: unlockData } = await supabase
                .from('milestone_unlocks')
                .insert({
                  company_id: companyId,
                  feature_key: feature.key,
                  feature_name: feature.name,
                  milestone_level: milestoneLevel,
                  unlocked_at: new Date().toISOString()
                })
                .select()
                .single()

              if (unlockData) {
                newlyUnlocked.push({
                  featureKey: feature.key,
                  featureName: feature.name,
                  description: feature.description,
                  unlockedAt: unlockData.unlocked_at,
                  milestoneLevel
                })
              }
            }
          }
        }
      }
    }

    return newlyUnlocked
  }

  /**
   * Get all unlocked features for a company
   */
  static async getUnlockedFeatures(companyId: string): Promise<UnlockedFeature[]> {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('milestone_unlocks')
      .select('*')
      .eq('company_id', companyId)
      .order('unlocked_at', { ascending: false })

    if (error) throw error

    return data.map(unlock => ({
      featureKey: unlock.feature_key,
      featureName: unlock.feature_name,
      description: this.getFeatureDescription(unlock.feature_key),
      unlockedAt: unlock.unlocked_at,
      milestoneLevel: unlock.milestone_level
    }))
  }

  /**
   * Get feature description from feature key
   */
  private static getFeatureDescription(featureKey: string): string {
    for (const features of Object.values(MILESTONE_FEATURES)) {
      const feature = features.find(f => f.key === featureKey)
      if (feature) return feature.description
    }
    return ''
  }

  /**
   * Get all available features by milestone level
   */
  static getMilestoneFeatures(level: MilestoneLevel) {
    return MILESTONE_FEATURES[level]
  }

  /**
   * Get all milestone levels and their thresholds
   */
  static getMilestoneThresholds() {
    return MILESTONE_THRESHOLDS
  }

  /**
   * Notify company about newly unlocked features
   */
  static async notifyUnlocks(companyId: string, unlockedFeatures: UnlockedFeature[]): Promise<void> {
    if (unlockedFeatures.length === 0) return

    const supabase = getSupabaseAdmin()

    // Get company details
    const { data: company } = await supabase
      .from('companies')
      .select('company_name, contact_email')
      .eq('id', companyId)
      .single()

    if (!company) return

    // TODO: Send email notification
    console.log(`[MilestoneTracker] Company ${company.company_name} unlocked ${unlockedFeatures.length} new features:`)
    unlockedFeatures.forEach(feature => {
      console.log(`  - ${feature.featureName} (${feature.milestoneLevel})`)
    })

    // TODO: Create in-app notification
    // TODO: Send webhook if configured
  }
}
