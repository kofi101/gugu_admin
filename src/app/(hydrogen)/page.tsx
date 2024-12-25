import React from 'react';

import MerchantAnalytics from '@/app/shared/analytics-dashboard/merchant-analytics';

import Image from 'next/image';
import WelcomeBanner from '@/components/banners/welcome';

import welcomeImg from '@public/landing.png';
import HandWaveIcon from '@/components/icons/hand-wave';

export default function HomePageComponent() {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8">
        <WelcomeBanner
          title={
            <>
              {greetUser()}
              <br />
              <HandWaveIcon className="inline-flex h-8 w-8" />
            </>
          }
          description={'Here’s What happening on your store today.'}
          media={
            <div className="absolute -bottom-6 end-4 hidden w-[300px] @2xl:block lg:w-[320px] 2xl:-bottom-7 2xl:w-[330px]">
              <div className="relative">
                {/* <Image
                  src={welcomeImg}
                  alt="Welcome shop image "
                  // fill
                  width={500}
                  height={200}
                  className="object-cover dark:brightness-95 dark:drop-shadow-md"
                /> */}
              </div>
            </div>
          }
          contentClassName="@2xl:max-w-[calc(100%-340px)]"
          className="border border-muted bg-gray-0 pb-8 @4xl:col-span-2 @7xl:col-span-8 lg:h-72 lg:pb-9 dark:bg-gray-100/30"
        ></WelcomeBanner>
      </div>

      <div className="mt-16">
        <MerchantAnalytics />
      </div>
    </div>
  );
}

function greetUser() {
  const now = new Date();
  const hours = now.getHours();

  if (hours < 12) {
    return 'Good morning!';
  } else if (hours < 18) {
    return 'Good afternoon!';
  } else {
    return 'Good evening!';
  }
}
