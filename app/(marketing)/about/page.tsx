import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Users, Target, Zap, Heart, Globe, Award, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              About HitlAI
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We're building the future of software testing by combining the best of human insight with AI efficiency.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                HitlAI exists to democratize high-quality software testing. We believe every company deserves access to comprehensive testing that catches both technical bugs and real user experience issues.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                By training AI testers on real human behavior, we've created a platform that delivers the speed and cost-efficiency of automation with the insight and empathy of human testing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-2xl">
                <Target className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Precision</h3>
                <p className="text-sm text-slate-600">AI trained on real human patterns</p>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl">
                <Users className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Human-First</h3>
                <p className="text-sm text-slate-600">Real testers train and validate AI</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-2xl">
                <Zap className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Speed</h3>
                <p className="text-sm text-slate-600">24/7 automated testing</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-2xl">
                <TrendingUp className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Scale</h3>
                <p className="text-sm text-slate-600">Test at any volume</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-slate-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-slate-600 leading-relaxed mb-6">
              HitlAI was founded in 2024 by Rickard Wig, a software engineer who experienced firsthand the limitations of traditional testing approaches. After years of watching companies struggle to balance the cost of human testing with the limitations of pure automation, he envisioned a better way.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              The breakthrough came from a simple insight: what if AI could learn not just to execute tests, but to think like real users? By having human testers train AI personas with their actual testing behavior, we created digital twins that combine human intuition with machine efficiency.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Today, HitlAI serves hundreds of companies worldwide, from startups to enterprises, helping them ship better software faster. Our platform has processed over 50,000 tests, with our AI testers learning from 2,000+ human testers across diverse backgrounds and expertise levels.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Human-Centric</h3>
              <p className="text-slate-600">
                We believe technology should empower people, not replace them. Our AI learns from humans and creates opportunities for testers worldwide.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Quality First</h3>
              <p className="text-slate-600">
                We're obsessed with accuracy. Every AI prediction is validated, every insight is actionable, every report is comprehensive.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Transparency</h3>
              <p className="text-slate-600">
                We're open about how our AI works, how testers are compensated, and how we protect your data. No black boxes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Leadership</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-black text-white">RW</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Rickard Wig</h3>
                  <p className="text-slate-600">Founder & CEO</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Rickard is a software engineer and entrepreneur passionate about making quality software testing accessible to everyone. With over a decade of experience in software development and testing, he founded HitlAI to bridge the gap between human insight and AI efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Join Us on Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether you're a company looking for better testing or a tester wanting to earn income, we'd love to have you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/company/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Testing
              </Button>
            </Link>
            <Link href="/careers">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                View Careers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
