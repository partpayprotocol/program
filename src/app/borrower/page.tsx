"use client"
import BorrowerComponent from "@/components/borrower/BorrowerComponent"
import BorrowerHeader from "@/components/borrower/BorrowerHeader"

export default function Borrower() {
  return (
    <div className="bg-[#FFFFFF] h-screen text-black">
        <BorrowerHeader />
        <BorrowerComponent />
    </div>
  )
}
