'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import cn from '@/utils/class-names';
import { Text } from '@/components/ui/text';
import ProductSummary from '@/app/shared/ecommerce/product/create-edit/product-summary';
import ProductMedia from '@/app/shared/ecommerce/product/create-edit/product-media';
import { FormPromotion } from '@/app/shared/ecommerce/product/create-edit/product-promotion';
import ProductTaxonomies from '@/app/shared/ecommerce/product/create-edit/product-tags';
import FormFooter from '@/components/form-footer';
import { Button } from '@/components/ui/button';
import {
  CreateProductInput,
  productFormSchema,
} from '@/utils/validators/create-product.schema';
import { fileUrl, merchantUrl } from '@/config/base-url';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { MdDeleteOutline } from 'react-icons/md';
import { SpinnerLoader } from '@/components/ui/spinner';
import { getUserToken } from '@/utils/get-token';

interface IndexProps {
  // slug?: string;
  className?: string;
  singleProduct?: Array<CreateProductInput>;
}

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

export default function CreateEditProduct({ slug, className }: IndexProps) {
  const [isLoading, setLoading] = useState(false);
  const [filesData, setFileData] = useState<Array<Array<File>>>([]);
  const [variantData, setVariantData] = useState([1]);
  const [fileErrorMsg, setFileErrorMsg] = useState('');

  const [user] = useAuthState(auth);


  const methods = useForm<CreateProductInput>({
    resolver: zodResolver(productFormSchema),
  });

  const handleAddVariant = () => {
    setVariantData((prev) => [1, ...prev]);
  };

  const handleDeleteVariant = (index: number) => {
    const variants = [...variantData];

    if (variants.length > 1) {
      variants.splice(index, 1);
      setVariantData(variants);
    }
  };

  const productType = methods.watch('productType');

  useEffect(() => {
    if (productType === 'Single') {
      setVariantData([1]);
    }
  }, [productType]);

  const onSubmit: SubmitHandler<CreateProductInput> = async (data) => {
    let fileError = null;

    // Check if any files are added
    if (filesData.length === 0) {
      fileError = 'Please add product images';
      setFileErrorMsg(fileError);
    } else {
      // If files are added, validate each variant's images
      variantData.forEach((_variant, index) => {
        // Check if the variant has associated images
        if (!filesData[index]) {
          fileError = 'Add images to all product variants';
        } else if (filesData[index].length < 3) {
          // Ensure each variant has at least 3 images
          fileError = 'Please select at least 3 product images';
        }
      });

      setFileErrorMsg(fileError);
    }

    if (fileError) {
      return;
    }

    setFileErrorMsg(null);

    setLoading(true);

    const variantUpload = await Promise.all(
      variantData.map(async (_item, index) => {
        const uploadFiles = await Promise.allSettled(
          filesData[index]?.map((file) => sendFiles(file))
        );
        const variantBody = {};
        variantBody.sizeId = Number(data.size[index]);
        variantBody.colourId = Number(data.color[index]);
        variantBody.materialId = Number(data.material[index]);
        variantBody.productDescription = data?.description[index];
        variantBody.quantity = data.quantity[index];
        variantBody.salesPrice = data.price[index];
        variantBody.weight = data.weight[index];

        variantBody.productImages = fileDataMapper(uploadFiles);

        return variantBody;
      })
    );

    const formBody = {
      productType: data.productType,
      productCategoryId: Number(data.category),
      productSubCategoryId: Number(data.subCategory),
      brandId: Number(data.brand),
      productCode: data.productCode,
      productName: data.productName,
      productDetails: variantUpload,
      isFeature: data.featured ? 1 : 0,
      isPromotion: data.promotion ? 1 : 0,
      promotionPrice: data.promotionPrice,
      isDiscount: data.discount ? 1 : 0,
      discountPercentage: data.discountPercentage,
      createdBy: user?.uid,
    };

    try {
      const token = await getUserToken();

      const res = await fetch(`${merchantUrl}/AddProduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(formBody),
      });

      if (!res.ok) {
        setLoading(false);
        return toast.error(
          <Text as="b">Something went wrong, please try again</Text>
        );
      }

      methods.reset();

      setFileData([]);

      toast.success(<Text as="b">Product successfully created</Text>);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(<Text as="b">Failed to create product</Text>);
      throw err;
    }
  };

  return (
    <div className="@container">
      <hr />

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={cn('[&_label.block>span]:font-medium', className)}
        >
          <div className="relative mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            <LoaderBackdrop isLoading={isLoading} />

    
              <ProductSummary className="pt-7 @2xl:pt-9 @3xl:pt-11" />
              {productType === 'Variant' && (
                <div className="flex items-center gap-10">
                  <Button
                    onClick={handleAddVariant}
                    type="button"
                    className="w-fit px-4"
                  >
                    Add variants
                  </Button>
                  <p className="font-semibold">
                    {variantData.length} variants added
                  </p>
                </div>
              )}
              <div className="h-[44rem] overflow-y-auto p-8">
                {variantData.map((_item, index) => (
                  <div
                    key={`${index}-item`}
                    className={`${
                      productType === 'Variant'
                        ? 'relative my-16 rounded-md border-2 border-gray-300 bg-gray-50 p-16'
                        : ''
                    }`}
                  >
                    {productType === 'Variant' && (
                      <button
                        onClick={() => handleDeleteVariant(index)}
                        className="absolute right-4 top-4"
                        type="button"
                      >
                        <MdDeleteOutline size="28" className="text-red-500" />
                      </button>
                    )}
                    <ProductTaxonomies
                      className="pt-7 @2xl:pt-9 @3xl:pt-11"
                      index={index}
                    />
                    <ProductMedia
                      index={index}
                      setFileData={setFileData}
                      filesData={filesData}
                      className="pt-7 @2xl:pt-9 @3xl:pt-11"
                    />
                  </div>
                ))}

                {fileErrorMsg && (
                  <span className="text-red-500">{fileErrorMsg}</span>
                )}
              </div>
              <FormPromotion className="pt-7 @2xl:pt-9 @3xl:pt-11" />
    
          </div>

          <FormFooter
            isLoading={isLoading}
            submitBtnText={slug ? 'Update Product' : 'Create Product'}
          />
        </form>
      </FormProvider>
    </div>
  );
}

const fileDataMapper = (fileData: PromiseSettledResult<unknown>[]) => {
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
    const path = item?.value?.path;
    switch (index) {
      case 0:
        result[0].imageOne = path;
        break;
      case 1:
        result[0].imageTwo = path;
        break;
      case 2:
        result[0].imageThree = path;
        break;
      case 3:
        result[0].imageFour = path;
        break;
      case 4:
        result[0].imageFive = path;
        break;
      case 5:
        result[0].imageSix = path;
        break;
      case 6:
        result[0].imageSeven = path;
        break;
      case 7:
        result[0].imageEight = path;
        break;
      case 8:
        result[0].imageNine = path;
        break;
      case 9:
        result[0].imageTen = path;
        break;
      default:
        break;
    }
  });

  return result;
};

export const FormLoader = () => (
  <div className="absolute right-0 top-0 z-50 h-full w-full backdrop-blur-sm"></div>
);

const LoaderBackdrop = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm">
      <SpinnerLoader className="h-12 w-12 text-white" />
    </div>
  );
};
