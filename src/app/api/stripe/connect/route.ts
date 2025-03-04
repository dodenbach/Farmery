import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    console.log('Creating Stripe account for:', session.user.email)
    const account = await stripe.accounts.create({
      type: 'standard',
      email: session.user.email,
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
