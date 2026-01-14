import Link from 'next/link'
import { Shield, Lock, Eye, Database, Users, FileText } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-100 border border-blue-200">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Privacy Policy</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              Your Privacy Matters
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We're committed to protecting your data and being transparent about how we use it.
            </p>
            <p className="text-sm text-slate-500 mt-4">Last updated: January 14, 2026</p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#information-collection" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Information We Collect
            </a>
            <a href="#how-we-use" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              How We Use Data
            </a>
            <a href="#data-sharing" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Data Sharing
            </a>
            <a href="#your-rights" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Your Rights
            </a>
            <a href="#security" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Security
            </a>
            <a href="#contact" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">Introduction</h2>
              <p className="text-slate-600 leading-relaxed">
                HitlAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at hitlai.com (the "Service").
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                By using HitlAI, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </div>

            {/* Information We Collect */}
            <div id="information-collection" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Information We Collect</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">1. Information You Provide</h3>
              <ul className="space-y-3 text-slate-600">
                <li><strong>Account Information:</strong> Name, email address, company name, password</li>
                <li><strong>Profile Information:</strong> Demographics, expertise areas, testing preferences</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely by Stripe)</li>
                <li><strong>Test Data:</strong> URLs tested, annotations, screenshots, recordings, feedback</li>
                <li><strong>Communications:</strong> Messages, support requests, feedback you send us</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">2. Information Collected Automatically</h3>
              <ul className="space-y-3 text-slate-600">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">3. Biometric Data (Testers Only)</h3>
              <p className="text-slate-600 leading-relaxed">
                For human testers, we collect behavioral biometric data to verify human participation and improve AI training:
              </p>
              <ul className="space-y-3 text-slate-600 mt-4">
                <li><strong>Mouse Movement Patterns:</strong> Speed, acceleration, jitter variance</li>
                <li><strong>Typing Patterns:</strong> Keystroke timing, speed variance</li>
                <li><strong>Interaction Patterns:</strong> Focus events, scroll behavior, click patterns</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                This data is anonymized and used solely for fraud detection and AI training. It cannot be used to identify you personally.
              </p>
            </div>

            {/* How We Use Data */}
            <div id="how-we-use" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">How We Use Your Information</h2>
              </div>

              <ul className="space-y-4 text-slate-600">
                <li><strong>Provide Services:</strong> Process tests, generate reports, facilitate payments</li>
                <li><strong>AI Training:</strong> Train AI testers on human behavior patterns (anonymized)</li>
                <li><strong>Improve Platform:</strong> Analyze usage patterns, fix bugs, develop new features</li>
                <li><strong>Communications:</strong> Send test notifications, platform updates, support responses</li>
                <li><strong>Security:</strong> Detect fraud, prevent abuse, verify human testers</li>
                <li><strong>Legal Compliance:</strong> Comply with laws, respond to legal requests</li>
                <li><strong>Marketing:</strong> Send promotional emails (opt-out available)</li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div id="data-sharing" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Data Sharing and Disclosure</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">We Share Your Information With:</h3>
              <ul className="space-y-4 text-slate-600">
                <li>
                  <strong>Companies Requesting Tests:</strong> Test results, annotations, screenshots (tester identity anonymized unless you opt-in to share)
                </li>
                <li>
                  <strong>Service Providers:</strong> Supabase (database), Vercel (hosting), Stripe (payments), OpenAI (AI analysis)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> Law enforcement, regulatory authorities when legally required
                </li>
                <li>
                  <strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets
                </li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">We Do NOT:</h3>
              <ul className="space-y-3 text-slate-600">
                <li>❌ Sell your personal information to third parties</li>
                <li>❌ Share your data with advertisers</li>
                <li>❌ Use your test data for purposes other than stated</li>
                <li>❌ Share tester identities without explicit consent</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div id="your-rights" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Your Privacy Rights</h2>
              </div>

              <p className="text-slate-600 leading-relaxed mb-6">
                You have the following rights regarding your personal information:
              </p>

              <ul className="space-y-4 text-slate-600">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
                <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Object:</strong> Object to certain data processing activities</li>
              </ul>

              <p className="text-slate-600 leading-relaxed mt-6">
                To exercise these rights, contact us at <a href="mailto:privacy@hitlai.com" className="text-blue-600 hover:underline">privacy@hitlai.com</a>
              </p>
            </div>

            {/* Security */}
            <div id="security" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Data Security</h2>
              </div>

              <p className="text-slate-600 leading-relaxed mb-6">
                We implement industry-standard security measures to protect your information:
              </p>

              <ul className="space-y-3 text-slate-600">
                <li>🔒 <strong>Encryption:</strong> All data encrypted in transit (TLS) and at rest (AES-256)</li>
                <li>🔐 <strong>Authentication:</strong> Secure password hashing, optional 2FA</li>
                <li>🛡️ <strong>Access Control:</strong> Role-based permissions, least privilege principle</li>
                <li>📊 <strong>Monitoring:</strong> 24/7 security monitoring and logging</li>
                <li>🔍 <strong>Audits:</strong> Regular security audits and penetration testing</li>
                <li>💾 <strong>Backups:</strong> Encrypted daily backups with 30-day retention</li>
              </ul>

              <p className="text-slate-600 leading-relaxed mt-6">
                While we strive to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>

            {/* Data Retention */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">Data Retention</h2>
              <ul className="space-y-3 text-slate-600">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Test Data:</strong> Retained for 2 years for AI training and compliance</li>
                <li><strong>Payment Records:</strong> Retained for 7 years for tax/legal compliance</li>
                <li><strong>Deleted Accounts:</strong> Data anonymized or deleted within 90 days</li>
              </ul>
            </div>

            {/* Children's Privacy */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">Children's Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                HitlAI is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </div>

            {/* International Transfers */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">International Data Transfers</h2>
              <p className="text-slate-600 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-6">Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or prominent notice on our platform. Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Contact */}
            <div id="contact" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-black text-slate-900 mb-6">Contact Us</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-slate-50 p-6 rounded-xl">
                <p className="text-slate-700"><strong>Email:</strong> <a href="mailto:privacy@hitlai.com" className="text-blue-600 hover:underline">privacy@hitlai.com</a></p>
                <p className="text-slate-700 mt-2"><strong>Address:</strong> HitlAI, Stockholm, Sweden</p>
                <p className="text-slate-700 mt-2"><strong>Data Protection Officer:</strong> Rickard Wig</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-slate-600 mb-8">
            We're here to help. Reach out to our team anytime.
          </p>
          <Link href="mailto:privacy@hitlai.com" className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Contact Privacy Team
          </Link>
        </div>
      </section>
    </div>
  )
}
