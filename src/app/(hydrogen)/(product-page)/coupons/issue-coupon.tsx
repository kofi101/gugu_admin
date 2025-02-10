'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Modal, Textarea } from 'rizzui';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { MdOutlineClose } from 'react-icons/md';
import { Unauthorized } from '../products/configs/config';
import { SpinnerLoader } from '@/components/ui/spinner';
import { SelectComponent } from '@/app/shared/ecommerce/product/create-edit/product-summary';

type UserType = Array<{
  customerId: string;
  phoneNumber: string;
  emailAddress: string;
  fullName: string;
  numberOfPurchases: number;
  totalSpend: number;
  orderFrequency: number;
}>;

export const IssueCouponToUser = ({ couponCode }: { couponCode: string }) => {
  const [users, setUsers] = useState<UserType>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [user] = useAuthState(auth);
  const merchantId = user?.uid;

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({});

  const selectedUser = watch('user');
  const selectedUserDetails: UserType =
    users.length > 0 &&
    users.filter((user) => user?.customerId === selectedUser);

  useEffect(() => {
    const fetchTopUsers = async () => {
      setLoading(true);

      const token = await getUserToken();

      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      };
      try {
        const response = await fetchUtil(
          `${baseUrl}/Coupon/EligbleCustomers/${merchantId}`,
          fetchOptions
        );
        setUsers(response);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  const onSubmit = async (formData) => {
    setFormLoading(true);

    try {
      const token = await getUserToken();
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          customerId: formData?.user,
          couponCode: couponCode,
          message: formData.message,
          issuedBy: merchantId,
        }),
      };

      const response = await fetch(
        `${baseUrl}/Coupon/IssueCoupons`,
        fetchOptions
      );

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        setFormLoading(false);
        throw new Error('Failed to issue coupon');
      }

      reset();
      toast.success('Coupon issued successfully');
      setFormLoading(false);
    } catch (error) {
      setFormLoading(false);
      toast.error('Failed to issue coupons');
      console.error('Failed to issue coupon', error);
    }
  };
  return (
    <>
      <Button variant="text" onClick={() => setModalState(true)}>
        Issue
      </Button>
      <Modal size="lg" isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="mx-auto my-20 h-fit max-w-lg rounded-lg bg-white p-6">
          <div className="flex justify-between">
            <h2 className="mb-6 text-xl font-semibold">Issue Coupon to User</h2>
            <MdOutlineClose
              size={24}
              className="cursor-pointer"
              onClick={() => setModalState(false)}
            />
          </div>

          {loading ? (
            <SpinnerLoader />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* User Selection */}
              <div className="mb-4">
                <SelectComponent
                  options={users?.map((user) => ({
                    label: `${user?.fullName}`,
                    value: user?.customerId,
                  }))}
                  register={register('user')}
                  labelText="Select user to issue coupon"
                  placeholder="Select user"
                  error={errors?.user?.message as string}
                ></SelectComponent>
                <Textarea
                  placeholder="Any additional notes for user"
                  className="mb-6 mt-4"
                  label={'Additional note'}
                  {...register('message')}
                />
              </div>

              {
                <div className="max-w-sm rounded-lg">
                  <h2 className="mb-4 border-b pb-2 text-lg font-semibold">
                    Customer Details
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Full Name:</span>{' '}
                      {selectedUserDetails[0]?.fullName || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Email Address:</span>{' '}
                      {selectedUserDetails[0]?.emailAddress || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Phone Number:</span>{' '}
                      {selectedUserDetails[0]?.phoneNumber || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Number of Purchases:</span>{' '}
                      {selectedUserDetails[0]?.numberOfPurchases || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Total Spend:</span> GHC
                      {selectedUserDetails[0]?.totalSpend || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Order Frequency:</span>{' '}
                      {selectedUserDetails[0]?.orderFrequency || '-'} days
                    </div>
                  </div>
                </div>
              }
              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" className="" isLoading={formLoading}>
                  Issue Coupon
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
};
