"use client"
import BorrowerHeader from "@/components/borrower/BorrowerHeader";
import RequestEquipmet from "@/components/borrower/RequestEquipmet";

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
