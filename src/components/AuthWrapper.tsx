'use client';

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebase';
import { routes } from '@/config/routes';
// import SignIn from '@/app/signin/page';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isUserValid, setIsUserValid] = useState(false);
  const router = useRouter();
  //   const [user, error] = useAuthState(auth);

  useEffect(() => {
    const checkAuth = () => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setIsUserValid(true);
          console.log('This is the logged in user', user);
        } else {
          console.log('no user found');
          return router.push(`${routes.auth.signIn}`);
        }
      });
    };
    checkAuth();
  }, []);

  //   if (error) {
  //     return router.push(`${routes.auth.signIn}`);
  //   }

  //   if (user) {
  //     return <>{children}</>;
  //   }

  //   return <>{children}</>;
  if (isUserValid) {
    return <>{children}</>;
  }
  return <>{children}</>;
};
