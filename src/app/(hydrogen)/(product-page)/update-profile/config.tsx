'use client';
import React from 'react';
import { Tab } from 'rizzui';
import UpdateProfileComponent from './profile';
import UpdatePassword from './change-password';
import { UserProfileType } from './user-details.type';
import PreferredPaymentOption from './payment-option';
import MerchantPaymentCard, { PaymentInfo } from './payment-info';

export type Options = Array<{ id: number; name: string; displayName: string }>;

export default function UpdateProfileConfig({
  userDetails,
  businessCategories,
  paymentOptions,
  mobileNetworks,
  merchantPayment,
}: {
  businessCategories: Array<{
    businessCategoryId: number;
    businessCategory: string;
  }>;
  userDetails: UserProfileType;
  paymentOptions: Options;
  mobileNetworks: Options;
  merchantPayment: PaymentInfo;
}) {
  return (
    <Tab>
      <Tab.List>
        <Tab.ListItem>Update Profile</Tab.ListItem>
        <Tab.ListItem>Change Password</Tab.ListItem>
        <Tab.ListItem>Preferred Payment</Tab.ListItem>
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
        <Tab.Panel>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            <PreferredPaymentOption
              paymentOptions={paymentOptions}
              mobileNetworks={mobileNetworks}
            />
            <MerchantPaymentCard merchant={merchantPayment} />
          </div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab>
  );
}
