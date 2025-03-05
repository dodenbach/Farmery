import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.log('No session found')
      return NextResponse.json({ error: 'Please log in again' }, { status: 401 })
    }

    if (!process.env.STRIPE_CONNECT_CLIENT_ID) {
      console.error('Missing Stripe Connect client ID')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const connectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CONNECT_CLIENT_ID}&scope=read_write`

    return NextResponse.json({ url: connectUrl })
  } catch (error) {
    console.error('Connect error:', error)
    return NextResponse.json({ error: 'Failed to connect' }, { status: 500 })
  }
}
