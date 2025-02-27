'use client';

import React, { useState, useEffect } from 'react';
import { SpinnerLoader } from '@/components/ui/spinner';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl } from '@/config/base-url';
import { Button } from '@/components/ui/button';
import { Modal, ActionIcon } from 'rizzui';
import { MdOutlineClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import { Text } from '@/components/ui/text';
import { getUserToken } from '@/utils/get-token';

interface Merchant {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  shipping_BillingAddress: string;
  dateofBirth: string;
  gender: string;
  userImage: string;
  businessCategory: string;
  businessDocument: string;
  firebaseId: string;
}

export const MerchantsPage = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const token = await getUserToken();
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      };
      const data = await fetchUtil(
        `${baseUrl}/User/MerchantList`,
        fetchOptions
      );
      setMerchants(data);
    } catch (error) {
      toast.error('Failed to fetch merchants');
      console.error('Error fetching merchants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  return (
    <div className="w-full rounded-lg p-6">
      <h4 className="mb-6 font-semibold">All Merchants</h4>

      {loading ? (
        <SpinnerLoader />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {merchants.length > 0 &&
            merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
        </div>
      )}
    </div>
  );
};

const MerchantCard: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleApprove = async (email: string) => {
    try {
      setApproveLoading(true);
      const token = await getUserToken();
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ emailAddress: email }),
      };

      await fetchUtil(`${baseUrl}/User/ConfirmMerchantAccount`, fetchOptions);
      toast.success('Merchant approved successfully');
    } catch (error) {
      toast.error('Failed to approve merchant');
      console.error('Error approving merchant:', error);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async (email: string) => {
    try {
      setRejectLoading(true);
      const token = await getUserToken();
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ emailAddress: email }),
      };

      await fetchUtil(`${baseUrl}/User/UnconfirmMerchantAccount`, fetchOptions);
      toast.success('Merchant rejected successfully');
    } catch (error) {
      toast.error('Failed to reject merchant');
      console.error('Error rejecting merchant:', error);
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="relative rounded-lg bg-white p-6 shadow-lg">
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
        <p className="w-8/12 truncate text-sm">
          <span className="font-semibold">
            <ViewPDF file={merchant.businessDocument} />:
          </span>
        </p>
      </div>

      <div className="mt-4 flex justify-end gap-4">
        <Button
          onClick={() => handleApprove(merchant.email)}
          size="sm"
          isLoading={approveLoading}
        >
          Approve
        </Button>
        <Button
          onClick={() => handleReject(merchant.email)}
          size="sm"
          isLoading={rejectLoading}
          color="danger"
        >
          Reject
        </Button>
      </div>
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
