import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user already has a Stripe account
    const { data: farmer } = await supabase
      .from('farmers')
      .select('stripe_account_id')
      .eq('user_id', session.user.id)
      .single()

    let accountId = farmer?.stripe_account_id

    if (!accountId) {
      // Create a new Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'standard',
        email: session.user.email,
      })
      accountId = account.id

      // Store the Stripe account ID
      await supabase
        .from('farmers')
        .upsert({
          user_id: session.user.id,
          stripe_account_id: accountId,
          email: session.user.email
        })
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
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
