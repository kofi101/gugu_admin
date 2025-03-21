'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { auth } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { baseUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserProfileType } from './user-details.type';
import { getUserToken } from '@/utils/get-token';
import { useRouter } from 'next/navigation';

export default function UpdateProfileComponent({
  userDetails,
  businessCategories,
}: {
  businessCategories: Array<{
    businessCategoryId: number;
    businessCategory: string;
  }>;
  userDetails: UserProfileType;
}) {
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const [user] = useAuthState(auth);

  const router = useRouter();
  const userBusinessCatId = businessCategories?.find(
    (item) => item?.businessCategory == userDetails?.businessCategory
  )?.businessCategoryId;

  const {
    setValue,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      businessName: userDetails?.fullName,
      businessPhone: userDetails?.phoneNumber,
      email: userDetails?.email,
      category: userBusinessCatId,
      address: userDetails?.address,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const userBody = {
        userType: 'Merchant',
        id: user?.uid,
        fullName: data.businessName,
        phoneNumber: data.businessPhone,
        email: data.email,
        address: data.address,
        shipping_BillingAddress: data.address,
        businessCategoryId: data.category || userBusinessCatId,
        businessDocument: userDetails?.businessDocument,
        firebaseId: user?.uid,
        modifiedBy: user?.uid,
        registrationDate: userDetails?.registrationDate,
      };

      const token = await getUserToken();

      const dbUserRes = await fetch(`${baseUrl}/User/UpdateUserDetails`, {
        method: 'PUT',
        body: JSON.stringify(userBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      if (!dbUserRes.ok) {
        throw new Error('Failed to update account');
      }

      reset();

      toast.success(<Text>Account updated successfully</Text>);
      router.refresh();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error(<Text>Something went wrong updating your account</Text>);
    }
  };

  const handleCategory = (event: { label: string; value: string }) => {
    setCategory(event.value);
    setValue('category', Number(event?.value));
  };

  const catOptions = businessCategories?.map((item) => ({
    value: item?.businessCategoryId,
    label: item?.businessCategory,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl">
      <div className="grid w-full gap-x-6 gap-y-5 md:grid-cols-2">
        {/* Business Name */}
        <Input
          type="text"
          size="lg"
          label="Business Name"
          placeholder="Enter your business name"
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
          {...register('businessName')}
          error={errors.businessName?.message}
        />

        {/* Business Phone */}
        <Input
          type="number"
          size="lg"
          label="Business Phone Number"
          placeholder="Enter your phone number"
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
          {...register('businessPhone')}
          error={errors.businessPhone?.message}
        />

        {/* Business Category (Full Width) */}
        <Select
          size="lg"
          placeholder="Choose business category"
          label="Select Business Category"
          className="col-span-2 [&>label>span]:font-medium"
          options={catOptions}
          onChange={handleCategory}
          value={category}
          displayValue={(selected) =>
            catOptions.find((item) => item.value === selected)?.label || ''
          }
          error={errors?.category?.message as string}
        />

        {/* Address (Full Width) */}
        <Textarea
          size="lg"
          label="Business Address"
          className="col-span-2 [&>label>span]:font-medium"
          placeholder="Enter business address"
          {...register('address')}
          error={errors.address?.message}
        />

        {/* Submit Button (Full Width) */}

        <Button
          isLoading={loading}
          size="lg"
          type="submit"
          className="col-span-2 mt-4 w-fit"
        >
          <span>Update Account Details</span>
        </Button>
      </div>
    </form>
  );
}
