'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleConnect = async () => {
    try {
      setLoading(true)
      console.log('StripeConnectButton: Starting connect flow with user:', user)
      
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      })
      
      const data = await response.json()
      console.log('StripeConnectButton: Connect response:', data)

      if (!response.ok) throw new Error(data.error || 'Failed to connect')
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('StripeConnectButton: Connect error:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Debug render
  console.log('StripeConnectButton: Rendering with user:', user)

  if (!user) {
    return <div>Please log in to connect your Stripe account</div>
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
