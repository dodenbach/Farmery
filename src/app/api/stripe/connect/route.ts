import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('Connect route started')
    console.log('STRIPE_CONNECT_CLIENT_ID exists:', !!process.env.STRIPE_CONNECT_CLIENT_ID)

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth result:', { userId: user?.id, error: authError })
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CONNECT_CLIENT_ID}&scope=read_write`
    console.log('Generated URL:', connectUrl)

    return NextResponse.json({ url: connectUrl })
  } catch (error) {
    console.error('Connect error:', error)
    return NextResponse.json(
      { error: 'Failed to generate connect URL' }, 
      { status: 500 }
    )
  }
}
