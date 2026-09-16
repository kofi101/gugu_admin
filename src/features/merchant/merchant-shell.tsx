'use client';

import { LayoutGrid, Package, ReceiptText, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppShell, type NavItem } from '@/components/shell/app-shell';
import { RoleGate } from '@/features/auth/role-gate';

const items: NavItem[] = [
  { href: '/merchant/', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/merchant/products/', label: 'Products', icon: Package },
  { href: '/merchant/orders/', label: 'Orders', icon: ReceiptText },
  { href: '/merchant/store/', label: 'Store profile', icon: Store },
];

export function MerchantShell({ children }: { children: ReactNode }) {
  return (
    <RoleGate role="merchant">
      <AppShell area="Seller dashboard" items={items}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
