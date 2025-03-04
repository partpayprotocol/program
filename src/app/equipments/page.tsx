"use client"
import BorrowerHeader from "@/components/borrower/BorrowerHeader";
import EquipmentsComponent from "@/components/Equipment/EquipmentsComponent";

export default function Equipments() {
    return (
        <div className="bg-white">
            <BorrowerHeader />
            <div>
                <EquipmentsComponent />
            </div>
        </div>
    );
}