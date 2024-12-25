import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { MdOutlineClose, MdOutlineEdit } from 'react-icons/md';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { fetchUtil } from '@/utils/fetch';
import { managementUrl } from '@/config/base-url';
import { Modal, ActionIcon } from 'rizzui';
import { getUserToken } from '@/utils/get-token';
import { SpinnerLoader } from '@/components/ui/spinner';
import { DeleteComponent } from '../../delete/delete';
import { Unauthorized } from '../../(product-page)/products/configs/page';

type ProductSubCategory = {
  productSubCategoryId: number;
  productCategory: string;
  productSubCategory: string;
};

type ProductCategory = {
  productCategoryId: number;
  productCategory: string;
};

export const ProductSubCategory = () => {
  const [subCategories, setSubCategories] = useState<Array<ProductSubCategory>>(
    []
  );
  const [categories, setCategories] = useState<Array<ProductCategory>>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<
    Array<ProductSubCategory>
  >([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  // Fetch categories and subcategories
  const fetchCategoriesAndSubCategories = async () => {
    const token = await getUserToken();
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    setLoading(true);
    try {
      const [categoriesData, subCategoriesData] = await Promise.all([
        fetchUtil(`${managementUrl}/ProductCategories`, fetchOptions),
        fetchUtil(`${managementUrl}/ProductSubCategories`, fetchOptions),
      ]);
      setCategories(categoriesData);
      setSubCategories(subCategoriesData);
      setFilteredSubCategories(subCategoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndSubCategories();
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/AddProductSubCategory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          productCategoryId: data.productCategoryId.value,
          productSubCategoryId: 0,
          productSubCategory: data.productSubCategory,
          createdBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      reset();
      setFormLoading(false);
      toast.success('Product subcategory successfully added');
      fetchCategoriesAndSubCategories();
    } catch (error) {
      toast.error('Failed to add product subcategory');
      setFormLoading(false);
      console.error(error);
    }
  };

  // Handle filtering based on selected category
  const handleCategoryFilterChange = (e) => {
    const selectedValue = e.label;
    setSelectedCategory(selectedValue);
    if (selectedValue === '' || null) {
      setFilteredSubCategories(subCategories);
    } else {
      setFilteredSubCategories(
        subCategories.filter(
          (subCategory) => subCategory.productCategory === selectedValue
        )
      );
    }
  };

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <h4 className="mb-6 text-xl font-bold">Add Product Subcategory</h4>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row">
          <Controller
            name="productCategoryId"
            control={control}
            rules={{ required: 'Product category is required' }}
            render={({ field: { onChange, value } }) => (
              <Select
                options={categories.map((item) => ({
                  label: item.productCategory,
                  value: item.productCategoryId,
                }))}
                value={value}
                onChange={onChange}
                label="Product Category"
                className="w-full md:w-1/2"
                error={errors?.productCategoryId?.message as string}
                size="md"
              />
            )}
          />

          <Input
            label="Subcategory Name"
            type="text"
            className="w-full md:w-1/2"
            {...register('productSubCategory', {
              required: 'Product subcategory name is required',
            })}
            size="md"
            placeholder="Enter product subcategory name"
            error={errors.productSubCategory?.message as string}
          />
        </div>

        <Button isLoading={formLoading} type="submit">
          Create Subcategory
        </Button>
      </form>

      <div className="mt-8">
        <h5 className="mb-4 text-lg font-semibold">All Subcategories</h5>

        <div className="mb-4">
          <Select
            options={categories.map((item) => ({
              label: item.productCategory,
              value: item.productCategoryId,
            }))}
            value={selectedCategory}
            onChange={handleCategoryFilterChange}
            label="Product Category"
            className="w-full md:w-1/2"
            size="md"
            clearable={selectedCategory !== null}
            onClear={() => {
              setSelectedCategory(null);

              setFilteredSubCategories(subCategories);
            }}
          />
        </div>

        {loading && <SpinnerLoader />}
        {!loading && (
          <ul className="h-80 space-y-2 overflow-auto">
            {filteredSubCategories.map((item) => (
              <li
                key={item.productSubCategoryId}
                className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 shadow-sm"
              >
                <p>{item.productSubCategory}</p>
                <div className="flex h-fit items-center gap-4">
                  <EditSub
                    name={item.productSubCategory}
                    id={item.productSubCategoryId}
                    fetchConfig={fetchCategoriesAndSubCategories}
                    category={categories}
                  />
                  <DeleteComponent
                    buttonVariant="outline"
                    name={item.productSubCategory}
                    url={`${managementUrl}/DeleteProductCategory/${item.productSubCategoryId}/${item.productCategory}/${user?.uid}`}
                    fetchConfig={fetchCategoriesAndSubCategories}
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

function EditSub({
  name,
  id,
  fetchConfig,
  category,
}: {
  name: string;
  id: number;
  fetchConfig: () => void;
  category: Array<ProductCategory>;
}) {
  const [modalState, setModalState] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productSubCategory: name,
      productCategoryId: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/ModifyProductSubCategory`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          modifiedBy: user?.uid,
          productCategoryId: data.productCategoryId?.value,
          productSubCategoryId: id,
          productSubCategory: data.productSubCategory,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('Product sub category successfully updated');
      fetchConfig();
    } catch (error) {
      toast.error('Failed to update product category');
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
            <h4 className="mb-4"> Edit sub category</h4>
            <div className="flex flex-col gap-2 md:flex-row">
              <Controller
                name="productCategoryId"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    options={category?.map((item) => ({
                      label: item.productCategory,
                      value: item.productCategoryId,
                    }))}
                    value={value}
                    onChange={onChange}
                    label="Product Category"
                    className="w-1/2"
                    error={errors?.productCategoryId?.message as string}
                    size="md"
                  />
                )}
              />

              <Input
                label="Subcategory Name"
                type="text"
                className="w-1/2"
                {...register('productSubCategory')}
                size="md"
                placeholder="Enter product subcategory name"
                error={errors.productSubCategory?.message as string}
              />
            </div>

            <Button
              type="submit"
              size="md"
              isLoading={formLoading}
              className="col-span-2 mt-6 w-fit min-w-20"
            >
              Update Sub Category
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
