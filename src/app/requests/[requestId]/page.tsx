"use client"
import RequestedEquipmet from "@/components/borrower/RequestedEquipment";
import VendorHeader from "@/components/header/VendorHeader";
import RequestedList from "@/components/vendor/RequestedList";
import { useParams } from "next/navigation";

export default function RequestId() {
    const { requestId } = useParams();
    return (
    <div className="bg-white h-screen">
        <VendorHeader />
        <div className="p-3 md:p-10 h-[91%] border-2 overflow-scroll">
            <RequestedEquipmet />
        </div>
    </div>
    )
}
