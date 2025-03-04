"use client"
import { ItemProps } from '@/app/types/equipment'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Item: React.FC<ItemProps> = ({ title, id, description, image, amount }) => {
    const router = useRouter()

    const handleFund = () => {
        localStorage.setItem("Payment_type", "fund")
        router.push(`equipments/${id}`)
    }

    const handlePart = () => {
        localStorage.setItem("Payment_type", "part")
        router.push(`equipments/${id}`)
    }

    return (
        <div className='m-4 py-2 w-fit text-zinc-800 items-center justify-center rounded-xl bg-white overflow-hidden drop-shadow-md'>
            <div className="">
                <Image className=" pb-2 object-cover w-[230px] h-[230px]" src={image} alt="" width={200} height={100} />
            </div>
            <div className='p-4 pt-0'>
                <h2 className="font-semibold text-md truncate" title={title}>
                    {title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2 h-5 mb-1" title={description}>
                    {description}
                </p>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-600">
                        ${amount?.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <button
                        onClick={handlePart}
                        className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded">
                        Part
                    </button>
                    <button
                        onClick={handleFund}
                        className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded">
                        Fund
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Item