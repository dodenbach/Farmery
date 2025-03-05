import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Skip auth check for now
    console.log('Connect route started')
    
    if (!process.env.STRIPE_CONNECT_CLIENT_ID) {
      console.error('Missing Stripe Connect client ID')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Create the connect URL directly
    const connectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CONNECT_CLIENT_ID}&scope=read_write`
    console.log('Generated URL:', connectUrl)
    
    return NextResponse.json({ url: connectUrl })
  } catch (error) {
    console.error('Connect error:', error)
    return NextResponse.json({ error: 'Failed to connect' }, { status: 500 })
  }
}
