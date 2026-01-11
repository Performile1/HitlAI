/**
 * Email Integration using Resend
 * 
 * Handles:
 * - Tester assignment notifications
 * - Test completion notifications
 * - Welcome emails
 * - Password reset
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM_EMAIL = 'HitlAI <notifications@hitlai.com>'

/**
 * Send tester assignment notification
 */
export async function sendTesterAssignmentEmail(
  testerEmail: string,
  testerName: string,
  testTitle: string,
  testUrl: string,
  assignmentId: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: testerEmail,
    subject: `New Test Assignment: ${testTitle}`,
    html: `
      <h2>Hi ${testerName},</h2>
      <p>You've been assigned a new test!</p>
      
      <h3>${testTitle}</h3>
      <p><strong>Website:</strong> ${testUrl}</p>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/tester/tests/${assignmentId}" 
           style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Start Test
        </a>
      </p>
      
      <p style="color: #64748b; font-size: 14px;">
        This test should take approximately 15-30 minutes to complete.
      </p>
    `
  })
}

/**
 * Send test completion notification to company
 */
export async function sendTestCompletionEmail(
  companyEmail: string,
  companyName: string,
  testTitle: string,
  testRequestId: string,
  resultsCount: number
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: companyEmail,
    subject: `Test Completed: ${testTitle}`,
    html: `
      <h2>Hi ${companyName},</h2>
      <p>Your test has been completed!</p>
      
      <h3>${testTitle}</h3>
      <p><strong>Results:</strong> ${resultsCount} friction points identified</p>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/company/tests/${testRequestId}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Results
        </a>
      </p>
    `
  })
}

/**
 * Send welcome email to new company
 */
export async function sendCompanyWelcomeEmail(
  email: string,
  companyName: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to HitlAI!',
    html: `
      <h2>Welcome to HitlAI, ${companyName}!</h2>
      <p>We're excited to help you improve your UX with AI-powered testing.</p>
      
      <h3>Getting Started</h3>
      <ol>
        <li>Create your first test</li>
        <li>Select personas that match your target users</li>
        <li>Choose test dimensions (happy path, negative testing, accessibility, etc.)</li>
        <li>Review results and fix friction points</li>
      </ol>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>
      
      <p style="color: #64748b; font-size: 14px;">
        Need help? Reply to this email or check our <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs">documentation</a>.
      </p>
    `
  })
}

/**
 * Send welcome email to new tester
 */
export async function sendTesterWelcomeEmail(
  email: string,
  displayName: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to HitlAI Tester Community!',
    html: `
      <h2>Welcome, ${displayName}!</h2>
      <p>Thank you for joining HitlAI as a tester. You're helping improve UX for everyone!</p>
      
      <h3>What's Next?</h3>
      <ol>
        <li>Complete your verification test (you'll receive it soon)</li>
        <li>Start receiving test assignments matching your profile</li>
        <li>Earn money while helping improve websites</li>
      </ol>
      
      <h3>How It Works</h3>
      <ul>
        <li>We'll match you with tests based on your age, tech skills, and device</li>
        <li>Each test takes 15-30 minutes</li>
        <li>You'll test as a specific persona (e.g., senior with low tech literacy)</li>
        <li>Report friction points and your experience</li>
        <li>Get paid for completed tests</li>
      </ul>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/tester/dashboard" 
           style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>
    `
  })
}

/**
 * Send persona refinement notification
 */
export async function sendPersonaRefinementEmail(
  companyEmail: string,
  companyName: string,
  personaName: string,
  refinementCount: number
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: companyEmail,
    subject: `Persona Update Available: ${personaName}`,
    html: `
      <h2>Hi ${companyName},</h2>
      <p>We've analyzed real user behavior and have ${refinementCount} suggested updates for your persona <strong>${personaName}</strong>.</p>
      
      <p>These refinements are based on actual user sessions and will help make your tests more accurate.</p>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/company/personas" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Review Refinements
        </a>
      </p>
    `
  })
}
