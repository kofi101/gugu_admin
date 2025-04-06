'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductType {
  productCatgoryId: number;
  availability: string;
  status: string;
  rejectReasons: string | null;
  isDeleted: string;
  productId: number;
  productCategory: string;
  productSubCategory: string;
  brand: string;
  productCode: string;
  productName: string;
  productDescription: string;
  size: string | null;
  colour: string;
  material: string;
  quantity: number;
  productImages: string[];
  salesPrice: number;
  promotionPrice: number;
  discountPercentage: number;
  discountPrice: number;
  isFeature: string;
  isPromotion: string;
  isDiscount: string;
}

const RenderProductDetails = ({ product }: { product: ProductType }) => {
  const validImages = product.productImages.filter((img) => img !== '');
  const [selectedImage, setSelectedImage] = useState(validImages[0] || '');

  return (
    <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-8 md:grid-cols-2">
      {/* Image Carousel */}
      <div>
        <div className="relative mb-4 h-[500px] w-full overflow-hidden rounded-md border border-gray-200">
          <Image
            src={selectedImage}
            fill
            sizes="500px"
            alt={product.productName}
            className="object-cover"
          />
        </div>

        <div className="scrollbar-hide flex gap-4 overflow-x-auto">
          {validImages.map((image, index) => (
            <button
              key={index}
              className={`relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-md border ${
                selectedImage === image ? 'border-blue-500' : 'border-gray-200'
              }`}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image}
                fill
                sizes="100px"
                alt={`${product.productName} ${index}`}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.productName}</h1>
          <p className="text-sm text-gray-500">
            {product.productCategory} / {product.productSubCategory}
          </p>
        </div>

        <div className="flex flex-col space-y-2 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              Promotion Price:
            </span>
            <span className="text-2xl font-bold text-red-500">
              GHC {product.promotionPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              Sales Price:
            </span>
            <span className="text-xl font-bold text-gray-800">
              GHC {product.salesPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Discount:</span>
            <span className="text-sm text-green-600">
              -{product.discountPercentage}%
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-gray-700">{product.productDescription}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Specifications</h2>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Brand:</strong> {product.brand}
              </p>
              <p>
                <strong>Code:</strong> {product.productCode}
              </p>
              <p>
                <strong>Color:</strong> {product.colour}
              </p>
              <p>
                <strong>Material:</strong> {product.material}
              </p>
              <p>
                <strong>Quantity Available:</strong> {product.quantity}
              </p>
            </div>
            <div>
              <p>
                <strong>Availability:</strong> {product.availability}
              </p>
              <p>
                <strong>Status:</strong> {product.status}
              </p>
              <p>
                <strong>Discount:</strong>{' '}
                {product.isDiscount === 'Yes'
                  ? `${product.discountPercentage}% Off`
                  : 'No Discount'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderProductDetails;
