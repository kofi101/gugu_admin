import HydrogenLayout from '@/layouts/hydrogen/layout';
import { merchantMenuItems } from '@/layouts/hydrogen/menu-items';
export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HydrogenLayout routes={merchantMenuItems}>{children}</HydrogenLayout>;
}
