'use client';

import React, { useState, useEffect } from 'react';
import { SpinnerLoader } from '@/components/ui/spinner';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl } from '@/config/base-url';
import { Tab } from 'rizzui';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import { ApprovedMerchant } from './approved-merchant';
import { PendingMerchant } from './pending-merchants';

export interface Merchant {
  address: string;
  businessCategory: string;
  businessDocument: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  registrationDate: string;
}

export const MerchantsPage = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

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
  }, [refresh]);

  const approvedMerchants = sortByDate(
    filterProducts(merchants, 'status', 'Confirmed'),
    'registrationDate',
    'asc'
  );

  const pendingMerchantsData = sortByDate(
    filterProducts(merchants, 'status', 'Unconfirmed'),
    'registrationDate',
    'asc'
  );
  const rejectedMerchants = sortByDate(
    filterProducts(merchants, 'status', 'Rejected'),
    'registrationDate',
    'asc'
  );

  return (
    <div className="w-full rounded-lg p-6">
      <h4 className="mb-6 font-semibold">All Merchants</h4>

      {loading ? (
        <SpinnerLoader />
      ) : (
        <Tab>
          <Tab.List>
            <Tab.ListItem>Pending</Tab.ListItem>
            <Tab.ListItem>Approved</Tab.ListItem>
            <Tab.ListItem>Rejected</Tab.ListItem>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              {pendingMerchantsData?.length > 0 ? (
                <PendingMerchant
                  setRefresh={setRefresh}
                  merchants={pendingMerchantsData}
                />
              ) : (
                <p>No data...</p>
              )}
            </Tab.Panel>
            <Tab.Panel>
              {approvedMerchants?.length > 0 ? (
                <ApprovedMerchant merchants={approvedMerchants} />
              ) : (
                <p>No data...</p>
              )}
            </Tab.Panel>
            <Tab.Panel>
              {rejectedMerchants?.length > 0 ? (
                <ApprovedMerchant merchants={rejectedMerchants} />
              ) : (
                <p>No data...</p>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab>
      )}
    </div>
  );
};

const filterProducts = (
  products: Array<Merchant>,
  filterKey: string,
  filterValue: string
) => {
  return products.filter((product) => product[filterKey] === filterValue);
};

// Function to sort an array of objects by date (ascending or descending)
const sortByDate = (items: Array<Merchant>, dateKey: string, order = 'asc') => {
  return items.sort((a, b) => {
    const dateA = new Date(a[dateKey]);
    const dateB = new Date(b[dateKey]);

    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};
