'use client';

import React, { useState } from 'react';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Modal, Text, Textarea } from 'rizzui';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { MdOutlineClose } from 'react-icons/md';

import { SelectComponent } from '@/app/shared/ecommerce/product/create-edit/product-summary';
import { useRouter } from 'next/navigation';

export const ProcessOrder = ({
  orderStatusNumber,
  orderStatuses,
  orderNumber,
}: {
  orderNumber: string;
  orderStatusNumber: string;
  orderStatuses: Array<{ id: number; name: string; displayName?: string }>;
}) => {
  const [modalState, setModalState] = useState(false);
  const [user] = useAuthState(auth);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({});

  const handleUpdateOrderStatus = async (formData) => {
    const token = await getUserToken();

    const processUrl = `${baseUrl}/Orders/ProcessOrder`;

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        orderStatus: formData.orderStatus || orderStatusNumber,
        orderNumber: orderNumber,
        processedBy: user?.uid,
      }),
    };

    try {
      await fetchUtil(processUrl, fetchOptions);
      toast.success(<Text as="b">Order status updated successfully</Text>);
      reset();
      router.refresh();
    } catch (error) {
      return toast.error(<Text as="b">Failed to update order status</Text>);
    } finally {
      setModalState(false);
    }
  };

  return (
    <>
      {/* Button to open modal */}
      <Button variant="outline" onClick={() => setModalState(true)}>
        Process Order
      </Button>

      {/* Modal to process order */}
      <Modal size="md" isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="p-8">
          {/* Modal Header */}
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-xl font-semibold">
              Process order number: {orderNumber}
            </h4>
            <button
              className="border-none"
              onClick={() => setModalState(false)}
            >
              <MdOutlineClose size={24} className="cursor-pointer" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleUpdateOrderStatus)}>
            <div className="mb-4 flex items-center justify-between">
              <SelectComponent
                register={register('orderStatus', {
                  required: 'Select new order status',
                })}
                labelText="Select new order status"
                placeholder="Select new order status"
                options={orderStatuses?.map((item) => ({
                  label: item.displayName || item.name,
                  value: String(item?.id),
                }))}
                error={errors?.orderStatus?.message as string}
              />
            </div>
            <Textarea
              {...register('comments')}
              label={'Add reasons for approval (optional)'}
            />

            <Button
              isLoading={isSubmitting}
              variant={'solid'}
              className="mt-5 px-4 py-2"
              type="submit"
            >
              Update Order Status
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};
