"use client"
import BorrowerHeader from "@/components/header/BorrowerHeader";
import RequestEquipmet from "@/components/borrower/RequestedEquipment";

export default function RequestPage() {
    return (
    <div className="bg-white">
        <BorrowerHeader />
        <div>
            <RequestEquipmet />
        </div>
    </div>
    )
}
