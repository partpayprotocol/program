"use client"
import { usePage } from '@/app/context/PageContext';
import React from 'react'

const VendorHeader = () => {
    const { setCurrentPage } = usePage();

    return (
      <header className="bg-zinc900 text-white p-4 shadow-md">
        <nav className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">PARTPAY</h1>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentPage('create-store')}
              className="bg-zinc-700 hover:bg-zinc-800 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              Create Store
            </button>
            <button
              onClick={() => setCurrentPage('upload-equipment')}
              className="bg-zinc-700 hover:bg-zinc-800 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              Upload equipment
            </button>
            <button
              onClick={() => setCurrentPage('all-equipment')}
              className="bg-zinc-700 hover:bg-zinc-800 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              All Equipment
            </button>
          </div>
        </nav>
      </header>
    )
}

export default VendorHeader