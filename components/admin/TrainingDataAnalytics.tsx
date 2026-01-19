'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Target } from 'lucide-react'

interface TrainingStats {
  total_corrections: number
  helpful_count: number
  not_helpful_count: number
  avg_alignment_score: number
  hallucination_rate: number
  top_issue_types: Array<{ type: string; count: number }>
  recent_corrections: Array<{
    id: string
    test_run_id: string
    correction_type: string
    is_helpful: boolean
    feedback_quality_score: number
    created_at: string
  }>
}

export default function TrainingDataAnalytics() {
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrainingStats()
  }, [])

  async function fetchTrainingStats() {
    try {
      const response = await fetch('/api/training/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching training stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No training data available yet
        </CardContent>
      </Card>
    )
  }

  const helpfulPercentage = stats.total_corrections > 0
    ? (stats.helpful_count / stats.total_corrections) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_corrections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Training samples collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Helpful Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {helpfulPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.helpful_count} helpful responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Alignment Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(stats.avg_alignment_score * 100).toFixed(1)}%
            </div>
            <Progress value={stats.avg_alignment_score * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Hallucination Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(stats.hallucination_rate * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Needs improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issue Types Breakdown */}
      {stats.top_issue_types.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
            <CardDescription>
              Most frequently reported AI issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.top_issue_types.map((issue) => {
                const percentage = stats.total_corrections > 0
                  ? (issue.count / stats.total_corrections) * 100
                  : 0
                
                return (
                  <div key={issue.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {issue.type.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {issue.count} reports
                        </span>
                        <Badge variant="outline">
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Corrections */}
      {stats.recent_corrections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>
              Latest human corrections and feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_corrections.map((correction) => (
                <div 
                  key={correction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {correction.is_helpful ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {correction.correction_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(correction.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Quality: {correction.feedback_quality_score}
                    </Badge>
                    {correction.is_helpful ? (
                      <Badge variant="default" className="bg-green-500">
                        Helpful
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        Needs Fix
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Training Progress
          </CardTitle>
          <CardDescription>
            How your feedback is improving AI performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Model Alignment</span>
                <span className="text-sm text-muted-foreground">
                  {(stats.avg_alignment_score * 100).toFixed(1)}% aligned
                </span>
              </div>
              <Progress value={stats.avg_alignment_score * 100} className="h-3" />
            </div>

            <div className="grid gap-3 md:grid-cols-3 pt-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total_corrections}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Training Samples
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.helpful_count}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Positive Examples
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.not_helpful_count}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Corrections Made
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
