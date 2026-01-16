'use client'

import { useEffect, useState } from 'react'

interface ProgressBannerProps {
  className?: string
}

interface NextUnlock {
  phase: string
  milestoneName: string
  progress: number
  daysEstimate: number
}

export default function ProgressBanner({ className = '' }: ProgressBannerProps) {
  const [nextUnlock, setNextUnlock] = useState<NextUnlock | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/milestones')
      const data = await response.json()
      
      if (data.success && data.data.nextUnlock) {
        setNextUnlock(data.data.nextUnlock)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !nextUnlock) {
    return null
  }

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      phase2: 'Fine-Tuned Models',
      phase3: 'Self-Hosted AI',
      phase4: 'Full Hybrid System'
    }
    return labels[phase] || phase
  }

  const getPhaseDescription = (phase: string) => {
    const descriptions: Record<string, string> = {
      phase2: '50% cost reduction • 15% better accuracy',
      phase3: '70% cost reduction • 10x faster',
      phase4: '80% cost reduction • 90% accuracy'
    }
    return descriptions[phase] || ''
  }

  return (
    <div className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎯</span>
              <div className="text-sm font-semibold">
                Next Unlock: {getPhaseLabel(nextUnlock.phase)}
              </div>
            </div>
            <div className="text-xs opacity-90">
              {getPhaseDescription(nextUnlock.phase)}
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none md:w-64">
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(nextUnlock.progress, 100)}%` }}
                />
              </div>
              <div className="text-xs mt-1 text-center md:text-left">
                {nextUnlock.progress}% complete
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-semibold">
                {nextUnlock.daysEstimate < 999 ? `~${nextUnlock.daysEstimate} days` : 'TBD'}
              </div>
              <div className="text-xs opacity-90">to unlock</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
