import React from 'react'

const LoadingSkeleton = () => {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md animate-pulse">
    {/* Form title skeleton */}
    <div className="h-7 bg-gray-200 rounded mb-6 w-3/4"></div>
    
    <div className="mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>

    <div className="mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
    
    <div className="mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
    
    <div className="mb-4">
      <div className="h-4 bg-gray-200 rounded w-2/5 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
    
    <div className="mb-6">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-24 bg-gray-200 rounded w-full"></div>
    </div>
    
    <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
  </div>
  )
}

export default LoadingSkeleton