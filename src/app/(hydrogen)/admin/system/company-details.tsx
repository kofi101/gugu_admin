'use client';

import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { managementUrl } from '@/config/base-url';
import { Textarea } from 'rizzui';
import { getUserToken } from '@/utils/get-token';

import toast from 'react-hot-toast';

export default function CompanyDetailsForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      callUseNowNumber: '',
      siteDisplayEmail: '',
      welcomeMessage: '',
      ourVision: '',
      ourMission: '',
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
        method: 'POST',
        body: JSON.stringify({ ...data, companyDetailsId: 0 }),
      };

      const response = await fetch(
        `${managementUrl}/AddCompanyDetails`,
        fetchOptions
      );

      if (!response.ok) {
        toast.error('Failed to add company details');
        throw new Error('Failed to submit company details');
      }

      toast.success('City successfully added');
      reset();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-6 rounded-lg bg-white p-6 shadow-md"
    >
      <h2 className="text-xl font-semibold text-gray-700">Company Details</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          type="text"
          {...register('callUseNowNumber', {
            required: 'Phone number is required',
          })}
          placeholder="Call Us Now Number"
          error={errors?.callUseNowNumber?.message as string}
        />

        <Input
          type="email"
          {...register('siteDisplayEmail', { required: 'Email is required' })}
          placeholder="Site Display Email"
          error={errors?.siteDisplayEmail?.message as string}
        />
      </div>

      <Textarea
        {...register('welcomeMessage', {
          required: 'Welcome message is required',
        })}
        placeholder="Welcome Message"
        error={errors?.welcomeMessage?.message as string}
      />

      <Textarea
        {...register('ourVision', { required: 'Vision is required' })}
        placeholder="Our Vision"
        error={errors?.ourVision?.message as string}
      />

      <Textarea
        {...register('ourMission', { required: 'Mission is required' })}
        placeholder="Our Mission"
        error={errors?.ourMission?.message as string}
      />

      <Button isLoading={isSubmitting} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
