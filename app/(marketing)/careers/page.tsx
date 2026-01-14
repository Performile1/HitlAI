import { Mail, MapPin, Users, Rocket, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Join the Future of Testing
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              We're building the world's most advanced testing platform. 
              Help us revolutionize how software is tested with AI and human collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why HitlAI?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We're a fast-growing startup combining cutting-edge AI with human expertise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Cutting-Edge Tech</h3>
              <p className="text-slate-600">
                Work with GPT-4, Next.js, Supabase, and the latest AI technologies
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Amazing Team</h3>
              <p className="text-slate-600">
                Collaborate with talented engineers, designers, and product people
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Impact</h3>
              <p className="text-slate-600">
                Help thousands of companies deliver better products to millions of users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Move Fast</h3>
                  <p className="text-slate-600">
                    We ship quickly, iterate rapidly, and learn from our users
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">User-Centric</h3>
                  <p className="text-slate-600">
                    Every decision starts with our users - companies and testers
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Quality First</h3>
                  <p className="text-slate-600">
                    We build products we're proud of with attention to detail
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Rocket className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Innovation</h3>
                  <p className="text-slate-600">
                    We're not afraid to try new approaches and challenge the status quo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Open Positions</h2>
            <p className="text-xl text-slate-600">
              We don't have any specific openings right now, but we're always looking for exceptional talent
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Spontaneous Application
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Think you'd be a great fit for HitlAI? We'd love to hear from you! 
              Send us your resume and tell us why you want to join our mission.
            </p>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Email us at</div>
                  <a 
                    href="mailto:careers@hitlai.com" 
                    className="text-lg font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    careers@hitlai.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Location</div>
                  <div className="text-lg font-semibold text-slate-900">
                    Remote-first (Europe)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a href="mailto:careers@hitlai.com">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  <Mail className="w-5 h-5 mr-2" />
                  Send Application
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What to Include */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What to Include</h2>
            <p className="text-slate-600">
              Help us get to know you better
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-2">📄 Your Resume/CV</h3>
              <p className="text-sm text-slate-600">
                Tell us about your experience, skills, and what you've built
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-2">💡 Why HitlAI?</h3>
              <p className="text-sm text-slate-600">
                What excites you about our mission and what you'd bring to the team
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-2">🚀 Your Work</h3>
              <p className="text-sm text-slate-600">
                Portfolio, GitHub, or examples of projects you're proud of
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-2">🎯 Your Role</h3>
              <p className="text-sm text-slate-600">
                What role you're interested in or how you see yourself contributing
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
