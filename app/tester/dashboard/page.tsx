'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, CheckCircle, Clock, DollarSign, Star } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">{profile?.display_name}</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Available Tests</p>
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{availableTests}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">In Progress</p>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{inProgressTests}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Completed</p>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{completedTests}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Rating</p>
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {profile?.average_rating?.toFixed(1) || '—'}
            </p>
          </div>
        </div>

        {/* Verification Notice */}
        {!profile?.is_verified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-yellow-900 mb-2">Verification Pending</h3>
            <p className="text-sm text-yellow-700">
              Complete your first test to get verified and start receiving more assignments!
            </p>
          </div>
        )}

        {/* Test Assignments */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Your Test Assignments</h2>
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
                <div key={assignment.id} className="p-6 hover:bg-slate-50 transition">
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
                          <Button className="bg-green-600 hover:bg-green-700">
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
