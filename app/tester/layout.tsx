'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, TestTube, TrendingUp, Rocket, Settings, LogOut, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function TesterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/tester/login')
  }

  if (pathname === '/tester/login' || pathname === '/tester/signup') {
    return <>{children}</>
  }

  const navItems = [
    { href: '/tester/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tester/tests', label: 'Available Tests', icon: TestTube },
    { href: '/tester/mission-control', label: 'Mission Control', icon: Rocket },
    { href: '/tester/performance', label: 'Performance', icon: TrendingUp },
    { href: '/tester/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/tester/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            HitlAI Tester
          </h1>
          <p className="text-sm text-slate-500 mt-1">Testing Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : ''}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="mb-4 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
            <div className="text-xs text-slate-600 font-medium mb-1">Current Tier</div>
            <div className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Expert</div>
            <div className="text-xs text-slate-500 mt-1">20% platform fee</div>
          </div>
          <div className="mb-4 p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
            <div className="text-xs text-slate-600 font-medium mb-1">Total Earnings</div>
            <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">$1,778</div>
            <div className="text-xs text-slate-500 mt-1">127 tests completed</div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
