'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, AlertCircle, CheckCircle, Clock, User, Users } from 'lucide-react'

interface AIPersona {
  id: string
  name: string
  age: number
  tech_literacy: string
  eyesight: string
  cognitive_load: string
  is_public: boolean
  created_at: string
}

interface HumanTester {
  id: string
  display_name: string
  age: number
  tech_literacy: string
  total_tests_completed: number
  average_rating: number
  is_available: boolean
  is_verified: boolean
  specialties: string[]
  created_at: string
}

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
  const [aiPersonas, setAiPersonas] = useState<AIPersona[]>([])
  const [humanTesters, setHumanTesters] = useState<HumanTester[]>([])
  const [twinMetrics, setTwinMetrics] = useState<DigitalTwin[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ai' | 'human' | 'metrics'>('ai')

  useEffect(() => {
    fetchTwins()
  }, [])

  const fetchTwins = async () => {
    try {
      const response = await fetch('/api/admin/digital-twins')
      if (!response.ok) throw new Error('Failed to fetch digital twins')
      
      const data = await response.json()
      setAiPersonas(data.aiPersonas || [])
      setHumanTesters(data.humanTesters || [])
      setTwinMetrics(data.twinMetrics || [])
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-2">Digital Twins & Testers</h1>
          <p className="text-slate-600">Unified view of AI personas and human testers</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('ai')}
            variant={activeTab === 'ai' ? 'default' : 'outline'}
            className={activeTab === 'ai' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Personas ({aiPersonas.length})
          </Button>
          <Button
            onClick={() => setActiveTab('human')}
            variant={activeTab === 'human' ? 'default' : 'outline'}
            className={activeTab === 'human' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Human Testers ({humanTesters.length})
          </Button>
          <Button
            onClick={() => setActiveTab('metrics')}
            variant={activeTab === 'metrics' ? 'default' : 'outline'}
            className={activeTab === 'metrics' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance Metrics ({twinMetrics.length})
          </Button>
        </div>

        {/* AI Personas Tab */}
        {activeTab === 'ai' && (
          <div className="grid gap-4">
            {aiPersonas.map((persona, index) => (
              <Card key={persona.id} className="card-hover shadow-lg hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">{persona.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            AI Persona
                          </span>
                          {persona.is_public && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Public
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                      <div className="text-xs text-slate-600 font-medium">Age</div>
                      <div className="text-lg font-bold text-blue-600">{persona.age}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                      <div className="text-xs text-slate-600 font-medium">Tech Literacy</div>
                      <div className="text-lg font-bold text-purple-600 capitalize">{persona.tech_literacy}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                      <div className="text-xs text-slate-600 font-medium">Eyesight</div>
                      <div className="text-lg font-bold text-green-600 capitalize">{persona.eyesight}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-100">
                      <div className="text-xs text-slate-600 font-medium">Cognitive Load</div>
                      <div className="text-lg font-bold text-orange-600 capitalize">{persona.cognitive_load}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {aiPersonas.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">No AI personas found</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Human Testers Tab */}
        {activeTab === 'human' && (
          <div className="grid gap-4">
            {humanTesters.map((tester, index) => (
              <Card key={tester.id} className="card-hover shadow-lg hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="bg-gradient-to-r from-slate-900 to-green-900 bg-clip-text text-transparent">{tester.display_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Human Tester
                          </span>
                          {tester.is_verified && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ✓ Verified
                            </span>
                          )}
                          {tester.is_available ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              Unavailable
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        ⭐ {tester.average_rating?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Rating</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                      <div className="text-xs text-slate-600 font-medium">Age</div>
                      <div className="text-lg font-bold text-blue-600">{tester.age}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                      <div className="text-xs text-slate-600 font-medium">Tech Literacy</div>
                      <div className="text-lg font-bold text-purple-600 capitalize">{tester.tech_literacy}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                      <div className="text-xs text-slate-600 font-medium">Tests Completed</div>
                      <div className="text-lg font-bold text-green-600">{tester.total_tests_completed || 0}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-100">
                      <div className="text-xs text-slate-600 font-medium">Specialties</div>
                      <div className="text-lg font-bold text-orange-600">{tester.specialties?.length || 0}</div>
                    </div>
                  </div>
                  {tester.specialties && tester.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tester.specialties.map((specialty, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {humanTesters.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">No human testers found</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Performance Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="grid gap-6">
            {twinMetrics.map((twin, index) => (
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

            {twinMetrics.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">No performance metrics available yet</p>
                  <p className="text-sm text-slate-500 mt-2">Metrics will appear after AI testers complete tests</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
