function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">🏠 NestFind</span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-700 hover:text-indigo-600">Buy</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600">Rent</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600">Sell</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Dream Home
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Search thousands of properties with our MLS platform
          </p>

          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <input
              type="text"
              placeholder="Enter city, neighborhood, or ZIP code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">10,000+</div>
            <div className="text-gray-600">Properties Listed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">5,000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
            <div className="text-gray-600">Expert Agents</div>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            ✅ Ready to Build
          </h2>
          <div className="space-y-2 text-gray-700">
            <div>✅ Backend API: <strong>http://localhost:4000/api/v1</strong></div>
            <div>✅ Frontend: <strong>http://localhost:8080</strong></div>
            <div>✅ PostgreSQL database with MLS schema</div>
            <div>✅ JWT authentication endpoints</div>
            <div>✅ Property CRUD with advanced search</div>
          </div>
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg text-center">
            <strong>Next:</strong> Building API client and authentication with TDD
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
