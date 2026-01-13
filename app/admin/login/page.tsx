'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Verify admin role
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('raw_user_meta_data')
        .eq('id', data.user.id)
        .single()

      const userType = data.user.user_metadata?.user_type
      
      if (userType !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin credentials required.')
      }

      router.push('/admin/digital-twins')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center text-sm text-purple-200 hover:text-white mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="flex items-center justify-center mb-8 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <Shield className="w-12 h-12 text-purple-400 mr-3 relative" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
            <p className="text-purple-200 text-sm">HitlAI Platform Control</p>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl animate-fade-in-up">
          <h2 className="text-2xl font-bold text-white mb-2">
            Secure Access
          </h2>
          <p className="text-purple-200 mb-6">Sign in with your admin credentials</p>

          {error && (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Admin Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hitlai.com"
                className="bg-white/90 backdrop-blur-sm border-white/30 text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/90 backdrop-blur-sm border-white/30 text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 shadow-lg hover:shadow-xl transition-all duration-300 btn-glow"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Portal'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-xs text-purple-200 text-center">
              <Shield className="w-4 h-4 inline mr-1" />
              This portal is restricted to authorized administrators only
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-purple-200">
            Not an admin?{' '}
            <Link href="/company/login" className="text-purple-400 hover:text-white font-semibold">
              Company Login
            </Link>
            {' or '}
            <Link href="/tester/login" className="text-purple-400 hover:text-white font-semibold">
              Tester Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
