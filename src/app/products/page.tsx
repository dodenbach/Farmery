'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  category: string
  images: string[]
  farmer_id: string
  farm_name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            profiles:farmer_id (
              farm_name
            )
          `)
          .gt('quantity', 0)

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory)
        }

        const { data, error } = await query

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Available Products
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat</option>
            <option value="eggs">Eggs</option>
            <option value="honey">Honey</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 text-center">Loading...</div>
      ) : error ? (
        <div className="mt-6 text-red-600">{error}</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                <img
                  src={product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href={`/products/${product.id}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.farm_name}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
