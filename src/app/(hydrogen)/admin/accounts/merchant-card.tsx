'use client';

import React, { Dispatch, useState } from 'react';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl } from '@/config/base-url';
import { Button } from '@/components/ui/button';
import { Modal, ActionIcon, Textarea } from 'rizzui';
import { MdOutlineClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import { Merchant } from './merchants';
import { useRouter } from 'next/navigation';

export const MerchantCard: React.FC<{
  merchant: Merchant;
  isApproved?: boolean;
}> = ({ merchant, isApproved, setRefresh }) => {
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [approveReason, setApproveReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const router = useRouter();

  const handleApprove = async () => {
    try {
      setApproveLoading(true);
      const token = await getUserToken();
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          emailAddress: merchant.email,
          accountStatus: 1,
          reasons: approveReason,
        }),
      };

      await fetchUtil(`${baseUrl}/User/ConfirmMerchantAccount`, fetchOptions);
      toast.success('Merchant approved successfully');
      setApproveReason('');
      router.refresh();
    } catch (error) {
      toast.error('Failed to approve merchant');
      console.error('Error approving merchant:', error);
    } finally {
      router.refresh();
      setApproveLoading(false);
      setRefresh((prev) => !prev);
    }
  };

  const handleReject = async () => {
    try {
      setRejectLoading(true);
      const token = await getUserToken();
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          emailAddress: merchant.email,
          accountStatus: 2,
          reasons: rejectReason,
        }),
      };

      await fetchUtil(`${baseUrl}/User/ConfirmMerchantAccount`, fetchOptions);
      toast.success('Merchant rejected successfully');
      setRejectReason('');

      router.refresh();
    } catch (error) {
      toast.error('Failed to reject merchant');
      console.error('Error rejecting merchant:', error);
    } finally {
      router.refresh();
      setRejectLoading(false);
      setRefresh((prev) => !prev);
    }
  };

  return (
    <div className="relative rounded-lg border bg-white p-6 shadow-lg">
      <div className="flex items-center space-x-4">
        <div>
          <h3 className="text-xl font-bold">{merchant.fullName}</h3>
          <p className="text-sm">{merchant.email}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm">
          <span className="font-semibold">Phone:</span> {merchant.phoneNumber}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Address:</span> {merchant.address}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Business Category:</span>{' '}
          {merchant.businessCategory}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Registration Date:</span>{' '}
          {formatDate(merchant.registrationDate)}
        </p>
        <p className="w-8/12 truncate text-sm">
          <span className="font-semibold">
            <ViewPDF file={merchant.businessDocument} />:
          </span>
        </p>
      </div>

      {!isApproved && (
        <div className="mt-4 flex justify-end gap-4">
          <ApproveReject
            reason={approveReason}
            setReason={setApproveReason}
            handleApprove={handleApprove}
            isApprove
            approveLoading={approveLoading}
          />
          <ApproveReject
            reason={rejectReason}
            setReason={setRejectReason}
            handleReject={handleReject}
            rejectLoading={rejectLoading}
          />
        </div>
      )}
    </div>
  );
};

const ViewPDF = ({ file }: { file?: string }) => {
  const [modalState, setModalState] = useState(false);
  return (
    <>
      <Button
        variant="text"
        className="border-none p-0 underline underline-offset-2"
        onClick={() => setModalState(true)}
      >
        View Business Document
      </Button>
      <Modal size="lg" isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="relative m-auto px-7 pb-8 pt-6">
          <ActionIcon
            size="sm"
            variant="text"
            onClick={() => setModalState(false)}
            className="absolute right-4 top-1"
          >
            <MdOutlineClose size={24} />
          </ActionIcon>
          <div className="h-[80vh] w-[80vh]">
            <object
              data={file}
              type="application/pdf"
              width="100%"
              height="100%"
            >
              Show pdf file
            </object>
          </div>
        </div>
      </Modal>
    </>
  );
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

const ApproveReject = ({
  isApprove,
  handleApprove,
  handleReject,
  reason,
  setReason,
  approveLoading,
  rejectLoading,
}: {
  isApprove?: boolean;
  handleApprove?: () => void;
  handleReject?: () => void;
  reason: string;
  setReason: Dispatch<React.SetStateAction<string>>;
  approveLoading?: boolean;
  rejectLoading?: boolean;
}) => {
  const [modalState, setModalState] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        color={isApprove ? 'primary' : 'danger'}
        onClick={() => setModalState(true)}
        size="sm"
      >
        {isApprove ? 'Approve' : 'Reject'}
      </Button>
      <Modal size="lg" isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="relative m-auto px-7 pb-8 pt-6">
          <ActionIcon
            size="sm"
            variant="text"
            onClick={() => setModalState(false)}
            className="absolute right-4 top-1"
          >
            <MdOutlineClose size={24} />
          </ActionIcon>
          <p className="my-4 text-red-500">
            {`Please be sure to ${
              isApprove ? 'approve' : 'reject'
            } a merchant. This action cannot be undone`}
          </p>

          <div className="my-4 w-full">
            <Textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`${
                isApprove
                  ? 'Enter reason for approval'
                  : 'Enter reason for rejection'
              }`}
              label={isApprove ? 'Approval reason' : 'Rejection reason'}
            />
          </div>

          <div className="flex justify-end">
            <Button
              isLoading={isApprove ? approveLoading : rejectLoading}
              variant="solid"
              type="submit"
              color={isApprove ? 'primary' : 'danger'}
              onClick={() => {
                handleApprove?.();
                handleReject?.();
              }}
            >
              {isApprove ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
