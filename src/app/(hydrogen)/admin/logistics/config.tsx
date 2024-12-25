'use client';

import React from 'react';
import { Tab } from 'rizzui';
import { ShippingOptions } from './shipping';
import { RegionPage } from './location';
import { PickupStation } from './pick-up';

export const LogisticConfig = () => {
  return (
    <Tab>
      <Tab.List>
        <Tab.ListItem>Shipping</Tab.ListItem>
        <Tab.ListItem>Locations</Tab.ListItem>
        <Tab.ListItem>Pick Up Stations</Tab.ListItem>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <ShippingOptions />
        </Tab.Panel>
        <Tab.Panel>
          <RegionPage />
        </Tab.Panel>
        <Tab.Panel>
          <PickupStation />
        </Tab.Panel>
      </Tab.Panels>
    </Tab>
  );
};
