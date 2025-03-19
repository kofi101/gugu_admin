'use client';

import React, { useState } from 'react';

import {  Popover } from 'rizzui';
import { Button } from '@/components/ui/button';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IssueCouponToUser } from './issue-coupon';
import { ReActivateCoupon, DeactivateCoupon } from './deactivate';
import { EditCoupon } from './edit-coupons';

export function CouponDetails({
  couponCode,
  couponID,
  expiryDate,
  couponAmount,
  fetchCoupons,
  couponTypeId,
  couponPercentage,
  applicableId,
  startDate,
  frequency,
  applicableOptions,
  applicationType,
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Popover placement="top" isOpen={isOpen} setIsOpen={setIsOpen}>
      <Popover.Trigger>
        <Button variant="text">
          <BsThreeDotsVertical size={24} />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <div className="flex flex-col">
          <EditCoupon
            couponCode={couponCode}
            couponID={couponID}
            expiryDate={expiryDate}
            couponAmount={couponAmount}
            fetchCoupons={fetchCoupons}
            applicableOptions={applicableOptions}
            couponTypeId={couponTypeId}
            couponPercentage={couponPercentage}
            applicableId={applicableId}
            startDate={startDate}
            frequency={frequency}
            applicationType={applicationType}
          />
          <IssueCouponToUser couponCode={couponCode} />
          <ReActivateCoupon couponCode={couponCode} />
          <DeactivateCoupon couponCode={couponCode} />
        </div>
      </Popover.Content>
    </Popover>
  );
}
