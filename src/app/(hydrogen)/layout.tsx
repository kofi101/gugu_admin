// 'use client';

import HydrogenLayout from '@/layouts/hydrogen/layout';

import { useIsMounted } from '@/hooks/use-is-mounted';

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const isMounted = useIsMounted();

  // if (!isMounted) {
  //   return null;
  // }

  return <HydrogenLayout>{children}</HydrogenLayout>;
}
