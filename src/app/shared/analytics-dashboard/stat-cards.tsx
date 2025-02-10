'use client';

import MetricCard from '@/components/cards/metric-card';
import { RoundedTopBarFill } from '@/components/charts/rounded-topbar';
import { Title, Text } from '@/components/ui/text';
import cn from '@/utils/class-names';
import { formatDate } from '@/utils/format-date';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

export default function StatCards({
  metrics,
  className,
}: {
  metrics: Array<any>;
  className?: string;
}) {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold">Top Sales</h2>

      <div
        className={cn('grid grid-cols-1 gap-5 3xl:gap-8 4xl:gap-9', className)}
      >
        {metrics?.map((data) => (
          <div
            key={data.productCode}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Order #{data?.checkOutOrderNumber}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(data?.transactionDate, 'MMMM D, YYYY')}
            </p>
            <div className="mt-2 h-24">
              <p className="font-medium text-gray-700">
                Customer: {data?.fullName}
              </p>
              <p className="text-sm text-gray-600">
                Phone: {data?.phoneNumber}
              </p>
              <p className="text-sm text-gray-600">Address: {data?.address}</p>
            </div>
            <div className="mt-3 h-20 border-t pt-2">
              <p className="font-medium text-gray-700">
                Product: {data?.productName}
              </p>
              <p className="text-sm text-gray-600">Code: {data?.productCode}</p>
              <p className="text-sm text-gray-600">
                Quantity: {data?.quantity}
              </p>
              <p className="text-sm text-gray-600">
                Price: GHC {data?.salesPrice.toFixed(2)}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  data?.statusDescription === 'Delivered'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {data?.statusDescription}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
