'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Star, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RateTestersPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [testRequest, setTestRequest] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [ratings, setRatings] = useState<any>({})
  const [overallFeedback, setOverallFeedback] = useState('')
  const [overallSatisfaction, setOverallSatisfaction] = useState(0)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadTestData()
  }, [params.id])

  const loadTestData = async () => {
    try {
      const { data: testData } = await supabase
        .from('test_requests')
        .select('*')
        .eq('id', params.id)
        .single()

      const { data: assignmentsData } = await supabase
        .from('human_test_assignments')
        .select(`
          *,
          tester:human_testers(id, display_name, avatar_url)
        `)
        .eq('test_request_id', params.id)
        .eq('status', 'completed')

      setTestRequest(testData)
      setAssignments(assignmentsData || [])

      const initialRatings: any = {}
      assignmentsData?.forEach((assignment: any) => {
        initialRatings[assignment.id] = {
          communication: assignment.communication_rating || 0,
          quality: assignment.quality_rating || 0,
          timeliness: assignment.timeliness_rating || 0,
          wouldWorkAgain: assignment.would_work_again || false,
          feedback: assignment.company_feedback || ''
        }
      })
      setRatings(initialRatings)
    } catch (error) {
      console.error('Error loading test data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (assignmentId: string, category: string, value: number) => {
    setRatings({
      ...ratings,
      [assignmentId]: {
        ...ratings[assignmentId],
        [category]: value
      }
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      for (const assignmentId in ratings) {
        const rating = ratings[assignmentId]
        const overall = Math.round((rating.communication + rating.quality + rating.timeliness) / 3)

        await supabase
          .from('human_test_assignments')
          .update({
            communication_rating: rating.communication,
            quality_rating: rating.quality,
            timeliness_rating: rating.timeliness,
            overall_rating: overall,
            would_work_again: rating.wouldWorkAgain,
            company_feedback: rating.feedback
          })
          .eq('id', assignmentId)
      }

      await supabase
        .from('test_requests')
        .update({
          overall_satisfaction_rating: overallSatisfaction,
          overall_feedback: overallFeedback,
          rated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      setSuccess(true)
      setTimeout(() => {
        router.push(`/company/tests/${params.id}`)
      }, 2000)
    } catch (error) {
      console.error('Error submitting ratings:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Star className="w-12 h-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading test details...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Ratings Submitted!</h2>
          <p className="text-slate-600">Thank you for your feedback</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/company/tests/${params.id}`} className="inline-flex items-center text-sm text-slate-700 hover:text-blue-600 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to test details
        </Link>

        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-2">
            Rate Your Testers
          </h1>
          <p className="text-slate-600">Help us improve by rating the testers who worked on: <span className="font-semibold">{testRequest?.title}</span></p>
        </div>

        {/* Individual Tester Ratings */}
        <div className="space-y-6 mb-8">
          {assignments.map((assignment, index) => (
            <div key={assignment.id} className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {assignment.tester?.display_name?.[0] || 'T'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{assignment.tester?.display_name || 'Tester'}</h3>
                  <p className="text-sm text-slate-600">Completed {new Date(assignment.completed_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Rating Categories */}
              <div className="space-y-6">
                <StarRating
                  label="Communication"
                  description="How well did they communicate their findings?"
                  value={ratings[assignment.id]?.communication || 0}
                  onChange={(val) => handleRatingChange(assignment.id, 'communication', val)}
                />
                
                <StarRating
                  label="Quality"
                  description="How thorough and insightful was their testing?"
                  value={ratings[assignment.id]?.quality || 0}
                  onChange={(val) => handleRatingChange(assignment.id, 'quality', val)}
                />
                
                <StarRating
                  label="Timeliness"
                  description="Did they complete the test on time?"
                  value={ratings[assignment.id]?.timeliness || 0}
                  onChange={(val) => handleRatingChange(assignment.id, 'timeliness', val)}
                />

                {/* Would Work Again */}
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
                  <input
                    type="checkbox"
                    id={`work-again-${assignment.id}`}
                    checked={ratings[assignment.id]?.wouldWorkAgain || false}
                    onChange={(e) => handleRatingChange(assignment.id, 'wouldWorkAgain', e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600"
                  />
                  <label htmlFor={`work-again-${assignment.id}`} className="font-medium text-slate-700 cursor-pointer">
                    I would work with this tester again
                  </label>
                </div>

                {/* Feedback */}
                <div className="space-y-2">
                  <Label htmlFor={`feedback-${assignment.id}`}>Written Feedback (Optional)</Label>
                  <Textarea
                    id={`feedback-${assignment.id}`}
                    value={ratings[assignment.id]?.feedback || ''}
                    onChange={(e) => handleRatingChange(assignment.id, 'feedback', e.target.value)}
                    placeholder="Share specific feedback about this tester's work..."
                    rows={3}
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Test Satisfaction */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8 animate-fade-in-up" style={{animationDelay: `${assignments.length * 0.1}s`}}>
          <h3 className="font-bold text-lg mb-4">Overall Test Satisfaction</h3>
          
          <StarRating
            label="How satisfied are you with this test overall?"
            description="Consider the entire testing experience"
            value={overallSatisfaction}
            onChange={setOverallSatisfaction}
          />

          <div className="space-y-2 mt-6">
            <Label htmlFor="overall-feedback">Overall Feedback (Optional)</Label>
            <Textarea
              id="overall-feedback"
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder="Share your thoughts about the overall testing experience..."
              rows={4}
              className="bg-slate-50"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6 shadow-lg"
        >
          {submitting ? 'Submitting Ratings...' : 'Submit All Ratings'}
        </Button>
      </div>
    </div>
  )
}

function StarRating({ label, description, value, onChange }: { 
  label: string
  description?: string
  value: number
  onChange: (value: number) => void 
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-slate-700">{label}</p>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        <span className="text-sm font-bold text-slate-700">{value > 0 ? `${value}/5` : 'Not rated'}</span>
      </div>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-all duration-200 hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
