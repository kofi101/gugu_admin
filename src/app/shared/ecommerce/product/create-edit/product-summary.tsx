import React, { useState, useEffect } from 'react';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import { productTypeOptions } from '@/app/shared/ecommerce/product/create-edit/form-utils';
import { fetchUtil } from '@/utils/fetch';
import { managementUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';

export default function ProductSummary({
  className,
  editMode = false,
}: {
  className?: string;
  editMode?: boolean;
}) {
  const [brand, setBrand] = useState([]);
  const [category, setCategory] = useState<
    Array<{ productCategory: string; productCategoryId: string }>
  >([]);
  const [subCategory, setSubCategory] = useState<
    Array<{
      productCategory: string;
      productSubCategory: string;
      productSubCategoryId: string;
    }>
  >([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [brandOptions, setBrandOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const getAllConfigs = async () => {
    const token = await getUserToken();

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    const [brandData, categoryData, subCategoryData] = await Promise.all([
      fetchUtil(`${managementUrl}/Brands`, fetchOptions),
      fetchUtil(`${managementUrl}/ProductCategories`, fetchOptions),
      fetchUtil(`${managementUrl}/ProductSubCategories`, fetchOptions),
    ]);

    setBrand(brandData);
    setCategory(categoryData);
    setSubCategory(subCategoryData);
  };

  const categoryOptions = category?.map((item) => ({
    label: item.productCategory,
    value: item.productCategoryId,
  }));

  const categoryValue = watch('category');

  useEffect(() => {
    const userCat = category?.find(
      (cat) => cat.productCategoryId === Number(categoryValue)
    );

    const foundSubCat: Array<{ label: string; value: string }> = subCategory
      ?.filter((i) => i?.productCategory === userCat?.productCategory)
      ?.map((i) => ({
        label: i?.productSubCategory,
        value: i?.productSubCategoryId,
      }));

    const foundBrand: Array<{ label: string; value: string }> = brand
      ?.filter((i) => i?.productCategory === userCat?.productCategory)
      ?.map((i) => ({ label: i?.brandName, value: i?.brandId }));

    setSubCategoryOptions(foundSubCat);
    setBrandOptions(foundBrand);
  }, [categoryValue]);

  useEffect(() => {
    getAllConfigs();
  }, []);

  return (
    <FormGroup
      title="Summary"
      description="Product description and necessary information from here"
      className={cn(className)}
    >
      <Input
        label={
          <span>
            Product Name <span className="text-red-500">required *</span>
          </span>
        }
        placeholder="Enter your product name"
        {...register('productName')}
        error={errors.productName?.message as string}
        type="text"
        autoComplete="off"
      />
      {!editMode && (
        <SelectComponent
          labelText={
            <span>
              Product Type <span className="text-red-500">required *</span>
            </span>
          }
          options={productTypeOptions}
          placeholder="Choose your product type"
          error={errors?.productType?.message as string}
          register={register('productType')}
        />
      )}

      <SelectComponent
        labelText="Category"
        options={categoryOptions}
        placeholder="Select product category"
        error={errors?.category?.message as string}
        register={register('category')}
      />
      <SelectComponent
        labelText="Sub category"
        options={subCategoryOptions}
        placeholder="Select sub category"
        error={errors?.subCategory?.message as string}
        register={register('subCategory')}
      />
      <Input
        label={
          <span>
            {' '}
            Product Code <span className="text-red-500">required *</span>
          </span>
        }
        placeholder="Enter your product code"
        {...register('productCode')}
        error={errors.productCode?.message as string}
        type="text"
        autoComplete="off"
      />
      <SelectComponent
        labelText="Brand"
        options={brandOptions}
        placeholder="Select product brand"
        error={errors?.brand?.message as string}
        register={register('brand')}
      />
    </FormGroup>
  );
}

export const SelectComponent = ({
  labelText,
  options,
  error,
  placeholder,
  register,
}: {
  labelText: React.ReactNode;
  options: Array<{ label: string; value: string }>;
  error: string;
  placeholder: string;
  register: any;
}) => {
  return (
    <div className="flex  flex-col">
      <label className="mb-1 text-sm font-medium" htmlFor={labelText as string}>
        {labelText}
      </label>
      <select
        className={`rounded-md border-2 border-gray-200 text-sm  focus:border-[1px] ${
          !!error && 'border-red-500 focus:border-red-500'
        }`}
        {...register}
        id={labelText}
      >
        <option
          className="font-gray-200 block w-full text-left text-sm text-muted-foreground"
          value=""
          disabled
          selected
        >
          {placeholder}
        </option>
        {options &&
          options.map((item) => (
            <option
              className="font-gray-200 block w-full text-left text-sm text-muted-foreground"
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
      </select>
      {!!error && <span className="text-[13px] text-red">{error}</span>}
    </div>
  );
};
