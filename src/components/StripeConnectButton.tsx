'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  const handleConnect = async () => {
    try {
      setLoading(true)
      
      // Get fresh session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
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
      }
    } catch (error) {
      console.error('Connect error:', error)
      alert('Failed to connect to Stripe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

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
