'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain, ArrowLeft } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TesterSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Account
    email: '',
    password: '',
    displayName: '',
    
    // Step 2: Demographics
    age: '',
    gender: '',
    occupation: '',
    educationLevel: '',
    locationCountry: '',
    
    // Step 3: Experience
    techLiteracy: 'medium',
    primaryDevice: 'desktop',
    languages: 'en',
    yearsOfTestingExperience: '0',
    previousPlatforms: [] as string[],
    
    // Step 4: Preferences
    preferredTestTypes: [] as string[],
    preferredIndustries: [] as string[],
    minTestDuration: '10',
    maxTestDuration: '60',
    maxTestsPerWeek: '10',
    
    // Step 5: Payment
    paymentMethod: 'stripe',
    paypalEmail: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: 'tester'
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // 2. Create tester profile
      const { error: testerError } = await supabase
        .from('human_testers')
        .insert({
          user_id: authData.user.id,
          email: formData.email,
          display_name: formData.displayName,
          
          // Demographics
          age: parseInt(formData.age),
          gender: formData.gender || null,
          occupation: formData.occupation || null,
          education_level: formData.educationLevel || null,
          location_country: formData.locationCountry || null,
          
          // Experience
          tech_literacy: formData.techLiteracy,
          primary_device: formData.primaryDevice,
          languages: [formData.languages],
          years_of_testing_experience: parseInt(formData.yearsOfTestingExperience),
          previous_platforms: formData.previousPlatforms,
          
          // Preferences
          preferred_test_types: formData.preferredTestTypes,
          preferred_industries: formData.preferredIndustries,
          min_test_duration_minutes: parseInt(formData.minTestDuration),
          max_test_duration_minutes: parseInt(formData.maxTestDuration),
          max_tests_per_week: parseInt(formData.maxTestsPerWeek),
          
          // Payment & Availability
          payment_method: formData.paymentMethod,
          paypal_email: formData.paymentMethod === 'paypal' ? formData.paypalEmail : null,
          timezone: formData.timezone,
          
          // Status
          is_available: true,
          is_verified: false
        })

      if (testerError) throw testerError

      // 3. Redirect to dashboard
      router.push('/tester/dashboard')
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />

      <div className="w-full max-w-md relative z-10">
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

        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Become a Tester</h2>
          <p className="text-slate-600 mb-6">Earn money testing websites</p>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-700 font-medium">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="How should we call you?"
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-slate-700 font-medium">Age</Label>
              <Input
                id="age"
                type="number"
                required
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="18+"
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="techLiteracy" className="text-slate-700 font-medium">Tech Literacy</Label>
              <select
                id="techLiteracy"
                required
                value={formData.techLiteracy}
                onChange={(e) => setFormData({ ...formData, techLiteracy: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              >
                <option value="low">Low - I struggle with technology</option>
                <option value="medium">Medium - I'm comfortable with basics</option>
                <option value="high">High - I'm very tech-savvy</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryDevice" className="text-slate-700 font-medium">Primary Device</Label>
              <select
                id="primaryDevice"
                required
                value={formData.primaryDevice}
                onChange={(e) => setFormData({ ...formData, primaryDevice: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              >
                <option value="desktop">Desktop/Laptop</option>
                <option value="mobile">Mobile Phone</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 btn-glow" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-sm text-slate-600 text-center mt-6">
            Already have an account?{' '}
            <Link href="/tester/login" className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
