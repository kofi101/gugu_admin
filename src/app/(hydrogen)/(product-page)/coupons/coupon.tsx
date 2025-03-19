'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Unauthorized } from '../products/configs/config';
import { SpinnerLoader } from '@/components/ui/spinner';
import { CouponDetails } from './details';

const CouponPage = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [applicable, setApplicable] = useState<
    Array<{ id: string; name: string; displayName: string }>
  >([]);
  const [coupons, setCoupons] = useState<
    Array<{
      applicationType: string;
      couponID: number;
      couponCode: string;
      couponAmount: number;
      expiryDate: string;
      isIssued: boolean;
      redeemed: boolean;
      couponPercentage: number;
    }>
  >([]);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({});

  const fetchCoupons = async () => {
    const token = await getUserToken();
    setLoading(true);
    try {
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      };
      const data = await fetchUtil(
        `${baseUrl}/Coupon/MerchantCoupons/${user?.uid}`,
        fetchOptions
      );
      setCoupons(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to fetch coupons');
      console.error('Failed to fetch coupons', error);
    }
  };

  const fetchCouponApplicable = async () => {
    const token = await getUserToken();

    try {
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      };
      const data = await fetchUtil(
        `${baseUrl}/Coupon/CouponApplicableType`,
        fetchOptions
      );
      setApplicable(data);
    } catch (error) {
      console.error('Failed to fetch coupon applicable types', error);
    }
  };

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
          couponTypeId: 2,
          couponAmount: 0,
          couponPercentage: formData.couponPercentage,
          applicableId: 1,
          startDate: formData.startDate,
          expiryDate: formData.expiryDate,
          quantityToGenerate: formData.quantityToGenerate,
          frequency: formData.frequency,
          merchantID: user?.uid,
        }),
      };

      const response = await fetch(
        `${baseUrl}/Coupon/CreateCoupons`,
        fetchOptions
      );

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        setFormLoading(false);

        return toast.error('Failed to create coupon');
      }

      if (response.ok) {
        await fetchCoupons();
      }

      reset();
      toast.success('Coupon added successfully');
      setFormLoading(false);
    } catch (error) {
      setFormLoading(false);
      toast.error('Failed to create coupons');
      console.error('Failed to create coupon', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCoupons();
    }
    fetchCouponApplicable();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <h2 className="mb-6 text-3xl font-bold">Manage Coupons</h2>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-2xl font-semibold">Create New Coupon</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Coupon Amount */}

          <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Coupon Percentage */}

            <Input
              label="Coupon Percentage"
              type="number"
              placeholder="Enter coupon percentage"
              id="couponPercentage"
              {...register('couponPercentage', {
                required: 'Coupon percentage is required',
              })}
              error={errors.couponPercentage?.message as string}
            />

            {/* Quantity to Generate */}

            <Input
              label="Number of Coupons "
              type="number"
              min={1}
              placeholder="Enter quantity to generate"
              id="quantityToGenerate"
              {...register('quantityToGenerate', {
                required: 'Quantity is required',
                min: 1,
              })}
              error={errors.quantityToGenerate?.message as string}
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

          <Button type="submit" isLoading={formLoading} className="mt-8">
            Create Coupon
          </Button>
        </form>
      </div>

      {loading && <SpinnerLoader />}
      {!loading && coupons.length === 0 && (
        <p className="mt-20 text-center">No coupons found</p>
      )}
      {coupons && coupons.length > 0 && (
        <>
          <h4 className="mb-4 text-xl font-semibold">Your Coupons</h4>
          <div className="max-h-[40rem] w-full overflow-auto rounded-lg bg-white p-6 shadow-md">
            {!loading && coupons?.length === 0 ? (
              <p>No coupons found.</p>
            ) : (
              <table className="min-w-full leading-normal">
                <thead className="overflow-auto border">
                  <tr>
                    <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Code
                    </th>
                    <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Percentage (%)
                    </th>
                    <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Expiry Date
                    </th>
                    <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Issued
                    </th>
                    <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Redeemed
                    </th>

                    <th className="border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      {' '}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coupons?.map((coupon) => (
                    <tr key={coupon.couponID}>
                      <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                        {coupon.couponCode}
                      </td>
                      <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                        {coupon.couponPercentage}
                      </td>
                      <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                        {format(new Date(coupon.expiryDate), 'yyyy-MM-dd')}
                      </td>
                      <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                        {coupon.isIssued ? 'Yes' : 'No'}
                      </td>
                      <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                        {coupon.redeemed ? 'Yes' : 'No'}
                      </td>

                      <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                        <CouponDetails
                          couponCode={coupon.couponCode}
                          couponID={coupon.couponID}
                          expiryDate={coupon.expiryDate}
                          couponAmount={coupon.couponAmount}
                          fetchCoupons={fetchCoupons}
                          applicableOptions={applicable}
                          couponTypeId={coupon.couponTypeId}
                          couponPercentage={coupon.couponPercentage}
                          applicableId={coupon.applicableId}
                          startDate={coupon.startDate}
                          frequency={coupon.frequency}
                          applicationType={coupon.applicationType}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CouponPage;
