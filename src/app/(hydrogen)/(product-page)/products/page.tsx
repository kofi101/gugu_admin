'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import PageHeader from '@/app/shared/page-header';
import ProductsTable from '@/app/shared/ecommerce/product/product-list/table';
import { merchantUrl } from '@/config/base-url';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { fetchUtil } from '@/utils/fetch';
import { SpinnerLoader } from '@/components/ui/spinner';
import { getUserToken } from '@/utils/get-token';

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

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFetch, setRefreshFetch] = useState(false);

  const [user] = useAuthState(auth);

  const merchantId = user?.uid;


  const productUrl = `${merchantUrl}/Products/${merchantId}`;

  useEffect(() => {
    const fetchProducts = async () => {
      const token = await getUserToken();

      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      };

      setLoading(true);
      try {
        const products: Array<any> = await fetchUtil(productUrl, fetchOptions);

        const mappedProducts =
          products &&
          products
            .filter((item) => item.isDeleted === 'No')
            .map((item) => ({
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

        setAllProducts(mappedProducts);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        return toast.error(<Text as="b">Failed to fetch products</Text>);
      }
    };

    fetchProducts();
  }, [refreshFetch]);
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

      <>
        {loading ? (
          <SpinnerLoader loading={loading} />
        ) : (
          allProducts &&
          allProducts.length > 0 && (
            <ProductsTable
              data={allProducts}
              setRefreshFetch={setRefreshFetch}
            />
          )
        )}
      </>
    </>
  );
}
