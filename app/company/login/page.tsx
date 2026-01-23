'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CompanyLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@company.com',
      password: 'demo123'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) throw authError
      if (!data.user) throw new Error('Failed to sign in')

      // Verify user is a company member
      const { data: membership } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', data.user.id)
        .single()

      if (!membership) {
        throw new Error('No company account found. Please sign up first.')
      }

      router.push('/company/dashboard')
      
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center text-sm text-slate-700 hover:text-blue-600 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="flex items-center justify-center mb-8 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <Brain className="w-10 h-10 text-blue-600 mr-3 relative" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">HitlAI</h1>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Company Sign In</h2>
          <p className="text-slate-600 mb-6">Welcome back to your dashboard</p>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
              {error}
            </div>
          )}

          <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-700 mb-2">
              <strong>Demo Account:</strong> Try the platform with pre-filled credentials
            </p>
            <Button
              type="button"
              onClick={fillDemoCredentials}
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Use Demo Credentials
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 btn-glow" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-sm text-slate-600 text-center mt-6">
            Don't have an account?{' '}
            <Link href="/company/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
