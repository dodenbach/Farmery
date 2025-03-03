'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'

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
  farm_description: string
  farm_location: string
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            profiles:farmer_id (
              farm_name,
              farm_description,
              farm_location
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        if (!data) throw new Error('Product not found')

        setProduct({
          ...data,
          farm_name: data.profiles.farm_name,
          farm_description: data.profiles.farm_description,
          farm_location: data.profiles.farm_location,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleAddToCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      if (!product) return

      setAddingToCart(true)
      
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        farmerId: product.farmer_id,
        farmName: product.farm_name,
        image: product.images?.[0]
      })

      // Show success message
      alert('Added to cart successfully!')
      
      // Optionally redirect to cart
      router.push('/cart')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>
  if (!product) return <div className="text-center py-12">Product not found</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        {/* Image gallery */}
        <div className="flex flex-col-reverse">
          <div className="w-full aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
            <img
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-full object-center object-cover"
            />
          </div>
        </div>

        {/* Product info */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
          
          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl text-gray-900">${product.price}</p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="text-base text-gray-700 space-y-6">{product.description}</div>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <h3 className="text-sm text-gray-600 font-medium">Quantity:</h3>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="ml-3 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                {[...Array(Math.min(10, product.quantity))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-10 flex">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`w-full bg-green-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white ${
                addingToCart ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              {addingToCart ? 'Adding to cart...' : 'Add to cart'}
            </button>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-10">
            <h3 className="text-sm font-medium text-gray-900">About the Farm</h3>
            <div className="mt-4 prose prose-sm text-gray-500">
              <p className="font-semibold">{product.farm_name}</p>
              <p>{product.farm_description}</p>
              <p className="mt-2">Location: {product.farm_location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
