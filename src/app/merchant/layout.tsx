import { MerchantShell } from '@/features/merchant/merchant-shell';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return <MerchantShell>{children}</MerchantShell>;
}
