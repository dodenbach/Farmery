import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Fresh from Local Farms to Your Table
            </h1>
            <p className="mt-6 text-xl text-green-100 max-w-3xl mx-auto">
              Connect directly with local farmers. Get fresh produce and support your local agriculture community.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/signup?role=customer"
                className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-md text-lg font-semibold"
              >
                Shop as Customer
              </Link>
              <Link
                href="/signup?role=farmer"
                className="bg-green-600 text-white hover:bg-green-500 px-8 py-3 rounded-md text-lg font-semibold"
              >
                Sell as Farmer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700">Direct from Farms</h3>
              <p className="mt-2 text-gray-600">Get the freshest produce directly from local farmers</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700">Support Local</h3>
              <p className="mt-2 text-gray-600">Help your local farming community thrive</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700">Quality Guaranteed</h3>
              <p className="mt-2 text-gray-600">Know exactly where your food comes from</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
