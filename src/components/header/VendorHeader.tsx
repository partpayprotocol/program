"use client"
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { MdMenu } from 'react-icons/md';
import { FaUpload } from "react-icons/fa";

const VendorHeader = () => {

    return (
      <header className="">
      <nav className="p-4 flex justify-between items-center">
        <Image src="/darklogo.png" alt="PARTPAY" width={100} height={100}/>
        <button className='text-3xl md:hidden'>
        <MdMenu />
        </button>
        <div className="text-[#424242] text-[15px] hidden md:flex">
          <Link href="/request-equipment" className="hover:bg-zinc-100 p-2 rounded-md">
          Notifications
          </Link>
          <Link href="/requests" className="hover:bg-zinc-100 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500">
          View Requests
          </Link>
          <Link href="/requests" className="hover:bg-zinc-100 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500">
          My Uploads
          </Link>
          <Link href="/upload-equipment" className="hover:bg-zinc-100 p-2 flex items-center rounded-md space-x-2 focus:outline-none focus:ring-2 focus:ring-zinc-500">
          <FaUpload className='mr-1'/> Upload
          </Link>
          
        </div>
        {/* <WalletMultiButton /> */}
      </nav>
    </header>
    )
}

export default VendorHeader