import BorrowerHeader from '@/components/borrower/BorrowerHeader'
import EquipmentIdComponent from '@/components/Equipment/EquipmentIdComponent'
import React from 'react'

const EqiupmentIdpage = () => {
  return (
    <div className='bg-white'>
      <BorrowerHeader />
      <div className='p-8'>
        <EquipmentIdComponent />
      </div>
    </div>
  )
}

export default EqiupmentIdpage