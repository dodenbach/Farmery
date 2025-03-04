import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  console.log('Starting Stripe Connect API route...')
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    console.log('Getting user from Supabase...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      throw new Error('Not authenticated')
    }
    
    if (!user) {
      console.error('No user found')
      throw new Error('Not authenticated')
    }

    console.log('Creating Stripe account for:', user.email)
    const account = await stripe.accounts.create({
      type: 'standard',
      email: user.email,
      capabilities: {
        card_payments: {requested: true},
        transfers: {requested: true}
      }
    })
    console.log('Stripe account created:', account.id)

    console.log('Creating account link...')
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/farmer?error=stripe_failed`,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/farmer?success=stripe_connected`,
      type: 'account_onboarding'
    })
    console.log('Account link created')

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe connect error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack
    })
    
    return NextResponse.json(
      { error: error.message || 'Failed to create connect account' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
