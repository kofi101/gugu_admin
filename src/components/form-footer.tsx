import cn from '@/utils/class-names';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IoArrowBackSharp } from 'react-icons/io5';

interface FormFooterProps {
  className?: string;
  altBtnText?: string;
  submitBtnText?: string;
  isLoading?: boolean;
  handleAltBtn?: () => void;
}

export const negMargin = '-mx-4 md:-mx-5 lg:-mx-6 3xl:-mx-8 4xl:-mx-10';

export default function FormFooter({
  isLoading,
  altBtnText = 'Save as Draft',
  submitBtnText = 'Submit',
  className,
  handleAltBtn,
}: FormFooterProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 left-0 right-0 -mb-8 flex items-center justify-between gap-4 border-t bg-white px-4 py-4 md:px-5 lg:px-6 3xl:px-8 4xl:px-10 dark:bg-gray-50',
        className,
        negMargin
      )}
    >
      <Link href="/products" className="mr-4 flex items-center">
        <IoArrowBackSharp size="20" /> See all products
      </Link>
      <Button type="submit" isLoading={isLoading} className="w-full @xl:w-auto">
        {submitBtnText}
      </Button>
    </div>
  );
}
