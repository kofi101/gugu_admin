
import { metaObject } from '@/config/site.config';
import CouponPage from './coupon';

export const metadata = {
  ...metaObject('Coupons'),
};

export default function File() {
  return <CouponPage />;
}