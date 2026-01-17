'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, Brain, Flag, Hammer, FileText, LogOut, BookOpen, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navItems = [
    { href: '/admin/tests', label: 'Test Management', icon: ClipboardList },
    { href: '/admin/digital-twins', label: 'Digital Twins', icon: Brain },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/blog', label: 'Blog CMS', icon: BookOpen },
    { href: '/admin/flagged-testers', label: 'Flagged Testers', icon: Flag },
    { href: '/admin/forge', label: 'The Forge', icon: Hammer },
    { href: '/admin/disputes', label: 'Disputes', icon: FileText },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            HitlAI Admin
          </h1>
          <p className="text-sm text-slate-500 mt-1">Platform Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
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
