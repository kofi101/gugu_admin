import React, { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MdOutlineClose, MdOutlineEdit } from 'react-icons/md';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { Modal, ActionIcon } from 'rizzui';
import { useForm } from 'react-hook-form';
import { fetchUtil } from '@/utils/fetch';
import { managementUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Unauthorized } from '../../(product-page)/products/configs/page';
import { SpinnerLoader } from '@/components/ui/spinner';
import { DeleteComponent } from '../../delete/delete';

type ProductCategory = {
  productCategoryId: number;
  productCategory: string;
  createdBy: string;
};

export const ProductCategory = () => {
  const [category, setCategory] = useState<Array<ProductCategory>>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const getProductCategory = async () => {
    const token = await getUserToken();

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    setLoading(true);
    const data = await fetchUtil(
      `${managementUrl}/ProductCategories`,
      fetchOptions
    );
    setCategory(data);
    setLoading(false);
  };

  useEffect(() => {
    getProductCategory();
  }, []);

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/AddProductCategory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          productCategoryId: 0,
          productCategory: data.productCategory,
          createdBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('Product category successfully added');
    } catch (error) {
      toast.error('Failed to add product category');
      setFormLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <h4 className="mb-6 text-xl font-bold">Add product category</h4>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Category Name"
          type="text"
          {...register('productCategory', {
            required: 'Product category name is required',
          })}
          size="md"
          placeholder="Enter product category name"
          error={errors.productCategory?.message as string}
        />

        <Button isLoading={formLoading} type="submit">
          Create Category
        </Button>
      </form>

      <div className="mt-8">
        <h5 className="mb-4 text-lg font-semibold">All category</h5>

        {loading && <SpinnerLoader />}
        {!loading && (
          <ul className="h-[24.8rem] space-y-2 overflow-auto">
            {category.map((item) => (
              <li
                key={item.productCategoryId}
                className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 shadow-sm"
              >
                <p>{item.productCategory}</p>
                <div className="flex h-fit items-center gap-4">
                  <EditProductCategory
                    name={item.productCategory}
                    id={item.productCategoryId}
                    fetchConfig={getProductCategory}
                  />
                  <DeleteComponent
                    buttonVariant="outline"
                    name={item.productCategory}
                    url={`${managementUrl}/DeleteProductCategory/${item.productCategoryId}/${item.productCategory}/${user?.uid}`}
                    fetchConfig={getProductCategory}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default function EditProductCategory({
  name,
  id,
  fetchConfig,
}: {
  name: string;
  id: number;
  fetchConfig: () => void;
}) {
  const [modalState, setModalState] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productCategory: name,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/ModifyProductCategory`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          productCategoryId: id,
          productCategory: data.productCategory,
          modifiedBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('Product category successfully added');
      fetchConfig();
    } catch (error) {
      toast.error('Failed to add product category');
      setFormLoading(false);
      console.log(error);
    }
  };

  return (
    <>
      <button className="border-none" onClick={() => setModalState(true)}>
        <MdOutlineEdit size={24} />
      </button>
      <Modal isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="relative m-auto px-7 pb-8 pt-6">
          <ActionIcon
            size="sm"
            variant="text"
            onClick={() => setModalState(false)}
            className="absolute right-4 top-1"
          >
            <MdOutlineClose size={24} />
          </ActionIcon>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center [&_label>span]:font-medium"
          >
            <h4 className="mb-4"> Edit category</h4>
            <Input
              type="text"
              label="Modify Category"
              inputClassName="border-2"
              size="lg"
              className="w-full"
              error={errors.productCategory?.message as string}
              {...register('productCategory')}
              placeholder="Edit category"
            />

            <Button
              type="submit"
              size="md"
              isLoading={formLoading}
              className="col-span-2 mt-6 w-fit min-w-20"
            >
              Update Category
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
