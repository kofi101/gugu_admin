'use client';

import { useForm } from 'react-hook-form';
import { IoMdClose } from 'react-icons/io';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { managementUrl } from '@/config/base-url';
import { Textarea, Modal } from 'rizzui';
import { getUserToken } from '@/utils/get-token';

import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function EditCompanyDetailsForm({ companyDetails }) {
  const [modalState, setModalState] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      callUseNowNumber: companyDetails.callUseNowNumber,
      siteDisplayEmail: companyDetails.siteDisplayEmail,
      welcomeMessage: companyDetails.welcomeMessage,
      ourVision: companyDetails.ourVision,
      ourMission: companyDetails.ourMission,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify({
          ...data,
          companyDetailsId: companyDetails.companyDetailsId,
        }),
      };

      const response = await fetch(
        `${managementUrl}/ModifyCompanyDetails`,
        fetchOptions
      );

      if (!response.ok) {
        toast.error('Failed to update company details');
        throw new Error('Failed to submit company details');
      }

      toast.success('Company details successfully updated');
      reset();
      router.refresh();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  useEffect(() => {
    reset({
      callUseNowNumber: companyDetails.callUseNowNumber,
      siteDisplayEmail: companyDetails.siteDisplayEmail,
      welcomeMessage: companyDetails.welcomeMessage,
      ourVision: companyDetails.ourVision,
      ourMission: companyDetails.ourMission,
    });
  }, [companyDetails, reset]);

  return (
    <>
      <Button onClick={() => setModalState(true)}>Edit Company Details</Button>

      <Modal
        size="lg"
        isOpen={modalState}
        onClose={() => {
          setModalState(false);
          reset();
        }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full space-y-6 rounded-lg bg-white p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700">
              Company Details
            </h2>
            <button type="button" onClick={() => setModalState(false)}>
              <IoMdClose size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Call Us Now Number"
              type="number"
              {...register('callUseNowNumber', {
                required: 'Phone number is required',
              })}
              placeholder="Call Us Now Number"
              error={errors?.callUseNowNumber?.message as string}
            />

            <Input
              label="Site Display Email"
              type="email"
              {...register('siteDisplayEmail', {
                required: 'Email is required',
              })}
              placeholder="Site Display Email"
              error={errors?.siteDisplayEmail?.message as string}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Textarea
              label="Welcome Message"
              {...register('welcomeMessage', {
                required: 'Welcome message is required',
              })}
              placeholder="Welcome Message"
              error={errors?.welcomeMessage?.message as string}
            />

            <Textarea
              label="Our Vision"
              {...register('ourVision', { required: 'Vision is required' })}
              placeholder="Our Vision"
              error={errors?.ourVision?.message as string}
            />
          </div>

          <Textarea
            label="Our Mission"
            {...register('ourMission', { required: 'Mission is required' })}
            placeholder="Our Mission"
            error={errors?.ourMission?.message as string}
          />

          <div className="flex justify-end">
            <Button
              isLoading={isSubmitting}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Company Details'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
