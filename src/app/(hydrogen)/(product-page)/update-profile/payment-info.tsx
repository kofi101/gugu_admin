import React from 'react';

export default function MerchantPaymentCard({ merchant }: {merchant: PaymentInfo}) {
  if (!merchant) return null;

  const {
    merchantName,
    paymentOption,
    paymentNumber,
    paymentNetwork,
    bankAccountNumber,
    bank,
    bankBranch,
  } = merchant;

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-semibold text-gray-800">{merchantName}</h2>
        <span className="rounded-md bg-green-500 px-3 py-1 text-xs font-medium text-white">
          {paymentOption}
        </span>
      </div>

      {/* Payment Details */}
      <div className="mt-4 space-y-2 text-sm text-gray-700">
        {paymentOption === 'Mobile Money' ? (
          <>
            <p>
              <span className="font-semibold">Phone Number:</span>{' '}
              {paymentNumber || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Network:</span>{' '}
              {paymentNetwork || 'N/A'}
            </p>
          </>
        ) : (
          <>
            <p>
              <span className="font-semibold">Bank Account:</span>{' '}
              {bankAccountNumber || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Bank:</span> {bank || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Branch:</span>{' '}
              {bankBranch || 'N/A'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export type PaymentInfo = {
  merchantId: string;
  merchantName: string;
  paymentOption: string;
  paymentNumber: string;
  paymentNetwork: string;
  bankAccountNumber: string | null;
  bank: string | null;
  bankBranch: string | null;
};
