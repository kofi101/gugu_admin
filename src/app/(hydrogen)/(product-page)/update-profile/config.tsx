'use client';
import React from 'react';
import { Tab } from 'rizzui';
import UpdateProfileComponent from './profile';
import UpdatePassword from './change-password';

export default function UpdateProfileConfig({ userDetails }) {
  return (
    <Tab>
      <Tab.List>
        <Tab.ListItem>Update Profile</Tab.ListItem>
        <Tab.ListItem>Change Password</Tab.ListItem>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <UpdateProfileComponent userDetails={userDetails} />
        </Tab.Panel>
        <Tab.Panel>
          <UpdatePassword />
        </Tab.Panel>
      </Tab.Panels>
    </Tab>
  );
}
