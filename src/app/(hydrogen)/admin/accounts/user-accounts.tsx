'use client';

import React, { useState, useEffect } from 'react';
import { SpinnerLoader } from '@/components/ui/spinner';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl } from '@/config/base-url';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Text } from '@/components/ui/text';
import { getUserToken } from '@/utils/get-token';

type User = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  shipping_BillingAddress: string;
  registrationDate: string;
  gender: string;
  userImage: string;
  businessCategoryId: number;
  businessDocument: string;
  firebaseId: string;
};

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getUserToken();

      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      };

      const data = await fetchUtil(
        `${baseUrl}/User/CustomerList`,
        fetchOptions
      );
      setUsers(data);
    } catch (error) {
      toast.error(<Text as="b">Failed to fetch users</Text>);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full overflow-x-auto rounded-lg bg-white p-6 shadow-md">
      <h4 className="mb-6 font-semibold">All Users</h4>

      {loading ? (
        <SpinnerLoader />
      ) : (
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Full Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone Number</th>
              <th className="px-4 py-2 text-left">Registration Date</th>
              {/* <th className="px-4 py-2 text-left">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {users.length > 0 &&
              users?.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.fullName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.phoneNumber}</td>

                  <td className="px-4 py-2">
                    {new Date(user.registrationDate).toDateString()}
                  </td>
{/* 
                  <td className="px-4 py-2">
                    <Button
                      color="danger"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                    >
                      Delete
                    </Button>
                  </td> */}
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
