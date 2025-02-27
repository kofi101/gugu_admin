'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Modal,
  ActionIcon,
  Popover,
  Textarea,
  Title,
  Input,
  Select,
} from 'rizzui';
import { MdOutlineClose } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { SpinnerLoader } from '@/components/ui/spinner';
import { fetchUtil } from '@/utils/fetch';
import { useForm } from 'react-hook-form';
import { managementUrl } from '@/config/base-url';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import { Unauthorized } from '../../(product-page)/products/configs/config';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IoMdClose } from 'react-icons/io';

interface Promotion {
  carouselBannerId: number;
  productId: number;
  productName: string;
  promotionDescription: string;
  image: string;
}

const PromotionCard: React.FC<{ promotion: Promotion }> = ({ promotion }) => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = await getUserToken();
      await fetchUtil(
        `${managementUrl}/DeleteCarouselBanner/${promotion.productId}`,
        {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          method: 'DELETE',
        }
      );

      setLoading(false);
      toast.success('Banner deleted successfully');
      router.refresh();
    } catch (error) {
      setLoading(false);
      console.error('Something went wrong while deleting banner');
    }
  };
  return (
    <div className="overflow-hidden rounded-lg bg-white p-4 shadow-lg">
      <div className="relative h-36 w-full">
        <Image
          src={promotion.image}
          alt={promotion.productName}
          fill
          className="h-full w-full rounded-lg object-cover"
        />
      </div>
      <div className="mt-4">
        <h3 className="truncate text-lg font-bold">{promotion.productName}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {promotion.promotionDescription}
        </p>
      </div>
      <div className="mt-4 flex justify-end gap-4">
        <EditCarousel
          productId={promotion.productId}
          productName={promotion.productName}
          image={promotion.image}
          carouselBannerId={promotion.carouselBannerId}
          promotionDescription={promotion.promotionDescription}
        />
        <Button
          size="sm"
          isLoading={loading}
          onClick={handleDelete}
          color="danger"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
export const PromotionsList: React.FC<{ promotions: Promotion[] }> = ({
  promotions,
}) => {
  return (
    <div className="grid max-h-96 w-full gap-8 overflow-auto py-4 md:grid-cols-2 lg:grid-cols-3">
      {promotions.map((promotion) => (
        <PromotionCard key={promotion.carouselBannerId} promotion={promotion} />
      ))}
    </div>
  );
};

export type Product = {
  productId: number;
  productCategory: string;
  productSubCategory: string;
  brand: string;
  productCode: string;
  productName: string;
  productDescription: string;
  size: string;
  colour: string;
  material: string;
  quantity: number;
  productImages: string[];
  salesPrice: number;
  promotionPrice: number;
  discountPercentage: number;
  isFeature: string;
  isPromotion: string;
  isDiscount: string;
  merchant: string;
  availability: string;
  status: string;
  rejectReasons: string;
  approvedBy: string;
  approvedOn: string;
  isDeleted: string;
};

export const Carousel = ({ approvedProducts, carouselData }) => {
  return (
    <section>
      <div className="flex flex-col md:flex-row md:justify-between mb-8">
        <h5 className="mb-4">Homepage carousels</h5>
        <AddCarousel approvedProducts={approvedProducts} />
      </div>
      <PromotionsList promotions={carouselData} />
    </section>
  );
};

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
        method: 'POST',
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
    } finally {
      setModalState(false);
    }
  };
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
export function AddCarousel({
  // productId,
  // productName,
  // image,
  // carouselBannerId,
  // promotionDescription,
  approvedProducts,
}) {
  const [modalState, setModalState] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    // defaultValues: {
    //   carouselBannerId,
    //   productId,
    //   productName,
    //   promotionDescription,
    //   image,
    // },
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
        body: JSON.stringify({
          ...data,
        }),
      };

      const response = await fetch(
        `${managementUrl}/AddCarouselBanner`,
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
          Add Product to Homepage Carousel
        </Button>
      </div>
      <Modal isOpen={modalState} onClose={() => setModalState(false)}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="m-auto px-7 pb-8 pt-6"
        >
          <div className="mb-7 flex items-center justify-between">
            <h5> Add carousel banner</h5>
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
                Add to Carousel
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
