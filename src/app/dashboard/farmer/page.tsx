'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import StripeConnectButton from '@/components/StripeConnectButton'

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}

interface Profile {
  stripe_account_id?: string
}

export default function FarmerDashboard() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch profile and products in parallel
        const [profileResult, productsResult] = await Promise.all([
          supabase.from('profiles').select('stripe_account_id').eq('id', user.id).single(),
          supabase.from('products').select('*').eq('farmer_id', user.id)
        ])

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
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Farmer Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {!profile?.stripe_account_id && (
            <div className="mr-4">
              <StripeConnectButton />
            </div>
          )}
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add New Product
          </button>
        </div>
      </div>

      {!profile?.stripe_account_id && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please connect your Stripe account to receive payments from customers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your existing code for loading/error states and products table */}
      {loading ? (
        <div className="mt-6 text-center">Loading...</div>
      ) : error ? (
        <div className="mt-6 text-red-600">{error}</div>
      ) : (
        // Your existing products table code...
        <div className="mt-6">
          {/* ... existing table code ... */}
        </div>
      )}
    </div>
  )
}
