'use client';

import { FolderTree, Image as ImageIcon, LayoutGrid, PackageCheck, ReceiptText, UserCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppShell, type NavItem } from '@/components/shell/app-shell';
import { RoleGate } from '@/features/auth/role-gate';

const items: NavItem[] = [
  { href: '/admin/', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/admin/applications/', label: 'Seller applications', icon: UserCheck },
  { href: '/admin/products/', label: 'Product approvals', icon: PackageCheck },
  { href: '/admin/orders/', label: 'All orders', icon: ReceiptText },
  { href: '/admin/catalog/', label: 'Categories', icon: FolderTree },
  { href: '/admin/banners/', label: 'Banners', icon: ImageIcon },
  { href: '/admin/users/', label: 'Users and roles', icon: Users },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RoleGate role="admin">
      <AppShell area="GUGU staff" items={items}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
