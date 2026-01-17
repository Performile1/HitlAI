'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, CheckCircle, Clock, DollarSign, Star, Sparkles, Award } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface TesterProfile {
  id: string
  display_name: string
  total_tests_completed: number
  average_rating: number
  is_verified: boolean
}

interface Assignment {
  id: string
  status: string
  assigned_at: string
  test_request: {
    title: string
    url: string
    mission: string
  }
}

export default function TesterDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<TesterProfile | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/tester/login')
        return
      }

      // Get tester profile
      const { data: testerData } = await supabase
        .from('human_testers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!testerData) {
        router.push('/tester/signup')
        return
      }

      setProfile(testerData)

      // Get assignments
      const { data: assignmentsData } = await supabase
        .from('human_test_assignments')
        .select(`
          *,
          test_request:test_requests(title, url, mission)
        `)
        .eq('tester_id', testerData.id)
        .order('assigned_at', { ascending: false })
        .limit(10)

      setAssignments(assignmentsData || [])
      
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const availableTests = assignments.filter(a => a.status === 'assigned').length
  const inProgressTests = assignments.filter(a => a.status === 'in_progress').length
  const completedTests = profile?.total_tests_completed || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />
      
      <header className="glass-effect border-b border-white/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-30 animate-pulse" />
                <Brain className="w-8 h-8 text-green-600 relative" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-green-900 bg-clip-text text-transparent">{profile?.display_name}</h1>
                <p className="text-sm text-slate-600">
                  {profile?.is_verified ? '✓ Verified Tester' : 'Pending Verification'}
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-6 card-hover shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">Available Tests</p>
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{availableTests}</p>
          </div>

          <div className="group bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6 card-hover shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">In Progress</p>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{inProgressTests}</p>
          </div>

          <div className="group bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-6 card-hover shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">Completed</p>
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{completedTests}</p>
          </div>

          <div className="group bg-gradient-to-br from-yellow-50 to-white rounded-xl border border-yellow-100 p-6 card-hover shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">Rating</p>
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {profile?.average_rating?.toFixed(1) || '—'}
            </p>
          </div>
        </div>

        {/* Founding Tester CTA */}
        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 border-2 border-purple-200 rounded-xl p-6 mb-8 shadow-xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-lg text-slate-900">Join the Founding Tester Program</h3>
              </div>
              <p className="text-slate-700 mb-4">
                Earn up to <strong className="text-green-600">40% revenue share</strong> + <strong className="text-purple-600">0.05% equity</strong>. 
                Help train our AI and get rewarded for your contributions. Limited spots available!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/founding-tester">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                    <Award className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                </Link>
                <Link href="/founding-tester">
                  <Button variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Notice */}
        {!profile?.is_verified && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8 shadow-lg animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <h3 className="font-semibold text-yellow-900 mb-2">Verification Pending</h3>
            <p className="text-sm text-yellow-700">
              Complete your first test to get verified and start receiving more assignments!
            </p>
          </div>
        )}

        {/* Test Assignments */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-xl animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-green-900 bg-clip-text text-transparent">Your Test Assignments</h2>
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No assignments yet</h3>
              <p className="text-slate-600">
                We'll notify you when tests matching your profile become available
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-6 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-transparent transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {assignment.test_request.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {assignment.test_request.url}
                      </p>
                      <p className="text-sm text-slate-700 mb-3">
                        {assignment.test_request.mission}
                      </p>
                      <p className="text-xs text-slate-500">
                        Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-6">
                      {assignment.status === 'assigned' && (
                        <Link href={`/tester/tests/${assignment.id}`}>
                          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300">
                            Start Test
                          </Button>
                        </Link>
                      )}
                      {assignment.status === 'in_progress' && (
                        <Link href={`/tester/tests/${assignment.id}`}>
                          <Button variant="outline">
                            Continue
                          </Button>
                        </Link>
                      )}
                      {assignment.status === 'completed' && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
