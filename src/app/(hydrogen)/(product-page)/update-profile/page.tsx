import { cookies } from 'next/headers';
import { baseUrl, managementUrl } from '@/config/base-url';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import UpdateProfileConfig from './config';

export const metadata = {
  ...metaObject('Accounts Management'),
};

const pageHeader = {
  title: 'Update Account',
  breadcrumb: [
    {
      href: '/update-profile',
      name: 'Update store profile',
    },
  ],
};

export default async function UpdateProfile() {
  const token = cookies()?.get('token')?.value;
  const userId = cookies()?.get('userId')?.value;

  let userDetails;

  let businessCategories;

  try {
    if (!token || !userId) {
      throw new Error('Unauthorized: Missing token or userId.');
    }

    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const categoryRes = await fetch(`${managementUrl}/BusinessCategories`);

    businessCategories = await categoryRes.json();

    userDetails = await fetch(
      `${baseUrl}/User/GetUserDetails/${userId}`,
      fetchOptions
    ).then((res) => res.json());
  } catch (error) {
    console.error('Error while fetching dashboard data', error);
  }

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <UpdateProfileConfig
        userDetails={userDetails}
        businessCategories={businessCategories}
      />
    </>
  );
}
