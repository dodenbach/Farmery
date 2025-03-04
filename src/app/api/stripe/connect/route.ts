import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    // Get the user from Supabase auth
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('No authenticated user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Creating Stripe Connect account for user:', user.id)

    // Create a new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: user.id
      }
    })

    console.log('Stripe account created:', account.id)

    // Save the account ID to the user's profile
    await supabase
      .from('profiles')
      .update({ stripe_account_id: account.id })
      .eq('id', user.id)

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/farmer?error=stripe_failed`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/farmer?success=stripe_connected`,
      type: 'account_onboarding',
    })

    console.log('Account link created:', accountLink.url)

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
