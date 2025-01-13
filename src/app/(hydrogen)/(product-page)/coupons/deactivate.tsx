'use client';

import React, { useState } from 'react';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { baseUrl } from '@/config/base-url';
import { Modal } from 'rizzui';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Unauthorized } from '../products/configs/page';
import { SpinnerLoader } from '@/components/ui/spinner';
import { MdOutlineClose } from 'react-icons/md';

export const ReActivateCoupon = ({ couponCode }: { couponCode: string }) => {
  const [user] = useAuthState(auth);
  const [formLoading, setFormLoading] = useState(false);
  const [modalState, setModalState] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({});

  const onSubmit = async (formData) => {
    setFormLoading(true);

    try {
      const fetchOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user?.uid,
        },
        body: JSON.stringify({
          couponCode: couponCode,
          startDate: formData.start,
          expiryDate: formData.expiry,
        }),
      };

      const response = await fetch(
        `${baseUrl}/Coupon/ReactivateCoupon`,
        fetchOptions
      );

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        setFormLoading(false);

        return toast.error('Failed to re-activate coupon');
      }

      reset();
      toast.success('Coupon re-activated successfully');
      setFormLoading(false);
    } catch (error) {
      setFormLoading(false);
      toast.error('Failed to re-activate coupons');
      console.error('Failed to re-activate coupon', error);
    }
  };

  return (
    <>
      <Button variant="text" onClick={() => setModalState(true)}>
        Re-activate Coupon
      </Button>

      {/* Modal to apply coupon */}
      <Modal size="md" isOpen={modalState} onClose={() => setModalState(false)}>
        {formLoading ? (
          <div className="flex items-center justify-center">
            <SpinnerLoader />
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-xl font-semibold">
                Re-activate deactivated coupons
              </h4>
              <MdOutlineClose
                size={24}
                className="cursor-pointer"
                onClick={() => setModalState(false)}
              />
            </div>

            {/* Toggle Section */}
            <div className="mb-4">
              <p className="text-gray-600">
                You can make de-activated coupons active again.
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="my-8 flex flex-col gap-4 md:flex-row">
                  <Input
                    label="Start Date"
                    type="datetime-local"
                    id="start"
                    {...register('start', {
                      required: 'Start date is required',
                    })}
                    error={errors.start?.message as string}
                  />

                  {/* Expiry Date */}

                  <Input
                    label="Expiry Date"
                    type="datetime-local"
                    id="expiry"
                    {...register('expiry', {
                      required: 'Expiry date is required',
                    })}
                    error={errors.expiry?.message as string}
                  />
                </div>

                <Button
                  isLoading={formLoading}
                  type="submit"
                  className="px-4 py-2"
                >
                  Activate Coupon
                </Button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
