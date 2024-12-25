import Image from 'next/image';
import SignInForm from './sign-in-form';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import UnderlineShape from '@/components/shape/underline';
import { metaObject } from '@/config/site.config';
import SiginImage from '@public/login-backgroud.jpg';

export const metadata = {
  ...metaObject('Sign In'),
};

export default function SignIn() {
  return (
    <AuthWrapperOne
      title={
        <>
          Welcome back! Please{' '}
          <span className="relative inline-block">
            Sign in to
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue md:w-28 xl:-bottom-1.5 xl:w-36" />
          </span>{' '}
          continue.
        </>
      }
      description="Welcome back! Sign in to access your dashboard, manage orders, and track sales effortlessly. Your one-stop destination for all things commerce."
      bannerTitle="The simplest way to manage your Shop."
      bannerDescription="Your gateway to success awaits! Access your account to oversee inventory, manage transactions, and unlock exclusive insights. Elevate your eCommerce experience with every login"
      // todo : fix google and apple sign in
      isSocialLoginActive={false}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={SiginImage}
            alt="Sign Up Thumbnail"
            fill
            priority
            sizes="(max-width: 768px) 100vw"
            className="object-cover"
          />
        </div>
      }
    >
      <SignInForm />
    </AuthWrapperOne>
  );
}
