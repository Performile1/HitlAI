'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Lock, Unlock, TrendingUp, Target, Zap } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface MilestoneData {
  milestone_name: string
  current_value: number
  target_value: number
  is_unlocked: boolean
  unlock_phase: string
  unlocked_at: string | null
}

interface FeatureData {
  feature_key: string
  feature_name: string
  description: string
  milestone_name: string
  is_unlocked: boolean
}

export default function MilestoneProgress({ companyId }: { companyId: string }) {
  const [milestones, setMilestones] = useState<MilestoneData[]>([])
  const [features, setFeatures] = useState<FeatureData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchMilestoneData()
  }, [companyId])

  async function fetchMilestoneData() {
    try {
      const [milestonesRes, featuresRes] = await Promise.all([
        supabase
          .from('platform_milestones')
          .select('*')
          .order('target_value', { ascending: true }),
        supabase
          .from('unlocked_features')
          .select('*')
          .eq('company_id', companyId)
      ])

      if (milestonesRes.data) setMilestones(milestonesRes.data)
      if (featuresRes.data) setFeatures(featuresRes.data)
    } catch (error) {
      console.error('Error fetching milestone data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'phase1': return 'bg-blue-500'
      case 'phase2': return 'bg-purple-500'
      case 'phase3': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'phase1': return 'Early Access'
      case 'phase2': return 'Growth'
      case 'phase3': return 'Enterprise'
      default: return phase
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentMilestone = milestones.find(m => !m.is_unlocked)
  const completedMilestones = milestones.filter(m => m.is_unlocked)
  const unlockedFeatures = features.filter(f => f.is_unlocked)
  const lockedFeatures = features.filter(f => !f.is_unlocked)

  return (
    <div className="space-y-6">
      {/* Current Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Progress
              </CardTitle>
              <CardDescription>
                {completedMilestones.length} of {milestones.length} milestones unlocked
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <TrendingUp className="h-4 w-4 mr-2" />
              {currentMilestone ? `${currentMilestone.current_value} tests` : 'All unlocked!'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Milestone Progress */}
          {currentMilestone && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{currentMilestone.milestone_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentMilestone.target_value - currentMilestone.current_value} tests remaining
                  </p>
                </div>
                <Badge className={getPhaseColor(currentMilestone.unlock_phase)}>
                  {getPhaseLabel(currentMilestone.unlock_phase)}
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={calculateProgress(currentMilestone.current_value, currentMilestone.target_value)} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{currentMilestone.current_value} completed</span>
                  <span>{currentMilestone.target_value} target</span>
                </div>
              </div>
            </div>
          )}

          {/* All Milestones List */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">All Milestones</h4>
            {milestones.map((milestone) => (
              <div 
                key={milestone.milestone_name}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  milestone.is_unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {milestone.is_unlocked ? (
                    <Unlock className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">{milestone.milestone_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {milestone.target_value} tests
                    </p>
                  </div>
                </div>
                {milestone.is_unlocked ? (
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    {calculateProgress(milestone.current_value, milestone.target_value).toFixed(0)}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Features */}
      {unlockedFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Unlocked Features
            </CardTitle>
            <CardDescription>
              Features you've earned through your testing milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {unlockedFeatures.map((feature) => (
                <div 
                  key={feature.feature_key}
                  className="p-4 rounded-lg border border-green-200 bg-green-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{feature.feature_name}</h4>
                    <Unlock className="h-4 w-4 text-green-600 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {feature.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {feature.milestone_name}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Features Preview */}
      {lockedFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-400" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              Features you'll unlock as you reach more milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {lockedFeatures.map((feature) => (
                <div 
                  key={feature.feature_key}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50 opacity-60"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">{feature.feature_name}</h4>
                    <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {feature.description}
                  </p>
                  <Badge variant="outline" className="text-xs bg-white">
                    Unlocks at {feature.milestone_name}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
