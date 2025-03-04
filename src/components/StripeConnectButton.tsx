'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(currentUser)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setAuthChecked(true)
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user)
      setUser(session?.user || null)
      router.refresh() // Refresh the page to update header
    })

    checkAuth()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleConnect = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        credentials: 'same-origin'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect')
      }
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Connect error:', error)
      alert(error.message || 'Failed to connect to Stripe')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking auth
  if (!authChecked) {
    return <div>Loading...</div>
  }

  // Show button only if user is authenticated
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
