'use client';

import React, { useState, useEffect } from 'react';

import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Modal, Select, Popover, Title, Text } from 'rizzui';
import { format } from 'date-fns';
import { CiEdit } from 'react-icons/ci';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { MdOutlineClose } from 'react-icons/md';
import { Unauthorized } from '../products/configs/page';
import { SpinnerLoader } from '@/components/ui/spinner';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { SelectComponent } from '@/app/shared/ecommerce/product/create-edit/product-summary';
import ApplyCoupon from './apply-coupon';
import { IssueCouponToUser } from './issue-coupon';

export function CouponDetails({
  couponCode,
  couponID,
  expiryDate,
  couponAmount,
  fetchCoupons,
  couponTypeId,
  couponPercentage,
  applicableId,
  startDate,
  frequency,
  applicableOptions,
  applicationType,
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Popover placement="top" isOpen={isOpen} setIsOpen={setIsOpen}>
      <Popover.Trigger>
        <Button variant="text">
          <BsThreeDotsVertical size={24} />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <EditCoupon
          couponCode={couponCode}
          couponID={couponID}
          expiryDate={expiryDate}
          couponAmount={couponAmount}
          fetchCoupons={fetchCoupons}
          applicableOptions={applicableOptions}
          couponTypeId={couponTypeId}
          couponPercentage={couponPercentage}
          applicableId={applicableId}
          startDate={startDate}
          frequency={frequency}
          applicationType={applicationType}
        />
        <ApplyCoupon couponCode={couponCode} />
     <IssueCouponToUser couponCode={couponCode}/>
      </Popover.Content>
    </Popover>
  );
}

const EditCoupon = ({
  couponCode,
  couponAmount,
  expiryDate,
  couponTypeId,
  couponPercentage,
  applicableId,
  startDate,
  frequency,
  fetchCoupons,
  applicableOptions,
  applicationType,
}: {
  couponID: number;
  couponCode: string;
  couponAmount: number;
  expiryDate: string;
  couponTypeId: string;
  couponPercentage: string;
  applicableId: string;
  startDate: string;
  frequency: string;
  applicableOptions: Array<any>;
  applicationType: string;
  fetchCoupons: () => Promise<void>;
}) => {
  const [modalState, setModalState] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [user] = useAuthState(auth);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      couponCode: couponCode,
      couponTypeId: couponTypeId,
      couponAmount: couponAmount,
      couponPercentage: couponPercentage,
      applicableId: applicableId,
      startDate: startDate,
      expiryDate: expiryDate,
      frequency: frequency,
      merchantID: user?.uid,
    },
  });

  const onSubmit = async (formData) => {
    setFormLoading(true);

    try {
      const token = await getUserToken();
      const fetchOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          ...formData,
        }),
      };

      const response = await fetch(
        `${baseUrl}/Coupon/ModifyCoupon`,
        fetchOptions
      );

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        setFormLoading(false);
        throw new Error('Failed to edit coupon');
      }

      if (response) {
        fetchCoupons();
      }

      reset();
      setModalState(false);
      toast.success('Coupon edited successfully');
      setFormLoading(false);
    } catch (error) {
      setFormLoading(false);
      toast.error('Failed to edit coupons');
      console.error('Failed to edit coupon', error);
    }
  };

  return (
    <>
      <Button variant="text" onClick={() => setModalState(true)}>
        Edit
      </Button>
      <Modal size="xl" isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="m-auto px-7 py-12 ">
          <div className="mb-7 flex items-center justify-between">
            <h4>Edit Coupon</h4>
            <MdOutlineClose size={24} onClick={() => setModalState(false)} />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
              <Input
                label="Coupon Amount GHC"
                type="number"
                placeholder="Enter coupon amount"
                id="couponAmount"
                {...register('couponAmount')}
                error={errors.couponAmount?.message as string}
              />

              {/* Coupon Percentage */}

              <Input
                label="Coupon Percentage"
                type="number"
                placeholder="Enter coupon percentage"
                id="couponPercentage"
                {...register('couponPercentage')}
                error={errors.couponPercentage?.message as string}
              />

              {/* Applicable ID */}

              <SelectComponent
                options={applicableOptions?.map((item) => ({
                  label: item?.displayName,
                  value: item?.id,
                }))}
                placeholder={'Select applicable option'}
                register={register('applicableId')}
                error={errors?.applicableId?.message as string}
                labelText="Apply Coupon Type"
              />

              {/* Start Date */}

              <Input
                label="Start Date"
                type="datetime-local"
                id="startDate"
                {...register('startDate', {
                  required: 'Start date is required',
                })}
                error={errors.startDate?.message as string}
              />

              {/* Expiry Date */}

              <Input
                label="Expiry Date"
                type="datetime-local"
                id="expiryDate"
                {...register('expiryDate', {
                  required: 'Expiry date is required',
                })}
                error={errors.expiryDate?.message as string}
              />

              {/* Frequency */}

              <Input
                label="Number of Usage"
                type="number"
                placeholder="Enter usage frequency"
                id="frequency"
                {...register('frequency', {
                  required: 'Number usage is required',
                })}
                error={errors.frequency?.message as string}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="col-span-2 mt-12"
              isLoading={formLoading}
            >
              Edit Coupon
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};
