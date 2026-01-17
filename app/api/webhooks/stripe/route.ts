import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { handleWebhook, processSubscriptionEvent } from '@/lib/integrations/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = await handleWebhook(body, signature)

    console.log('Stripe webhook received:', event.type)

    // Process subscription events
    if (event.type.startsWith('customer.subscription.')) {
      await processSubscriptionEvent(event, supabase)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 400 }
    )
  }
}
