import Image from 'next/image';
import UnderlineShape from '@/components/shape/underline';
import SignUpForm from './sign-up-form';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import { metaObject } from '@/config/site.config';
import SignUpImage from '@public/login-backgroud.jpg';

export const metadata = {
  ...metaObject('Sign Up'),
};

export default function SignUp() {
  return (
    <AuthWrapperOne
      title={
        <>
          Become a merchant today!
          <span className="relative inline-block">
            JOIN US
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-28 text-blue xl:-bottom-1.5 xl:w-36" />
          </span>
        </>
      }
      description="By signing up, you will gain access to exclusive content, special offers, and be the first to hear about exciting news and updates."
      bannerTitle="The platform to market and sell your product."
      bannerDescription="Amet minim mollit non deserunt ullamco est sit aliqua dolor do
      amet sint velit officia consequat duis."
      isSocialLoginActive={false}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={SignUpImage}
            alt="Sign Up Thumbnail"
            fill
            priority
            sizes="(max-width: 768px) 100vw"
            className="object-cover"
          />
        </div>
      }
    >
      <SignUpForm />
    </AuthWrapperOne>
  );
}
