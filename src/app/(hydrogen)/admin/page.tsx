import React from 'react';

import Image from 'next/image';
import WelcomeBanner from '@/components/banners/welcome';
// import AdminImage from '@public/admin.jpg';

export default function HomePageComponent() {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8">
        <WelcomeBanner
          title={'Admin Portal'}
          description={
            'Here’s What happening on your store today. See the statistics at once.'
          }
          media={
            <div className="end-4 hidden w-[300px] @2xl:block lg:w-[320px] 2xl:w-[330px]">
              <div className="relative">
                {/* <Image
                  src={AdminImage}
                  alt="Welcome shop image "
                  className="dark:brightness-95 dark:drop-shadow-md"
                /> */}
              </div>
            </div>
          }
          contentClassName="@2xl:max-w-[calc(100%-340px)]"
          className="border border-muted bg-gray-0 pb-8 @4xl:col-span-2 @7xl:col-span-8 lg:h-72 lg:pb-9 dark:bg-gray-100/30"
        ></WelcomeBanner>
      </div>
    </div>
  );
}
