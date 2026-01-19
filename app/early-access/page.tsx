import EarlyAdopterForm from '@/components/forms/EarlyAdopterForm'
import { Sparkles, Zap, Shield, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Early Access Program | HitlAI',
  description: 'Join our exclusive early adopter program and get priority access to AI-powered testing'
}

export default function EarlyAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Join the Future of Testing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Be among the first to experience AI-powered testing that combines human intelligence 
            with cutting-edge automation
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="inline-flex p-3 bg-blue-100 rounded-lg mb-3">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Priority Access</h3>
            <p className="text-sm text-muted-foreground">
              Skip the waitlist and get immediate access
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="inline-flex p-3 bg-purple-100 rounded-lg mb-3">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Special Pricing</h3>
            <p className="text-sm text-muted-foreground">
              Exclusive discounts for early adopters
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="inline-flex p-3 bg-green-100 rounded-lg mb-3">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Direct Support</h3>
            <p className="text-sm text-muted-foreground">
              Dedicated support from our team
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="inline-flex p-3 bg-orange-100 rounded-lg mb-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Shape the Product</h3>
            <p className="text-sm text-muted-foreground">
              Your feedback drives our roadmap
            </p>
          </div>
        </div>

        <EarlyAdopterForm />

        <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            By applying, you'll be considered for our early access program. We review applications 
            based on testing needs, company size, and potential for collaboration. Selected applicants 
            will receive an invitation within 5-7 business days.
          </p>
        </div>
      </div>
    </div>
  )
}
