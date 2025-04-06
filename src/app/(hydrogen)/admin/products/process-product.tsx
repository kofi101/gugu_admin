'use client';

import React, { useState } from 'react';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Modal, ActionIcon, Popover, Textarea, Title } from 'rizzui';
import { MdOutlineClose } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { managementUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import { Unauthorized } from '../../(product-page)/products/configs/config';

export const ProcessProduct = ({
  productId,
  productCode,
  productName,
}: {
  productId?: number;
  productCode?: string;
  productName?: string;
}) => {
  const [modalState, setModalState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [user] = useAuthState(auth);

  const handleApprove = async (): Promise<void | string> => {
    const token = await getUserToken();
    setLoading(true);

    const fetchOptions = {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        productId: productId,
        productCode: productCode,
        approvedBy: user?.uid,
      }),
    };

    try {
      const response = await fetch(
        `${managementUrl}/ApproveProduct`,
        fetchOptions
      );

      if (!response.ok) {
        if (response.status === 401) {
          setLoading(false);
          return toast.error(<Unauthorized />);
        }

        throw new Error(`Failed to approve product: ${response.statusText}`);
      }

      await response.json();
      setModalState(false);

      toast.success('Product approved successfully');
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Failed to approve product');
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({});

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setRejectLoading(true);
      const res = await fetch(`${managementUrl}/RejectProduct`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          productId: productId,
          productCode: productCode,
          rejectReasons: data.reason,
          approvedBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setRejectLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setRejectLoading(false);
      setModalState(false);
      toast.success('Product rejected successfully');
    } catch (error) {
      toast.error('Failed to reject product');
      setRejectLoading(false);
      console.log(error);
    }
  };

  return (
    <>
      <Button
        size="sm"
        className="border-none"
        onClick={() => setModalState(true)}
      >
        Process
      </Button>
      <Modal isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="relative m-auto h-44 px-7 pb-8 pt-6">
          <Title as="h6" className="mb-4 text-center">
            {' '}
            Process {productName} - {productCode}
          </Title>
          <ActionIcon
            size="sm"
            variant="text"
            onClick={() => setModalState(false)}
            className="absolute right-4 top-1"
          >
            <MdOutlineClose size={24} />
          </ActionIcon>

          <div className="my-4 flex h-96 justify-between">
            <Button onClick={handleApprove} isLoading={loading}>
              {' '}
              Approve Product
            </Button>
            <Popover size="lg">
              <Popover.Trigger>
                <Button variant="outline">Reject Product</Button>
              </Popover.Trigger>
              <Popover.Content>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="w-60 md:w-96"
                >
                  <Textarea
                    {...register('reason', {
                      required: 'Please add a rejection reason',
                    })}
                    label="Add a rejection reason"
                    placeholder="Rejection reason"
                    error={errors?.reason?.message as string}
                  />

                  <Button
                    className="mt-4"
                    type="submit"
                    color="danger"
                    isLoading={rejectLoading}
                  >
                    Reject
                  </Button>
                </form>
              </Popover.Content>
            </Popover>
          </div>
        </div>
      </Modal>
    </>
  );
};
