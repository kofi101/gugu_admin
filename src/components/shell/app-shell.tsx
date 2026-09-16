'use client';

import { LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Wordmark } from '@/components/brand';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';

export type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

function isActive(pathname: string, item: NavItem) {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return item.exact ? path === item.href : path.startsWith(item.href);
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium transition-colors duration-150 focus-visible:outline-white',
                active
                  ? 'bg-white font-semibold text-brand-900 shadow-[0_1px_2px_rgb(0_0_0/0.2)]'
                  : 'text-brand-100 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className={cn('size-[1.125rem] shrink-0', active ? 'text-brand-700' : 'text-brand-300')} aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({ area, items, onNavigate }: { area: string; items: NavItem[]; onNavigate?: () => void }) {
  const { session, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const email = session.status === 'signed-in' ? session.user.email : null;
  return (
    <div className="flex h-full flex-col">
      <div aria-hidden className="woven h-2 shrink-0" />
      <div className="px-5 pt-5 pb-6">
        <Wordmark area={area} inverse />
      </div>
      <nav aria-label={`${area} navigation`} className="flex-1 overflow-y-auto px-3">
        <NavList items={items} onNavigate={onNavigate} />
      </nav>
      <div className="border-t border-white/10 px-3 py-3">
        {email ? (
          <p className="truncate px-3 pb-2 text-sm text-brand-200" title={email}>
            {email}
          </p>
        ) : null}
        <button
          type="button"
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true);
            await signOut();
          }}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium text-brand-100 hover:bg-white/10 hover:text-white focus-visible:outline-white disabled:opacity-60"
        >
          <LogOut className="size-[1.125rem] text-brand-300" aria-hidden />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}

export function AppShell({ area, items, children }: { area: string; items: NavItem[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Close the drawer when the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 64rem)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-4 py-2 font-semibold text-brand-800 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh bg-brand-900 lg:block">
        <SidebarBody area={area} items={items} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-brand-950 bg-brand-900 px-2 text-white lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(true)}
          className="grid size-11 place-items-center rounded-lg hover:bg-white/10 focus-visible:outline-white"
        >
          <Menu className="size-6" aria-hidden />
          <span className="sr-only">Open menu</span>
        </button>
        <Link href={items[0]?.href ?? '/'} className="mr-auto rounded focus-visible:outline-white">
          <Wordmark inverse />
        </Link>
      </header>

      <dialog
        id="mobile-nav"
        ref={drawerRef}
        aria-label={`${area} menu`}
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="m-0 h-dvh max-h-dvh w-[min(20rem,85vw)] max-w-none bg-brand-900 p-0 text-white lg:hidden"
      >
        {open ? (
          <div className="relative h-full">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-2 z-10 grid size-11 place-items-center rounded-lg text-brand-100 hover:bg-white/10 focus-visible:outline-white"
            >
              <X className="size-6" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
            <SidebarBody key={pathname} area={area} items={items} onNavigate={() => setOpen(false)} />
          </div>
        ) : null}
      </dialog>

      <main id="main" tabIndex={-1} className="min-w-0 px-4 py-6 focus:outline-none sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
