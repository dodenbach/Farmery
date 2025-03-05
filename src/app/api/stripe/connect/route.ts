import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'  // Add this line

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Stripe Connect OAuth URL
    const connectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CLIENT_ID}&scope=read_write`

    console.log('Generated connect URL for user:', user.id)
    return NextResponse.json({ url: connectUrl })
  } catch (error) {
    console.error('Connect error:', error)
    return NextResponse.json(
      { error: 'Failed to generate connect URL' }, 
      { status: 500 }
    )
  }
}
