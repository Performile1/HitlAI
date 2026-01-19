import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TrainingDataAnalytics from '@/components/admin/TrainingDataAnalytics'

export const metadata = {
  title: 'AI Training Data | Admin',
  description: 'Monitor AI training data collection and human feedback'
}

export default async function TrainingDataPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Training Data Analytics</h1>
        <p className="text-muted-foreground">
          Monitor human feedback and AI alignment metrics for continuous improvement
        </p>
      </div>

      <TrainingDataAnalytics />
    </div>
  )
}
