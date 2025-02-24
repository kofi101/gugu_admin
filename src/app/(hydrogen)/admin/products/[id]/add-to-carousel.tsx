'use client';

import { useForm } from 'react-hook-form';
import { managementUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { Modal, Button, ActionIcon, Textarea, Title } from 'rizzui';

export default function AddToCarousel({ productId, productName, image }) {
  const [modalState, setModalState] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({});

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          carouselBannerId: 0,
          productId: productId,
          productName: productName,
          promotionDescription: data.description,
          image: image,
        }),
      };

      const response = await fetch(
        `${managementUrl}/AddCarouselBanner`,
        fetchOptions
      );

      if (!response.ok) {
        toast.error('Failed to add product to carousel');
        throw new Error('Failed to add product to carousel');
      }

      toast.success('Product added to carousel');
      reset();
    } catch (error) {
      console.error('Failed to add product to carousel', error);
    } finally {
      setModalState(false);
    }
  };
  return (
    <>
      <div className="max-w-96 rounded-lg border p-4 shadow-md">
        <p>
          Products can be added to the homepage carousel to promote them to
          customers.
        </p>
        <Button className="mt-4" onClick={() => setModalState(true)}>
          Add to Homepage Carousel
        </Button>
      </div>
      <Modal isOpen={modalState} onClose={() => setModalState(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="m-auto px-7 pb-8 pt-6"
        >
          <div className="mb-7 flex items-center justify-between">
            <h5> Add {productName} to carousel </h5>
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
              error={errors.description?.message as string}
              {...register('description', {
                required: 'Promotion description is required',
              })}
              label="Promotion description"
              placeholder="Add a description for the promotion on the carousel"
            />

            <Button
              isLoading={isSubmitting}
              type="submit"
              size="md"
              className="col-span-2 mt-6"
            >
              Add Product
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
