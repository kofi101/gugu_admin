import { metaObject } from '@/config/site.config';
import { ProductList } from './all-products';
import PageHeader from '@/app/shared/page-header';

export const metadata = {
  ...metaObject('Products'),
};

const pageHeader = {
  title: 'Product List',
  breadcrumb: [
    {
      href: '/admin/products',
      name: 'All products ',
    },
  ],
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      <ProductList />
    </>
  );
}
