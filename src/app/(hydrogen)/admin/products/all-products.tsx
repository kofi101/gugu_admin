'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Modal,
  ActionIcon,
  Popover,
  Textarea,
  Title,
  Input,
  Select,
} from 'rizzui';
import { MdOutlineClose } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { SpinnerLoader } from '@/components/ui/spinner';
import { fetchUtil } from '@/utils/fetch';
import { useForm } from 'react-hook-form';
import { managementUrl } from '@/config/base-url';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import { Unauthorized } from '../../(product-page)/products/configs/config';

export type Product = {
  productId: number;
  productCategory: string;
  productSubCategory: string;
  brand: string;
  productCode: string;
  productName: string;
  productDescription: string;
  size: string;
  colour: string;
  material: string;
  quantity: number;
  productImages: string[];
  salesPrice: number;
  promotionPrice: number;
  discountPercentage: number;
  isFeature: string;
  isPromotion: string;
  isDiscount: string;
  merchant: string;
  availability: string;
  status: string;
  rejectReasons: string;
  approvedBy: string;
  approvedOn: string;
  isDeleted: string;
};

type ProductStatus = 'Pending' | 'All' | 'Approved';

const getProductStatus = (status: ProductStatus): string => {
  switch (status) {
    case 'Pending':
      return 'PendingProducts';

    case 'Approved':
      return 'Products/Approved';

    default:
      return 'Products';
  }
};

export const ProductList = () => {
  const [products, setProducts] = useState<Array<Product>>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'Pending' | 'All' | 'Approved'>('All');
  const [productCategory, setProductCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchProducts = async (status: ProductStatus) => {
    const token = await getUserToken();
    setLoading(true);

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    try {
      const data = await fetchUtil(
        `${managementUrl}/${getProductStatus(status)}`,
        fetchOptions
      );
      setProducts(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    Array.isArray(products) &&
    products?.filter((product) => {
      return (
        (productCategory
          ? product.productCategory === productCategory
          : true) &&
        (searchTerm
          ? product.productName.toLowerCase().includes(searchTerm.toLowerCase())
          : true)
      );
    });

  useEffect(() => {
    fetchProducts(filter);
  }, [filter]);

  return (
    <div className="max-w-5xl p-6">
      <div className="mb-6 flex justify-between">
        <div className="space-x-4">
          <Button
            onClick={() => setFilter('All')}
            variant={filter === 'All' ? 'solid' : 'outline'}
          >
            All Products
          </Button>
          <Button
            onClick={() => setFilter('Pending')}
            variant={filter === 'Pending' ? 'solid' : 'outline'}
          >
            Pending Products
          </Button>
        </div>
      </div>

      <div className="my-16 flex flex-col gap-4  md:flex-row">
        <Select
          options={Array.from(
            new Set(products.map((product) => product.productCategory))
          ).map((category) => ({ label: category, value: category }))}
          onChange={(selectedOption) =>
            setProductCategory(selectedOption?.value || null)
          }
          value={productCategory}
          placeholder="Filter by Category"
          className="w-full md:w-1/2"
          clearable={productCategory !== null}
          onClear={() => setProductCategory(null)}
        />

        <Input
          type="text"
          placeholder="Search by Product Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2"
        />
      </div>

      {loading ? (
        <SpinnerLoader />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(filteredProducts) &&
            filteredProducts?.map((product?) => (
              <div
                key={product?.productId}
                className="flex flex-col rounded-lg bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold">
                  {product?.productName}
                </h3>
                <p className="text-sm text-gray-600">
                  {product?.productDescription}
                </p>
                <div className="mt-4">
                  <span className="inline-block rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    Category: {product?.productCategory}
                  </span>
                  <span className="ml-2 inline-block rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    Subcategory: {product?.productSubCategory}
                  </span>
                </div>
                <div className="mt-4">
                  <span className="block font-bold text-gray-700">Price:</span>
                  <span className="block text-gray-800">
                    GHC {product?.salesPrice}
                  </span>
                  {product.promotionPrice > 0 && (
                    <span className="block text-red-600">
                      Promotion Price: GHC {product?.promotionPrice}
                    </span>
                  )}
                </div>
                <div className="mt-auto flex items-center space-x-4">
                  <Link
                    className="underline-offset-2 hover:underline"
                    href={`/admin/products/${product?.productId}`}
                  >
                    View Details
                  </Link>
                  <ProcessProduct
                    productCode={product?.productCode}
                    productId={product?.productId}
                  />

                  <span className="font-bold">{product?.status}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export const ProcessProduct = ({
  productId,
  productCode,
}: {
  productId?: number;
  productCode?: string;
}) => {
  const [modalState, setModalState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [user] = useAuthState(auth);

  const handleApprove = async (): Promise<void | string> => {
    const token = await getUserToken();
    setLoading(true);

    const fetchOptions = {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        productId: productId,
        productCode: productCode,
        approvedBy: user?.uid,
      }),
    };

    try {
      const response = await fetch(
        `${managementUrl}/ApproveProduct`,
        fetchOptions
      );

      if (!response.ok) {
        if (response.status === 401) {
          setLoading(false);
          return toast.error(<Unauthorized />);
        }

        throw new Error(`Failed to approve product: ${response.statusText}`);
      }

      const data = await response.json();

      toast.success('Product approved successfully');
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Failed to approve product');
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({});

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setRejectLoading(true);
      const res = await fetch(`${managementUrl}/RejectProduct`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          productId: productId,
          productCode: productCode,
          rejectReasons: data.reason,
          approvedBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setRejectLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setRejectLoading(false);
      toast.success('Product rejected successfully');
    } catch (error) {
      toast.error('Failed to reject product');
      setRejectLoading(false);
      console.log(error);
    }
  };

  return (
    <>
      <Button
        size="sm"
        className="border-none"
        onClick={() => setModalState(true)}
      >
        Process
      </Button>
      <Modal isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="relative m-auto h-44 px-7 pb-8 pt-6">
          <Title as="h6" className="mb-4 text-center">
            {' '}
            Process Product
          </Title>
          <ActionIcon
            size="sm"
            variant="text"
            onClick={() => setModalState(false)}
            className="absolute right-4 top-1"
          >
            <MdOutlineClose size={24} />
          </ActionIcon>

          <div className="my-4 flex h-96 justify-between">
            <Button onClick={handleApprove} isLoading={loading}>
              {' '}
              Approve Product
            </Button>
            <Popover size="lg">
              <Popover.Trigger>
                <Button variant="outline">Reject Product</Button>
              </Popover.Trigger>
              <Popover.Content>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="w-60 md:w-96"
                >
                  <Textarea
                    {...register('reason', {
                      required: 'Please add a rejection reason',
                    })}
                    label="Add a rejection reason"
                    placeholder="Rejection reason"
                    error={errors?.reason?.message as string}
                  />

                  <Button
                    className="mt-4"
                    type="submit"
                    color="danger"
                    isLoading={rejectLoading}
                  >
                    Reject
                  </Button>
                </form>
              </Popover.Content>
            </Popover>
          </div>
        </div>
      </Modal>
    </>
  );
};
