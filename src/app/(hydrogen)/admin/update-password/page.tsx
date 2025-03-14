import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import UpdatePassword from './profile';

export const metadata = {
  ...metaObject('User admin password'),
};

const pageHeader = {
  title: 'Update Password',
  breadcrumb: [
    {
      href: '/admin/update-password',
      name: 'Update admin password',
    },
  ],
};

export default async function UserProfile() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      <UpdatePassword />
    </>
  );
}
