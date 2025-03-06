import HydrogenLayout from '@/layouts/hydrogen/layout';
import { merchantMenuItems } from '@/layouts/hydrogen/menu-items';

export default async function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HydrogenLayout isMerchant routes={merchantMenuItems}>{children}</HydrogenLayout>;
}
