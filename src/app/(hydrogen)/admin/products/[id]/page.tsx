import { metaObject } from '@/config/site.config';
import { ProductDetails } from './product-details';
import PageHeader from '@/app/shared/page-header';
import { fetchUtil } from '@/utils/fetch';
import { managementUrl } from '@/config/base-url';
import { cookies } from 'next/headers';

export const metadata = {
  ...metaObject('Product Details'),
};

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const token = cookies().get('token');

  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  const product = await fetchUtil(
    `${managementUrl}/Product/${params?.id}`,
    fetchOptions
  );


  const pageHeader = {
    title: `${product?.productCode}`,
    breadcrumb: [
      {
        href: '/admin/products',
        name: 'All Products',
      },
      {
        name: 'Product Details',
      },
    ],
  };

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      {product && <ProductDetails product={product} />}
    </>
  );
}
