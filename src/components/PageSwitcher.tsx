'use client'
import { usePage } from '@/app/context/PageContext';
import VendorComponent from './VendorComponent';
import HeaderComponent from './borrower/BorrowerHeader';
import CreateStore from './CreateStore';
import UploadEquipment from './borrower/Equipment/UploadEquipment';
// import EquipmentComponent from './EquipmentComponent'; // Adjust path

export default function PageSwitcher() {
    const { currentPage } = usePage();

    return (
        <div className=''>
            <HeaderComponent />
            <div className="max-w-4xl mx-auto">
                {currentPage === 'create-store' && <CreateStore />}
                {currentPage === 'all-equipment' && <UploadEquipment />}


            </div>
        </div>
    );
}