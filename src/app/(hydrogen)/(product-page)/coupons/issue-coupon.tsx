'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl, merchantUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Modal, Checkbox, Text } from 'rizzui';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { MdOutlineClose } from 'react-icons/md';
import { Unauthorized } from '../products/configs/page';
import { SpinnerLoader } from '@/components/ui/spinner';

import { SelectComponent } from '@/app/shared/ecommerce/product/create-edit/product-summary';

export const IssueCouponToUser = ({ couponCode }: { couponCode: string }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState(false);

  const [user] = useAuthState(auth);

  const merchantId = user?.uid;

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({});

  // Fetch the users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetchUtil(`${baseUrl}/User/CustomerList`);
        setUsers(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const token = await getUserToken();
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          customerId: 'string',
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
        setLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        setLoading(false);
        throw new Error('Failed to issue coupon');
      }

      reset();

      toast.success('Coupon issued successfully');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to issue coupons');
      console.error('Failed to issue coupon', error);
    }
  };
  return (
    <>
      <Button variant="text" onClick={() => setModalState(true)}>
        Issue Coupon
      </Button>
      <Modal size="xl" isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="mx-auto my-20 h-96 max-w-lg rounded-lg bg-white p-6">
          <h2 className="mb-6 text-xl font-semibold">Issue Coupon to User</h2>

          {loading ? (
            <SpinnerLoader />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* User Selection */}
              <div className="mb-4">
                <SelectComponent
                  options={users?.map((user) => ({
                    label: `${user.userName}-${user.phoneNumber}`,
                    value: user?.userId,
                  }))}
                  register={register('user')}
                  labelText="Select user to issue coupon"
                  placeholder="Select user"
                  error={errors?.user?.message as string}
                ></SelectComponent>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className=""
                  isLoading={loading}
                  disabled={loading}
                >
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
