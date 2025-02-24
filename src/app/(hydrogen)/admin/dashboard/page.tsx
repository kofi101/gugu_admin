import React from 'react';

import { managementUrl } from '@/config/base-url';
import DashboardComponent, { DashboardMetricsProps } from './Dashboard';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import { cookies } from 'next/headers';

export const metadata = {
  ...metaObject('Admin Dashboard'),
};

const pageHeader = {
  title: 'Dashboard Overview',
  breadcrumb: [],
};
export default async function HomePageComponent() {
  const token = cookies().get('token');

  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  const dashboardData: DashboardMetricsProps = await fetch(
    `${managementUrl}/DashboardData`,
    fetchOptions
  ).then((res) => res.json());

  return (
    <div className="@container">
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      <DashboardComponent {...dashboardData} />
    </div>
  );
}
