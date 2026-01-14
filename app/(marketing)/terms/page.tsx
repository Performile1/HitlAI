import Link from 'next/link'
import { FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-100 border border-blue-200">
              <Scale className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Terms of Service</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Please read these terms carefully before using HitlAI.
            </p>
            <p className="text-sm text-slate-500 mt-4">Last updated: January 14, 2026</p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#acceptance" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Acceptance
            </a>
            <a href="#accounts" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Accounts
            </a>
            <a href="#services" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Services
            </a>
            <a href="#payment" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Payment
            </a>
            <a href="#conduct" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              User Conduct
            </a>
            <a href="#termination" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Termination
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Acceptance */}
            <div id="acceptance" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-black text-slate-900 mb-6">1. Acceptance of Terms</h2>
              <p className="text-slate-600 leading-relaxed">
                By accessing or using HitlAI ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                These Terms apply to all visitors, users, and others who access or use the Service, including but not limited to companies requesting tests and human testers performing tests.
              </p>
            </div>

            {/* Definitions */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">2. Definitions</h2>
              <ul className="space-y-3 text-slate-600">
                <li><strong>"Service"</strong> refers to the HitlAI platform accessible at hitlai.com</li>
                <li><strong>"Company"</strong> refers to organizations requesting testing services</li>
                <li><strong>"Tester"</strong> refers to human testers performing tests on the platform</li>
                <li><strong>"AI Tester"</strong> refers to automated testing agents trained on human behavior</li>
                <li><strong>"Test"</strong> refers to a testing session conducted on a website or application</li>
                <li><strong>"Credits"</strong> refers to the currency used to purchase testing services</li>
              </ul>
            </div>

            {/* Accounts */}
            <div id="accounts" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-black text-slate-900 mb-6">3. User Accounts</h2>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">3.1 Account Creation</h3>
              <p className="text-slate-600 leading-relaxed">
                You must create an account to use the Service. You agree to:
              </p>
              <ul className="space-y-2 text-slate-600 mt-4">
                <li>✓ Provide accurate, current, and complete information</li>
                <li>✓ Maintain and update your information</li>
                <li>✓ Keep your password secure and confidential</li>
                <li>✓ Be at least 18 years of age</li>
                <li>✓ Notify us immediately of unauthorized access</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">3.2 Account Types</h3>
              <ul className="space-y-3 text-slate-600">
                <li><strong>Company Accounts:</strong> For organizations requesting testing services</li>
                <li><strong>Tester Accounts:</strong> For individuals performing tests</li>
                <li><strong>Admin Accounts:</strong> For HitlAI platform administrators</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">3.3 Account Responsibility</h3>
              <p className="text-slate-600 leading-relaxed">
                You are responsible for all activities that occur under your account. We are not liable for any loss or damage arising from unauthorized use of your account.
              </p>
            </div>

            {/* Services */}
            <div id="services" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-black text-slate-900 mb-6">4. Services Provided</h2>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">4.1 For Companies</h3>
              <ul className="space-y-3 text-slate-600">
                <li>Request AI-only, human-only, or hybrid testing</li>
                <li>Define test objectives and personas</li>
                <li>Receive detailed test reports with insights</li>
                <li>Access test recordings and screenshots</li>
                <li>View human vs AI performance comparisons</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">4.2 For Testers</h3>
              <ul className="space-y-3 text-slate-600">
                <li>Accept and complete testing assignments</li>
                <li>Earn $20 per completed test</li>
                <li>Train AI personas with your testing behavior</li>
                <li>Earn passive income when AI you trained runs tests</li>
                <li>Build reputation through quality ratings</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">4.3 Service Availability</h3>
              <p className="text-slate-600 leading-relaxed">
                We strive for 99.9% uptime but do not guarantee uninterrupted access. We may suspend the Service for maintenance, updates, or emergencies with reasonable notice when possible.
              </p>
            </div>

            {/* Payment */}
            <div id="payment" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-black text-slate-900 mb-6">5. Payment Terms</h2>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">5.1 Company Payments</h3>
              <ul className="space-y-3 text-slate-600">
                <li><strong>Pricing:</strong> $5 per AI test, $25 per human test</li>
                <li><strong>Credits:</strong> Purchase credits in advance (never expire)</li>
                <li><strong>Payment Methods:</strong> Credit card, debit card via Stripe</li>
                <li><strong>Refunds:</strong> No refunds on completed tests; partial refunds for cancelled tests</li>
                <li><strong>Taxes:</strong> Prices exclude applicable taxes</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">5.2 Tester Payments</h3>
              <ul className="space-y-3 text-slate-600">
                <li><strong>Rate:</strong> $20 per completed test (after platform fee)</li>
                <li><strong>AI Revenue Share:</strong> Earn when AI you trained runs tests</li>
                <li><strong>Payment Schedule:</strong> Weekly payouts via Stripe</li>
                <li><strong>Minimum Payout:</strong> $50 minimum balance required</li>
                <li><strong>Taxes:</strong> You are responsible for reporting income</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">5.3 Platform Fees</h3>
              <p className="text-slate-600 leading-relaxed">
                HitlAI retains a 20% platform fee on human tests to cover infrastructure, AI training, and operations.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">6. Intellectual Property</h2>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">6.1 HitlAI Property</h3>
              <p className="text-slate-600 leading-relaxed">
                The Service, including all content, features, and functionality, is owned by HitlAI and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">6.2 User Content</h3>
              <p className="text-slate-600 leading-relaxed">
                You retain ownership of content you submit (test annotations, feedback, etc.). By submitting content, you grant HitlAI a worldwide, non-exclusive, royalty-free license to use, reproduce, and analyze your content for:
              </p>
              <ul className="space-y-2 text-slate-600 mt-4">
                <li>✓ Providing the Service</li>
                <li>✓ Training AI models</li>
                <li>✓ Generating test reports</li>
                <li>✓ Improving the platform</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">6.3 AI Training Data</h3>
              <p className="text-slate-600 leading-relaxed">
                Behavioral data collected from testers is anonymized and used to train AI personas. This data becomes part of HitlAI's proprietary AI models.
              </p>
            </div>

            {/* User Conduct */}
            <div id="conduct" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-black text-slate-900 mb-6">7. User Conduct</h2>
              
              <p className="text-slate-600 leading-relaxed mb-6">You agree NOT to:</p>
              
              <ul className="space-y-3 text-slate-600">
                <li>❌ Use bots, scripts, or automation to perform tests (testers only)</li>
                <li>❌ Submit false, misleading, or low-quality test results</li>
                <li>❌ Share account credentials with others</li>
                <li>❌ Attempt to manipulate ratings or reviews</li>
                <li>❌ Reverse engineer or copy the Service</li>
                <li>❌ Use the Service for illegal purposes</li>
                <li>❌ Harass, abuse, or harm other users</li>
                <li>❌ Upload malware, viruses, or malicious code</li>
                <li>❌ Scrape or extract data from the platform</li>
                <li>❌ Circumvent security measures</li>
              </ul>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mt-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-orange-900 mb-2">Fraud Detection</h4>
                    <p className="text-sm text-orange-800">
                      We use biometric analysis to detect automated testing. Testers found using bots will be permanently banned and forfeit all earnings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Standards */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">8. Quality Standards (Testers)</h2>
              
              <p className="text-slate-600 leading-relaxed mb-6">
                Testers must maintain quality standards to remain active on the platform:
              </p>

              <ul className="space-y-3 text-slate-600">
                <li><strong>Minimum Rating:</strong> Maintain 3.5/5.0 average rating</li>
                <li><strong>Auto-Disable:</strong> Ratings below 2.5/5.0 result in automatic suspension</li>
                <li><strong>Test Completion:</strong> Complete tests within assigned timeframes</li>
                <li><strong>Quality Feedback:</strong> Provide detailed, actionable insights</li>
                <li><strong>Honest Testing:</strong> Test as a genuine user would</li>
              </ul>
            </div>

            {/* Termination */}
            <div id="termination" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-black text-slate-900 mb-6">9. Termination</h2>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">9.1 By You</h3>
              <p className="text-slate-600 leading-relaxed">
                You may terminate your account at any time through account settings. Upon termination:
              </p>
              <ul className="space-y-2 text-slate-600 mt-4">
                <li>• Companies: Unused credits remain valid for 1 year</li>
                <li>• Testers: Outstanding payments will be processed</li>
                <li>• Your data will be handled per our Privacy Policy</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">9.2 By HitlAI</h3>
              <p className="text-slate-600 leading-relaxed">
                We may suspend or terminate your account immediately if you:
              </p>
              <ul className="space-y-2 text-slate-600 mt-4">
                <li>• Violate these Terms</li>
                <li>• Engage in fraudulent activity</li>
                <li>• Fail to maintain quality standards (testers)</li>
                <li>• Pose a security risk to the platform</li>
              </ul>
            </div>

            {/* Disclaimers */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">10. Disclaimers</h2>
              
              <p className="text-slate-600 leading-relaxed mb-6">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>

              <ul className="space-y-2 text-slate-600">
                <li>• Accuracy or reliability of test results</li>
                <li>• Uninterrupted or error-free operation</li>
                <li>• Specific outcomes or business results</li>
                <li>• Compatibility with your systems</li>
              </ul>

              <p className="text-slate-600 leading-relaxed mt-6">
                AI test results are predictions based on training data and may not reflect actual user behavior. Human test results reflect individual tester opinions and may vary.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">11. Limitation of Liability</h2>
              
              <p className="text-slate-600 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, HITLAI SHALL NOT BE LIABLE FOR:
              </p>

              <ul className="space-y-2 text-slate-600 mt-4">
                <li>• Indirect, incidental, or consequential damages</li>
                <li>• Loss of profits, revenue, or business opportunities</li>
                <li>• Data loss or corruption</li>
                <li>• Third-party actions or content</li>
              </ul>

              <p className="text-slate-600 leading-relaxed mt-6">
                Our total liability shall not exceed the amount you paid to HitlAI in the 12 months preceding the claim.
              </p>
            </div>

            {/* Indemnification */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">12. Indemnification</h2>
              
              <p className="text-slate-600 leading-relaxed">
                You agree to indemnify and hold harmless HitlAI from any claims, damages, or expenses arising from:
              </p>

              <ul className="space-y-2 text-slate-600 mt-4">
                <li>• Your use of the Service</li>
                <li>• Your violation of these Terms</li>
                <li>• Your violation of any third-party rights</li>
                <li>• Content you submit to the platform</li>
              </ul>
            </div>

            {/* Dispute Resolution */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">13. Dispute Resolution</h2>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">13.1 Governing Law</h3>
              <p className="text-slate-600 leading-relaxed">
                These Terms are governed by the laws of Sweden, without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">13.2 Arbitration</h3>
              <p className="text-slate-600 leading-relaxed">
                Any disputes shall be resolved through binding arbitration in Stockholm, Sweden, except for claims seeking injunctive relief.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">14. Changes to Terms</h2>
              
              <p className="text-slate-600 leading-relaxed">
                We may modify these Terms at any time. We will notify you of material changes via email or prominent notice on the platform. Continued use after changes constitutes acceptance of the updated Terms.
              </p>
            </div>

            {/* Contact */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">15. Contact Information</h2>
              
              <div className="bg-slate-50 p-6 rounded-xl">
                <p className="text-slate-700"><strong>Email:</strong> <a href="mailto:legal@hitlai.com" className="text-blue-600 hover:underline">legal@hitlai.com</a></p>
                <p className="text-slate-700 mt-2"><strong>Address:</strong> HitlAI, Stockholm, Sweden</p>
                <p className="text-slate-700 mt-2"><strong>Company:</strong> Intellectual Property of Rickard Wig</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Questions About Our Terms?
          </h2>
          <p className="text-slate-600 mb-8">
            Our legal team is here to help clarify any questions.
          </p>
          <Link href="mailto:legal@hitlai.com" className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Contact Legal Team
          </Link>
        </div>
      </section>
    </div>
  )
}
