'use client'

import { useState } from 'react'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'  // Important for auth
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to connect')
      }
      
      const data = await response.json()
      
      // Redirect to Stripe Connect onboarding
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No redirect URL received')
      }
    } catch (error) {
      console.error('Failed to start connect:', error)
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
