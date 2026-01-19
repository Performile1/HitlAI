'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Rocket, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FormData {
  fullName: string
  email: string
  company: string
  role: string
  companySize: string
  industry: string
  testingNeeds: string
  monthlyTestVolume: string
  currentTools: string
  painPoints: string
  interestedFeatures: string[]
  referralSource: string
  agreeToTerms: boolean
}

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
]

const MONTHLY_VOLUMES = [
  'Just starting (0-10 tests/month)',
  'Small scale (10-50 tests/month)',
  'Growing (50-200 tests/month)',
  'Medium scale (200-500 tests/month)',
  'Large scale (500-1000 tests/month)',
  'Enterprise (1000+ tests/month)'
]

const FEATURES = [
  { id: 'ai_testing', label: 'AI-Powered Testing' },
  { id: 'human_testing', label: 'Human Tester Network' },
  { id: 'session_recording', label: 'Session Recording & Replay' },
  { id: 'advanced_analytics', label: 'Advanced Analytics' },
  { id: 'api_access', label: 'API Access' },
  { id: 'custom_personas', label: 'Custom Personas' },
  { id: 'integrations', label: 'CI/CD Integrations' },
  { id: 'white_label', label: 'White Label Solution' }
]

export default function EarlyAdopterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    company: '',
    role: '',
    companySize: '',
    industry: '',
    testingNeeds: '',
    monthlyTestVolume: '',
    currentTools: '',
    painPoints: '',
    interestedFeatures: [],
    referralSource: '',
    agreeToTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      interestedFeatures: prev.interestedFeatures.includes(featureId)
        ? prev.interestedFeatures.filter(id => id !== featureId)
        : [...prev.interestedFeatures, featureId]
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Valid email is required')
      return false
    }
    if (!formData.company.trim()) {
      setError('Company name is required')
      return false
    }
    if (!formData.companySize) {
      setError('Company size is required')
      return false
    }
    if (!formData.monthlyTestVolume) {
      setError('Monthly test volume is required')
      return false
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/early-adopters/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/early-access/thank-you')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Application Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for your interest in HitlAI. We'll review your application and get back to you soon.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Rocket className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Early Adopter Program</CardTitle>
            <CardDescription>
              Join our exclusive early access program and shape the future of AI-powered testing
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Badge variant="secondary">Priority Access</Badge>
          <Badge variant="secondary">Special Pricing</Badge>
          <Badge variant="secondary">Direct Support</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Acme Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="QA Manager, CTO, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size *</Label>
              <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                <SelectTrigger id="companySize">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="SaaS, E-commerce, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyTestVolume">Expected Monthly Test Volume *</Label>
            <Select value={formData.monthlyTestVolume} onValueChange={(value) => handleInputChange('monthlyTestVolume', value)}>
              <SelectTrigger id="monthlyTestVolume">
                <SelectValue placeholder="Select expected volume" />
              </SelectTrigger>
              <SelectContent>
                {MONTHLY_VOLUMES.map(volume => (
                  <SelectItem key={volume} value={volume}>{volume}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testingNeeds">What are you looking to test?</Label>
            <Textarea
              id="testingNeeds"
              value={formData.testingNeeds}
              onChange={(e) => handleInputChange('testingNeeds', e.target.value)}
              placeholder="Web apps, mobile apps, APIs, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentTools">Current Testing Tools</Label>
            <Input
              id="currentTools"
              value={formData.currentTools}
              onChange={(e) => handleInputChange('currentTools', e.target.value)}
              placeholder="Selenium, Cypress, manual testing, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="painPoints">What are your biggest testing challenges?</Label>
            <Textarea
              id="painPoints"
              value={formData.painPoints}
              onChange={(e) => handleInputChange('painPoints', e.target.value)}
              placeholder="Time-consuming, expensive, lack of coverage, etc."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Which features interest you most?</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {FEATURES.map(feature => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature.id}
                    checked={formData.interestedFeatures.includes(feature.id)}
                    onCheckedChange={() => handleFeatureToggle(feature.id)}
                  />
                  <label
                    htmlFor={feature.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {feature.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralSource">How did you hear about us?</Label>
            <Input
              id="referralSource"
              value={formData.referralSource}
              onChange={(e) => handleInputChange('referralSource', e.target.value)}
              placeholder="Google, LinkedIn, referral, etc."
            />
          </div>

          <div className="flex items-start space-x-2 pt-4 border-t">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
              required
            />
            <label
              htmlFor="terms"
              className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I agree to the terms and conditions and understand that my application will be reviewed. 
              I consent to being contacted by HitlAI regarding early access opportunities. *
            </label>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
