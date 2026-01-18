'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Sparkles, X, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import Link from 'next/link'

interface UnlockedFeature {
  feature_key: string
  feature_name: string
  description: string
  milestone_name: string
  unlocked_at: string
}

interface MilestoneCelebrationProps {
  companyId: string
}

export default function MilestoneCelebration({ companyId }: MilestoneCelebrationProps) {
  const [recentUnlocks, setRecentUnlocks] = useState<UnlockedFeature[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    checkRecentUnlocks()
  }, [companyId])

  async function checkRecentUnlocks() {
    try {
      const response = await fetch(`/api/milestones/recent-unlocks?companyId=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setRecentUnlocks(data.unlocks || [])
        
        if (data.unlocks && data.unlocks.length > 0) {
          triggerConfetti()
        }
      }
    } catch (error) {
      console.error('Error checking recent unlocks:', error)
    }
  }

  function triggerConfetti() {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  function handleDismiss(featureKey: string) {
    setDismissed(prev => new Set(prev).add(featureKey))
  }

  const visibleUnlocks = recentUnlocks.filter(unlock => !dismissed.has(unlock.feature_key))

  if (visibleUnlocks.length === 0) return null

  return (
    <div className="space-y-4">
      {visibleUnlocks.map((unlock) => (
        <Card key={unlock.feature_key} className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    New Feature Unlocked!
                  </CardTitle>
                  <CardDescription>
                    Congratulations on reaching {unlock.milestone_name}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(unlock.feature_key)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{unlock.feature_name}</h3>
                <p className="text-sm text-muted-foreground">{unlock.description}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {unlock.milestone_name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Unlocked {new Date(unlock.unlocked_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/dashboard/features/${unlock.feature_key}`} className="flex-1">
                  <Button className="w-full" variant="default">
                    Explore Feature
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard/milestones">
                  <Button variant="outline">
                    View All Progress
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
