'use client';
import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { Tab } from 'rizzui';
import { UsersPage } from './user-accounts';
import { MerchantsPage } from './merchants';

const pageHeader = {
  title: 'Accounts Management',
  breadcrumb: [
    {
      href: '/admin/accounts',
      name: 'User and Merchant Accounts',
    },
  ],
};

export default function AccountsPage() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <Tab>
        <Tab.List>
          <Tab.ListItem>User Accounts</Tab.ListItem>
          <Tab.ListItem>Merchant Accounts</Tab.ListItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <UsersPage />
          </Tab.Panel>
          <Tab.Panel>
            <MerchantsPage />
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
    </>
  );
}
