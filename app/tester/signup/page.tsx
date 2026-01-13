'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Brain, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const testTypes = ['ecommerce', 'saas', 'mobile_apps', 'accessibility', 'usability', 'functional']
const industries = ['fintech', 'healthcare', 'education', 'retail', 'entertainment', 'enterprise']
const platforms = ['usertesting', 'userlytics', 'trymyui', 'testbirds', 'other']

export default function TesterSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    age: '',
    gender: '',
    occupation: '',
    educationLevel: '',
    locationCountry: '',
    techLiteracy: 'medium',
    primaryDevice: 'desktop',
    languages: 'en',
    yearsOfTestingExperience: '0',
    previousPlatforms: [] as string[],
    preferredTestTypes: [] as string[],
    preferredIndustries: [] as string[],
    minTestDuration: '10',
    maxTestDuration: '60',
    maxTestsPerWeek: '10',
    paymentMethod: 'stripe',
    paypalEmail: '',
    timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
  })

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const toggleArrayItem = (field: 'previousPlatforms' | 'preferredTestTypes' | 'preferredIndustries', value: string) => {
    const current = formData[field]
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(item => item !== value) })
    } else {
      setFormData({ ...formData, [field]: [...current, value] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { user_type: 'tester' }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      const { error: testerError } = await supabase
        .from('human_testers')
        .insert({
          user_id: authData.user.id,
          email: formData.email,
          display_name: formData.displayName,
          age: parseInt(formData.age),
          gender: formData.gender || null,
          occupation: formData.occupation || null,
          education_level: formData.educationLevel || null,
          location_country: formData.locationCountry || null,
          tech_literacy: formData.techLiteracy,
          primary_device: formData.primaryDevice,
          languages: [formData.languages],
          years_of_testing_experience: parseInt(formData.yearsOfTestingExperience),
          previous_platforms: formData.previousPlatforms,
          preferred_test_types: formData.preferredTestTypes,
          preferred_industries: formData.preferredIndustries,
          min_test_duration_minutes: parseInt(formData.minTestDuration),
          max_test_duration_minutes: parseInt(formData.maxTestDuration),
          max_tests_per_week: parseInt(formData.maxTestsPerWeek),
          payment_method: formData.paymentMethod,
          paypal_email: formData.paymentMethod === 'paypal' ? formData.paypalEmail : null,
          timezone: formData.timezone,
          is_available: true,
          is_verified: false
        })

      if (testerError) throw testerError

      router.push('/tester/dashboard')
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />

      <div className="w-full max-w-2xl relative z-10">
        <Link href="/" className="inline-flex items-center text-sm text-slate-700 hover:text-green-600 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="flex items-center justify-center mb-8 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <Brain className="w-10 h-10 text-green-600 mr-3 relative" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-green-900 to-slate-900 bg-clip-text text-transparent">HitlAI</h1>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                ${s < step ? 'bg-green-600 text-white' : s === step ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}
              `}>
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 5 && <div className={`h-1 flex-1 mx-2 ${s < step ? 'bg-green-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl animate-fade-in-up">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {step === 1 && 'Create Account'}
            {step === 2 && 'About You'}
            {step === 3 && 'Your Experience'}
            {step === 4 && 'Preferences'}
            {step === 5 && 'Payment & Availability'}
          </h2>
          <p className="text-slate-600 mb-6">Step {step} of 5</p>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Account */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 8 characters"
                    className="bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="How should we call you?"
                    className="bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </>
            )}

            {/* Step 2: Demographics */}
            {step === 2 && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      required
                      min="18"
                      max="100"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender (Optional)</Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non_binary">Non-binary</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation (Optional)</Label>
                  <Input
                    id="occupation"
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    className="bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="educationLevel">Education (Optional)</Label>
                    <select
                      id="educationLevel"
                      value={formData.educationLevel}
                      onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">Select...</option>
                      <option value="high_school">High School</option>
                      <option value="bachelors">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationCountry">Country (Optional)</Label>
                    <Input
                      id="locationCountry"
                      type="text"
                      value={formData.locationCountry}
                      onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                      placeholder="e.g., United States"
                      className="bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Experience */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="techLiteracy">Tech Literacy</Label>
                  <select
                    id="techLiteracy"
                    required
                    value={formData.techLiteracy}
                    onChange={(e) => setFormData({ ...formData, techLiteracy: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white/50 backdrop-blur-sm"
                  >
                    <option value="low">Low - I struggle with technology</option>
                    <option value="medium">Medium - I'm comfortable with basics</option>
                    <option value="high">High - I'm very tech-savvy</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryDevice">Primary Device</Label>
                  <select
                    id="primaryDevice"
                    required
                    value={formData.primaryDevice}
                    onChange={(e) => setFormData({ ...formData, primaryDevice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white/50 backdrop-blur-sm"
                  >
                    <option value="desktop">Desktop/Laptop</option>
                    <option value="mobile">Mobile Phone</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfTestingExperience">Years of Testing Experience</Label>
                  <Input
                    id="yearsOfTestingExperience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsOfTestingExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfTestingExperience: e.target.value })}
                    className="bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Previous Testing Platforms (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.map((platform) => (
                      <label key={platform} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.previousPlatforms.includes(platform)}
                          onChange={() => toggleArrayItem('previousPlatforms', platform)}
                          className="rounded text-green-600"
                        />
                        <span className="text-sm capitalize">{platform.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label>Preferred Test Types</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {testTypes.map((type) => (
                      <label key={type} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferredTestTypes.includes(type)}
                          onChange={() => toggleArrayItem('preferredTestTypes', type)}
                          className="rounded text-green-600"
                        />
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Industries</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {industries.map((industry) => (
                      <label key={industry} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferredIndustries.includes(industry)}
                          onChange={() => toggleArrayItem('preferredIndustries', industry)}
                          className="rounded text-green-600"
                        />
                        <span className="text-sm capitalize">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minTestDuration">Min Test Duration (minutes)</Label>
                    <Input
                      id="minTestDuration"
                      type="number"
                      min="5"
                      max="120"
                      value={formData.minTestDuration}
                      onChange={(e) => setFormData({ ...formData, minTestDuration: e.target.value })}
                      className="bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTestDuration">Max Test Duration (minutes)</Label>
                    <Input
                      id="maxTestDuration"
                      type="number"
                      min="10"
                      max="180"
                      value={formData.maxTestDuration}
                      onChange={(e) => setFormData({ ...formData, maxTestDuration: e.target.value })}
                      className="bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTestsPerWeek">Max Tests Per Week</Label>
                  <Input
                    id="maxTestsPerWeek"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxTestsPerWeek}
                    onChange={(e) => setFormData({ ...formData, maxTestsPerWeek: e.target.value })}
                    className="bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </>
            )}

            {/* Step 5: Payment */}
            {step === 5 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white/50 backdrop-blur-sm"
                  >
                    <option value="stripe">Stripe (Bank Transfer)</option>
                    <option value="paypal">PayPal</option>
                    <option value="equity">Equity (HitlAI Shares)</option>
                    <option value="hybrid">Hybrid (Cash + Equity)</option>
                  </select>
                </div>
                {formData.paymentMethod === 'paypal' && (
                  <div className="space-y-2">
                    <Label htmlFor="paypalEmail">PayPal Email</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      required
                      value={formData.paypalEmail}
                      onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                      placeholder="your-paypal@example.com"
                      className="bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                )}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Earnings Structure</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Base rate: $20 per test</li>
                    <li>• Platform fee: 30% (New Tester)</li>
                    <li>• Your earnings: $14 per test initially</li>
                    <li>• Earn more as you level up (15-25% fee for higher tiers)</li>
                  </ul>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {step < 5 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              )}
            </div>
          </form>

          <p className="text-sm text-slate-600 text-center mt-6">
            Already have an account?{' '}
            <Link href="/tester/login" className="text-green-600 hover:text-green-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
