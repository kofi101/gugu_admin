import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import PageHeader from '@/app/shared/page-header';
import ProductsTable from '@/app/shared/ecommerce/product/product-list/table';
import { merchantUrl } from '@/config/base-url';
import { fetchUtil } from '@/utils/fetch';
import { cookies } from 'next/headers';

const pageHeader = {
  title: 'Products',
  breadcrumb: [
    {
      href: '/products',
      name: 'Products',
    },
    {
      name: 'List',
    },
  ],
};

export default async function ProductsPage() {
  const cookieSet = await cookies();

  const token = cookieSet.get('token')?.value;
  const userId = cookieSet.get('userId')?.value;

  const productUrl = `${merchantUrl}/Products/${userId}`;

  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  const products = await fetchUtil(productUrl, fetchOptions);

  const mappedProducts = products
    ?.filter((item) => item.isDeleted === 'No')
    ?.map((item) => ({
      category: item.productCategory,
      id: item.productId,
      image: item.productImages[0],
      name: item.productName,
      price: item.salesPrice,
      rating: [4, 5, 3, 2],
      sku: item.productCode,
      status: item.status,
      stock: item.quantity,
    }));

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <Link href={'/products/create'} className="w-full @lg:w-auto">
            <Button
              as="span"
              className="w-full @lg:w-auto dark:bg-gray-100 dark:text-white dark:active:bg-gray-100"
            >
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Add Product
            </Button>
          </Link>
        </div>
      </PageHeader>

      <ProductsTable isMerchant data={mappedProducts} />
    </>
  );
}
