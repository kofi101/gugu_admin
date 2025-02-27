'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PiHouseLineBold } from 'react-icons/pi';
import { Title, Text } from '@/components/ui/text';

import GuguLogo from '@/components/icons/gugu-logo';

export default function NotFoundPage() {
  const { push } = useRouter();
  return (
    <div className="flex grow items-center px-6 xl:px-10">
      <div className="mx-auto text-center">
        <GuguLogo />
        <Title
          as="h1"
          className="text-[22px] font-bold leading-normal text-gray-1000 lg:text-3xl"
        >
          Sorry, the page not found
        </Title>
        <Text className="mt-3 text-sm leading-loose text-gray-500 lg:mt-6 lg:text-base lg:leading-loose">
          We have been spending long hours in order to launch our new website.
          Join our
          <br className="hidden sm:inline-block" />
          mailing list or follow us on Facebook for get latest update.
        </Text>
        <Button
          color="primary"
          size="xl"
          className="mt-8 h-12 px-4 xl:h-14 xl:px-6"
          onClick={() => push('/')}
        >
          <PiHouseLineBold className="mr-1.5 text-lg" />
          Back to home
        </Button>
      </div>
    </div>
  );
}
