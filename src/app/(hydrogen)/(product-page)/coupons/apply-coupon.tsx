'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl, merchantUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Modal, Checkbox, Text } from 'rizzui';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { MdOutlineClose } from 'react-icons/md';
import { Unauthorized } from '../products/configs/config';
import { SpinnerLoader } from '@/components/ui/spinner';

import { SelectComponent } from '@/app/shared/ecommerce/product/create-edit/product-summary';

interface ApplyCouponForm {
  couponCode: string;
  productCategories: { productCategoryId: number }[];
  specificProducts: { productId: number }[];
  appliedBy: string;
}

export const ApplyCoupon = ({ couponCode }: { couponCode: string }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [view, setView] = useState<'products' | 'category'>('products');
  const [modalState, setModalState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  const merchantId = user?.uid;

  const fetchAllProducts = async () => {
    setLoading(true);
    const token = await getUserToken();

    const productUrl = `${merchantUrl}/Products/${merchantId}`;

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    try {
      const products = await fetchUtil(productUrl, fetchOptions);
      setAllProducts(products);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      return toast.error(<Text as="b">Failed to fetch products</Text>);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return (
    <>
      {/* Button to open modal */}
      <Button variant="text" onClick={() => setModalState(true)}>
        Apply Coupon
      </Button>

      {/* Modal to apply coupon */}
      <Modal size="md" isOpen={modalState} onClose={() => setModalState(false)}>
        {loading ? (
          <div className="flex items-center justify-center">
            <SpinnerLoader />
          </div>
        ) : (
          <div className="p-8">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-xl font-semibold">
                Apply Coupon Code: {couponCode}
              </h4>
              <MdOutlineClose
                size={24}
                className="cursor-pointer"
                onClick={() => setModalState(false)}
              />
            </div>

            {/* Toggle Section */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                You can apply this coupon either to individual products or an
                entire product category.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant={view === 'products' ? 'solid' : 'outline'}
                  onClick={() => setView('products')}
                  className="px-4 py-2"
                >
                  Products
                </Button>
                <Button
                  variant={view === 'category' ? 'solid' : 'outline'}
                  onClick={() => setView('category')}
                  className="px-4 py-2"
                >
                  Category
                </Button>
              </div>
            </div>

            {/* Render the component based on selected view */}
            {view === 'products' ? (
              <ApplyCouponToProducts
                allProducts={allProducts}
                merchantID={merchantId}
                couponCode={couponCode}
              />
            ) : (
              <ApplyToProductCategory
                allProducts={allProducts}
                merchantID={merchantId}
                couponCode={couponCode}
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export const ApplyCouponToProducts = ({
  couponCode,
  allProducts,
}: {
  couponCode: string;
  allProducts: Array<any>;
}) => {
  const { handleSubmit, reset } = useForm<ApplyCouponForm>();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [user] = useAuthState(auth);

  const merchantId = user?.uid;

  const onSubmit = async (data: ApplyCouponForm) => {
    const sendData = {
      couponCode: couponCode,
      appliedBy: merchantId,
      specificProducts: selectedCategories?.map((product) => ({
        productId: product,
      })),
    };

    try {
      const token = await getUserToken();
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          ...sendData,
        }),
      };

      const response = await fetch(
        `${baseUrl}/Coupon/ApplyCouponToSpecificProducts`,
        fetchOptions
      );

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        setFormLoading(false);
        return toast.error('Failed to apply coupon');
      }

      reset();
      toast.success('Coupon applied to product successfully');
      setFormLoading(false);
    } catch (error) {
      setFormLoading(false);
      toast.error('Failed to apply coupons');
      console.error('Failed to apply coupon', error);
    }

    reset();
    setSelectedCategories([]);
  };

  const handleCategoryChange = (event, item) => {
    const { checked } = event.target;

    if (checked) {
      setSelectedCategories((prevCategories) => [
        ...prevCategories,
        item.productId,
      ]);
    } else {
      setSelectedCategories((prevCategories) =>
        prevCategories.filter((category) => category !== item.productId)
      );
    }
  };

  const filterProducts = allProducts?.filter(
    (product) => product?.productName.toLowerCase().includes(searchInput)
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Coupon Application Options */}
      <h5 className="mb-4 text-lg font-medium">Apply to:</h5>

      {/* Product Search and List */}
      <div className="flex-1">
        <Input
          type="text"
          label="Search Products"
          value={searchInput}
          placeholder="Enter product name"
          onChange={(e) => setSearchInput(e.target.value.toLowerCase())}
          onClear={() => setSearchInput('')}
          clearable
          className="mb-4"
        />

        <div className="h-64 overflow-auto rounded-md border p-4">
          {filterProducts?.length > 0 ? (
            filterProducts?.map((item) => (
              <div key={item?.productName} className="mb-2 flex items-center">
                <Checkbox
                  className="mr-2"
                  label={`${item?.productName} - GHC ${item?.salesPrice}`}
                  labelPlacement="right"
                  value={selectedCategories.includes(item)}
                  onChange={(event) => handleCategoryChange(event, item)}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No products found</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <Button isLoading={formLoading} type="submit" size="lg">
          Apply Coupon
        </Button>
      </div>
    </form>
  );
};

export default ApplyCoupon;

const groupProductCategories = (allProducts) => {
  // Create a map to store unique product categories
  const categoriesMap = new Map();

  // Iterate through all products
  allProducts.forEach((item) => {
    if (!categoriesMap.has(item.productCategory)) {
      categoriesMap.set(item.productCategory, {
        productCategory: item.productCategory,
        productCategoryId: item.productCatgoryId,
      });
    }
  });

  return Array.from(categoriesMap.values());
};

const ApplyToProductCategory = ({ allProducts, merchantID, couponCode }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyCouponForm>();

  const [formLoading, setFormLoading] = useState(false);
  const [user] = useAuthState(auth);

  const merchantId = user?.uid;

  const onSubmit = async (data: ApplyCouponForm) => {
    const sendData = {
      couponCode: couponCode,
      appliedBy: merchantId,
      productCategories: [
        {
          productCategoryId: Number(data.productCategory),
        },
      ],
    };
    if (!data.productCategory) return;

    try {
      const token = await getUserToken();
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          ...sendData,
        }),
      };

      const response = await fetch(
        `${baseUrl}/Coupon/ApplyCouponToSpecificCategory`,
        fetchOptions
      );

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        setFormLoading(false);
        return toast.error('Failed to apply coupon');
      }

      reset();

      toast.success('Coupon applied successfully');
      setFormLoading(false);
    } catch (error) {
      setFormLoading(false);
      toast.error('Failed to apply coupons');
      console.error('Failed to apply coupon', error);
    }

    reset();
  };

  const category = groupProductCategories(allProducts);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex-1">
        <SelectComponent
          options={category?.map((item) => ({
            label: item?.productCategory,
            value: item?.productCategoryId,
          }))}
          placeholder="Select Product Category"
          register={register('productCategory')}
          laeblText="Apply to Product Category"
          error={errors?.productCategory?.message as string}
        />
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <Button isLoading={formLoading} type="submit" size="lg">
          Apply Coupon
        </Button>
      </div>
    </form>
  );
};
