import { CustomerReviews } from './review';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';

export const metadata = {
  ...metaObject('Reviews'),
};

const pageHeader = {
  title: 'Customer Reviews',
  breadcrumb: [
    {
      href: '/admin/reviews',
      name: 'Customer reviews',
    },
  ],
};

export default function CustomerReviewsPage() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      <CustomerReviews />
    </>
  );
}
