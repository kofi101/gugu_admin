import React from 'react';
import { CompanyDetailsType } from './page';
import { FaPhone } from 'react-icons/fa6';
import { MdMail } from 'react-icons/md';

const Confirmation = ({ details }: { details?: CompanyDetailsType }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800">
          Your account is under review!
        </h2>
        <p className="mt-3 text-gray-600">
          Our admins are reviewing your account. You will be notified once your
          registration is approved.
        </p>

        {details && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Need Assistance?
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              Contact our administrators:
            </p>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">
                {details?.welcomeMessage}
              </h4>
              <p className="flex items-center text-gray-600">
                <MdMail size={24} className="mr-1" />{' '}
                {details?.siteDisplayEmail}
              </p>
              <p className="flex items-center text-gray-600">
                <FaPhone size={24} className="mr-1" />{' '}
                {details?.callUseNowNumber}
              </p>
            </div>
          </div>
        )}

        <p className="mt-6 text-sm text-gray-500">
          Thank you for your patience! 🎉
        </p>
      </div>
    </div>
  );
};

export default Confirmation;
