'use client'
import { usePage } from "@/app/context/PageContext";
import Image from "next/image";
import Link from "next/link";

export default function BorrowerHeader() {

  return (
    <header className="bg-zinc900 text-white p-4 shadow-md">
      <nav className="max-w-4xl mx-auto flex justify-between items-center">
        <Image src="/logo.png" alt="PARTPAY" width={100} height={100}/>
        <div className="space-x-4">
          <Link href="/request-equipment" className="bg-zinc-700 hover:bg-zinc-800 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500">
          Request equipment
          </Link>
          <Link href="/requests" className="bg-zinc-700 hover:bg-zinc-800 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500">
          Requested equipment
          </Link>
          <Link href="/equipments" className="bg-zinc-700 hover:bg-zinc-800 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500">
          Equipments
          </Link>
          <Link href="/borrower/lease" className="bg-zinc-700 hover:bg-zinc-800 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500">
          Lease
          </Link>
        </div>
      </nav>
    </header>
  );
}