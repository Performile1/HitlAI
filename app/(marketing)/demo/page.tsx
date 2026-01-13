import { Users, Building2, Shield, ArrowRight, CheckCircle, Camera } from 'lucide-react';
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

          <div className="grid md:grid-cols-3 gap-8">
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

            {/* Admin Demo */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Admin Account</h3>
              <p className="text-slate-600 mb-6">
                Manage AI personas, review flagged testers, configure platform settings, and oversee operations
              </p>

              {/* Screenshot Placeholder */}
              <div className="bg-slate-100 rounded-lg p-4 mb-6 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Admin Dashboard</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Manage AI digital twins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Review flagged testers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Configure platform settings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Monitor system health</span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-slate-600 mb-1">Demo Credentials</div>
                <div className="font-mono text-sm text-slate-900">
                  <div>📧 admin@hitlai.com</div>
                  <div>🔑 admin123</div>
                </div>
              </div>

              <Link href="/admin/login">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Try Admin Demo
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
