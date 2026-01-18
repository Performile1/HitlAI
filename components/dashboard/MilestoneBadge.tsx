'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

interface MilestoneBadgeProps {
  companyId: string
  showDetails?: boolean
}

export default function MilestoneBadge({ companyId, showDetails = false }: MilestoneBadgeProps) {
  const [testCount, setTestCount] = useState(0)
  const [nextMilestone, setNextMilestone] = useState<{ name: string; target: number } | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProgress()
  }, [companyId])

  async function fetchProgress() {
    try {
      const { data: milestones } = await supabase
        .from('platform_milestones')
        .select('milestone_name, current_value, target_value, is_unlocked')
        .order('target_value', { ascending: true })

      if (milestones && milestones.length > 0) {
        const current = milestones[0].current_value
        setTestCount(current)

        const next = milestones.find(m => !m.is_unlocked)
        if (next) {
          setNextMilestone({
            name: next.milestone_name,
            target: next.target_value
          })
        }
      }
    } catch (error) {
      console.error('Error fetching milestone progress:', error)
    }
  }

  const progress = nextMilestone 
    ? Math.min((testCount / nextMilestone.target) * 100, 100)
    : 100

  if (showDetails) {
    return (
      <Link href="/dashboard/milestones">
        <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex-shrink-0">
            <div className="relative">
              <Trophy className="h-8 w-8 text-yellow-500" />
              {progress === 100 && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">
                {nextMilestone ? `Next: ${nextMilestone.name}` : 'All Milestones Complete!'}
              </p>
              <Badge variant="secondary" className="text-xs">
                {testCount} tests
              </Badge>
            </div>
            {nextMilestone && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href="/dashboard/milestones">
      <Badge 
        variant="outline" 
        className="cursor-pointer hover:bg-gray-100 transition-colors px-3 py-1.5"
      >
        <Target className="h-3 w-3 mr-1.5" />
        {testCount} / {nextMilestone?.target || testCount} tests
      </Badge>
    </Link>
  )
}
