'use client';

import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { managementUrl } from '@/config/base-url';
import { Textarea, Modal } from 'rizzui';
import { getUserToken } from '@/utils/get-token';

import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';
import { useState } from 'react';

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
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      router.refresh();
      setModalState(false);
    }
  };

  return (
    <>
      <Button onClick={() => setModalState(true)}>Edit</Button>
      <Modal size="lg" isOpen={modalState} onClose={() => setModalState(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full space-y-6 rounded-lg bg-white p-6 shadow-md"
        >
          <h2 className="text-xl font-semibold text-gray-700">
            Company Details
          </h2>
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
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export const CompanyDetails = ({ companyDetails }) => {
  return (
    <div className="flex w-full flex-col rounded-lg border bg-white p-6 shadow-md md:w-1/2">
      <h2 className="text-2xl font-semibold text-gray-800">Company Details</h2>

      <div className="mb-8 mt-4 space-y-3">
        <p className="text-gray-700">
          <span className="font-medium">Call Us Now:</span>{' '}
          {companyDetails?.callUseNowNumber}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Email:</span>{' '}
          {companyDetails?.siteDisplayEmail}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Welcome Message:</span>{' '}
          {companyDetails?.welcomeMessage}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Our Vision:</span>{' '}
          {companyDetails?.ourVision}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Our Mission:</span>{' '}
          {companyDetails?.ourMission}
        </p>
      </div>
      <div className="flex justify-end">
        <EditCompanyDetailsForm companyDetails={companyDetails} />
      </div>
    </div>
  );
};
