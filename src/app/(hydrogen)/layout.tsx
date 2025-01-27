import HydrogenLayout from '@/layouts/hydrogen/layout';

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HydrogenLayout>{children}</HydrogenLayout>;
}
