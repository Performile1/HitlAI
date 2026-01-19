'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface HumanFeedbackFormProps {
  testRunId: string
  aiResponse: {
    findings: string[]
    recommendations: string[]
    sentiment: string
  }
  onSubmitSuccess?: () => void
}

export default function HumanFeedbackForm({ 
  testRunId, 
  aiResponse, 
  onSubmitSuccess 
}: HumanFeedbackFormProps) {
  const [rating, setRating] = useState<'helpful' | 'not_helpful' | ''>('')
  const [correctionText, setCorrectionText] = useState('')
  const [issueType, setIssueType] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const issueTypes = [
    { value: 'incorrect_finding', label: 'Incorrect Finding' },
    { value: 'missed_issue', label: 'Missed Issue' },
    { value: 'wrong_priority', label: 'Wrong Priority' },
    { value: 'poor_recommendation', label: 'Poor Recommendation' },
    { value: 'hallucination', label: 'Hallucination/Made-up Info' },
    { value: 'bias', label: 'Bias or Unfairness' },
    { value: 'other', label: 'Other' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rating) {
      setError('Please select a rating')
      return
    }

    if (rating === 'not_helpful' && !correctionText.trim()) {
      setError('Please provide correction details')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/training/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testRunId,
          rating,
          correctionText: correctionText.trim() || null,
          issueType: issueType || null,
          aiResponse
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setSuccess(true)
      if (onSubmitSuccess) {
        setTimeout(onSubmitSuccess, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <h3 className="font-semibold text-lg">Thank You!</h3>
            <p className="text-sm text-muted-foreground">
              Your feedback helps improve our AI testing capabilities
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThumbsUp className="h-5 w-5" />
          Rate AI Performance
        </CardTitle>
        <CardDescription>
          Your feedback trains our AI to provide better testing insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Label>Was this AI analysis helpful?</Label>
            <RadioGroup value={rating} onValueChange={(value) => setRating(value as any)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="helpful" id="helpful" />
                <label htmlFor="helpful" className="flex items-center gap-2 cursor-pointer flex-1">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Yes, helpful and accurate</span>
                </label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="not_helpful" id="not_helpful" />
                <label htmlFor="not_helpful" className="flex items-center gap-2 cursor-pointer flex-1">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium">No, needs improvement</span>
                </label>
              </div>
            </RadioGroup>
          </div>

          {rating === 'not_helpful' && (
            <>
              <div className="space-y-3">
                <Label>What was the issue?</Label>
                <RadioGroup value={issueType} onValueChange={setIssueType}>
                  <div className="grid gap-2 md:grid-cols-2">
                    {issueTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <label 
                          htmlFor={type.value} 
                          className="text-sm cursor-pointer"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="correction">
                  What should the AI have said instead? *
                </Label>
                <Textarea
                  id="correction"
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  placeholder="Provide the correct analysis, findings, or recommendations..."
                  rows={5}
                  required={rating === 'not_helpful'}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific. Your correction will be used to train the AI.
                </p>
              </div>
            </>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Why your feedback matters:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Improves AI accuracy for everyone</li>
              <li>• Helps identify AI blind spots</li>
              <li>• Trains the model to match human expertise</li>
              <li>• Contributes to safer, more aligned AI</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Feedback...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
