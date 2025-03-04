import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    // Get the authorization header
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      throw new Error('No authorization header')
    }

    // Verify the session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Auth error:', authError)
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

    console.log('Creating account link...')
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/farmer?error=stripe_failed`,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/farmer?success=stripe_connected`,
      type: 'account_onboarding'
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create connect account' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
