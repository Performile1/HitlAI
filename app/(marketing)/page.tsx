/**
 * HitlAI Homepage - Modern landing page with dual CTAs
 * 
 * Two user types:
 * 1. Companies - Request AI/human testing
 * 2. Testers - Join as human tester
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Users, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <Brain className="w-12 h-12 text-blue-600" />
                <h1 className="text-4xl font-bold text-slate-900">HitlAI</h1>
              </div>
            </div>

            {/* Headline */}
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

            {/* Social Proof */}
            <p className="text-sm text-slate-500 mt-8">
              Trusted by 500+ companies • 2,000+ human testers • 50,000+ tests completed
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Why HitlAI?
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The only platform that combines AI testing with real human behavior analysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                AI-Powered Testing
              </h4>
              <p className="text-slate-600">
                Autonomous AI agents test your site 24/7, covering happy paths, 
                error flows, accessibility, and edge cases.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                Real Human Testers
              </h4>
              <p className="text-slate-600">
                Get feedback from actual users matching your target personas—seniors, 
                mobile users, low tech literacy, and more.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                Continuous Learning
              </h4>
              <p className="text-slate-600">
                AI learns from human behavior to refine personas and catch issues 
                that matter to your real users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              How It Works
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Companies */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                  1
                </span>
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
                    <p className="text-sm text-slate-600">Detailed friction points, sentiment scores, recommendations</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Continuous Improvement</p>
                    <p className="text-sm text-slate-600">AI learns from each test to improve accuracy</p>
                  </div>
                </div>
              </div>

              <Link href="/company/signup" className="mt-6 block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Testing
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* For Testers */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                  2
                </span>
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

                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Earn & Help</p>
                    <p className="text-sm text-slate-600">Get paid while improving UX for everyone</p>
                  </div>
                </div>
              </div>

              <Link href="/tester/signup" className="mt-6 block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Join as Tester
                  <Users className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-lg text-slate-600">
              Pay only for what you use. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="p-6 rounded-xl border-2 border-slate-200">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Free</h4>
              <p className="text-3xl font-bold text-slate-900 mb-4">$0<span className="text-sm text-slate-600">/mo</span></p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li>✓ 10 AI tests/month</li>
                <li>✓ Basic personas</li>
                <li>✓ Email support</li>
              </ul>
              <Button variant="outline" className="w-full">Get Started</Button>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-xl border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                POPULAR
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Pro</h4>
              <p className="text-3xl font-bold text-slate-900 mb-4">$99<span className="text-sm text-slate-600">/mo</span></p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li>✓ 100 AI tests/month</li>
                <li>✓ 10 human tests/month</li>
                <li>✓ Custom personas</li>
                <li>✓ Priority support</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-xl border-2 border-slate-200">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h4>
              <p className="text-3xl font-bold text-slate-900 mb-4">Custom</p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li>✓ Unlimited tests</li>
                <li>✓ Dedicated testers</li>
                <li>✓ Custom integrations</li>
                <li>✓ 24/7 support</li>
              </ul>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Improve Your UX?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of companies testing smarter with AI and human insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/company/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
                Start Testing Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-blue-700">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <span className="text-white font-bold">HitlAI</span>
              </div>
              <p className="text-sm">
                Human-centric testing, AI-powered insights
              </p>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/demo">Demo</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
                <li><Link href="/security">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 HitlAI. All rights reserved. Intellectual Property of Rickard Wig.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
