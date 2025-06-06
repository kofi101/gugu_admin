import React from 'react';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import PageHeader from '@/app/shared/page-header';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import { fetchUtil } from '@/utils/fetch';
import { merchantUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { Text } from '@/components/ui/text';
import { cookies } from 'next/headers';
import EditProduct from '@/app/shared/ecommerce/product/edit/edit-product';

const pageHeader = {
  title: 'Edit Product',
  breadcrumb: [
    {
      href: routes.eCommerce.products,
      name: 'All Products',
    },
    {
      name: 'Edit',
    },
  ],
};

export default async function EditProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  const cookieSet = cookies();
  const token = cookieSet.get('token')?.value;
  const userId = cookieSet.get('userId')?.value;

  let productDetails;

  const fetchSingleProductUrl = `${merchantUrl}/GetProduct/${userId}/${slug}`;
  try {
    productDetails = await fetchUtil(fetchSingleProductUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
  } catch (err) {
    return toast.error(
      <Text as="b">Something went wrong, please try again</Text>
    );
  }

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      {productDetails && <EditProduct singleProduct={productDetails} />}
    </>
  );
}
