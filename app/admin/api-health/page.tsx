import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ApiHealthDashboard from '@/components/admin/ApiHealthDashboard'

export const metadata = {
  title: 'API Health Monitoring | Admin',
  description: 'Monitor API endpoint health and performance'
}

export default async function ApiHealthPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Health Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of API endpoint health, performance, and uptime
        </p>
      </div>

      <ApiHealthDashboard />
    </div>
  )
}
