'use client';

import { useState, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { auth } from '@/config/firebase';
import { Password } from '@/components/ui/password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { FileInput } from '@/components/ui/file-input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SignUpSchema, signUpSchema } from '@/utils/validators/signup.schema';
import { baseUrl, managementUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthState } from 'react-firebase-hooks/auth';

const initialValues = {
  businessName: '',
  businessPhone: '',
  email: '',
  password: '',
  category: '',
  address: '',
  file: '',
  confirmPassword: '',
  isAgreed: false,
};

export default function UpdateProfileComponent({ userDetails }) {
  const [files, setFiles] = useState<File>();
  const [category, setCategory] = useState('');
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessCategory, setBusinessCategory] = useState([]);

  const [user] = useAuthState(auth);

  const {
    setError,
    setValue,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: initialValues,
  });

  const documentFileExtensions = [
    'doc',
    'docx',
    'pdf',
    'txt',
    'rtf',
    'odt',
    'ppt',
    'pptx',
    'xls',
    'xlsx',
  ];

  const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
    try {
      if (!files) {
        setFileError(
          'Please attach business document(doc,docx,pdf,txt,ppt,xls,)'
        );
        return;
      }
      if (!data.category) {
        setError('category', {
          type: 'manual',
          message: 'Select business category',
        });
        return;
      }

      setLoading(true);

      const fileForm = new FormData();
      fileForm.append('files', files);
      const fileUploadRes = await fetch(
        `${baseUrl}/FilesManager/UploadFileDocuments`,
        {
          method: 'POST',
          body: fileForm,
        }
      );

      if (!fileUploadRes.ok) {
        throw new Error('Failed to upload business document.');
      }

      const fileUpload = await fileUploadRes.json();

      const userBody = {
        userType: 'Merchant',
        id: user?.uid,
        fullName: data.businessName,
        phoneNumber: data.businessPhone,
        email: data.email,
        address: data.address,
        shipping_BillingAddress: data.address,
        businessCategoryId: data.category,
        businessDocument: fileUpload?.path,
        firebaseId: user?.uid,
        modifiedBy: user?.uid,
        registrationDate: new Date(Date.now()).toISOString(),
      };

      const dbUserRes = await fetch(`${baseUrl}/User/UpdateUserDetails`, {
        method: 'PUT',
        body: JSON.stringify(userBody),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!dbUserRes.ok) {
        throw new Error('Failed to update account');
      }

      reset();

      toast.success(<Text>Account updated successfully</Text>);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error(<Text>Something went wrong updating your account</Text>);
    }
  };

  const isFileTypeAllowed = (
    fileName: string,
    allowedExtensions: Array<string>
  ): boolean => {
    const fileExtension =
      fileName && fileName.split('.')[1]?.toLocaleLowerCase();

    return !!fileExtension && allowedExtensions.includes(fileExtension);
  };

  function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFile = (event?.target as HTMLInputElement)?.files[0];
    if (!isFileTypeAllowed(uploadedFile?.name, documentFileExtensions)) {
      return setFileError(
        'Please select a document format(doc,docx,pdf,txt,ppt)'
      );
    }

    setFiles(uploadedFile);
    setFileError('');
  }

  const handleCategory = (event: { label: string; value: string }) => {
    setCategory(event.value);
    setValue('category', event.value.toString());
  };

  async function getBusinessCategory() {
    const res = await fetch(`${managementUrl}/BusinessCategories`);
    const categoryData = await res.json();
    setBusinessCategory(categoryData);
  }

  const catOptions = businessCategory?.map((item) => ({
    value: item?.businessCategoryId,
    label: item?.businessCategory,
  }));

  useEffect(() => {
    getBusinessCategory();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl">
      <div className="grid w-full gap-x-6 gap-y-5 md:grid-cols-2">
        {/* Business Name */}
        <Input
          type="text"
          size="lg"
          label="Business Name"
          placeholder="Enter your business name"
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
          {...register('businessName')}
          error={errors.businessName?.message}
        />

        {/* Business Phone */}
        <Input
          type="number"
          size="lg"
          label="Business Phone Number"
          placeholder="Enter your phone number"
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
          {...register('businessPhone')}
          error={errors.businessPhone?.message}
        />

        {/* Business Category (Full Width) */}
        <Select
          size="lg"
          placeholder="Choose business category"
          label="Select Business Category"
          className="col-span-2 [&>label>span]:font-medium"
          options={catOptions}
          onChange={handleCategory}
          value={category}
          displayValue={(selected) =>
            catOptions.find((item) => item.value === selected)?.label || ''
          }
          error={errors?.category?.message as string}
        />

        {/* Address (Full Width) */}
        <Textarea
          size="lg"
          label="Business Address"
          className="col-span-2 [&>label>span]:font-medium"
          placeholder="Enter business address"
          {...register('address')}
          error={errors.address?.message}
        />

        {/* Business Document (Full Width) */}
        <FileInput
          label="Proof of business document (doc, pdf, txt, ppt)"
          placeholder="Upload Business Document"
          className="col-span-2"
          error={fileError}
          onChange={(event) => handleFileSelection(event)}
        />

        {/* Submit Button (Full Width) */}

        <Button
          disabled={!!fileError}
          isLoading={loading}
          size="lg"
          type="submit"
          className="col-span-2 mt-4 w-fit"
        >
          <span>Update Account Details</span>
        </Button>
      </div>
    </form>
  );
}
