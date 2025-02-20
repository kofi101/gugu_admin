'use client';

import React, { useState, useEffect } from 'react';
import { SpinnerLoader } from '@/components/ui/spinner';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl } from '@/config/base-url';
import { Button } from '@/components/ui/button';
import { Modal, ActionIcon, Radio, RadioGroup } from 'rizzui';
import { MdOutlineClose, MdOutlineEdit } from 'react-icons/md';
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

  console.log('merchants', merchants);

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
      toast.error(<Text as="b">Failed to fetch merchants</Text>);
      console.error('Error fetching merchants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (email: string) => {
    const token = await getUserToken();
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ emailAddress: email }),
    };

    const res = await fetchUtil(
      `${baseUrl}/User/ConfirmMerchantAccount`,
      fetchOptions
    );

    console.log('res', res);
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
            merchants?.map((merchant) => (
              <div
                key={merchant.id}
                className="relative  rounded-lg  p-6 shadow-lg"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-xl font-bold">{merchant.fullName}</h3>
                    <p className="text-sm">{merchant.email}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm">
                    <span className="font-semibold">Phone:</span>{' '}
                    {merchant.phoneNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Address:</span>{' '}
                    {merchant.address}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Business Category:</span>{' '}
                    {merchant.businessCategory}
                  </p>
                  <p className="w-8/12 truncate text-sm">
                    <span className="font-semibold">
                      <ViewPDF file={merchant.businessDocument} />:
                    </span>{' '}
                  </p>
                </div>

                <Button
                  onClick={() => handleApprove(merchant.email)}
                  size="sm"
                  className="absolute bottom-4 right-4"
                >
                  Approve
                </Button>
              </div>
            ))}
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
