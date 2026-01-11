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
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    age: '',
    techLiteracy: 'medium',
    primaryDevice: 'desktop',
    languages: 'en'
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
          display_name: formData.displayName,
          age: parseInt(formData.age),
          tech_literacy: formData.techLiteracy,
          primary_device: formData.primaryDevice,
          languages: [formData.languages],
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <div className="flex items-center justify-center mb-8">
          <Brain className="w-10 h-10 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-slate-900">HitlAI</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Become a Tester</h2>
          <p className="text-slate-600 mb-6">Earn money testing websites</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="How should we call you?"
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                required
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="18+"
              />
            </div>

            <div>
              <Label htmlFor="techLiteracy">Tech Literacy</Label>
              <select
                id="techLiteracy"
                required
                value={formData.techLiteracy}
                onChange={(e) => setFormData({ ...formData, techLiteracy: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="low">Low - I struggle with technology</option>
                <option value="medium">Medium - I'm comfortable with basics</option>
                <option value="high">High - I'm very tech-savvy</option>
              </select>
            </div>

            <div>
              <Label htmlFor="primaryDevice">Primary Device</Label>
              <select
                id="primaryDevice"
                required
                value={formData.primaryDevice}
                onChange={(e) => setFormData({ ...formData, primaryDevice: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="desktop">Desktop/Laptop</option>
                <option value="mobile">Mobile Phone</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
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
