import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MilestoneProgress from '@/components/dashboard/MilestoneProgress'
import MilestoneCelebration from '@/components/dashboard/MilestoneCelebration'

export const metadata = {
  title: 'Milestones | HitlAI',
  description: 'Track your testing milestones and unlock new features'
}

export default async function MilestonesPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', session.user.id)
    .single()

  if (!company) {
    redirect('/onboarding')
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Milestones</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock powerful features as you grow with HitlAI
        </p>
      </div>

      <div className="space-y-6">
        <MilestoneCelebration companyId={company.id} />
        <MilestoneProgress companyId={company.id} />
      </div>
    </div>
  )
}
