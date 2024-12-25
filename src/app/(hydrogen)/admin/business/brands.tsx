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

type BrandType = {
  brandId: number;
  productCategory: string;
  brandName: string;
};

type ProductCategory = {
  productCategoryId: number;
  productCategory: string;
};

export const BrandComponent = () => {
  const [brand, setBrand] = useState<Array<BrandType>>([]);
  const [categories, setCategories] = useState<Array<ProductCategory>>([]);
  const [filteredBrand, setFilteredBrand] = useState<Array<BrandType>>([]);
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

  // Fetch categories and brand
  const fetchBrandAndCategories = async () => {
    const token = await getUserToken();
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    setLoading(true);
    try {
      const [categoriesData, brandData] = await Promise.all([
        fetchUtil(`${managementUrl}/ProductCategories`, fetchOptions),
        fetchUtil(`${managementUrl}/Brands`, fetchOptions),
      ]);
      setCategories(categoriesData);
      setBrand(brandData);
      setFilteredBrand(brandData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandAndCategories();
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/AddBrand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          productCategoryId: data.productCategoryId.value,
          brandId: 0,
          brandName: data.brand,
          createdBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      reset();
      setFormLoading(false);
      toast.success('Brand successfully added');
      fetchBrandAndCategories();
    } catch (error) {
      toast.error('Failed to add brand');
      setFormLoading(false);
      console.error(error);
    }
  };

  // Handle filtering based on selected category
  const handleCategoryFilterChange = (e) => {
    const selectedValue = e.label;
    setSelectedCategory(selectedValue);
    if (selectedValue === '' || null) {
      setFilteredBrand(brand);
    } else {
      setFilteredBrand(
        brand?.filter(
          (subCategory) => subCategory.productCategory === selectedValue
        )
      );
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md md:max-w-[60%]">
      <h4 className="mb-6 text-xl font-bold">Add Brands</h4>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row">
          <Controller
            name="productCategoryId"
            control={control}
            rules={{ required: 'Product category is required' }}
            render={({ field: { onChange, value } }) => (
              <Select
                options={categories?.map((item) => ({
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
            label="Brand Name"
            type="text"
            className="w-full md:w-1/2"
            {...register('brand', {
              required: 'Brand name is required',
            })}
            size="md"
            placeholder="Enter Brand name"
            error={errors.brand?.message as string}
          />
        </div>

        <Button isLoading={formLoading} type="submit">
          Create Brand
        </Button>
      </form>

      <div className="mt-8">
        <h5 className="mb-4 text-lg font-semibold">All brand</h5>

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
              setFilteredBrand(brand);
            }}
          />
        </div>

        {loading && <SpinnerLoader />}
        {!loading && (
          <ul className="h-80 space-y-2 overflow-auto">
            {filteredBrand.map((item) => (
              <li
                key={item.brandId}
                className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 shadow-sm"
              >
                <p>{item.brandName}</p>
                <div className="flex h-fit items-center gap-4">
                  <EditBrand
                    productCategory={item.productCategory}
                    name={item.brandName}
                    id={item.brandId}
                    fetchConfig={fetchBrandAndCategories}
                    category={categories}
                  />
                  <DeleteComponent
                    buttonVariant="outline"
                    name={item.brandName}
                    url={`${managementUrl}/DeleteBrand/${item.brandId}/${item.brandName}/${user?.uid}`}
                    fetchConfig={fetchBrandAndCategories}
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

function EditBrand({
  name,
  id,
  fetchConfig,
  category,
  productCategory,
}: {
  name: string;
  id: number;
  productCategory: string;
  fetchConfig: () => void;
  category: Array<ProductCategory>;
}) {
  const [modalState, setModalState] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [user] = useAuthState(auth);

  const foundCategory = category.find(
    (c) => c.productCategory === productCategory
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      brand: name,
      productCategoryId: foundCategory?.productCategory,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/ModifyBrand`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          modifiedBy: user?.uid,
          productCategoryId:
            data.productCategoryId?.value || foundCategory?.productCategoryId,
          brandId: id,
          brandName: data.brand,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('Brand successfully updated');
      fetchConfig();
    } catch (error) {
      toast.error('Failed to update brand');
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
            <h4 className="mb-4"> Edit brand</h4>
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
                {...register('brand')}
                size="md"
                placeholder="Enter product subcategory name"
                error={errors.brand?.message as string}
              />
            </div>

            <Button
              type="submit"
              size="md"
              isLoading={formLoading}
              className="col-span-2 mt-6 w-fit min-w-20"
            >
              Update Brand
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
