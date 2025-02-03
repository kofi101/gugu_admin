import React from 'react';
import NextLink from 'next/link';

import MerchantAnalytics from '@/app/shared/analytics-dashboard/merchant-analytics';

import { cookies } from 'next/headers';
import { merchantUrl } from '@/config/base-url';
import { FaArrowRightLong } from 'react-icons/fa6';

export default async function HomePageComponent() {
  let topProducts;
  let dashboardData;
  let salesData;

  try {
    const token = cookies()?.get('token');
    const userId = cookies()?.get('userId');

    if (!token || !userId) {
      throw new Error('Unauthorized: Missing token or userId.');
    }

    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const [topProductRes, dashboardRes, salesRes] = await Promise.all([
      fetch(`${merchantUrl}/TopSellingProducts/${userId}`, fetchOptions),
      fetch(`${merchantUrl}/DashboardData/${userId}`, fetchOptions),
      fetch(`${merchantUrl}/TotalSales/${userId}`, fetchOptions),
    ]);

    if (!topProductRes.ok || !dashboardRes.ok || !salesRes.ok) {
      throw new Error('Failed to fetch dashboard data.');
    }

    topProducts = await topProductRes.json();
    dashboardData = await dashboardRes.json();
    salesData = await salesRes.json();
  } catch (error) {
    console.error('Error while fetching dashboard data', error);
  }

  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8">
        <div className="w-full rounded-lg p-6 shadow">
          <h2 className="flex gap-3">{greetUser()}</h2>

          <p className="mt-10">
            Welcome to Your Shop – Manage, Track, and Grow Your Business with
            Ease!
          </p>

          <div className="mt-20">
            <p className="mb-10 font-semibold">
              Total Sales{' '}
              <span className="font-bold">
                GHC: {dashboardData?.totalSales}
              </span>
            </p>

            <NextLink
              className="flex w-fit items-center gap-2 border-b-2 border-b-black font-semibold transition-all hover:gap-6 "
              href={'/orders'}
            >
              Go to Orders <FaArrowRightLong size={24} />
            </NextLink>
          </div>
        </div>
        <div className="w-full rounded-lg p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Top Selling Products</h2>

          <ul className="h-60 space-y-3 overflow-y-auto">
            {topProducts?.map((product) => (
              <li
                key={product.productId}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <h3 className="text-sm font-medium">{product.productName}</h3>
                  <p className="text-xs text-gray-500">
                    {product.brandName} - {product.productCategory}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {product.highCount} Sold
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16">
        <MerchantAnalytics
          dashboardData={dashboardData}
          salesData={salesData}
        />
      </div>
    </div>
  );
}

function greetUser() {
  const now = new Date();
  const hours = now.getHours();

  if (hours < 12) {
    return 'Good morning!';
  } else if (hours < 18) {
    return 'Good afternoon!';
  } else {
    return 'Good evening!';
  }
}
