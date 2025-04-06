import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import { fetchUtil } from '@/utils/fetch';
import { merchantUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { Text } from '@/components/ui/text';
import { cookies } from 'next/headers';
import RenderProductDetails from './details';

const pageHeader = {
  title: 'Product Details',
  breadcrumb: [
    {
      href: routes.eCommerce.products,
      name: 'All Products',
    },
    {
      name: 'Details',
    },
  ],
};

export default async function ProductDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params?.slug;

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
      {productDetails && <RenderProductDetails product={productDetails?.[0]} />}
    </>
  );
}
