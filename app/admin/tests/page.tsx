'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Clock, XCircle, Users, Brain, AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface TestAssignment {
  id: string
  tester_type: 'human' | 'ai'
  status: string
  tester_id?: string
  ai_persona_id?: string
  tester_name?: string
  assigned_at: string
  completed_at?: string
  decline_reason?: string
}

interface TestRequest {
  id: string
  title: string
  url: string
  status: string
  company_id: string
  company_name: string
  total_tests: number
  required_testers: number
  required_ai_testers: number
  created_at: string
  assignments: TestAssignment[]
}

export default function AdminTestsPage() {
  const [tests, setTests] = useState<TestRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const supabase = createClient()

  useEffect(() => {
    loadTests()
  }, [filter])

  async function loadTests() {
    try {
      setLoading(true)
      
      // Fetch test requests with company info
      let query = supabase
        .from('test_requests')
        .select(`
          *,
          companies!inner(name)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data: testData, error: testError } = await query

      if (testError) throw testError

      // Fetch assignments for each test
      const testsWithAssignments = await Promise.all(
        (testData || []).map(async (test) => {
          const { data: assignments } = await supabase
            .from('test_assignments')
            .select(`
              *,
              human_testers(display_name),
              personas(name)
            `)
            .eq('test_request_id', test.id)

          return {
            ...test,
            company_name: test.companies?.name || 'Unknown',
            assignments: (assignments || []).map((a: any) => ({
              ...a,
              tester_name: a.tester_type === 'human' 
                ? a.human_testers?.display_name 
                : a.personas?.name
            }))
          }
        })
      )

      setTests(testsWithAssignments)
    } catch (error) {
      console.error('Failed to load tests:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleReassignDeclined(testId: string) {
    try {
      // Call API to find and assign replacement testers
      const response = await fetch('/api/admin/tests/reassign-declined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testRequestId: testId })
      })

      if (!response.ok) throw new Error('Failed to reassign testers')

      alert('Declined testers have been replaced')
      loadTests()
    } catch (error) {
      console.error('Reassignment failed:', error)
      alert('Failed to reassign testers')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'assigned': return 'bg-purple-100 text-purple-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'declined': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getAssignmentStats = (test: TestRequest) => {
    const total = test.assignments.length
    const completed = test.assignments.filter(a => a.status === 'completed').length
    const declined = test.assignments.filter(a => a.status === 'declined').length
    const inProgress = test.assignments.filter(a => a.status === 'in_progress').length
    const assigned = test.assignments.filter(a => a.status === 'assigned').length

    return { total, completed, declined, inProgress, assigned }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading tests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-2">
            Test Management
          </h1>
          <p className="text-slate-600">Monitor all tests, assignments, and tester activity</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'in_progress', 'completed'].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f as any)}
              variant={filter === f ? 'default' : 'outline'}
              className={filter === f ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : ''}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Tests List */}
        <div className="space-y-4">
          {tests.map((test) => {
            const stats = getAssignmentStats(test)
            const hasDeclined = stats.declined > 0
            const needsMoreTesters = stats.total < test.total_tests

            return (
              <Card key={test.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{test.title}</CardTitle>
                        <Badge className={getStatusColor(test.status)}>
                          {getStatusIcon(test.status)}
                          <span className="ml-1">{test.status}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p><strong>Company:</strong> {test.company_name}</p>
                        <p><strong>URL:</strong> <a href={test.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{test.url}</a></p>
                        <p><strong>Created:</strong> {new Date(test.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.completed}/{test.total_tests}
                      </div>
                      <div className="text-sm text-slate-500">Tests Completed</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Assignment Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600">Assigned</div>
                      <div className="text-xl font-bold text-purple-600">{stats.assigned}</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600">In Progress</div>
                      <div className="text-xl font-bold text-blue-600">{stats.inProgress}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600">Completed</div>
                      <div className="text-xl font-bold text-green-600">{stats.completed}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600">Declined</div>
                      <div className="text-xl font-bold text-red-600">{stats.declined}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600">Total</div>
                      <div className="text-xl font-bold text-slate-600">{stats.total}</div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {(hasDeclined || needsMoreTesters) && (
                    <div className="mb-4 space-y-2">
                      {hasDeclined && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                              <div className="font-semibold text-red-900">
                                {stats.declined} tester{stats.declined > 1 ? 's' : ''} declined
                              </div>
                              <div className="text-sm text-red-700">
                                Replacement testers needed
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleReassignDeclined(test.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Reassign
                          </Button>
                        </div>
                      )}
                      {needsMoreTesters && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <div className="font-semibold text-yellow-900">
                                Needs {test.total_tests - stats.total} more tester{test.total_tests - stats.total > 1 ? 's' : ''}
                              </div>
                              <div className="text-sm text-yellow-700">
                                Required: {test.required_testers} human, {test.required_ai_testers} AI
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assignments List */}
                  {test.assignments.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Assigned Testers</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {test.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              {assignment.tester_type === 'human' ? (
                                <Users className="w-5 h-5 text-green-600" />
                              ) : (
                                <Brain className="w-5 h-5 text-blue-600" />
                              )}
                              <div>
                                <div className="font-medium text-slate-900">
                                  {assignment.tester_name || 'Unknown'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {assignment.tester_type === 'human' ? 'Human Tester' : 'AI Persona'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(assignment.status)}>
                                {assignment.status}
                              </Badge>
                              {assignment.status === 'declined' && assignment.decline_reason && (
                                <span className="text-xs text-red-600" title={assignment.decline_reason}>
                                  ⚠️
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link href={`/admin/tests/${test.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/company/tests/${test.id}`}>
                      <Button variant="outline" size="sm">
                        View as Company
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {tests.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">No tests found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
