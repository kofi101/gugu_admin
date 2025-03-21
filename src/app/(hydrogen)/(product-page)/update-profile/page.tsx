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
  let mobileNetworks;
  let paymentOptions;
  let merchantPayment;

  try {
    if (!token || !userId) {
      throw new Error('Unauthorized: Missing token or userId.');
    }

    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    businessCategories = await fetch(
      `${managementUrl}/BusinessCategories`
    )?.then((res) => res.json());

    merchantPayment = await fetch(
      `${baseUrl}/User/GetMerchantPaymentOptions/${userId}`,
      fetchOptions
    )?.then((res) => res.json());

    userDetails = await fetch(
      `${baseUrl}/User/GetUserDetails/${userId}`,
      fetchOptions
    ).then((res) => res.json());

    mobileNetworks = await fetch(
      `${baseUrl}/User/MobileNetworks`,
      fetchOptions
    ).then((res) => res.json());

    paymentOptions = await fetch(
      `${baseUrl}/User/PaymentOptions`,
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
        paymentOptions={paymentOptions}
        mobileNetworks={mobileNetworks}
        merchantPayment={merchantPayment}
      />
    </>
  );
}
