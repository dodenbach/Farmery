'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create a single instance outside the component
const supabase = createClientComponentClient()

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleConnect = async () => {
    try {
      setLoading(true)
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login') // Redirect to login if no session
        return
      }

      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect')
      }
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No redirect URL received')
      }
    } catch (error) {
      console.error('Connect error:', error)
      alert('Failed to connect to Stripe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {loading ? 'Connecting...' : 'Connect with Stripe'}
    </button>
  )
}
