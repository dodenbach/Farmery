import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret!
    )

    if (event.type === 'account.updated') {
      const account = event.data.object
      const supabase = createRouteHandlerClient({ cookies })
      
      // Update the user's profile with their Stripe account ID
      await supabase
        .from('profiles')
        .update({ 
          stripe_account_id: account.id,
          is_stripe_connected: account.details_submitted
        })
        .eq('stripe_account_id', account.id)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

// Needed for Stripe webhooks
export const runtime = 'nodejs'
