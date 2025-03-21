'use client';

import { auth } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Select } from '@/components/ui/select';
import { baseUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserToken } from '@/utils/get-token';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Options } from './config';


export default function PreferredPaymentOption({
  paymentOptions,
  mobileNetworks,
}: {
  paymentOptions: Options;
  mobileNetworks: Options;

}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState();
  const [networks, setNetworks] = useState();
  const [user] = useAuthState(auth);

  const router = useRouter();

  const selectedPaymentOption = watch('paymentOption');

  const onSubmit = async (data) => {
    const mobileBody = {
      merchantId: user?.uid,
      paymentOption: data?.paymentOption,
      paymentNumber: data?.phoneNumber,
      paymentNetwork: data?.telecomProvider,
    };
    const bankBody = {
      merchantId: user?.uid,
      paymentOption: data?.paymentOption,
      bankAccountNumber: data?.accountNumber,
      bank: data?.bankName,
      bankBranch: data?.bankBranch,
    };

    const sendBody = selectedPaymentOption === 1 ? mobileBody : bankBody;
    try {
      setLoading(true);

      const token = await getUserToken();

      const res = await fetch(`${baseUrl}/User/MerchantPaymentOptions`, {
        method: 'PUT',
        body: JSON.stringify(sendBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to update account');
      }
      setValue('paymentOption', '');
      reset();
      toast.success(<Text>Payment details updated successfully</Text>);
      setLoading(false);
      router.refresh();
    } catch (error) {
      setLoading(false);
      console.error('Error updating payment option:', error);
      toast.error(
        <Text>Something went wrong updating your payment details</Text>
      );
    }
  };

  const handlePaymentOptions = (event: { label: string; value: string }) => {
    setPayment(event.value);
    setValue('paymentOption', Number(event?.value));
  };

  const handleMobileNetworks = (event: { label: string; value: string }) => {
    setNetworks(event.value);
    setValue('telecomProvider', Number(event?.value));
  };

  const payOptions = paymentOptions?.map((item) => ({
    value: item?.id,
    label: item?.displayName,
  }));
  const providerOptions = mobileNetworks?.map((item) => ({
    value: item?.id,
    label: item?.displayName,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <Select
        size="lg"
        placeholder="Please add payment option"
        label="Add Preferred Payment Option"
        className="col-span-2 [&>label>span]:font-medium"
        options={payOptions}
        onChange={handlePaymentOptions}
        value={payment}
        displayValue={(selected) =>
          payOptions.find((item) => item.value === selected)?.label || ''
        }
        error={errors?.paymentOption?.message as string}
      />
      {selectedPaymentOption === 1 && (
        <div className="space-y-2">
          <Input
            type="number"
            size="lg"
            label="Enter Phone Number"
            placeholder="Enter your phone number"
            className="[&>label>span]:font-medium"
            inputClassName="text-sm"
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message as string}
          />

          <Select
            size="lg"
            placeholder="Please select provider"
            label="Select Telecom Provider"
            className="col-span-2 [&>label>span]:font-medium"
            options={providerOptions}
            onChange={handleMobileNetworks}
            value={networks}
            displayValue={(selected) =>
              providerOptions.find((item) => item.value === selected)?.label ||
              ''
            }
            error={errors?.telecomProvider?.message as string}
          />
        </div>
      )}

      {selectedPaymentOption === 2 && (
        <div className="space-y-2">
          <Input
            type="number"
            size="lg"
            label="Enter Account Number"
            placeholder="Enter your account"
            className="[&>label>span]:font-medium"
            inputClassName="text-sm"
            {...register('accountNumber')}
            error={errors.accountNumber?.message as string}
          />
          <Input
            type="text"
            size="lg"
            label="Enter Bank Name"
            placeholder="Enter bank name "
            className="[&>label>span]:font-medium"
            inputClassName="text-sm"
            {...register('bankName')}
            error={errors.bankName?.message as string}
          />
          <Input
            type="text"
            size="lg"
            label="Enter Bank Branch"
            placeholder="Enter bank branch "
            className="[&>label>span]:font-medium"
            inputClassName="text-sm"
            {...register('bankBranch')}
            error={errors.bankBranch?.message as string}
          />
        </div>
      )}

      <Button type="submit" isLoading={loading} disabled={loading}>
        {loading ? 'Saving...' : 'Save Payment Option'}
      </Button>
    </form>
  );
}
