import HydrogenLayout from '@/layouts/hydrogen/layout';
import { adminMenuItems } from '@/layouts/hydrogen/menu-items';
export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HydrogenLayout routes={adminMenuItems}>{children}</HydrogenLayout>;
}
