'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  // Add this useEffect to check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Initial session check:', session)
    }
    checkSession()
  }, [])

  const handleConnect = async () => {
    try {
      setLoading(true)
      console.log('Button clicked, checking session...')
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session data:', session)

      if (!session) {
        console.log('No session found')
        throw new Error('Please log in first')
      }

      console.log('Making API request...')
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      console.log('API response status:', response.status)
      const data = await response.json()
      console.log('API response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect')
      }
      
      if (data.url) {
        console.log('Redirecting to:', data.url)
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
