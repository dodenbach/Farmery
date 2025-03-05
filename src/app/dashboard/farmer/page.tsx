import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import StripeConnectButton from '@/components/StripeConnectButton'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()
  
  // Get the user's products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('farmer_id', user?.id)
    .order('created_at', { ascending: false })
  
  const hasStripeAccount = !!profile?.stripe_account_id
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
        
        {!hasStripeAccount && (
          <div className="mt-4 p-4 border-l-4 border-yellow-400 bg-yellow-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
        
        <div className="mt-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
          <div className="flex space-x-4">
            {!hasStripeAccount && <StripeConnectButton />}
            <Link href="/dashboard/products/new">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Add New Product
              </button>
            </Link>
          </div>
        </div>
        
        {products && products.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {product.name}
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            ${product.price.toFixed(2)} / {product.unit}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 flex justify-end">
                  <Link href={`/dashboard/products/${product.id}/edit`}>
                    <button className="text-sm text-green-700 font-medium hover:text-green-900">
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6">
            <p className="text-gray-500">You haven't added any products yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
