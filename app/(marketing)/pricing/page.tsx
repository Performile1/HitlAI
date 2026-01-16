'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Zap, Star, TrendingUp, Sparkles, TrendingDown } from 'lucide-react'
import EarlyAdopterCard from '@/components/EarlyAdopterCard'

const creditPackages = [
  {
    name: 'Starter Pack',
    price: 99,
    credits: 25,
    bonus: 0,
    description: 'Perfect for trying HitlAI',
    features: [
      '25 credits (never expire)',
      '1 credit = 1 AI test',
      '5 credits = 1 human test',
      'Email support',
      'Basic personas'
    ]
  },
  {
    name: 'Growth Pack',
    price: 449,
    credits: 120,
    bonus: 10,
    popular: true,
    description: 'Best for growing companies',
    features: [
      '120 credits + 10% bonus',
      'Save $50 vs pay-per-test',
      'Priority support',
      'Custom personas',
      'Advanced analytics'
    ]
  },
  {
    name: 'Enterprise Pack',
    price: 1999,
    credits: 600,
    bonus: 20,
    description: 'For high-volume testing',
    features: [
      '600 credits + 20% bonus',
      'Save $400 vs pay-per-test',
      'Dedicated account manager',
      'Custom integrations',
      'White-label reports'
    ]
  }
]

const monthlyPlans = [
  {
    name: 'Free',
    price: 0,
    aiTests: 10,
    humanTests: 0,
    features: [
      '10 AI tests/month',
      'Basic personas',
      'Email support',
      'Community access'
    ]
  },
  {
    name: 'Pro',
    price: 299,
    aiTests: 100,
    humanTests: 10,
    popular: true,
    features: [
      '100 AI tests/month',
      '10 human tests/month',
      'Custom personas',
      'Priority support',
      'Save 40% vs pay-per-test',
      'Advanced analytics'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    aiTests: 'Unlimited',
    humanTests: '50+',
    features: [
      'Unlimited AI tests',
      '50+ human tests/month',
      'Dedicated testers',
      'Custom integrations',
      '24/7 support',
      'SLA guarantee'
    ]
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold">HitlAI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/company/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/company/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Simple, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Pay only for what you use. No hidden fees. Credits never expire.
          </p>
        </div>

        {/* Early Adopter Programs */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Limited Time Opportunity</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Lock In Lifetime Discounts
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Join our early adopter program and save up to 25% forever. As our AI improves, 
              prices drop for everyone—but early adopters keep their exclusive discounts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <EarlyAdopterCard type="company" />
            <EarlyAdopterCard type="tester" />
          </div>

          {/* Price Evolution Timeline */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <TrendingDown className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-slate-900">How Prices Drop as AI Improves</h3>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <div className="text-sm font-semibold text-blue-600 mb-2">Phase 1: Now</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">$5</div>
                <div className="text-xs text-slate-600">per AI test</div>
                <div className="text-xs text-slate-500 mt-2">External APIs (GPT-4, Claude)</div>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <div className="text-sm font-semibold text-purple-600 mb-2">Phase 2: 1,000 tests</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">$3</div>
                <div className="text-xs text-slate-600">per AI test (40% off)</div>
                <div className="text-xs text-slate-500 mt-2">Fine-tuned models</div>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                <div className="text-sm font-semibold text-green-600 mb-2">Phase 3: 5,000 tests</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">$1.50</div>
                <div className="text-xs text-slate-600">per AI test (70% off)</div>
                <div className="text-xs text-slate-500 mt-2">Self-hosted LLaMA/Mixtral</div>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                <div className="text-sm font-semibold text-orange-600 mb-2">Phase 4: 10,000 tests</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">$1</div>
                <div className="text-xs text-slate-600">per AI test (80% off)</div>
                <div className="text-xs text-slate-500 mt-2">Full hybrid optimization</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700">
                <strong className="text-blue-600">Early Adopter Advantage:</strong> If you lock in a 25% discount today at $5/test, 
                you'll pay <strong>$3.75</strong> in Phase 1, <strong>$2.25</strong> in Phase 2, <strong>$1.13</strong> in Phase 3, 
                and <strong>$0.75</strong> in Phase 4. Your discount compounds with every improvement!
              </p>
            </div>
          </div>
        </section>

        {/* Pay-Per-Test Pricing */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-16 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-2xl font-bold text-center mb-8">Pay-Per-Test Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Test</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">$5</div>
              <p className="text-sm text-slate-600">per test</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
              <Star className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Human Test</h3>
              <div className="text-4xl font-bold text-green-600 mb-2">$25</div>
              <p className="text-sm text-slate-600">per test</p>
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Credit Packages</h2>
          <p className="text-center text-slate-600 mb-12">Buy credits in bulk and save. Credits never expire.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {creditPackages.map((pkg, index) => (
              <div
                key={pkg.name}
                className={`
                  rounded-2xl p-8 border-2 transition-all duration-300 card-hover animate-fade-in-up
                  ${pkg.popular 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-xl scale-105' 
                    : 'border-slate-200 bg-white shadow-lg'
                  }
                `}
                style={{animationDelay: `${0.2 + index * 0.1}s`}}
              >
                {pkg.popular && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-slate-600 mb-4">{pkg.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold">${pkg.price}</span>
                  <span className="text-slate-600"> / {pkg.credits} credits</span>
                </div>
                
                {pkg.bonus > 0 && (
                  <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg mb-4 font-semibold text-sm">
                    +{pkg.bonus}% Bonus Credits
                  </div>
                )}
                
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/company/signup">
                  <Button className={`w-full ${pkg.popular ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}`}>
                    Buy Credits
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Monthly Plans</h2>
          <p className="text-center text-slate-600 mb-12">For companies that test regularly</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {monthlyPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`
                  rounded-2xl p-8 border-2 transition-all duration-300 card-hover animate-fade-in-up
                  ${plan.popular 
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-xl scale-105' 
                    : 'border-slate-200 bg-white shadow-lg'
                  }
                `}
                style={{animationDelay: `${0.5 + index * 0.1}s`}}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                    POPULAR
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {typeof plan.price === 'number' && <span className="text-slate-600">/month</span>}
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-slate-600 mb-1">AI Tests</div>
                  <div className="text-2xl font-bold text-blue-600">{plan.aiTests}</div>
                  <div className="text-sm text-slate-600 mt-3 mb-1">Human Tests</div>
                  <div className="text-2xl font-bold text-green-600">{plan.humanTests}</div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href={plan.price === 'Custom' ? '/contact' : '/company/signup'}>
                  <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}>
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl p-8 shadow-xl animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose HitlAI?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">10x Cheaper AI Tests</h3>
              <p className="text-sm text-slate-600">AI tests at $5 vs competitors' $49-99 human-only pricing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Flexible Pricing</h3>
              <p className="text-sm text-slate-600">Pay-per-test, credit packages, or monthly plans - you choose</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Hybrid Approach</h3>
              <p className="text-sm text-slate-600">Unique AI + Human testing combination for best results</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-6 shadow-lg">
              <summary className="font-semibold cursor-pointer">Do credits expire?</summary>
              <p className="mt-2 text-slate-600">No! Credits never expire. Buy them when you need them and use them whenever you want.</p>
            </details>
            <details className="bg-white rounded-lg p-6 shadow-lg">
              <summary className="font-semibold cursor-pointer">Can I switch between plans?</summary>
              <p className="mt-2 text-slate-600">Yes! You can switch between pay-per-test, credit packages, and monthly plans at any time.</p>
            </details>
            <details className="bg-white rounded-lg p-6 shadow-lg">
              <summary className="font-semibold cursor-pointer">What's the difference between AI and human tests?</summary>
              <p className="mt-2 text-slate-600">AI tests use our trained personas to simulate user behavior ($5). Human tests use real people matching your target audience ($25).</p>
            </details>
            <details className="bg-white rounded-lg p-6 shadow-lg">
              <summary className="font-semibold cursor-pointer">Is there a free trial?</summary>
              <p className="mt-2 text-slate-600">Yes! The Free plan includes 10 AI tests per month. No credit card required.</p>
            </details>
          </div>
        </div>
      </main>
    </div>
  )
}
