'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import {
  useCreateUserWithEmailAndPassword,
  useSendEmailVerification,
} from 'react-firebase-hooks/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'next/navigation';

import { Password } from '@/components/ui/password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { FileInput } from '@/components/ui/file-input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { routes } from '@/config/routes';
import { SignUpSchema, signUpSchema } from '@/utils/validators/signup.schema';
import { baseUrl, managementUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';

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

export default function SignUpForm() {
  const [files, setFiles] = useState<File>();
  const [category, setCategory] = useState('');
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessCategory, setBusinessCategory] = useState([]);

  const router = useRouter();
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
  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  const [sendEmailVerification] = useSendEmailVerification(auth);

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

      const firebaseUser = await createUserWithEmailAndPassword(
        data.email,
        data.password
      );

      if (!firebaseUser?.user) {
        toast.error('Failed to create user account');
        throw new Error('User creation failed.');
      }

      await sendEmailVerification();

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
        id: firebaseUser.user.uid,
        fullName: data.businessName,
        phoneNumber: data.businessPhone,
        email: data.email,
        address: data.address,
        shipping_BillingAddress: data.address,
        businessCategoryId: data.category,
        businessDocument: fileUpload?.path,
        firebaseId: firebaseUser.user.uid,
        createdBy: firebaseUser.user.uid,
        registrationDate: new Date(Date.now()).toISOString(),
      };

      const dbUserRes = await fetch(`${baseUrl}/User/AddUserDetails`, {
        method: 'POST',
        body: JSON.stringify(userBody),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!dbUserRes.ok) {
        throw new Error('Failed to create merchant account');
      }

      reset();

      toast.success(
        <Text>
          Verification email sent. Please check your inbox and verify.
          <br />
          We will receive your request and will respond soon.
          <br />
          Best Regards, GUGU Team
        </Text>
      );

      setLoading(false);
      router.push('/auth/confirmation');
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error(<Text>Something went wrong creating your account</Text>);
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
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-x-4 gap-y-5 md:grid md:grid-cols-2 lg:gap-5">
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
          <Input
            type="email"
            size="lg"
            label="Business Email"
            className="col-span-2 [&>label>span]:font-medium"
            inputClassName="text-sm"
            placeholder="Enter your business email"
            {...register('email')}
            error={errors.email?.message}
          />

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

          <Textarea
            size="lg"
            label="Business Address"
            className="col-span-2 [&>label>span]:font-medium"
            placeholder="Enter business address"
            {...register('address')}
            error={errors.address?.message}
          />
          <Password
            label="Password"
            placeholder="Enter your password"
            size="lg"
            className="[&>label>span]:font-medium"
            inputClassName="text-sm"
            {...register('password')}
            error={errors.password?.message}
          />
          <Password
            label="Confirm Password"
            placeholder="Enter confirm password"
            size="lg"
            className="[&>label>span]:font-medium"
            inputClassName="text-sm"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <FileInput
            label="Proof of business document(doc,docx,pdf,txt,ppt)"
            placeholder="Proof of Business Document"
            className="col-span-2"
            error={fileError}
            onChange={(event) => handleFileSelection(event)}
          />

          <Button
            disabled={!!fileError}
            isLoading={loading}
            size="lg"
            type="submit"
            className="col-span-2 mt-2"
          >
            <span>Get Started</span>{' '}
            <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
          </Button>
        </div>
      </form>
      <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        Already have an account?{' '}
        <Link
          href={routes.auth.signIn}
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Sign In
        </Link>
      </Text>
    </>
  );
}
