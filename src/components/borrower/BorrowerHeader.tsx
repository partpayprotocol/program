'use client'
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";

export default function BorrowerHeader() {

  return (
    <header className="">
      <nav className="p-4 md:p-8 flex justify-between items-center">
        <Image src="/darklogo.png" alt="PARTPAY" width={100} height={100}/>
        <div className="text-[#424242] text-[15px]">
          <Link href="/request-equipment" className="hover:bg-zinc-100 p-2 rounded-md">
          Notifications
          </Link>
          <Link href="/requests" className="hover:bg-zinc-100 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500">
          View Requests
          </Link>
          
        </div>
        {/* <WalletMultiButton /> */}
      </nav>
    </header>
  );
}