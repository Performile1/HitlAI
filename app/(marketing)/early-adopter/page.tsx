'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, CheckCircle, Sparkles, Users, TrendingDown } from 'lucide-react'

const tiers = [
  {
    id: 'founding_partner',
    name: 'Founding Partner',
    spots: 10,
    discount: '25%',
    benefits: [
      'Lifetime 25% discount on all plans',
      'Priority support & dedicated account manager',
      'Early access to all new features',
      'Quarterly strategy sessions with founders',
      'Logo on website as founding partner',
      'Input on product roadmap'
    ],
    commitment: '$500/month minimum for 12 months'
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    spots: 40,
    discount: '15%',
    benefits: [
      'Lifetime 15% discount on all plans',
      'Priority support',
      'Early access to new features',
      'Monthly product updates',
      'Logo on website as early adopter'
    ],
    commitment: '$200/month minimum for 6 months'
  },
  {
    id: 'beta_user',
    name: 'Beta User',
    spots: 150,
    discount: '10%',
    benefits: [
      'First year 10% discount',
      'Priority support during beta',
      'Early access to new features',
      'Beta user badge'
    ],
    commitment: '$100/month minimum for 3 months'
  }
]

export default function EarlyAdopterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTier, setSelectedTier] = useState('early_adopter')
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    companySize: '',
    industry: '',
    monthlyTestVolume: '',
    currentTestingApproach: '',
    whyInterested: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/early-adopter/apply', {
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

      router.push('/application-success?type=company')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Limited Time Opportunity</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
            Become an Early Adopter
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Lock in exclusive pricing and help shape the future of AI-powered testing. 
            Limited spots available at each tier.
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
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {selectedTier === tier.id && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-black text-blue-600">{tier.discount}</span>
                    <span className="text-slate-600">lifetime discount</span>
                  </div>
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
                  <p className="text-xs text-slate-600">{tier.commitment}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Application Form</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Size *
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Industry *
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    placeholder="e.g., SaaS, E-commerce"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Testing Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Testing Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected Monthly Test Volume *
                  </label>
                  <select
                    name="monthlyTestVolume"
                    value={formData.monthlyTestVolume}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select volume</option>
                    <option value="10-50">10-50 tests/month</option>
                    <option value="51-100">51-100 tests/month</option>
                    <option value="101-500">101-500 tests/month</option>
                    <option value="501+">501+ tests/month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Testing Approach
                  </label>
                  <textarea
                    name="currentTestingApproach"
                    value={formData.currentTestingApproach}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us how you currently handle testing..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Why are you interested in the Early Adopter Program? *
                  </label>
                  <textarea
                    name="whyInterested"
                    value={formData.whyInterested}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="What excites you about HitlAI? What problems are you trying to solve?"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-slate-200">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold shadow-lg"
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Lifetime Savings</h3>
            <p className="text-sm text-slate-600">Lock in your discount forever as our AI improves and prices drop</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Shape the Product</h3>
            <p className="text-sm text-slate-600">Direct input on features and roadmap as a founding customer</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Priority Access</h3>
            <p className="text-sm text-slate-600">First to try new features and dedicated support</p>
          </div>
        </div>
      </main>
    </div>
  )
}
