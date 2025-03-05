import { Suspense } from 'react'
import ProductForm from '@/components/ProductForm'
import Link from 'next/link'

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link 
          href="/dashboard" 
          className="text-green-600 hover:text-green-800"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <ProductForm />
      </Suspense>
    </div>
  )
}
