'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, TrendingUp, DollarSign, Award, Clock, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TesterPerformancePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [tester, setTester] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [recentPerf, setRecentPerf] = useState<any>(null)

  useEffect(() => {
    loadPerformanceData()
  }, [])

  const loadPerformanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: testerData } = await supabase
        .from('human_testers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const { data: historyData } = await supabase
        .from('tester_test_history')
        .select('*')
        .eq('tester_id', testerData?.id)
        .order('completed_at', { ascending: false })
        .limit(20)

      const { data: recentData } = await supabase
        .from('tester_recent_performance')
        .select('*')
        .eq('tester_id', testerData?.id)
        .single()

      setTester(testerData)
      setHistory(historyData || [])
      setRecentPerf(recentData)
    } catch (error) {
      console.error('Error loading performance:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalEarnings = () => {
    return history.reduce((sum, test) => sum + (test.amount_earned_usd || 0), 0)
  }

  const getNextTierRequirement = () => {
    const tiers = [
      { name: 'new', tests: 0, rating: 0 },
      { name: 'verified', tests: 50, rating: 3.5 },
      { name: 'expert', tests: 200, rating: 4.0 },
      { name: 'master', tests: 500, rating: 4.5 }
    ]
    const currentIndex = tiers.findIndex(t => t.name === tester?.tier)
    const nextTier = tiers[currentIndex + 1]
    if (!nextTier) return null
    
    const testsNeeded = Math.max(0, nextTier.tests - (tester?.total_tests_completed || 0))
    const ratingNeeded = Math.max(0, nextTier.rating - (tester?.average_rating || 0))
    
    return { ...nextTier, testsNeeded, ratingNeeded }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Award className="w-12 h-12 animate-pulse mx-auto mb-4 text-green-600" />
          <p className="text-slate-600">Loading your performance...</p>
        </div>
      </div>
    )
  }

  const nextTier = getNextTierRequirement()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-slate-900 to-green-900 bg-clip-text text-transparent">
          Your Performance Dashboard
        </h1>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg card-hover animate-fade-in-up">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Tests</p>
            <p className="text-3xl font-bold">{tester?.total_tests_completed || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg card-hover animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Average Rating</p>
            <p className="text-3xl font-bold">{tester?.average_rating?.toFixed(1) || '—'}</p>
            <p className="text-xs text-slate-500 mt-1">out of 5.0</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg card-hover animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold">${calculateTotalEarnings().toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg card-hover animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Current Tier</p>
            <p className="text-2xl font-bold capitalize">{tester?.tier || 'New'}</p>
            <p className="text-xs text-slate-500 mt-1">{tester?.platform_fee_percent}% platform fee</p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <h2 className="text-xl font-bold mb-6">Rating Breakdown</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Communication</span>
                <span className="text-sm font-bold">{tester?.avg_communication_rating?.toFixed(1) || '—'}/5.0</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${((tester?.avg_communication_rating || 0) / 5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Quality</span>
                <span className="text-sm font-bold">{tester?.avg_quality_rating?.toFixed(1) || '—'}/5.0</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${((tester?.avg_quality_rating || 0) / 5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Timeliness</span>
                <span className="text-sm font-bold">{tester?.avg_timeliness_rating?.toFixed(1) || '—'}/5.0</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${((tester?.avg_timeliness_rating || 0) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Would Work Again</p>
                <p className="text-2xl font-bold text-green-600">{tester?.would_work_again_percent?.toFixed(0) || 0}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total Ratings</p>
                <p className="text-2xl font-bold">{tester?.total_ratings || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        {nextTier && (
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 shadow-lg mb-8 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <h2 className="text-xl font-bold mb-6">Tier Progress</h2>
            
            <div className="flex justify-between mb-6">
              {['new', 'verified', 'expert', 'master'].map((tier, index) => {
                const isCurrent = tier === tester?.tier
                const isPast = ['new', 'verified', 'expert', 'master'].indexOf(tier) < ['new', 'verified', 'expert', 'master'].indexOf(tester?.tier || 'new')
                
                return (
                  <div key={tier} className="flex items-center">
                    <div className="text-center">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all
                        ${isPast ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' : 
                          isCurrent ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white ring-4 ring-purple-200' : 
                          'bg-slate-200 text-slate-500'}
                      `}>
                        {isPast ? '✓' : isCurrent ? '●' : '○'}
                      </div>
                      <p className="text-xs font-semibold capitalize">{tier}</p>
                      <p className="text-xs text-slate-500">
                        {tier === 'new' && '30% fee'}
                        {tier === 'verified' && '25% fee'}
                        {tier === 'expert' && '20% fee'}
                        {tier === 'master' && '15% fee'}
                      </p>
                    </div>
                    {index < 3 && <div className={`h-1 w-16 mx-2 ${isPast ? 'bg-purple-500' : 'bg-slate-200'}`} />}
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold mb-4">Next Tier: <span className="capitalize text-purple-600">{nextTier.name}</span></p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Tests Completed</span>
                    <span className="font-semibold">{tester?.total_tests_completed || 0} / {nextTier.tests}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${Math.min(((tester?.total_tests_completed || 0) / nextTier.tests) * 100, 100)}%` }}
                    />
                  </div>
                  {nextTier.testsNeeded > 0 && (
                    <p className="text-xs text-slate-500 mt-1">{nextTier.testsNeeded} more tests needed</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Average Rating</span>
                    <span className="font-semibold">{tester?.average_rating?.toFixed(1) || 0} / {nextTier.rating}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${Math.min(((tester?.average_rating || 0) / nextTier.rating) * 100, 100)}%` }}
                    />
                  </div>
                  {nextTier.ratingNeeded > 0 && (
                    <p className="text-xs text-slate-500 mt-1">Maintain {nextTier.rating}+ rating</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Tests */}
        <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <h2 className="text-xl font-bold mb-6">Recent Test History</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No tests completed yet</p>
              <p className="text-sm text-slate-500 mt-2">Complete your first test to start earning!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rating</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((test) => (
                    <tr key={test.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm">
                        {test.completed_at ? new Date(test.completed_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
                          {test.test_category?.replace('_', ' ') || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {test.completion_time_minutes ? `${test.completion_time_minutes} min` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-semibold">{test.company_rating || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-bold text-green-600">
                          ${test.amount_earned_usd?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Badges */}
        {tester?.badges && tester.badges.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mt-8 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
            <h2 className="text-xl font-bold mb-6">Badges Earned</h2>
            <div className="flex flex-wrap gap-4">
              {tester.badges.map((badge: string) => (
                <div key={badge} className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg px-4 py-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900 capitalize">{badge.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
