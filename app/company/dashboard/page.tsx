'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Plus, Clock, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Company {
  id: string
  name: string
  plan_type: string
  monthly_test_quota: number
  tests_used_this_month: number
}

interface TestRequest {
  id: string
  title: string
  url: string
  test_type: string
  status: string
  created_at: string
}

export default function CompanyDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<Company | null>(null)
  const [testRequests, setTestRequests] = useState<TestRequest[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/company/login')
        return
      }

      // Get company membership
      const { data: membership } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        router.push('/company/signup')
        return
      }

      // Get company details
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', membership.company_id)
        .single()

      setCompany(companyData)

      // Get test requests
      const { data: requests } = await supabase
        .from('test_requests')
        .select('*')
        .eq('company_id', membership.company_id)
        .order('created_at', { ascending: false })
        .limit(10)

      setTestRequests(requests || [])
      
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
          <Brain className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const quotaPercentage = company ? (company.tests_used_this_month / company.monthly_test_quota) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">{company?.name}</h1>
                <p className="text-sm text-slate-600 capitalize">{company?.plan_type} Plan</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/company/tests/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Test
                </Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Tests This Month</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {company?.tests_used_this_month || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              of {company?.monthly_test_quota || 0} quota
            </p>
            <div className="mt-3 bg-slate-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">In Progress</p>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {testRequests.filter(t => t.status === 'in_progress').length}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Completed</p>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {testRequests.filter(t => t.status === 'completed').length}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Pending</p>
              <AlertCircle className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {testRequests.filter(t => t.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Tests</h2>
          </div>

          {testRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No tests yet</h3>
              <p className="text-slate-600 mb-6">Create your first test to get started</p>
              <Link href="/company/tests/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {testRequests.map((test) => (
                <Link 
                  key={test.id} 
                  href={`/company/tests/${test.id}`}
                  className="block p-6 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{test.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{test.url}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span className="capitalize">{test.test_type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{new Date(test.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={test.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-700',
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.draft}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
