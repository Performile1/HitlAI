'use client'

import { useEffect, useState } from 'react'

interface PhaseStatus {
  phase: string
  unlocked: boolean
  unlockedAt?: string
  milestones: Array<{
    id: string
    milestoneName: string
    currentValue: number
    targetValue: number
    progress: number
    isUnlocked: boolean
  }>
  overallProgress: number
}

interface ProgressSummary {
  currentPhase: string
  phases: {
    phase1: { active: true }
    phase2: PhaseStatus | null
    phase3: PhaseStatus | null
    phase4: PhaseStatus | null
  }
}

export default function PhaseProgressCard() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/milestones')
      const data = await response.json()
      
      if (data.success) {
        setSummary(data.data)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const phases = [
    {
      key: 'phase1',
      label: 'Phase 1: Foundation',
      description: 'External APIs • Tiered reasoning • Training data collection',
      status: summary.phases.phase1,
      unlocked: true
    },
    {
      key: 'phase2',
      label: 'Phase 2: Fine-Tuned Models',
      description: 'Custom models • 50% cost reduction • 15% better accuracy',
      status: summary.phases.phase2,
      unlocked: summary.phases.phase2?.unlocked || false
    },
    {
      key: 'phase3',
      label: 'Phase 3: Self-Hosted',
      description: 'LLaMA • Mixtral • 70% cost reduction • 10x faster',
      status: summary.phases.phase3,
      unlocked: summary.phases.phase3?.unlocked || false
    },
    {
      key: 'phase4',
      label: 'Phase 4: Full Hybrid',
      description: 'Complete system • 80% cost reduction • 90% accuracy',
      status: summary.phases.phase4,
      unlocked: summary.phases.phase4?.unlocked || false
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">AI Evolution Progress</h2>
      
      <div className="space-y-4">
        {phases.map((phase, index) => {
          const isActive = summary.currentPhase === phase.key
          const opacity = phase.unlocked ? 'opacity-100' : index === 1 ? 'opacity-75' : index === 2 ? 'opacity-50' : 'opacity-30'
          const borderColor = phase.unlocked ? 'border-green-500' : isActive ? 'border-purple-500' : 'border-gray-300'
          
          return (
            <div key={phase.key} className={`border-l-4 ${borderColor} pl-4 ${opacity}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {phase.unlocked ? '✅' : '🔒'}
                  </span>
                  <span className="font-semibold text-lg">{phase.label}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    phase.unlocked 
                      ? 'bg-green-100 text-green-800' 
                      : isActive 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {phase.unlocked ? 'ACTIVE' : 'LOCKED'}
                  </span>
                </div>
                {phase.status && 'overallProgress' in phase.status && (
                  <span className="text-sm text-gray-600">
                    {phase.status.overallProgress}%
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
              
              {phase.status && 'milestones' in phase.status && phase.status.milestones && (
                <div className="space-y-2">
                  {phase.status.milestones.slice(0, 3).map((milestone: any) => (
                    <div key={milestone.id} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600">{milestone.milestoneName}</span>
                        <span className="font-semibold">
                          {milestone.currentValue}/{milestone.targetValue}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            milestone.isUnlocked ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.min(milestone.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Every test you run helps unlock the next phase.</strong> As we collect more data, 
          our AI improves and costs drop. You benefit from better quality and lower prices.
        </p>
      </div>
    </div>
  )
}
