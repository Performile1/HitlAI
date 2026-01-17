'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, Calendar, ArrowRight, Home } from 'lucide-react'

function ApplicationSuccessContent() {
  const searchParams = useSearchParams()
  const [type, setType] = useState<'company' | 'tester'>('company')

  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam === 'tester') {
      setType('tester')
    }
  }, [searchParams])

  const isCompany = type === 'company'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Application Submitted!
          </h1>
          <p className="text-xl text-slate-600">
            Thank you for applying to our {isCompany ? 'Early Adopter' : 'Founding Tester'} program
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What Happens Next?</h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Confirmation Email</h3>
                <p className="text-slate-600 text-sm">
                  You'll receive a confirmation email within the next few minutes. 
                  Please check your spam folder if you don't see it.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Review Process</h3>
                <p className="text-slate-600 text-sm">
                  Our team will review your application within <strong>48 hours</strong>. 
                  We carefully evaluate each application to ensure a great fit.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Decision & Onboarding</h3>
                <p className="text-slate-600 text-sm">
                  {isCompany ? (
                    <>
                      If approved, we'll send you an onboarding email with your discount code, 
                      next steps, and a link to schedule an onboarding call with our team.
                    </>
                  ) : (
                    <>
                      If approved, we'll send you an onboarding email with your enhanced revenue share details, 
                      equity documentation, and next steps to start testing.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Expected Timeline</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• <strong>Today:</strong> Confirmation email sent</li>
              <li>• <strong>Within 48 hours:</strong> Application reviewed</li>
              <li>• <strong>Within 3-5 days:</strong> Decision email sent</li>
              <li>• <strong>Within 1 week:</strong> Onboarding begins (if approved)</li>
            </ul>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">While You Wait</h2>
          
          {isCompany ? (
            <div className="space-y-4">
              <p className="text-slate-600">
                Learn more about HitlAI and how our progressive unlock system works:
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Explore the homepage
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    View pricing details
                  </Link>
                </li>
                <li>
                  <Link href="/company/signup" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Create your company account (you can do this now!)
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-600">
                Get ready to start testing by exploring the platform:
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Learn about HitlAI
                  </Link>
                </li>
                <li>
                  <Link href="/tester/signup" className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Create your tester account (you can do this now!)
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://docs.hitlai.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Read testing best practices
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          {isCompany ? (
            <Link href="/company/signup" className="flex-1">
              <Button variant="outline" className="w-full py-3">
                Create Company Account
              </Button>
            </Link>
          ) : (
            <Link href="/tester/signup" className="flex-1">
              <Button variant="outline" className="w-full py-3">
                Create Tester Account
              </Button>
            </Link>
          )}
        </div>

        {/* Contact */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Questions? Email us at{' '}
            <a href="mailto:hello@hitlai.com" className="text-blue-600 hover:text-blue-700 font-medium">
              hello@hitlai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ApplicationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <ApplicationSuccessContent />
    </Suspense>
  )
}
