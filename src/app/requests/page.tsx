"use client"
import BorrowerHeader from "@/components/borrower/BorrowerHeader";
import RequestedEquipments from "@/components/borrower/RequestedEquipments";
import RequestEquipmet from "@/components/borrower/RequestEquipmet";

export default function RequestPage() {
    return (
    <div className="bg-white h-screen">
        <BorrowerHeader />
        <div className="p-10">
            <RequestedEquipments />
        </div>
    </div>
    )
}
