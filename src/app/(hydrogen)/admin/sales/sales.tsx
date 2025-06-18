'use client';

import { useEffect, useState } from 'react';

import { managementUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import Pagination from '@/components/pagination';

type SalesData = {
  merchant: string;
  merchantId: string;
  phoneNumber: string;
  totalSales: number;
};

export default function MerchantSales() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesData, setSalesData] = useState<Array<SalesData>>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const fetchSales = async () => {
    const token = await getUserToken();

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${managementUrl}/TotalSalesPerMerchant/${startDate}/${endDate}`,
        fetchOptions
      );
      const data = await res.json();
      setSalesData((data as Array<SalesData>) || []);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchSales();
    }
  }, [startDate, endDate]);

  return (
    <div className="mt-10 w-full rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Merchant Sales Report</h2>

      <div className="mb-6 flex gap-4">
        <div className="flex flex-col">
          <label htmlFor="startDate" className="mb-1 text-sm font-medium">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            className="rounded border px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="mb-1 text-sm font-medium">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            className="rounded border px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading sales data...</p>
      ) : (
        <>
          <table className="w-full border-t text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border-b p-2">Merchant</th>
                <th className="border-b p-2">Phone Number</th>
                <th className="border-b p-2">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesData?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No sales in selected date range.
                  </td>
                </tr>
              ) : (
                salesData?.map((sale, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border-b p-2">{sale?.merchant}</td>
                    <td className="border-b p-2">{sale?.phoneNumber}</td>
                    <td className="border-b p-2">
                      GHC {sale?.totalSales.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex justify-center">
            <Pagination
              totalItems={salesData?.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
