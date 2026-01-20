import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EarlyAdopterApplicationsList from '@/components/admin/EarlyAdopterApplicationsList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Early Adopter Applications | Admin',
  description: 'Review and manage early access applications'
}

export default async function EarlyAdoptersAdminPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: applications, error } = await supabase
    .from('early_adopter_applications')
    .select('*')
    .order('priority_score', { ascending: false })
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Early Adopter Applications</h1>
        <p className="text-muted-foreground">
          Review and manage applications for the early access program
        </p>
      </div>

      <EarlyAdopterApplicationsList initialApplications={applications || []} />
    </div>
  )
}
