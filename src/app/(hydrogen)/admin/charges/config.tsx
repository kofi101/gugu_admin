'use client';
import React from 'react';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import { Tab } from 'rizzui';
import { TaxPage } from './taxes';
import { ServiceChargePage } from './services';

const pageHeader = {
  title: 'Charges And Taxes',
  breadcrumb: [
    {
      href: '/admin/charges',
      name: 'Tax and Charges Configurations',
    },
  ],
};

export default function ChargesTaxConfig() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <Tab>
        <Tab.List>
          <Tab.ListItem>Taxes</Tab.ListItem>
          <Tab.ListItem>Service Charges</Tab.ListItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <TaxPage />
          </Tab.Panel>
          <Tab.Panel>
            <ServiceChargePage />
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
    </>
  );
}
