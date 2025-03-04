import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create a Standard Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'standard',
      email: session.user.email,
    })

    // Create account link for onboarding
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
