'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import CreateEditProduct from '@/app/shared/ecommerce/product/create-edit';
import PageHeader from '@/app/shared/page-header';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import { fetchUtil } from '@/utils/fetch';
1;
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { merchantUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { Text } from '@/components/ui/text';
import EditProduct from '@/app/shared/ecommerce/product/edit/edit-product';

const pageHeader = {
  title: 'Edit Product',
  breadcrumb: [
    {
      href: routes.eCommerce.products,
      name: 'Products',
    },
    {
      name: 'Edit',
    },
  ],
};

export default function EditProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, setProduct] = useState([]);
  const slug = params.slug;

  const [user] = useAuthState(auth);

  const fetchSingleProductUrl = `${merchantUrl}/Products/${user?.uid}/${slug}`;
  const fetchSingleProduct = async () => {
    try {
      const res = await fetchUtil(fetchSingleProductUrl);

      setProduct(res);
    } catch (err) {
      return toast.error(
        <Text as="b">Something went wrong, please try again</Text>
      );
    }
  };

  useEffect(() => {
    fetchSingleProduct();
  }, []);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.createProduct}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button
            as="span"
            className="w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100"
          >
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            Edit Product
          </Button>
        </Link>
      </PageHeader>
      {product && <EditProduct singleProduct={product} />}
    </>
  );
}
