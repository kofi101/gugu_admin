'use client';

import React, { useEffect, useState } from 'react';

import { Modal, ActionIcon, Textarea } from 'rizzui';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { managementUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import { useRouter } from 'next/navigation';
import { IoMdClose } from 'react-icons/io';

export function EditCarousel({
  productId,
  productName,
  image,
  carouselBannerId,
  promotionDescription,
}) {
  const [modalState, setModalState] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      carouselBannerId,
      productId,
      productName,
      promotionDescription,
      image,
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
        }),
      };

      const response = await fetch(
        `${managementUrl}/ModifyCarouselBanner`,
        fetchOptions
      );

      if (!response.ok) {
        toast.error('Failed to edit carousel banner');
        throw new Error('Failed to edit carousel banner');
      }

      toast.success('Carousel banner edited successfully');
      reset();
      router.refresh();
    } catch (error) {
      console.error('Failed to edit carousel banner', error);
    }
  };

  useEffect(() => {
    reset({
      carouselBannerId,
      productId,
      productName,
      promotionDescription,
      image,
    });
  }, [
    carouselBannerId,
    productId,
    productName,
    promotionDescription,
    image,
    reset,
  ]);

  return (
    <>
      <Button size="sm" onClick={() => setModalState(true)}>
        Edit
      </Button>
      <Modal isOpen={modalState} onClose={() => setModalState(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="m-auto px-7 pb-8 pt-6"
        >
          <div className="mb-7 flex items-center justify-between">
            <h5> Edit {productName} carousel banner</h5>
            <ActionIcon
              size="sm"
              variant="text"
              onClick={() => setModalState(false)}
            >
              <IoMdClose className="h-auto w-6" strokeWidth={1.8} />
            </ActionIcon>
          </div>
          <div className="gap-x-5 gap-y-6 [&_label>span]:font-medium">
            <Textarea
              error={errors.promotionDescription?.message as string}
              {...register('promotionDescription')}
              label="Promotion description"
              placeholder="Add a description for the promotion on the carousel"
            />
            <div className="flex justify-end">
              <Button
                isLoading={isSubmitting}
                type="submit"
                size="md"
                className="col-span-2 mt-6"
              >
                Edit Banner
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
