'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import cn from '@/utils/class-names';
import { Text } from '@/components/ui/text';
import ProductSummary from '@/app/shared/ecommerce/product/create-edit/product-summary';
import ProductMedia from '@/app/shared/ecommerce/product/create-edit/product-media';
import { FormPromotion } from '@/app/shared/ecommerce/product/create-edit/product-promotion';
import ProductTaxonomies from '@/app/shared/ecommerce/product/create-edit/product-tags';
import FormFooter from '@/components/form-footer';
import { CreateProductInput } from '@/utils/validators/create-product.schema';
import { fileUrl, merchantUrl } from '@/config/base-url';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserToken } from '@/utils/get-token';
import { useRouter } from 'next/navigation';

interface IndexProps {
  className?: string;
  singleProduct?: Array<CreateProductInput>;
}

export interface FormBodyData {
  productId: number;
  productCategoryId: number;
  productSubCategoryId: number;
  brandId: number;
  productCode: string;
  productName: string;
  productDetails: ProductDetail[];
  isFeature: number;
  isPromotion: number;
  promotionPrice: number;
  isDiscount: number;
  discountPercentage: number;
  modifiedBy: string;
}

export interface ProductDetail {
  sizeId: number;
  colourId: number;
  materialId: number;
  productDescription?: string;
  quantity: number;
  salesPrice: number;
  weight: number;
  productImages: ProductImage[];
}

export interface ProductImage {
  imageOne: string;
  imageTwo: string;
  imageThree: string;
  imageFour: string;
  imageFive: string;
  imageSix: string;
  imageSeven: string;
  imageEight: string;
  imageNine: string;
  imageTen: string;
}

export default function EditProduct({ singleProduct, className }: IndexProps) {
  const [isLoading, setLoading] = useState(false);
  const [filesData, setFileData] = useState<Array<Array<File>>>([]);
  const [existingImages, setExistingImages] = useState<Array<string>>([]);

  const router = useRouter();

  const [user] = useAuthState(auth);

  const sendFiles = async (fileData: File) => {
    const formData = new FormData();
    formData.append('files', fileData);

    const res = await fetch(fileUrl, {
      method: 'POST',
      body: formData,
    });

    const file = await res.json();

    return file;
  };

  const methods = useForm();

  useEffect(() => {
    if (singleProduct && singleProduct.length > 0) {
      methods.reset({
        productName: singleProduct?.[0]?.productName,
        productCode: singleProduct?.[0]?.productCode,
        category: singleProduct?.[0]?.productCategoryId,
        brand: singleProduct?.[0]?.brandId,
        size: singleProduct?.[0]?.sizeId,
        color: singleProduct?.[0]?.colourId,
        material: singleProduct?.[0]?.materialId,
        subCategory: singleProduct?.[0]?.productSubCategoryId,
        description: singleProduct?.[0]?.productDescription,
        price: singleProduct?.[0]?.salesPrice,
        promotionPrice: singleProduct?.[0]?.promotionPrice,
        discountPercentage: singleProduct?.[0]?.discountPercentage,
        quantity: singleProduct?.[0]?.quantity,
        promotion: singleProduct?.[0]?.isPromotion === 'Yes' ? true : false,
        discount: singleProduct?.[0]?.isDiscount === 'Yes' ? true : false,
        featured: singleProduct?.[0]?.isFeature === 'Yes' ? true : false,
        weight: singleProduct?.[0]?.weight,
      });
    }
  }, [singleProduct]);

  useEffect(() => {
    setExistingImages(
      singleProduct?.[0]?.productImages?.filter((image: string) => image)
    );
  }, [singleProduct]);

  const onSubmit: SubmitHandler<CreateProductInput> = async (data) => {
    setLoading(true);

    const uploadFiles =
      filesData.length > 0 &&
      (await Promise.allSettled(filesData[0]?.map((file) => sendFiles(file))));

    const promiseFiles =
      uploadFiles && uploadFiles?.map((item) => item?.value?.path);

    const mappedFiles = fileDataMapper(
      existingImages.concat(promiseFiles || [])
    );

    const productDetails: Array<ProductDetail> = [
      {
        sizeId: Number(data.size),
        colourId: Number(data.color),
        materialId: Number(data.material),
        productDescription: data.description || '',
        quantity: Number(data.quantity),
        salesPrice: Number(data.price),
        weight: Number(data.weight),
        productImages: mappedFiles,
      },
    ];

    const formBody: FormBodyData = {
      productId: singleProduct?.[0]?.productId,
      productCategoryId: Number(data.category),
      productSubCategoryId: Number(data.subCategory),
      brandId: Number(data.brand),
      productCode: data.productCode,
      productName: data.productName,
      isFeature: data.featured ? 1 : 0,
      isPromotion: data.promotion ? 1 : 0,
      promotionPrice: Number(data.promotionPrice),
      isDiscount: data.discount ? 1 : 0,
      discountPercentage: Number(data.discountPercentage),
      modifiedBy: user?.uid || '',
      productDetails: productDetails,
    };

    try {
      const token = await getUserToken();
      const res = await fetch(`${merchantUrl}/ModifyProduct`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(formBody),
      });

      if (!res.ok) {
        setLoading(false);
        return toast.error(
          <Text as="b">Failed to update product, please try again</Text>
        );
      }

      methods.reset();

      setFileData([]);
      setExistingImages([]);
      router.refresh();
      toast.success(<Text as="b">Product successfully updated</Text>);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(<Text as="b">Failed to update product</Text>);
      throw err;
    }
    setLoading(false);
  };

  return (
    <div className="@container">
      <hr />

      {isLoading && <FormLoader />}

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={cn('[&_label.block>span]:font-medium', className)}
        >
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            <ProductSummary className="pt-7 @2xl:pt-9 @3xl:pt-11" editMode />

            <ProductTaxonomies
              className="pt-7 @2xl:pt-9 @3xl:pt-11"
              index={0}
              editMode
            />
            <ProductMedia
              index={0}
              setFileData={setFileData}
              filesData={filesData}
              className="pt-7 @2xl:pt-9 @3xl:pt-11"
              existingImages={existingImages}
              setExistingImages={setExistingImages}
            />

            <FormPromotion className="pt-7 @2xl:pt-9 @3xl:pt-11" />
          </div>

          <FormFooter isLoading={isLoading} submitBtnText={'Update Product'} />
        </form>
      </FormProvider>
    </div>
  );
}

const fileDataMapper = (fileData: Array<string>) => {
  const result = [
    {
      imageOne: '',
      imageTwo: '',
      imageThree: '',
      imageFour: '',
      imageFive: '',
      imageSix: '',
      imageSeven: '',
      imageEight: '',
      imageNine: '',
      imageTen: '',
    },
  ];

  fileData.forEach((item, index) => {
    switch (index) {
      case 0:
        result[0].imageOne = item;
        break;
      case 1:
        result[0].imageTwo = item;
        break;
      case 2:
        result[0].imageThree = item;
        break;
      case 3:
        result[0].imageFour = item;
        break;
      case 4:
        result[0].imageFive = item;
        break;
      case 5:
        result[0].imageSix = item;
        break;
      case 6:
        result[0].imageSeven = item;
        break;
      case 7:
        result[0].imageEight = item;
        break;
      case 8:
        result[0].imageNine = item;
        break;
      case 9:
        result[0].imageTen = item;
        break;
      default:
        break;
    }
  });

  return result;
};

export const FormLoader = () => (
  <div className="back absolute z-50 h-[200vh] w-[100vw] backdrop-blur-sm backdrop-opacity-70">
    {' '}
  </div>
);
