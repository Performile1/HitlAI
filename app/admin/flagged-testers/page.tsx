'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, User, Bot, CheckCircle, XCircle, Clock, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FlaggedTester {
  tester_type: 'human' | 'ai'
  tester_id: string
  tester_name: string
  rating: string
  total_evaluations: number
  is_flagged: boolean
  flagged_at: string | null
  flag_reason: string | null
  auto_disabled: boolean
  disabled_at: string | null
  disabled_reason: string | null
}

export default function FlaggedTestersPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [flaggedTesters, setFlaggedTesters] = useState<FlaggedTester[]>([])
  const [filter, setFilter] = useState<'all' | 'human' | 'ai'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'disabled'>('all')

  useEffect(() => {
    loadFlaggedTesters()
  }, [])

  const loadFlaggedTesters = async () => {
    try {
      const { data, error } = await supabase
        .from('all_flagged_testers')
        .select('*')
        .order('flagged_at', { ascending: false })

      if (error) throw error
      setFlaggedTesters(data || [])
    } catch (error) {
      console.error('Error loading flagged testers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnableTester = async (testerId: string, testerType: 'human' | 'ai') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (testerType === 'human') {
        await supabase
          .from('human_testers')
          .update({
            is_flagged: false,
            auto_disabled: false,
            is_available: true,
            flagged_at: null,
            disabled_at: null
          })
          .eq('id', testerId)

        // Log admin action
        await supabase.from('admin_action_log').insert({
          action_type: 'manual_enable',
          target_type: 'human_tester',
          target_id: testerId,
          reason: 'Manually enabled by admin',
          performed_by: user.id
        })
      } else {
        await supabase
          .from('ai_persona_ratings')
          .update({
            is_flagged: false,
            auto_disabled: false,
            flagged_at: null,
            disabled_at: null
          })
          .eq('persona_id', testerId)

        await supabase.from('admin_action_log').insert({
          action_type: 'manual_enable',
          target_type: 'ai_persona',
          target_id: testerId,
          reason: 'Manually enabled by admin',
          performed_by: user.id
        })
      }

      loadFlaggedTesters()
    } catch (error) {
      console.error('Error enabling tester:', error)
    }
  }

  const handleDisableTester = async (testerId: string, testerType: 'human' | 'ai') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (testerType === 'human') {
        await supabase
          .from('human_testers')
          .update({
            auto_disabled: true,
            is_available: false,
            disabled_at: new Date().toISOString(),
            disabled_reason: 'Manually disabled by admin'
          })
          .eq('id', testerId)

        await supabase.from('admin_action_log').insert({
          action_type: 'manual_disable',
          target_type: 'human_tester',
          target_id: testerId,
          reason: 'Manually disabled by admin',
          performed_by: user.id
        })
      } else {
        await supabase
          .from('ai_persona_ratings')
          .update({
            auto_disabled: true,
            disabled_at: new Date().toISOString(),
            disabled_reason: 'Manually disabled by admin'
          })
          .eq('persona_id', testerId)

        await supabase.from('admin_action_log').insert({
          action_type: 'manual_disable',
          target_type: 'ai_persona',
          target_id: testerId,
          reason: 'Manually disabled by admin',
          performed_by: user.id
        })
      }

      loadFlaggedTesters()
    } catch (error) {
      console.error('Error disabling tester:', error)
    }
  }

  const filteredTesters = flaggedTesters.filter(tester => {
    if (filter !== 'all' && tester.tester_type !== filter) return false
    if (statusFilter === 'flagged' && !tester.is_flagged) return false
    if (statusFilter === 'disabled' && !tester.auto_disabled) return false
    return true
  })

  const stats = {
    total: flaggedTesters.length,
    human: flaggedTesters.filter(t => t.tester_type === 'human').length,
    ai: flaggedTesters.filter(t => t.tester_type === 'ai').length,
    flagged: flaggedTesters.filter(t => t.is_flagged && !t.auto_disabled).length,
    disabled: flaggedTesters.filter(t => t.auto_disabled).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 animate-pulse mx-auto mb-4 text-orange-600" />
          <p className="text-slate-600">Loading flagged testers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-orange-900 bg-clip-text text-transparent mb-2">
            Flagged Testers
          </h1>
          <p className="text-slate-600">Monitor and manage low-rated testers</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="animate-fade-in-up">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Flagged</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.total}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Human Testers</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.human}</p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">AI Testers</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.ai}</p>
                </div>
                <Bot className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Flagged Only</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.flagged}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Auto-Disabled</p>
                  <p className="text-3xl font-bold text-red-600">{stats.disabled}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-6 flex gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Tester Type</label>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === 'human' ? 'default' : 'outline'}
                onClick={() => setFilter('human')}
                size="sm"
              >
                Human
              </Button>
              <Button
                variant={filter === 'ai' ? 'default' : 'outline'}
                onClick={() => setFilter('ai')}
                size="sm"
              >
                AI
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'flagged' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('flagged')}
                size="sm"
              >
                Flagged
              </Button>
              <Button
                variant={statusFilter === 'disabled' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('disabled')}
                size="sm"
              >
                Disabled
              </Button>
            </div>
          </div>
        </div>

        {/* Flagged Testers List */}
        <div className="space-y-4">
          {filteredTesters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p className="text-slate-600">No flagged testers found</p>
                <p className="text-sm text-slate-500 mt-2">All testers are performing well!</p>
              </CardContent>
            </Card>
          ) : (
            filteredTesters.map((tester, index) => (
              <Card key={tester.tester_id} className="card-hover animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tester.tester_type === 'human' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {tester.tester_type === 'human' ? (
                          <User className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Bot className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle>{tester.tester_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tester.tester_type === 'human' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {tester.tester_type === 'human' ? 'Human Tester' : 'AI Tester'}
                          </span>
                          {tester.auto_disabled && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Auto-Disabled
                            </span>
                          )}
                          {tester.is_flagged && !tester.auto_disabled && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Flagged
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{tester.rating}</div>
                      <div className="text-sm text-slate-500">{tester.total_evaluations} evaluations</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tester.is_flagged && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-yellow-900">Flagged for Review</p>
                            <p className="text-sm text-yellow-800 mt-1">{tester.flag_reason}</p>
                            {tester.flagged_at && (
                              <p className="text-xs text-yellow-700 mt-2">
                                Flagged {new Date(tester.flagged_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {tester.auto_disabled && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-red-900">Auto-Disabled</p>
                            <p className="text-sm text-red-800 mt-1">{tester.disabled_reason}</p>
                            {tester.disabled_at && (
                              <p className="text-xs text-red-700 mt-2">
                                Disabled {new Date(tester.disabled_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {tester.auto_disabled ? (
                        <Button
                          onClick={() => handleEnableTester(tester.tester_id, tester.tester_type)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Enable Tester
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleDisableTester(tester.tester_id, tester.tester_type)}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Disable Tester
                        </Button>
                      )}
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
