'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface DigitalTwin {
  id: string
  twin_type: string
  twin_name: string
  accuracy_percent: number
  confidence_score: number
  total_training_tests: number
  total_predictions: number
  correct_predictions: number
  false_positives: number
  false_negatives: number
  status: 'training' | 'production' | 'needs_data' | 'deprecated'
  last_retrain_date: string | null
  next_retrain_date: string | null
  needs_more_data: boolean
  recommended_tests_needed: number
  created_at: string
  updated_at: string
}

export default function DigitalTwinsPage() {
  const [twins, setTwins] = useState<DigitalTwin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTwins()
  }, [])

  const fetchTwins = async () => {
    try {
      const response = await fetch('/api/admin/digital-twins')
      if (!response.ok) throw new Error('Failed to fetch digital twins')
      
      const data = await response.json()
      setTwins(data.twins)
    } catch (error) {
      console.error('Error fetching digital twins:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'production':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'training':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'needs_data':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production':
        return 'bg-green-100 text-green-800'
      case 'training':
        return 'bg-blue-100 text-blue-800'
      case 'needs_data':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'from-green-600 to-emerald-600'
    if (accuracy >= 80) return 'from-blue-600 to-indigo-600'
    if (accuracy >= 70) return 'from-orange-600 to-yellow-600'
    return 'from-red-600 to-rose-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading digital twins...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 p-8 relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-2">AI Digital Twin Performance</h1>
          <p className="text-slate-600">Monitor and manage AI testing models</p>
        </div>

        <div className="grid gap-6">
          {twins.map((twin, index) => (
            <Card key={twin.id} className="card-hover shadow-lg hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500 rounded-full blur-lg opacity-30 animate-pulse" />
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-lg relative">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">{twin.twin_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {getStatusIcon(twin.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(twin.status)}`}>
                          {twin.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${getAccuracyColor(twin.accuracy_percent)} bg-clip-text text-transparent`}>
                      {twin.accuracy_percent.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-500 font-medium">Accuracy</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <div className="text-sm text-slate-600 font-medium">Training Tests</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{twin.total_training_tests}</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                    <div className="text-sm text-slate-600 font-medium">Total Predictions</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{twin.total_predictions}</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                    <div className="text-sm text-slate-600 font-medium">Confidence</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{(twin.confidence_score * 100).toFixed(0)}%</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-100">
                    <div className="text-sm text-slate-600 font-medium">False Positives</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{twin.false_positives}</div>
                  </div>
                </div>

                {twin.needs_more_data && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-900 mb-1">Low Confidence - More Data Needed</h4>
                        <p className="text-sm text-orange-800 mb-3">
                          This twin needs approximately {twin.recommended_tests_needed} more human tests to improve accuracy.
                        </p>
                        <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100 transition-all duration-300">
                          Fund {twin.recommended_tests_needed} Tests
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div>
                    Last Retrain: {twin.last_retrain_date ? new Date(twin.last_retrain_date).toLocaleDateString() : 'Never'}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                      Force Retrain
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {twins.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600">No digital twins found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
