import Link from 'next/link'
import { Shield, Lock, Eye, Server, Key, AlertTriangle, CheckCircle, FileCheck } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-100 border border-blue-200">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Security</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              Security at HitlAI
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Your data security is our top priority. We implement industry-leading practices to protect your information.
            </p>
          </div>
        </div>
      </section>

      {/* Security Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">End-to-End Encryption</h3>
              <p className="text-slate-600">
                All data encrypted in transit (TLS 1.3) and at rest (AES-256)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Server className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">SOC 2 Compliant</h3>
              <p className="text-slate-600">
                Infrastructure meets SOC 2 Type II security standards
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Monitoring</h3>
              <p className="text-slate-600">
                Continuous security monitoring and incident response
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Security */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Infrastructure Security</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Cloud Infrastructure</h3>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Hosting:</strong> Vercel (Edge Network) with global CDN</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Database:</strong> Supabase (PostgreSQL) with automated backups</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Storage:</strong> Encrypted object storage with access controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Payments:</strong> Stripe (PCI DSS Level 1 certified)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Data Encryption</h3>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>In Transit:</strong> TLS 1.3 with perfect forward secrecy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>At Rest:</strong> AES-256 encryption for all stored data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Passwords:</strong> Bcrypt hashing with salt (12 rounds)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>API Keys:</strong> Encrypted environment variables</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Access Control */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Access Control</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Key className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Authentication</h3>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li>✓ Secure password requirements (min 8 chars, complexity)</li>
                <li>✓ Optional two-factor authentication (2FA)</li>
                <li>✓ Session management with automatic timeout</li>
                <li>✓ Account lockout after failed login attempts</li>
                <li>✓ Password reset with email verification</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Authorization</h3>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li>✓ Role-based access control (RBAC)</li>
                <li>✓ Row-level security (RLS) policies</li>
                <li>✓ Least privilege principle</li>
                <li>✓ Granular permissions per resource</li>
                <li>✓ Audit logs for sensitive operations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Security Practices</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Regular Audits</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Quarterly security audits</li>
                <li>• Annual penetration testing</li>
                <li>• Code security reviews</li>
                <li>• Dependency vulnerability scans</li>
                <li>• Third-party security assessments</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Monitoring & Logging</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• 24/7 security monitoring</li>
                <li>• Real-time threat detection</li>
                <li>• Comprehensive audit logs</li>
                <li>• Automated alerting system</li>
                <li>• Incident response procedures</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Data Protection</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Daily encrypted backups</li>
                <li>• 30-day backup retention</li>
                <li>• Disaster recovery plan</li>
                <li>• Data anonymization for AI training</li>
                <li>• Secure data deletion procedures</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Compliance & Certifications</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-50 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">GDPR Compliant</h3>
              </div>
              <p className="text-slate-600">
                Full compliance with EU General Data Protection Regulation, including data subject rights and privacy by design.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-slate-900">SOC 2 Type II</h3>
              </div>
              <p className="text-slate-600">
                Our infrastructure providers maintain SOC 2 Type II certification for security, availability, and confidentiality.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-8 h-8 text-purple-600" />
                <h3 className="text-xl font-bold text-slate-900">PCI DSS</h3>
              </div>
              <p className="text-slate-600">
                Payment processing through Stripe (PCI DSS Level 1 certified). We never store credit card information.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-8 h-8 text-orange-600" />
                <h3 className="text-xl font-bold text-slate-900">ISO 27001</h3>
              </div>
              <p className="text-slate-600">
                Following ISO 27001 information security management best practices and working toward certification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vulnerability Disclosure */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Responsible Disclosure</h2>
          </div>
          
          <p className="text-slate-600 leading-relaxed mb-6">
            We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly:
          </p>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4">How to Report</h3>
            <ol className="space-y-3 text-slate-600 list-decimal list-inside">
              <li>Email <a href="mailto:security@hitlai.com" className="text-blue-600 hover:underline font-semibold">security@hitlai.com</a> with details</li>
              <li>Include steps to reproduce the vulnerability</li>
              <li>Allow us reasonable time to address the issue</li>
              <li>Do not publicly disclose until we've resolved it</li>
            </ol>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Bug Bounty:</strong> We offer rewards for valid security vulnerabilities based on severity. Critical issues may earn up to $5,000.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Team */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-slate-900 mb-8 text-center">Our Security Team</h2>
          
          <p className="text-slate-600 leading-relaxed text-center mb-8">
            Our security team continuously monitors threats, implements best practices, and ensures your data remains protected. We're committed to transparency and rapid response to any security concerns.
          </p>

          <div className="bg-slate-50 p-8 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Contact Security Team</h3>
            <p className="text-slate-600 mb-6">
              For security inquiries, vulnerability reports, or compliance questions:
            </p>
            <a href="mailto:security@hitlai.com" className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              security@hitlai.com
            </a>
          </div>
        </div>
      </section>

      {/* Security Updates */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-6">Stay Informed</h2>
          <p className="text-slate-600 mb-8">
            We publish security updates and incident reports on our status page. Subscribe to receive notifications about security-related announcements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog" className="inline-block px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors">
              Security Blog
            </Link>
            <a href="https://status.hitlai.com" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
              Status Page
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
