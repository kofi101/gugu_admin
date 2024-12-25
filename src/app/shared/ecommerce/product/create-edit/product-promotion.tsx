import React from 'react';
import { Checkbox } from 'rizzui';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';

import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';

export const FormPromotion = ({ className }: { className?: string }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <FormGroup
      title="Promotional features"
      description="Choose promotion options"
      className={cn(className)}
    >
      <Input
        label="Promotional Price GHC"
        placeholder="Enter promotion price"
        {...register('promotionPrice')}
        error={errors.promotionPrice?.message as string}
        type="number"
      />
      <Input
        label="Discount (%)"
        placeholder="Enter discount percentage (if any)"
        {...register('discountPercentage')}
        error={errors.discountPercentage?.message as string}
        type="text"
        maxLength={3}
      />
      <div className="flex gap-8">
        <Checkbox label="Promotional product" {...register('promotion')} />
        <Checkbox label="Discounted product" {...register('discount')} />
        <Checkbox label="Featured product" {...register('featured')} />
      </div>
    </FormGroup>
  );
};
