import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    // Create a Stripe Connect account link
    const accountLink = await stripe.accountLinks.create({
      account_type: 'standard',
      refresh_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?error=stripe_failed`,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=stripe_connected`,
      type: 'account_onboarding'
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.json(
      { error: 'Failed to create connect account' },
      { status: 500 }
    )
  }
}
