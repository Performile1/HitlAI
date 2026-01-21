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
import ProgressBanner from '@/components/ProgressBanner'
import EarlyAdopterCard from '@/components/EarlyAdopterCard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Progress Banner */}
      <ProgressBanner />
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
                <span className="text-sm font-medium text-blue-700">AI Testers Trained by Real Humans</span>
              </div>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 leading-tight">
                AI Testing at Scale,
                <br />
                <span className="gradient-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Human Insight When Needed</span>
              </h2>
            </div>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              Our <span className="font-semibold text-slate-900">human-like AI agents</span> test your site with the same intuition and behavior patterns as real users, at a fraction of the cost. 
              Choose <span className="font-semibold text-slate-900">AI agents for speed</span>, <span className="font-semibold text-slate-900">human testers for deep insight</span>, 
              or <span className="font-semibold text-slate-900">combine both</span> for comprehensive coverage.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8 animate-scale-in">
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

            {/* Login Links */}
            <div className="flex gap-6 justify-center items-center mb-16 text-sm">
              <span className="text-slate-500">Already have an account?</span>
              <Link href="/company/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                Company Login
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/tester/login" className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors">
                Tester Login
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

      {/* Progressive Rewards Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">NEW: Tester Equity & Credits Program</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
            🎉 Earn Equity & Credits as You Help Us Grow
          </h3>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Help us reach <span className="font-bold text-white">1,000 tests</span> → Earn platform credits & equity shares. 
            <span className="font-bold text-white"> 5,000 tests</span> → Unlock bonus rewards. 
            <span className="font-bold text-white"> 10,000 tests</span> → Join our founding tester program. Your contributions build our future together!
          </p>
          <Link href="/dashboard/milestones">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg shadow-xl">
              View Your Rewards
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-white to-slate-50 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">How It Works</span>
            </div>
            <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              Choose Your Testing Mix
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              AI testers trained by humans. <span className="font-semibold text-slate-900">Lower costs</span>, <span className="font-semibold text-slate-900">faster results</span>, with human insight when you need it.
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
                AI-Only Testing
              </h4>
              <p className="text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900">$5 per test.</span> Human-like AI agents run tests 24/7 with realistic user behavior patterns. 
                Perfect for <span className="font-semibold text-slate-900">regression testing</span> and catching technical issues fast.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-green-300 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover">
              <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-green-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">
                Human-Only Testing
              </h4>
              <p className="text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900">$25 per test.</span> Real users matching your personas provide 
                <span className="font-semibold text-slate-900"> emotional feedback</span>, confusion points, and UX insights AI can't catch.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover">
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-purple-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">
                Mixed Testing
              </h4>
              <p className="text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900">Best of both worlds.</span> AI handles volume and speed, 
                humans train the AI and provide emotional context. <span className="font-semibold text-slate-900">You control the ratio.</span>
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
                    <p className="font-semibold text-slate-900">Complete Tests</p>
                    <p className="text-sm text-slate-600">Earn <span className="font-semibold text-green-600">$20 per test</span> testing websites</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Train AI Testers</p>
                    <p className="text-sm text-slate-600">Your tests help train AI personas</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Earn Passive Income</p>
                    <p className="text-sm text-slate-600"><span className="font-semibold text-green-600">Get paid forever</span> when AI you trained runs tests</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Build Your Portfolio</p>
                    <p className="text-sm text-slate-600">Higher ratings = better pay + more AI revenue</p>
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

      {/* Trust & Transparency */}
      <section className="py-32 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-green-50 to-blue-50 border border-green-100">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Built on Trust & Transparency</span>
            </div>
            <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              Enterprise-Grade Reliability
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real-time monitoring, transparent AI training, and guaranteed uptime. See exactly how we perform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 hover:shadow-xl transition-all duration-300">
              <div className="inline-flex p-4 bg-green-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-5xl font-black text-green-600 mb-2">99.9%</div>
              <p className="text-lg font-semibold text-slate-900 mb-2">API Uptime</p>
              <p className="text-sm text-slate-600">Real-time monitoring with instant alerts and transparent status updates</p>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-5xl font-black text-blue-600 mb-2">85%</div>
              <p className="text-lg font-semibold text-slate-900 mb-2">AI Alignment Score</p>
              <p className="text-sm text-slate-600">Continuously improving with your feedback on every test result</p>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="inline-flex p-4 bg-purple-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-5xl font-black text-purple-600 mb-2">10K+</div>
              <p className="text-lg font-semibold text-slate-900 mb-2">Training Samples</p>
              <p className="text-sm text-slate-600">Human corrections actively training our AI to match expert judgment</p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
              <TrendingUp className="w-6 h-6 text-blue-600 mb-3" />
              <h4 className="font-bold text-slate-900 mb-2">Progressive Unlocks</h4>
              <p className="text-sm text-slate-600">Unlock advanced features as you test more</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
              <Shield className="w-6 h-6 text-green-600 mb-3" />
              <h4 className="font-bold text-slate-900 mb-2">Health Monitoring</h4>
              <p className="text-sm text-slate-600">Real-time API status and incident tracking</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
              <Brain className="w-6 h-6 text-purple-600 mb-3" />
              <h4 className="font-bold text-slate-900 mb-2">AI Transparency</h4>
              <p className="text-sm text-slate-600">Rate every AI result, see how it improves</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
              <Sparkles className="w-6 h-6 text-orange-600 mb-3" />
              <h4 className="font-bold text-slate-900 mb-2">Early Access</h4>
              <p className="text-sm text-slate-600">Lock in lifetime discounts and priority support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Early Adopter Programs */}
      <section className="py-32 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Limited Time Opportunity</span>
            </div>
            <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              Join the Journey
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Be part of building the future of AI testing. Lock in exclusive benefits as an early adopter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <EarlyAdopterCard type="company" />
            <EarlyAdopterCard type="tester" />
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
            {/* Starter Pack */}
            <div className="group p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-300">
              <h4 className="text-2xl font-bold text-slate-900 mb-3">Starter Pack</h4>
              <p className="mb-2">
                <span className="text-5xl font-black text-slate-900">$99</span>
              </p>
              <p className="text-sm text-slate-600 mb-6">25 credits (never expire)</p>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>1 credit = 1 AI test</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>5 credits = 1 human test</span>
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
              <Link href="/company/signup">
                <Button variant="outline" className="w-full py-6 border-2 hover:bg-slate-50">Buy Credits</Button>
              </Link>
            </div>

            {/* Growth Pack */}
            <div className="group relative p-8 rounded-3xl border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-white hover:shadow-2xl transition-all duration-300 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">Growth Pack</h4>
              <p className="mb-2">
                <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$449</span>
              </p>
              <p className="text-sm text-slate-600 mb-2">120 credits + 10% bonus</p>
              <p className="text-xs text-green-600 font-semibold mb-6">Save $50 vs pay-per-test</p>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">Credits never expire</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">Custom personas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">Advanced analytics</span>
                </li>
              </ul>
              <Link href="/company/signup">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 shadow-lg hover:shadow-xl transition-all btn-glow">Buy Credits</Button>
              </Link>
            </div>

            {/* Enterprise Pack */}
            <div className="group p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-300">
              <h4 className="text-2xl font-bold text-slate-900 mb-3">Enterprise Pack</h4>
              <p className="mb-2">
                <span className="text-5xl font-black text-slate-900">$1,999</span>
              </p>
              <p className="text-sm text-slate-600 mb-2">600 credits + 20% bonus</p>
              <p className="text-xs text-green-600 font-semibold mb-6">Save $400 vs pay-per-test</p>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>White-label reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>24/7 priority support</span>
                </li>
              </ul>
              <Link href="/company/signup">
                <Button variant="outline" className="w-full py-6 border-2 hover:bg-slate-50">Buy Credits</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-sm font-bold text-purple-700">⚡ Limited Spots Available</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Join Our Early Access Program
          </h3>
          <p className="text-xl text-slate-600 mb-4">
            Lock in <span className="font-bold text-purple-600">lifetime discounts</span>, get <span className="font-bold text-blue-600">priority support</span>, 
            and help <span className="font-bold text-slate-900">shape our roadmap</span>.
          </p>
          <p className="text-lg text-slate-500 mb-8">
            Only <span className="font-bold text-red-600">50 spots remaining</span> for companies. Applications reviewed within 5-7 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/early-access">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 btn-glow group">
                Apply for Early Access
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/company/signup">
              <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-purple-600 hover:bg-purple-50 px-10 py-7 text-lg transition-all duration-300">
                Start Testing Now
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Lifetime discounts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Shape features</span>
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
                <li><Link href="/early-access" className="hover:text-white transition-colors">Early Access</Link></li>
                <li><Link href="/dashboard/milestones" className="hover:text-white transition-colors">Milestones</Link></li>
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
