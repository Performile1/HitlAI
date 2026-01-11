'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Clock, Users, AlertCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface TestRequest {
  id: string
  title: string
  url: string
  mission: string
  test_type: string
  status: string
  created_at: string
  ai_test_run_ids: string[]
  human_test_assignment_ids: string[]
}

export default function TestResultsPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  const [loading, setLoading] = useState(true)
  const [testRequest, setTestRequest] = useState<TestRequest | null>(null)
  const [aiResults, setAiResults] = useState<any[]>([])
  const [humanResults, setHumanResults] = useState<any[]>([])

  useEffect(() => {
    loadResults()
  }, [testId])

  const loadResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/company/login')
        return
      }

      // Get test request
      const { data: request } = await supabase
        .from('test_requests')
        .select('*')
        .eq('id', testId)
        .single()

      if (!request) {
        router.push('/company/dashboard')
        return
      }

      setTestRequest(request)

      // Get AI results
      if (request.ai_test_run_ids && request.ai_test_run_ids.length > 0) {
        const { data: aiData } = await supabase
          .from('test_runs')
          .select('*')
          .in('id', request.ai_test_run_ids)

        setAiResults(aiData || [])
      }

      // Get human results
      if (request.human_test_assignment_ids && request.human_test_assignment_ids.length > 0) {
        const { data: humanData } = await supabase
          .from('human_test_assignments')
          .select('*')
          .in('id', request.human_test_assignment_ids)

        setHumanResults(humanData || [])
      }

    } catch (error) {
      console.error('Failed to load results:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading results...</p>
      </div>
    )
  }

  if (!testRequest) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Test not found</p>
      </div>
    )
  }

  const aiAvgSentiment = aiResults.length > 0
    ? aiResults.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / aiResults.length
    : 0

  const humanAvgSentiment = humanResults.filter(r => r.status === 'completed').length > 0
    ? humanResults.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / humanResults.filter(r => r.status === 'completed').length
    : 0

  const completedHuman = humanResults.filter(r => r.status === 'completed').length
  const pendingHuman = humanResults.filter(r => r.status !== 'completed').length

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/company/dashboard" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{testRequest.title}</h1>
          <p className="text-slate-600">{testRequest.url}</p>
          <div className="flex items-center space-x-4 mt-4">
            <StatusBadge status={testRequest.status} />
            <span className="text-sm text-slate-500 capitalize">
              {testRequest.test_type.replace('_', ' ')}
            </span>
            <span className="text-sm text-slate-500">
              Created {new Date(testRequest.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">AI Tests</p>
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{aiResults.length}</p>
            <p className="text-sm text-slate-600 mt-1">
              Avg Sentiment: {(aiAvgSentiment * 10).toFixed(1)}/10
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Human Tests</p>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{completedHuman}</p>
            <p className="text-sm text-slate-600 mt-1">
              {pendingHuman > 0 ? `${pendingHuman} pending` : 'All completed'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Overall Score</p>
              <AlertCircle className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {humanAvgSentiment > 0 
                ? (humanAvgSentiment * 10).toFixed(1)
                : (aiAvgSentiment * 10).toFixed(1)
              }/10
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {humanAvgSentiment > 0 ? 'From human testers' : 'From AI tests'}
            </p>
          </div>
        </div>

        {/* AI Results */}
        {aiResults.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 mb-8">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">AI Test Results</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {aiResults.map((result) => (
                  <div key={result.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900">Persona: {result.persona}</p>
                      <span className="text-sm text-slate-600">
                        Sentiment: {(result.sentiment_score * 10).toFixed(1)}/10
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Status: {result.status} • Duration: {result.duration_seconds}s
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Human Results */}
        {humanResults.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Human Test Results</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {humanResults.map((result) => (
                  <div key={result.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900">
                        {result.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                      </p>
                      {result.sentiment_score && (
                        <span className="text-sm text-slate-600">
                          Sentiment: {(result.sentiment_score * 10).toFixed(1)}/10
                        </span>
                      )}
                    </div>
                    {result.friction_points_found > 0 && (
                      <p className="text-sm text-slate-600 mb-2">
                        {result.friction_points_found} friction points found
                      </p>
                    )}
                    {result.notes && (
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
                        {result.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {testRequest.status === 'in_progress' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900">Test in Progress</h3>
                <p className="text-sm text-blue-700">
                  Results will appear here as tests are completed
                </p>
              </div>
            </div>
          </div>
        )}
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
