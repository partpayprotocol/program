"use client"
import VendorHeader from "@/components/header/VendorHeader";
import RequestedList from "@/components/vendor/RequestedList";

export default function RequestPage() {
    return (
    <div className="bg-white h-screen">
        <VendorHeader />
        <div className="p-3 md:p-10 h-[91%] border-2 overflow-scroll">
            <RequestedList />
        </div>
    </div>
    )
}
