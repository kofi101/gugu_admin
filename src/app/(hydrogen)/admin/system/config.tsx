'use client';
import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { Tab } from 'rizzui';
import { CompanyDetails } from './company-details';
import { Carousel } from './carousel';

const pageHeader = {
  title: 'System Management',
  breadcrumb: [
    {
      href: '/admin/system',
      name: 'App Configurations and management',
    },
  ],
};

export default function SystemPage({ companyDetails, carouselData }) {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <Tab>
        <Tab.List>
          <Tab.ListItem>Company Info</Tab.ListItem>
          <Tab.ListItem>Carousel Banner</Tab.ListItem>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <CompanyDetails companyDetails={companyDetails} />
          </Tab.Panel>

          <Tab.Panel>
            <Carousel carouselData={carouselData} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
    </>
  );
}
