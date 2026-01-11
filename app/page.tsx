import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Users, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <Brain className="w-12 h-12 text-blue-600" />
                <h1 className="text-4xl font-bold text-slate-900">HitlAI</h1>
              </div>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Human-Centric Testing,
              <br />
              <span className="text-blue-600">AI-Powered Insights</span>
            </h2>

            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
              Test your website through the eyes of real users. Combine AI automation 
              with human testers to discover friction points before your customers do.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/company/signup">
                <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
                  Request Testing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Link href="/tester/signup">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  Become a Tester
                  <Users className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-slate-500 mt-8">
              Trusted by 500+ companies • 2,000+ human testers • 50,000+ tests completed
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Companies */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                For Companies
              </h4>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Create Test Request</p>
                    <p className="text-sm text-slate-600">Define URL, objective, and personas</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Choose Test Type</p>
                    <p className="text-sm text-slate-600">AI-only, human-only, or hybrid</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Get Results</p>
                    <p className="text-sm text-slate-600">Detailed friction points, recommendations</p>
                  </div>
                </div>
              </div>

              <Link href="/company/signup" className="mt-6 block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Testing <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* For Testers */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                For Testers
              </h4>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Create Profile</p>
                    <p className="text-sm text-slate-600">Share your age, tech skills, devices</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Get Matched</p>
                    <p className="text-sm text-slate-600">Receive tests matching your profile</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Complete Tests</p>
                    <p className="text-sm text-slate-600">Test websites, report friction points</p>
                  </div>
                </div>
              </div>

              <Link href="/tester/signup" className="mt-6 block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Join as Tester <Users className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2026 HitlAI. Intellectual Property of Rickard Wig.</p>
        </div>
      </footer>
    </div>
  )
}
