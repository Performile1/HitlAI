import { Users, Building2, ArrowRight, CheckCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              See HitlAI in Action
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Explore our platform with demo accounts. Experience how companies request tests, 
              testers complete missions, and admins manage the entire ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How HitlAI Works</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our platform connects companies needing testing with both AI and human testers, 
              creating a unique hybrid testing ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Company Creates Test</h3>
              <p className="text-slate-600">
                Companies submit their website or app URL with specific testing missions and choose AI, human, or mixed testing
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Testers Execute</h3>
              <p className="text-slate-600">
                AI testers and human testers complete the mission, capturing screenshots, recording sessions, and documenting issues
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Insights Delivered</h3>
              <p className="text-slate-600">
                Companies receive comprehensive reports with categorized issues, severity ratings, and actionable recommendations
              </p>
            </div>
          </div>

          {/* Platform Screenshot Placeholder */}
          <div className="bg-slate-100 rounded-2xl border-2 border-slate-200 p-8 text-center">
            <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Platform Overview Screenshot</p>
                <p className="text-sm text-slate-400">Image placeholder - Add screenshot here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Logins */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Try Our Demo Accounts</h2>
            <p className="text-xl text-slate-600">
              Experience HitlAI from different perspectives with our pre-configured demo accounts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Company Demo */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Company Account</h3>
              <p className="text-slate-600 mb-6">
                Create test requests, view results, manage billing, and access comprehensive reports
              </p>

              {/* Screenshot Placeholder */}
              <div className="bg-slate-100 rounded-lg p-4 mb-6 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Company Dashboard</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Create and manage tests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>View detailed reports</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Manage team members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Track credit usage</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-slate-600 mb-1">Demo Credentials</div>
                <div className="font-mono text-sm text-slate-900">
                  <div>📧 demo@company.com</div>
                  <div>🔑 demo123</div>
                </div>
              </div>

              <Link href="/company/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Try Company Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Tester Demo */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Tester Account</h3>
              <p className="text-slate-600 mb-6">
                Browse available tests, complete missions, capture issues, and track your earnings
              </p>

              {/* Screenshot Placeholder */}
              <div className="bg-slate-100 rounded-lg p-4 mb-6 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Tester Dashboard</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Browse available tests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Execute test missions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Capture screenshots & recordings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Track earnings & ratings</span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-slate-600 mb-1">Demo Credentials</div>
                <div className="font-mono text-sm text-slate-900">
                  <div>📧 demo@tester.com</div>
                  <div>🔑 demo123</div>
                </div>
              </div>

              <Link href="/tester/login">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Try Tester Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Key Features Demo */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Key Features to Explore</h2>
            <p className="text-xl text-slate-600">
              Try these powerful features in the demo accounts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
              <div className="bg-slate-100 p-4 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">Element Picker & Annotations</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Element-Specific Annotations
                </h3>
                <p className="text-slate-600">
                  Click-to-select any element on the page. Automatically captures CSS selectors, 
                  XPath, and bounding boxes for precise issue reporting.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
              <div className="bg-slate-100 p-4 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">Screenshot Markup Tools</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Screenshot Capture & Markup
                </h3>
                <p className="text-slate-600">
                  Capture screenshots and annotate them with drawing tools: arrows, boxes, 
                  circles, and text. Perfect for visual bug reports.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
              <div className="bg-slate-100 p-4 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">AI Issue Detection</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  AI-Powered Analysis
                </h3>
                <p className="text-slate-600">
                  GPT-4 Vision automatically detects usability and accessibility issues, 
                  providing instant insights and recommendations.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
              <div className="bg-slate-100 p-4 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">Comprehensive Reports</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Detailed Test Reports
                </h3>
                <p className="text-slate-600">
                  Get executive summaries with overall scores, category breakdowns, 
                  human vs AI comparisons, and prioritized recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tester Incentive Model */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Earn Money as a Tester</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              HitlAI offers a revolutionary incentive model: earn immediate income plus passive income forever
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Immediate Earnings</h3>
              </div>
              <ul className="space-y-4 text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">$20 per test</div>
                    <div className="text-sm">Earn immediately for every test you complete</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Weekly payouts</div>
                    <div className="text-sm">Get paid every week via Stripe</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Flexible schedule</div>
                    <div className="text-sm">Work whenever you want, wherever you are</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl shadow-lg text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold">Passive Income Forever</h3>
              </div>
              <p className="text-blue-100 mb-6 font-medium">
                Every test you complete trains an AI digital twin that learns your testing style. When that AI runs tests, you earn revenue share—forever.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <div>
                    <div className="font-semibold">AI Revenue Share</div>
                    <div className="text-sm text-blue-100">Earn when AI trained by you runs tests</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <div>
                    <div className="font-semibold">Lifetime Earnings</div>
                    <div className="text-sm text-blue-100">Continue earning after you stop testing</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <div>
                    <div className="font-semibold">Build an Asset</div>
                    <div className="text-sm text-blue-100">Your expertise becomes revenue-generating</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Real Example: Your Earning Potential</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-4xl font-black text-green-600 mb-2">$1,000</div>
                <div className="text-sm text-slate-600 mb-2">Complete 50 tests</div>
                <div className="text-xs text-slate-500">Immediate earnings</div>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-black text-blue-600 mb-2">$250/mo</div>
                <div className="text-sm text-slate-600 mb-2">Your AI runs 500 tests/month</div>
                <div className="text-xs text-slate-500">Passive income (ongoing)</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-4xl font-black text-purple-600 mb-2">$3,000+</div>
                <div className="text-sm text-slate-600 mb-2">After 1 year of AI revenue</div>
                <div className="text-xs text-slate-500">Total passive earnings</div>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-6">
              * Actual earnings vary based on AI performance, test volume, and quality ratings
            </p>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-slate-600 mb-6">
              The more you test, the better your AI becomes, and the more passive income you generate.
            </p>
            <Link href="/tester/signup">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-6 text-lg">
                Start Earning as a Tester
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Testing?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Create your free account and get started with real testing in minutes
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/company/login">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View All Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
