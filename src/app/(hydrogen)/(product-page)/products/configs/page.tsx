'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import {
  MerchantMaterialConfig,
  MerchantColorConfig,
  MerchantSizeConfig,
} from './product-config';
import { Text } from '@/components/ui/text';
import { BsSignStop } from 'react-icons/bs';
import { getUserToken } from '@/utils/get-token';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const pageHeader = {
  title: 'Product Configurations',
  breadcrumb: [
    {
      href: routes.eCommerce.products,
      name: 'Products',
    },
    {
      name: 'Configurations',
    },
  ],
};

const ProductConfigPage = (): React.ReactElement => {
  const [userToken, setUserToken] = useState('');

  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getUserToken();
      setUserToken(token);
    };

    fetchToken();
  }, []);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <hr />

      {userToken && (
        <div className="mt-8 grid gap-10 md:mt-12 lg:grid-cols-2">
          <MerchantColorConfig userToken={userToken} userId={user?.uid} />

          <MerchantMaterialConfig userToken={userToken} userId={user?.uid} />

          <MerchantSizeConfig userToken={userToken} userId={user?.uid} />
        </div>
      )}
    </>
  );
};

export default ProductConfigPage;

export const Unauthorized = () => (
  <div className="flex items-center gap-4">
    <BsSignStop color="red" size={30} />
    <Text>Unauthorized to perform this task</Text>
    <BsSignStop color="red" size={30} />
  </div>
);
