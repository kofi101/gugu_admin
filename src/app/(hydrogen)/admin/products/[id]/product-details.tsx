import React from 'react';

import Image from 'next/image';
import { type Product } from '../all-products';
import AddToCarousel from './add-to-carousel';

export const ProductDetails = ({ product }: { product: Product }) => {
  return (
    <div className="w-full p-6">
      <div className="gap-4 md:flex md:justify-between md:gap-0">
        <h4 className="mb-6 text-lg font-bold">{product?.productName}</h4>
        <AddToCarousel
          productId={product.productId}
          productName={product.productName}
          image={product.productImages[0]}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 rounded-lg border p-4 md:p-6 md:grid-cols-3 mt-6">
        {/* Image Grid */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-6">
            {product?.productImages?.map(
              (image, index) =>
                image && (
                  <div
                    key={index}
                    className="relative h-64 w-full overflow-hidden rounded-md p-2 shadow-md"
                  >
                    <Image
                      src={image}
                      alt={`Product ${index + 1}`}
                      fill
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                )
            )}
          </div>
        </div>
        {/* Product Details */}
        <div className="space-y-4 md:border-l-2 md:p-4">
          <p>
            <strong>Category:</strong> {product?.productCategory}
          </p>
          <p>
            <strong>Subcategory:</strong> {product?.productSubCategory}
          </p>
          <p>
            <strong>Brand:</strong> {product?.brand}
          </p>
          <p>
            <strong>Code:</strong> {product?.productCode}
          </p>
          <p>
            <strong>Description:</strong> {product?.productDescription}
          </p>
          <p>
            <strong>Size:</strong> {product?.size}
          </p>
          <p>
            <strong>Colour:</strong> {product?.colour}
          </p>
          <p>
            <strong>Material:</strong> {product?.material}
          </p>
          <p>
            <strong>Quantity:</strong> {product?.quantity}
          </p>
          <p>
            <strong>Price:</strong> GHC{product?.salesPrice}
          </p>
          {product?.promotionPrice > 0 && (
            <p>
              <strong>Promotion Price:</strong> GHC{product?.promotionPrice}
            </p>
          )}
          <p>
            <strong>Availability:</strong> {product?.availability}
          </p>
          <p>
            <strong>Status:</strong> {product?.status}
          </p>
        </div>
      </div>
    </div>
  );
};
