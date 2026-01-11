'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Assignment {
  id: string
  instructions: string
  status: string
  test_request: {
    title: string
    url: string
    mission: string
  }
  assigned_persona: {
    name: string
    age: number
    tech_literacy: string
    eyesight: string
    attention_rules: any
  }
}

export default function TestExecutionPage() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  const [results, setResults] = useState({
    frictionPoints: [] as Array<{
      element: string
      issue: string
      severity: 'low' | 'medium' | 'high' | 'critical'
    }>,
    notes: '',
    sentimentScore: 0.5
  })

  useEffect(() => {
    loadAssignment()
  }, [assignmentId])

  const loadAssignment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/tester/login')
        return
      }

      const { data } = await supabase
        .from('human_test_assignments')
        .select(`
          *,
          test_request:test_requests(title, url, mission),
          assigned_persona:personas(name, age, tech_literacy, eyesight, attention_rules)
        `)
        .eq('id', assignmentId)
        .single()

      if (!data) {
        router.push('/tester/dashboard')
        return
      }

      setAssignment(data)
      
      if (data.status === 'in_progress') {
        setStarted(true)
      }
      
    } catch (error) {
      console.error('Failed to load assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    setStarted(true)
    setStartTime(Date.now())

    await supabase
      .from('human_test_assignments')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
  }

  const addFrictionPoint = () => {
    setResults({
      ...results,
      frictionPoints: [
        ...results.frictionPoints,
        { element: '', issue: '', severity: 'medium' }
      ]
    })
  }

  const updateFrictionPoint = (index: number, field: string, value: any) => {
    const updated = [...results.frictionPoints]
    updated[index] = { ...updated[index], [field]: value }
    setResults({ ...results, frictionPoints: updated })
  }

  const removeFrictionPoint = (index: number) => {
    setResults({
      ...results,
      frictionPoints: results.frictionPoints.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      const completionTime = Math.floor((Date.now() - startTime) / 1000)

      await supabase
        .from('human_test_assignments')
        .update({
          status: 'completed',
          completion_time_seconds: completionTime,
          friction_points_found: results.frictionPoints.length,
          sentiment_score: results.sentimentScore,
          notes: results.notes,
          completed_at: new Date().toISOString()
        })
        .eq('id', assignmentId)

      // TODO: Send completion email to company

      router.push('/tester/dashboard')
      
    } catch (error: any) {
      alert('Failed to submit results: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading test...</p>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Test not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/tester/dashboard" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!started ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">
              {assignment.test_request.title}
            </h1>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Website</h3>
                <a 
                  href={assignment.test_request.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  {assignment.test_request.url}
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Your Persona</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-semibold text-slate-900">{assignment.assigned_persona.name}</p>
                  <p className="text-sm text-slate-600">
                    Age {assignment.assigned_persona.age} • {assignment.assigned_persona.tech_literacy} tech literacy
                  </p>
                  <p className="text-sm text-slate-600">
                    Eyesight: {assignment.assigned_persona.eyesight}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Instructions</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                    {assignment.instructions}
                  </pre>
                </div>
              </div>

              <Button onClick={handleStart} className="w-full bg-green-600 hover:bg-green-700">
                Start Test
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Remember:</strong> Test as {assignment.assigned_persona.name} ({assignment.assigned_persona.age}, {assignment.assigned_persona.tech_literacy} tech literacy)
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Report Friction Points</h2>

              <div className="space-y-4 mb-6">
                {results.frictionPoints.map((point, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label>Element/Location</Label>
                        <input
                          type="text"
                          value={point.element}
                          onChange={(e) => updateFrictionPoint(index, 'element', e.target.value)}
                          placeholder="E.g., Submit button, Email field"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label>Severity</Label>
                        <select
                          value={point.severity}
                          onChange={(e) => updateFrictionPoint(index, 'severity', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <Label>Issue Description</Label>
                      <Textarea
                        value={point.issue}
                        onChange={(e) => updateFrictionPoint(index, 'issue', e.target.value)}
                        placeholder="Describe what was confusing or difficult..."
                        rows={3}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFrictionPoint(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={addFrictionPoint} variant="outline" className="w-full mb-6">
                + Add Friction Point
              </Button>

              <div className="mb-6">
                <Label>Overall Experience (0 = Terrible, 10 = Excellent)</Label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={results.sentimentScore * 10}
                  onChange={(e) => setResults({ ...results, sentimentScore: parseInt(e.target.value) / 10 })}
                  className="w-full"
                />
                <p className="text-center text-2xl font-bold text-slate-900 mt-2">
                  {(results.sentimentScore * 10).toFixed(0)} / 10
                </p>
              </div>

              <div className="mb-6">
                <Label>Additional Notes</Label>
                <Textarea
                  value={results.notes}
                  onChange={(e) => setResults({ ...results, notes: e.target.value })}
                  placeholder="Any other observations or feedback..."
                  rows={5}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'Submitting...' : 'Submit Test Results'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
