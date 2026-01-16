'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, CheckCircle, Sparkles, TrendingUp, Award, DollarSign } from 'lucide-react'

const tiers = [
  {
    id: 'founding_tester',
    name: 'Founding Tester',
    spots: 20,
    revenueShare: '40%',
    equity: '0.05%',
    benefits: [
      '40% revenue share per test (vs 30% standard)',
      '0.05% equity with 4-year vesting',
      'Founding Tester badge & recognition',
      'Direct line to founders',
      'Input on AI training priorities',
      'Early access to all features',
      'Priority test assignments'
    ],
    requirements: 'Commit to 50+ tests in first 3 months'
  },
  {
    id: 'early_tester',
    name: 'Early Tester',
    spots: 30,
    revenueShare: '35%',
    equity: '0.01%',
    benefits: [
      '35% revenue share per test',
      '0.01% equity with 4-year vesting',
      'Early Tester badge',
      'Priority support',
      'Early feature access',
      'Monthly feedback sessions'
    ],
    requirements: 'Commit to 30+ tests in first 3 months'
  },
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    spots: 50,
    revenueShare: '32%',
    equity: null,
    benefits: [
      '32% revenue share per test',
      'Beta Tester badge',
      'Priority support during beta',
      'Early feature access',
      'Community recognition'
    ],
    requirements: 'Commit to 20+ tests in first 3 months'
  }
]

export default function FoundingTesterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTier, setSelectedTier] = useState('early_tester')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    portfolioUrl: '',
    yearsOfExperience: '',
    testingSpecialties: [] as string[],
    platforms: [] as string[],
    availability: '',
    whyInterested: '',
    relevantExperience: '',
    sampleWork: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/founding-tester/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tier: selectedTier
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Application failed')
      }

      router.push('/application-success?type=tester')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleCheckboxChange = (field: 'testingSpecialties' | 'platforms', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-green-50 to-blue-50 border border-green-100">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Exclusive Opportunity</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
            Become a Founding Tester
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Join our elite team of testers, earn enhanced revenue share, and receive equity 
            for helping train our AI. Limited spots available.
          </p>
        </div>

        {/* Tier Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Choose Your Tier</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  selectedTier === tier.id
                    ? 'border-green-600 bg-green-50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {selectedTier === tier.id && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-black text-green-600">{tier.revenueShare}</span>
                    <span className="text-slate-600">per test</span>
                  </div>
                  {tier.equity && (
                    <p className="text-sm font-semibold text-purple-600 mb-1">+ {tier.equity} equity</p>
                  )}
                  <p className="text-sm text-slate-500">{tier.spots} spots remaining</p>
                </div>

                <ul className="space-y-2 mb-4">
                  {tier.benefits.slice(0, 3).map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                  {tier.benefits.length > 3 && (
                    <li className="text-sm text-slate-500">+ {tier.benefits.length - 3} more benefits</li>
                  )}
                </ul>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-600">{tier.requirements}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-900">Application Form</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Portfolio/Website
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Testing Experience</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Years of Testing Experience *
                  </label>
                  <select
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Testing Specialties * (select all that apply)
                  </label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {['UX Testing', 'Functional Testing', 'Accessibility', 'Performance', 'Security', 'Mobile Apps', 'E-commerce', 'SaaS'].map(specialty => (
                      <label key={specialty} className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.testingSpecialties.includes(specialty)}
                          onChange={() => handleCheckboxChange('testingSpecialties', specialty)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-slate-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Platforms * (select all that apply)
                  </label>
                  <div className="grid md:grid-cols-3 gap-2">
                    {['Web', 'iOS', 'Android', 'Desktop', 'Tablet'].map(platform => (
                      <label key={platform} className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.platforms.includes(platform)}
                          onChange={() => handleCheckboxChange('platforms', platform)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-slate-700">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Weekly Availability *
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select availability</option>
                    <option value="5-10">5-10 hours/week</option>
                    <option value="10-20">10-20 hours/week</option>
                    <option value="20-30">20-30 hours/week</option>
                    <option value="30+">30+ hours/week (full-time)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Motivation & Experience */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tell Us More</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Why do you want to be a Founding Tester? *
                  </label>
                  <textarea
                    name="whyInterested"
                    value={formData.whyInterested}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="What excites you about this opportunity? Why are you a great fit?"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Relevant Testing Experience *
                  </label>
                  <textarea
                    name="relevantExperience"
                    value={formData.relevantExperience}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Describe your most relevant testing experience. What types of products have you tested? What bugs have you found?"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sample Work or Bug Reports (Optional)
                  </label>
                  <textarea
                    name="sampleWork"
                    value={formData.sampleWork}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Share links to bug reports, test cases, or examples of your work..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-slate-200">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 text-lg font-semibold shadow-lg"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
              <p className="text-sm text-slate-500 text-center mt-4">
                We'll review your application within 48 hours and get back to you via email.
              </p>
            </div>
          </form>
        </div>

        {/* Benefits Recap */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Enhanced Earnings</h3>
            <p className="text-sm text-slate-600">Up to 40% revenue share per test vs 30% standard rate</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Equity Ownership</h3>
            <p className="text-sm text-slate-600">Up to 0.05% equity with 4-year vesting schedule</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Shape the AI</h3>
            <p className="text-sm text-slate-600">Your tests directly train our AI and improve the platform</p>
          </div>
        </div>
      </main>
    </div>
  )
}
