"use client"
import Image from 'next/image';
import React, { useState } from 'react';
import { MdArrowBack, MdCancel } from 'react-icons/md';

const RequestedEquipment = () => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [videoRequests, setVideoRequests] = useState([
    {
      id: 1,
      title: "Dell XPS Laptop",
      description: "Looking for a Dell XPS 15 laptop with atleast 16GB RAM, 512GB SSD, and Intel i7 processor for...",
      category: "Electronic",
      videoUrl: "https://example.com/video1.mp4"
    }
  ]);

  const [currentRequest, setCurrentRequest] = useState(videoRequests[0]);

  const handleReject = () => {
    // Handle reject logic
    console.log("Request rejected:", currentRequest.id);
    // Remove from requests and show next one
    setVideoRequests(videoRequests.filter(req => req.id !== currentRequest.id));
  };

  const handleBack = () => {
    console.log("Back button clicked");
    // Handle navigation back
  };

  const handleAccept = () => {
    // Handle accept logic
    console.log("Request accepted:", currentRequest.id);
    // Remove from requests and show next one
    setVideoRequests(videoRequests.filter(req => req.id !== currentRequest.id));
  };

  const handleDecline = () => {
    setShowDeclineModal(true);
  };

  const handleSeeLater = () => {
    console.log("See later:", currentRequest.id);
    // Logic to mark as see later
    setShowDeclineModal(false);
    // Remove from current queue and show next one
    setVideoRequests(videoRequests.filter(req => req.id !== currentRequest.id));
  };

  const handleNeverShow = () => {
    console.log("Never show again:", currentRequest.id);
    // Logic to mark as never show again
    setShowDeclineModal(false);
    // Remove from current queue and show next one
    setVideoRequests(videoRequests.filter(req => req.id !== currentRequest.id));
  };

  const handleCancelDecline = () => {
    setShowDeclineModal(false);
  };


  return (
    <div>
    <div className="max-w-4xl mx-auto p-4">
      <button 
        onClick={handleBack} 
        className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
      >
        <MdArrowBack className="mr-1" size={20} />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="">
            <div className="relative aspect-video md:w-[300px] lg:w-[400px] h-full rounded-lg overflow-hidden bg-gray-200">
              <Image
                src="/api/placeholder/400/320"
                alt="Equipment video preview"
                width={300}
                height={300}
                className="w- h-full border-2"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M8 5.14v14l11-7-11-7z" 
                        fill="white"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Details section */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-8">
              <div className="mb-4">
                {/* <p className="text-sm text-gray-500 mb-1">Equipment Category</p> */}
                <p className="text-lg font-medium">{currentRequest.category}</p>
              </div>

              <div className="mb-4">
                {/* <p className="text-sm text-gray-500 mb-1">Equipment Title</p> */}
                <p className="text-lg font-medium">{currentRequest.title}</p>
              </div>

              <div>
                {/* <p className="text-sm text-gray-500 mb-1">Description</p> */}
                <p className="text-base text-gray-700">
                  {currentRequest.description}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleDecline}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
         {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Decline Request</h3>
              <button
                onClick={handleCancelDecline}
                className="text-gray-500 hover:text-gray-700"
              >
                <MdCancel size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              What would you like to do with this request?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSeeLater}
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-left"
              >
                See this request later
              </button>

              <button
                onClick={handleNeverShow}
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-left"
              >
                Never show this request again
              </button>

              <button
                onClick={handleCancelDecline}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestedEquipment;