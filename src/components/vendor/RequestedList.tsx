"use client"
import { useAppContext } from '@/app/context/AppContext'
import { RequestToShowButtonType } from '@/app/types/app-types'
import Link from 'next/link';
import React, { useState } from 'react'
import { IoIosArrowDown } from "react-icons/io";
import { MdSearch } from 'react-icons/md'

// Sample data structure for the request items
const sampleRequests = [
  {
    id: 1,
    title: "Dell XPS Laptop",
    category: "Electronics",
    submittedDate: "March 11, 2023",
    description: "Looking for a Dell XPS 15 laptop with atleast 16GB RAM...",
    thumbnail: "/path-to-thumbnail.jpg" // Replace with actual image path
  },
  {
    id: 2,
    title: "Work Desk",
    category: "Furniture",
    submittedDate: "March 11, 2023",
    description: "Looking for a Dell XPS 15 laptop with atleast 16GB RAM... Looking for a Dell XPS 15 laptop with atleast 16GB RAM...",
    thumbnail: "/path-to-thumbnail.jpg" // Replace with actual image path
  },
  {
    id: 3,
    title: "Sewing Machine",
    category: "Furniture",
    submittedDate: "March 11, 2023",
    description: "Looking for a Dell XPS 15 laptop with atleast 16GB RAM...",
    thumbnail: "/path-to-thumbnail.jpg" // Replace with actual image path
  },
  {
    id: 4,
    title: "Sewing Machine",
    category: "Furniture",
    submittedDate: "March 11, 2023",
    description: "Looking for a Dell XPS 15 laptop with atleast 16GB RAM...",
    thumbnail: "/path-to-thumbnail.jpg" // Replace with actual image path
  }
]

const RequestList = () => {
    const { requestToShow, setRequestToShow } = useAppContext()
    const [requests] = useState(sampleRequests)

    const handleButtonClick = (clicked: RequestToShowButtonType) => {
        setRequestToShow(clicked)
    }
    
    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex justify-between mb-3">
                <h2 className="font-semibold text-zinc-800 text-[17px]">Request List</h2>
                <span className="text-zinc-800 text-[16px]">(1280)</span>
            </div>
            
            <div className="mb-6">
                <div className="bg-gray-100 p-1 rounded-md text-sm mr-auto mb-2 w-fit">
                    <button
                        onClick={() => handleButtonClick("recent")}
                        className={`p-1 px-2 transition-colors ${requestToShow === "recent" ? "bg-white rounded-md" : ""}`}
                    >
                        Most Recent
                    </button>
                    <button
                        onClick={() => handleButtonClick('requests')}
                        className={`p-1 px-2 transition-colors ${requestToShow === "requests" ? "bg-white rounded-md" : ""}`}
                    >
                        Listed Request
                    </button>
                </div>
                
                <div className="relative flex justify-between items-center">
                    <div className="flex items-center border rounded-md px-3 py-1">
                        <MdSearch size={18} className="text-gray-400 mr-1" />
                        <input 
                            type="text" 
                            placeholder="Search request..." 
                            className="outline-none bg-transparent"
                        />
                    </div>
                    <button className="flex items-center border rounded-md px-2 py-1">
                        <span className="mr-2">Filter by</span>
                        <IoIosArrowDown size={18} />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-gray-100 p-3">
                {requests.map(request => (
                    <div key={request.id} className="bg-white rounded-lg overflow-hidden shadow">
                        <div className="relative h-40 bg-gray-200">
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium line-clamp-1">{request.title}</h3>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-md">{request.category}</span>
                            </div>
                            
                            <div className="text-xs text-gray-500 mb-1">
                                Submitted on {request.submittedDate}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                            
                            <Link href={`/requests/${request.id}`}>
                             <h1 className=" bg-blue-500 hover:bg-blue-600 text-white py-[6px] rounded-md transition-colors w-full text-center">
                                View
                             </h1>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RequestList