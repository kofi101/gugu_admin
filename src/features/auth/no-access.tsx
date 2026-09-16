'use client';

import { LogOut, RefreshCw, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Wordmark } from '@/components/brand';
import { Button, ButtonLink, buttonClass } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { describeError } from '@/lib/errors';
import { homeForRole } from './home-for-role';

const sellUrl = process.env.NEXT_PUBLIC_SELL_ON_GUGU_URL;

export function NoAccess({ reason = 'customer' }: { reason?: 'customer' | 'staff-only' }) {
  const { session, signOut, refreshClaims } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const email = session.status === 'signed-in' ? session.user.email : null;
  const role = session.status === 'signed-in' ? session.role : null;

  const recheck = async () => {
    setChecking(true);
    try {
      await refreshClaims();
      const user = session.status === 'signed-in' ? session.user : null;
      const token = await user?.getIdTokenResult();
      const newRole = token?.claims.role;
      if ((newRole === 'merchant' && token?.claims.merchantId) || newRole === 'admin') {
        toast.success('Access updated.');
        router.replace(homeForRole(newRole));
      } else {
        toast('No seller access on this account yet.');
      }
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-ground">
      <div aria-hidden className="woven h-2" />
      <div className="px-4 pt-6 sm:px-8">
        <Wordmark area="Seller dashboard" />
      </div>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-lg rounded-[var(--radius-panel)] border border-line bg-surface p-6 shadow-[var(--shadow-panel)] sm:p-8">
          <Store className="size-7 text-brand-700" aria-hidden />
          {reason === 'staff-only' ? (
            <>
              <h1 className="mt-4 text-2xl font-bold tracking-[-0.02em]">This area is for GUGU staff</h1>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">
                Your account can manage a store but not the marketplace admin tools.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {role ? <ButtonLink href={homeForRole(role)}>Go to your dashboard</ButtonLink> : null}
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-2xl font-bold tracking-[-0.02em]">This account cannot sell on GUGU yet</h1>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">
                {email ? (
                  <>
                    You are signed in as <strong className="font-semibold break-all text-ink">{email}</strong>, a shopper
                    account.{' '}
                  </>
                ) : null}
                To list products, submit a Sell on GUGU application on the GUGU storefront. Once it is approved, come
                back here and check your access.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {sellUrl ? (
                  <a href={sellUrl} className={buttonClass()}>
                    Apply to sell on GUGU
                  </a>
                ) : null}
                <Button
                  variant={sellUrl ? 'secondary' : 'primary'}
                  icon={<RefreshCw aria-hidden />}
                  loading={checking}
                  onClick={recheck}
                >
                  I was approved, check again
                </Button>
              </div>
            </>
          )}
          <div className="mt-6 border-t border-line pt-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut aria-hidden />}
              loading={signingOut}
              onClick={async () => {
                setSigningOut(true);
                await signOut();
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
