"use client"
import React, { useEffect, useState } from 'react'
import { FaCamera } from "react-icons/fa";
import { HiArrowRightCircle } from "react-icons/hi2";
import RequestItem from './RequestItem';

const BorrowerComponent = () => {
    const [showRequestForm, setShowRequestForm] = useState(false)

    const handleClick = () => {
        setShowRequestForm(true)
        localStorage.setItem("showRequestForm", "true")
    }

    useEffect(() => {
        const isRequestForm = localStorage.getItem("showRequestForm");
        setShowRequestForm(isRequestForm === "true");
    }, []);

    return (
        <div className='w-full h-[92%] border-2 p-3 flex justify-center items-center'>
            {showRequestForm ?
                (
                    <RequestItem />
                ) : (
                    <div className='bg-[#F9FAFB] p-4 w-full max-w-[800px] mx-auto'>
                        <div className='text-center'>
                            <h1 className='font-semibold text-[20px]'>BorrowerComponent</h1>
                            <p className='text-[14px] text-gray-600'>What would you like to request for?</p>
                        </div>
                        <button
                            onClick={handleClick}
                            className='text-white bg-[#316BFF] mt-4 flex justify-between items-center p-3  rounded-md space-x-4 w-full'>
                            <span className='flex items-center'><FaCamera className='text-xl mr-2' />Make your request</span>
                            <HiArrowRightCircle className='text-2xl' />
                        </button>
                    </div>
                )
            }
        </div>
    )
}

export default BorrowerComponent