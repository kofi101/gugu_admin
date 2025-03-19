'use client';

import React, { useState } from 'react';

import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { baseUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Modal } from 'rizzui';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { MdOutlineClose } from 'react-icons/md';
import { Unauthorized } from '../products/configs/config';

export const EditCoupon = ({
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
      couponPercentage: couponPercentage,
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
              {/* Coupon Percentage */}

              <Input
                label="Coupon Percentage"
                type="number"
                placeholder="Enter coupon percentage"
                id="couponPercentage"
                {...register('couponPercentage')}
                error={errors.couponPercentage?.message as string}
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
