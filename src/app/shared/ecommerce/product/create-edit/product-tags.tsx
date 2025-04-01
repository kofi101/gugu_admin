'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import { useFormContext } from 'react-hook-form';
import { merchantUrl } from '@/config/base-url';
import { fetchUtil } from '@/utils/fetch';
import { SelectComponent } from './product-summary';
import { Textarea } from '@/components/ui/textarea';
import { getUserToken } from '@/utils/get-token';

export default function ProductTags({
  className,
  index,
  editMode = false,
}: {
  className?: string;
  index?: number;
  editMode?: boolean;
}) {
  const [size, setSize] = useState<string[]>([]);
  const [color, setColor] = useState<string[]>([]);
  const [material, setMaterial] = useState<string[]>([]);

  const {
    register,
    formState: { errors },
  } = useFormContext();

  const getAllConfigs = async () => {
    const token = await getUserToken();
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    const [sizeData, colorData, materialData] = await Promise.all([
      fetchUtil(`${merchantUrl}/Sizes`, fetchOptions),
      fetchUtil(`${merchantUrl}/Colours`, fetchOptions),
      fetchUtil(`${merchantUrl}/Materials`, fetchOptions),
    ]);

    setSize(sizeData);
    setColor(colorData);
    setMaterial(materialData);
  };

  const sizeOptions =
    size && size.map((i) => ({ label: i.size, value: i.sizesId }));

  const colorOptions =
    color && color.map((i) => ({ label: i.colour, value: i.coloursId }));

  const materialOptions =
    material &&
    material.map((i) => ({ label: i.material, value: i.materialsId }));

  useEffect(() => {
    getAllConfigs();
  }, []);

  return (
    <FormGroup
      title="Product variants"
      description="Add your product variants here"
      className={cn(className)}
    >
      <Input
        label="Price GHC"
        placeholder="Enter product price"
        {...register(`${editMode ? 'price' : 'price.' + index}`)}
        error={errors.price?.message as string}
        type="number"
        min={0}
        step={0.1}
      />

      <Input
        label="Quantity of products"
        placeholder="Available quantity"
        {...register(`${editMode ? 'quantity' : 'quantity.' + index}`)}
        error={errors.quantity?.message as string}
        type="number"
        min={0}
      />
      <SelectComponent
        labelText="Size"
        options={sizeOptions}
        register={register(`${editMode ? 'size' : 'size.' + index}`)}
        error={errors?.size?.message as string}
        placeholder="Select product size"
      />
      <SelectComponent
        labelText="Color"
        options={colorOptions}
        register={register(`${editMode ? 'color' : 'color.' + index}`)}
        error={errors?.color?.message as string}
        placeholder="Select product color"
      />
      <SelectComponent
        labelText="Material"
        options={materialOptions}
        register={register(`${editMode ? 'material' : 'material.' + index}`)}
        error={errors?.material?.message as string}
        placeholder="Select product material"
      />

      <Input
        label="Weight (Kg)"
        type="number"
        placeholder="Enter product weight"
        {...register(`${editMode ? 'weight' : 'weight.' + index}`)}
        error={errors.weight?.message as string}
        min={0}
        step={0.001}
        required
      />
      <Textarea
        size="lg"
        label="Product description"
        className="col-span-2 [&>label>span]:font-medium"
        placeholder="Describe the product"
        {...register(`${editMode ? 'description' : 'description.' + index}`)}
        error={errors.description?.message as string}
      />
    </FormGroup>
  );
}
