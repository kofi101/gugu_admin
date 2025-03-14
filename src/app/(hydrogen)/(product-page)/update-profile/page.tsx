import { cookies } from 'next/headers';
import { baseUrl } from '@/config/base-url';
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
  const token = cookies()?.get('token');
  const userId = cookies()?.get('userId');

  let userDetails;

  try {
    if (!token || !userId) {
      throw new Error('Unauthorized: Missing token or userId.');
    }

    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    userDetails = await fetch(
      `${baseUrl}/User/GetUserDetails/${userId}`,
      fetchOptions
    ).then((res) => res.json());

    console.log('user details', userDetails);
  } catch (error) {
    console.error('Error while fetching dashboard data', error);
  }

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <UpdateProfileConfig userDetails={userDetails} />
    </>
  );
}
