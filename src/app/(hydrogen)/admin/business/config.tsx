'use client';

import React from 'react';

import PageHeader from '@/app/shared/page-header';
import { Tab } from 'rizzui';
import { ProductCategory } from './product-category';
import { ProductSubCategory } from './product-sub-category';
import { BrandComponent } from './brands';
import { BusinessCategoryComponent } from './business-category';

const pageHeader = {
  title: 'Configurations',
  breadcrumb: [
    {
      href: '/admin/business',
      name: 'Business Configuration',
    },
  ],
};

export const AdminMerchantConfig = () => {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <Tab>
        <Tab.List>
          <Tab.ListItem>Brands</Tab.ListItem>
          <Tab.ListItem>Business Categories</Tab.ListItem>
          <Tab.ListItem>Product Categories</Tab.ListItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <BrandComponent />
          </Tab.Panel>
          <Tab.Panel>
            <BusinessCategoryComponent />
          </Tab.Panel>
          <Tab.Panel>
            <div className="grid gap-4 md:grid-cols-2">
              <ProductCategory />
              <ProductSubCategory />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
    </>
  );
};
