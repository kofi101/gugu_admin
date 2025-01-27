'use client';

import Link from 'next/link';
import HamburgerButton from '@/layouts/hamburger-button';
import Sidebar from '@/layouts/hydrogen/sidebar';
import Logo from '@/components/logo';
import StickyHeader from '@/layouts/sticky-header';
import { MdLogout } from 'react-icons/md';
import { useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '@/config/firebase';

export default function Header() {
  const [signOut] = useSignOut(auth);

  const handleSignOut = () => {
    signOut();
    const cookies = document.cookie.split(';');
    cookies.forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };

  return (
    <StickyHeader className="lg:justify-between 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton
          view={<Sidebar className="static w-full 2xl:w-full" />}
        />
        <Link
          href={'/'}
          aria-label="Site Logo"
          className="me-4 w-9 shrink-0 text-gray-800 hover:text-gray-900 lg:me-5 xl:hidden"
        >
          <Logo iconOnly={true} />
        </Link>
      </div>
      <Link
        onClick={handleSignOut}
        href={'/auth/sign-in'}
        aria-label="Logout"
        className="me-4 flex items-center gap-2 text-gray-800 underline underline-offset-2 hover:text-gray-900 lg:me-5 lg:mr-4"
      >
        <p>Logout</p>
        <MdLogout size={20} />
      </Link>
    </StickyHeader>
  );
}
