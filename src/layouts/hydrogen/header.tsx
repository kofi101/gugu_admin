'use client';

import Link from 'next/link';
import HamburgerButton from '@/layouts/hamburger-button';
import Sidebar from '@/layouts/hydrogen/sidebar';
import Logo from '@/components/logo';
import StickyHeader from '@/layouts/sticky-header';
import { MdLogout } from 'react-icons/md';
import { Button } from 'rizzui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  merchantMenuItems,
  adminMenuItems,
} from '@/layouts/hydrogen/menu-items';

export function MerchantHeader() {
  const [loading, setLoading] = useState<boolean>();

  const router = useRouter();
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await fetch('/auth/logout/api');

      router.replace('/auth/sign-in', {
        scroll: true,
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error logging out', err);
    }
  };

  return (
    <StickyHeader className="lg:justify-between 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton
          view={
            <Sidebar
              routes={merchantMenuItems}
              className="static w-full 2xl:w-full"
            />
          }
        />
        <Link
          href={'/'}
          aria-label="Site Logo"
          className="me-4 w-9 shrink-0 text-gray-800 hover:text-gray-900 lg:me-5 xl:hidden"
        >
          <Logo iconOnly={true} />
        </Link>
      </div>
      <Button
        isLoading={loading}
        variant="text"
        onClick={handleSignOut}
        aria-label="Logout"
        className="me-4 flex items-center gap-2 text-gray-800 underline underline-offset-2 hover:text-gray-900 lg:me-5 lg:mr-4"
      >
        <p>Logout</p>
        <MdLogout size={20} />
      </Button>
    </StickyHeader>
  );
}
export function AdminHeader() {
  const [loading, setLoading] = useState<boolean>();

  const router = useRouter();
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await fetch('/auth/logout/api');

      router.replace('/auth/sign-in', {
        scroll: true,
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error logging out', err);
    }
  };

  return (
    <StickyHeader className="lg:justify-between 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton
          view={
            <Sidebar
              routes={adminMenuItems}
              className="static w-full 2xl:w-full"
            />
          }
        />
        <Link
          href={'/'}
          aria-label="Site Logo"
          className="me-4 w-9 shrink-0 text-gray-800 hover:text-gray-900 lg:me-5 xl:hidden"
        >
          <Logo iconOnly={true} />
        </Link>
      </div>
      <Button
        isLoading={loading}
        variant="text"
        onClick={handleSignOut}
        aria-label="Logout"
        className="me-4 flex items-center gap-2 text-gray-800 underline underline-offset-2 hover:text-gray-900 lg:me-5 lg:mr-4"
      >
        <p>Logout</p>
        <MdLogout size={20} />
      </Button>
    </StickyHeader>
  );
}
