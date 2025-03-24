import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Item from './Item';
import Loading from '../Loading';
import { apiUrl } from '@/utils/constant';

interface Equipment {
  equipmentPda: string;
  name: string;
  images: string;
  description?: string;
  price: number;
  id: string
}

const EquipmentsComponent = () => {
  const { data: equipments, isLoading, error } = useQuery<Equipment[], Error>({
    queryKey: ['all-equipment'],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/equipment`);
      return response.data;
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>All Equipment</h1>
      <div className="flex flex-wrap justify-center">
        {equipments && equipments.length > 0 ? (
          equipments.map((item) => (
            <Item
              key={item.equipmentPda}
              title={item.name}
              id={item.id}
              image={item?.images[0]}
              description={item.description || 'No description available'}
              amount={item.price}
            />
          ))
        ) : (
          <p>No equipment found.</p>
        )}
        <Item title='Product Title' id='' image='https://www-konga-com-res.cloudinary.com/w_auto,f_auto,fl_lossy,dpr_auto,q_auto/media/catalog/product/E/D/182152_1637623897.jpg' description='Product description goes here' amount={223} />
      </div>
    </div>
  );
};

export default EquipmentsComponent;