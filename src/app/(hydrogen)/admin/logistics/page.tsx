import React from 'react';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';

import { LogisticConfig } from './config';

export const metadata = {
  ...metaObject('Logistics'),
};

const pageHeader = {
  title: 'Logistics',
  breadcrumb: [
    {
      href: '/admin/logistics',
      name: 'Logistic Configurations',
    },
  ],
};

export default function LogisticsPage() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <LogisticConfig />
    </>
  );
}
