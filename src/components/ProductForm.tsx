'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProductForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const supabase = createClientComponentClient()
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'lb', // Default unit
    category: '',
    images: [] as string[]
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProduct(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    try {
      setUploadingImage(true)
      setError('')
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error('You must be logged in to upload images')
      }
      
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `product-images/${fileName}`
      
      console.log('Uploading image to path:', filePath)
      
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)
        
      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
      
      // Get public URL
      const { data } = supabase.storage.from('products').getPublicUrl(filePath)
      
      console.log('Image uploaded successfully:', data.publicUrl)
      
      // Add image URL to product
      setProduct(prev => ({
        ...prev,
        images: [...prev.images, data.publicUrl]
      }))
      
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setError(error.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    console.log('Starting product submission...')

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session:', session)
      
      if (!session?.user) {
        throw new Error('You must be logged in to add a product')
      }

      // Validate form
      if (!product.name || !product.price || !product.quantity) {
        throw new Error('Please fill in all required fields')
      }
      
      console.log('About to insert product with farmer_id:', session.user.id)

      // Create product in database
      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          quantity: parseInt(product.quantity),
          unit: product.unit,
          category: product.category,
          farmer_id: session.user.id,
          images: product.images
        })
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error(`Failed to add product: ${insertError.message}`)
      }

      console.log('Product added successfully:', data)
      
      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Error adding product:', error)
      setError(error.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link 
          href="/dashboard" 
          className="text-green-600 hover:text-green-800"
        >
          ← Back to Dashboard
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={product.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={product.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={product.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <select
              id="unit"
              name="unit"
              value={product.unit}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="lb">Pound (lb)</option>
              <option value="oz">Ounce (oz)</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="each">Each</option>
              <option value="bunch">Bunch</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={product.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">Select a category</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="eggs">Eggs</option>
              <option value="herbs">Herbs</option>
              <option value="honey">Honey</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        {/* Image upload section */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Images
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="sr-only"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
            </label>
          </div>
          
          {/* Preview uploaded images */}
          {product.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
