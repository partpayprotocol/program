import { RequestDetails } from '@/app/types/request';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const RequestedEquipments = () => {
    const router = useRouter();
    const [request, setRequest] = useState<RequestDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                // In a real app, you would fetch from your API
                // const response = await fetch(`/api/requests/${id}`);
                // const data = await response.json();

                // Simulated data for demonstration
                const mockRequest: RequestDetails = {
                    title: "Dell XPS 15 Laptop",
                    description: "Looking for a Dell XPS 15 laptop with at least 16GB RAM, 512GB SSD, and Intel i7 processor for software development work. Preferably the latest model.",
                    category: "electronics",
                    budgetRange: "1000-5000",
                    additionalDetails: "Need it delivered within 2 weeks if possible. Would prefer warranty extension options.",
                    submittedDate: "February 28, 2025",
                };

                setRequest(mockRequest);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching request details:", error);
                setLoading(false);
            }
        };

        fetchRequest();
    }, []);

    const getBudgetRangeLabel = (range: string) => {
        const budgetMap: {[key: string]: string} = {
            '0-1000': 'Under $1,000',
            '1000-5000': '$1,000 - $5,000',
            '5000-10000': '$5,000 - $10,000',
            '10000-50000': '$10,000 - $50,000',
            '50000+': 'Over $50,000'
        };
        return budgetMap[range] || range;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <div className="flex flex-col items-center space-y-4">
                    <svg className="w-10 h-10 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-medium text-gray-700">Loading request details...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="px-6 py-8 mx-auto max-w-7xl">
                <div className="p-6 bg-red-50 rounded-lg border border-red-100">
                    <h3 className="text-lg font-medium text-red-800">Request not found</h3>
                    <p className="mt-2 text-sm text-red-700">We couldn't find the equipment request you're looking for.</p>
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 rounded-xl shadow">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{request.title}</h1>
                        <span className="px-3 py-1 text-xs font-medium text-indigo-800 bg-indigo-100 rounded-full">
                            {request.category.charAt(0).toUpperCase() + request.category.slice(1).replace(/_/g, ' ')}
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Submitted on {request.submittedDate}</p>
                </div>

                <div className="overflow-hidden bg-white ">
                    <div className=" border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Request Description</h2>
                        <p className="mt-3 text-gray-700">{request.description}</p>
                    </div>

                    {/* Details grid */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        <div className="p-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Budget Range</h3>
                            <p className="mt-2 flex items-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <span className="text-lg font-medium text-gray-900">{getBudgetRangeLabel(request?.budgetRange)}</span>
                            </p>
                        </div>
                        <div className="p-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Additional Requirements</h3>
                            {request.additionalDetails ? (
                                <p className="mt-2 text-gray-700">{request.additionalDetails}</p>
                            ) : (
                                <p className="mt-2 text-gray-500 italic">No additional requirements specified</p>
                            )}
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default RequestedEquipments;