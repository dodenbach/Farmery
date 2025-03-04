'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleConnect = async () => {
    try {
      setLoading(true)
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Please log in first')
      }

      // Call our API to start Stripe Connect flow
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to connect')
      
      // Redirect to Stripe's hosted onboarding
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Connect error:', error)
      alert(error.message)
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
