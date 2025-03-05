'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchUtil } from '@/utils/fetch';
import { managementUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { EditCarousel } from './edit-carousel';

interface Promotion {
  carouselBannerId: number;
  productId: number;
  productName: string;
  promotionDescription: string;
  image: string;
}

export const PromotionCard: React.FC<{ promotion: Promotion }> = ({
  promotion,
}) => {
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
    <div className="overflow-hidden rounded-lg border bg-white p-4 shadow-lg">
      <div className="relative aspect-video h-36">
        <Image
          src={promotion.image}
          alt={promotion.productName}
          fill
          className="h-full w-full rounded-lg object-contain"
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
    <>
      <h6>Existing carousels</h6>
      <div className="grid max-h-96 w-full gap-8 overflow-auto py-4 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promotion) => (
          <PromotionCard
            key={promotion.carouselBannerId}
            promotion={promotion}
          />
        ))}
      </div>
    </>
  );
};
