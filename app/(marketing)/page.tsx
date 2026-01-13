/**
 * HitlAI Homepage - Modern landing page with dual CTAs
 * 
 * Two user types:
 * 1. Companies - Request AI/human testing
 * 2. Testers - Join as human tester
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Users, Zap, Shield, TrendingUp, CheckCircle, Sparkles, Target, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-mesh">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-12 animate-slide-down">
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <Brain className="relative w-14 h-14 text-blue-600 animate-float" />
                </div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">HitlAI</h1>
              </div>
            </div>

            {/* Headline */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-blue-50 border border-blue-100">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Trusted by 500+ companies worldwide</span>
              </div>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 leading-tight">
                Human-Centric Testing,
                <br />
                <span className="gradient-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">AI-Powered Insights</span>
              </h2>
            </div>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              Test your website through the eyes of <span className="font-semibold text-slate-900">real users</span>. Combine AI automation 
              with human testers to discover friction points <span className="font-semibold text-slate-900">before your customers do</span>.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-scale-in">
              <Link href="/company/signup">
                <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-glow-md hover:shadow-glow-lg transition-all duration-300 btn-glow group">
                  Request Testing
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/tester/signup">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 group">
                  Become a Tester
                  <Users className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-slate-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">500+</div>
                <div className="text-sm text-slate-600">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">2,000+</div>
                <div className="text-sm text-slate-600">Human Testers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">50K+</div>
                <div className="text-sm text-slate-600">Tests Completed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-white to-slate-50 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Why Choose Us</span>
            </div>
            <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              Why HitlAI?
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The only platform that combines <span className="font-semibold text-slate-900">AI testing</span> with <span className="font-semibold text-slate-900">real human behavior</span> analysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover">
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Brain className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">
                AI-Powered Testing
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Autonomous AI agents test your site <span className="font-semibold text-slate-900">24/7</span>, covering happy paths, 
                error flows, accessibility, and edge cases.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-green-300 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover">
              <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-green-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">
                Real Human Testers
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Get feedback from <span className="font-semibold text-slate-900">actual users</span> matching your target personas—seniors, 
                mobile users, low tech literacy, and more.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover">
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-purple-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">
                Continuous Learning
              </h4>
              <p className="text-slate-600 leading-relaxed">
                AI learns from human behavior to refine personas and catch issues 
                that <span className="font-semibold text-slate-900">matter to your real users</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white border border-slate-200 shadow-sm">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Simple Process</span>
            </div>
            <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              How It Works
            </h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get started in minutes with our streamlined process
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Companies */}
            <div className="group bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-50" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <h4 className="text-3xl font-black text-slate-900">
                  For Companies
                </h4>
              </div>

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

              <Link href="/company/signup" className="mt-8 block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 btn-glow group">
                  Start Testing
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* For Testers */}
            <div className="group bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-600 rounded-2xl blur-lg opacity-50" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <h4 className="text-3xl font-black text-slate-900">
                  For Testers
                </h4>
              </div>

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

              <Link href="/tester/signup" className="mt-8 block">
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 btn-glow group">
                  Join as Tester
                  <Users className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-32 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Flexible Plans</span>
            </div>
            <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              Simple, Transparent Pricing
            </h3>
            <p className="text-xl text-slate-600">
              Pay only for what you use. <span className="font-semibold text-slate-900">No hidden fees</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free */}
            <div className="group p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-300">
              <h4 className="text-2xl font-bold text-slate-900 mb-3">Free</h4>
              <p className="mb-6">
                <span className="text-5xl font-black text-slate-900">$0</span>
                <span className="text-lg text-slate-600">/mo</span>
              </p>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>10 AI tests/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Basic personas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full py-6 border-2 hover:bg-slate-50">Get Started</Button>
            </div>

            {/* Pro */}
            <div className="group relative p-8 rounded-3xl border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-white hover:shadow-2xl transition-all duration-300 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                POPULAR
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">Pro</h4>
              <p className="mb-6">
                <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$99</span>
                <span className="text-lg text-slate-600">/mo</span>
              </p>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">100 AI tests/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">10 human tests/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">Custom personas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">Priority support</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 shadow-lg hover:shadow-xl transition-all btn-glow">Start Free Trial</Button>
            </div>

            {/* Enterprise */}
            <div className="group p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-300">
              <h4 className="text-2xl font-bold text-slate-900 mb-3">Enterprise</h4>
              <p className="mb-6">
                <span className="text-5xl font-black text-slate-900">Custom</span>
              </p>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited tests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Dedicated testers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>24/7 support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full py-6 border-2 hover:bg-slate-50">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Start Your Journey</span>
          </div>
          <h3 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
            Ready to Improve Your UX?
          </h3>
          <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join <span className="font-bold text-white">hundreds of companies</span> testing smarter with AI and human insights
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/company/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-7 text-lg shadow-2xl hover:shadow-glow-lg transition-all duration-300 btn-glow group">
                Start Testing Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm px-10 py-7 text-lg transition-all duration-300">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-50" />
                  <Brain className="relative w-8 h-8 text-blue-400" />
                </div>
                <span className="text-white font-black text-xl">HitlAI</span>
              </div>
              <p className="text-sm leading-relaxed">
                Human-centric testing, AI-powered insights
              </p>
            </div>

            <div>
              <h5 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Product</h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Company</h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Legal</h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p className="text-slate-500">&copy; 2026 HitlAI. All rights reserved. Intellectual Property of Rickard Wig.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
