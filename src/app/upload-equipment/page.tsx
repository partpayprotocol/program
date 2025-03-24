"use client"
import BorrowerHeader from "@/components/header/BorrowerHeader";
import UploadEquipment from "@/components/Equipment/UploadEquipment";

export default function EquipmentUpload() {
    return (
    <div className="bg-white">
        <BorrowerHeader />
        <div>
            <UploadEquipment />
        </div>
    </div>
    )
}
