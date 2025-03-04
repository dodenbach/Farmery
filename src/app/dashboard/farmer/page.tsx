'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import StripeConnectButton from '@/components/StripeConnectButton'

// ... keep your interfaces the same ...

function DashboardContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Dashboard: Fetching user data...')
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        console.log('Dashboard: Current user:', currentUser)
        
        if (!currentUser) {
          setError('Not authenticated')
          return
        }

        setUser(currentUser)

        // Fetch profile and products in parallel
        const [profileResult, productsResult] = await Promise.all([
          supabase.from('profiles').select('stripe_account_id').eq('id', currentUser.id).single(),
          supabase.from('products').select('*').eq('farmer_id', currentUser.id)
        ])

        console.log('Dashboard: Profile result:', profileResult)
        console.log('Dashboard: Products result:', productsResult)

        if (profileResult.error) throw profileResult.error
        if (productsResult.error) throw productsResult.error

        setProfile(profileResult.data)
        setProducts(productsResult.data || [])

        // Handle Stripe connection result
        if (searchParams.get('success') === 'stripe_connected') {
          alert('Successfully connected to Stripe!')
        } else if (searchParams.get('error') === 'stripe_failed') {
          setError('Failed to connect to Stripe. Please try again.')
        }
      } catch (err) {
        console.error('Dashboard error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams, supabase])

  // Rest of your component stays the same...
}

// Main component with Suspense
export default function FarmerDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
