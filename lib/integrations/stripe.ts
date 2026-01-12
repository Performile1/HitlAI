/**
 * Stripe Integration for HitlAI Platform
 * 
 * Handles:
 * - Subscription management (Free, Pro, Enterprise)
 * - Usage-based billing for tests
 * - Tester payouts
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: {
    ai_tests_per_month: number
    human_tests_per_month: number
    custom_personas: boolean
    priority_support: boolean
  }
}

export const PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: {
      ai_tests_per_month: 10,
      human_tests_per_month: 0,
      custom_personas: false,
      priority_support: false
    }
  },
  pro: {
    id: 'price_pro_monthly', // Stripe Price ID
    name: 'Pro',
    price: 9900, // $99.00 in cents
    interval: 'month',
    features: {
      ai_tests_per_month: 100,
      human_tests_per_month: 10,
      custom_personas: true,
      priority_support: true
    }
  },
  enterprise: {
    id: 'price_enterprise_monthly',
    name: 'Enterprise',
    price: 0, // Custom pricing
    interval: 'month',
    features: {
      ai_tests_per_month: -1, // Unlimited
      human_tests_per_month: -1,
      custom_personas: true,
      priority_support: true
    }
  }
}

/**
 * Create Stripe customer for company
 */
export async function createCustomer(
  email: string,
  companyName: string,
  companyId: string
): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name: companyName,
    metadata: {
      company_id: companyId
    }
  })

  return customer.id
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl
  })

  return session.url!
}

/**
 * Create customer portal session (manage subscription)
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  })

  return session.url
}

/**
 * Handle webhook events
 */
export async function handleWebhook(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  )

  return event
}

/**
 * Process subscription events
 */
export async function processSubscriptionEvent(
  event: Stripe.Event,
  supabase: any
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Update company subscription status
      const customerId = subscription.customer as string
      const plan = getPlanFromPriceId(subscription.items.data[0].price.id)

      await supabase
        .from('companies')
        .update({
          plan_type: plan,
          monthly_test_quota: PLANS[plan].features.ai_tests_per_month
        })
        .eq('stripe_customer_id', customerId)
      break

    case 'customer.subscription.deleted':
      // Downgrade to free plan
      await supabase
        .from('companies')
        .update({
          plan_type: 'free',
          monthly_test_quota: PLANS.free.features.ai_tests_per_month
        })
        .eq('stripe_customer_id', subscription.customer as string)
      break
  }
}

/**
 * Get plan name from Stripe price ID
 */
function getPlanFromPriceId(priceId: string): string {
  for (const [planName, plan] of Object.entries(PLANS)) {
    if (plan.id === priceId) {
      return planName
    }
  }
  return 'free'
}

/**
 * Create payout for tester
 */
export async function createTesterPayout(
  testerId: string,
  amount: number,
  description: string
): Promise<void> {
  // In production, integrate with Stripe Connect for tester payouts
  // For now, just log
  console.log(`Payout: $${amount/100} to tester ${testerId} for ${description}`)
}
