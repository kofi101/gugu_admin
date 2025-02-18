'use client';
import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { Tab } from 'rizzui';
import { CompanyDetails } from './company-details';

const pageHeader = {
  title: 'System Management',
  breadcrumb: [
    {
      href: '/admin/system',
      name: 'App Configurations and management',
    },
  ],
};

export default function SystemPage({ companyDetails }) {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <Tab>
        <Tab.List>
          <Tab.ListItem>Company Info</Tab.ListItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <CompanyDetails companyDetails={companyDetails} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
    </>
  );
}
