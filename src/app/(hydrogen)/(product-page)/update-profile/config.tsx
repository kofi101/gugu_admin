'use client';
import React from 'react';
import { Tab } from 'rizzui';
import UpdateProfileComponent from './profile';
import UpdatePassword from './change-password';
import { UserProfileType } from './user-details.type';

export default function UpdateProfileConfig({
  userDetails,
  businessCategories,
}: {
  businessCategories: Array<{
    businessCategoryId: number;
    businessCategory: string;
  }>;
  userDetails: UserProfileType;
}) {
  return (
    <Tab>
      <Tab.List>
        <Tab.ListItem>Update Profile</Tab.ListItem>
        <Tab.ListItem>Change Password</Tab.ListItem>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <UpdateProfileComponent
            userDetails={userDetails}
            businessCategories={businessCategories}
          />
        </Tab.Panel>
        <Tab.Panel>
          <UpdatePassword />
        </Tab.Panel>
      </Tab.Panels>
    </Tab>
  );
}
