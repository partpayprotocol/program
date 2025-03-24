"use client"
import BorrowerComponent from "@/components/borrower/BorrowerComponent"
import BorrowerHeader from "@/components/header/BorrowerHeader"

export default function Borrower() {
  return (
    <div className="bg-[#FFFFFF] h-screen text-black">
        <BorrowerHeader />
        <BorrowerComponent />
    </div>
  )
}
