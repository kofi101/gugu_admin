'use client';

import React, { useState } from 'react';

import { Text, Button, Popover, Title } from 'rizzui';

import toast from 'react-hot-toast';

import { MdDeleteOutline } from 'react-icons/md';
import { getUserToken } from '@/utils/get-token';

export function DeleteComponent({
  url,
  name,
  fetchConfig,
  buttonVariant = 'outline',
  disable = false,
}: {
  url: string;
  name: string;
  fetchConfig?: () => void;
  buttonVariant?: 'solid' | 'flat' | 'outline' | 'text';
  disable?: boolean;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      alert(
        `${name} may be used by other product or application, please be sure to delete`
      );
      setLoading(true);
      const token = await getUserToken();

      const res = await fetch(`${url}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      if (!res.ok) {
        setLoading(false);
        return toast.error(
          <Text> Something went wrong, please try again</Text>
        );
      }

      fetchConfig?.();

      setLoading(false);
      toast.success(<Text>{name} deleted successfully</Text>);
    } catch (error) {
      setLoading(false);
      console.error(error);
      return toast.error(<Text> Something went wrong, please try again</Text>);
    }
  };

  return (
    <Popover>
      <Popover.Trigger>
        <Button disabled={disable} variant={buttonVariant} color="danger">
          <MdDeleteOutline size={20} />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        {({ setOpen }) => (
          <div className="w-56">
            <Title as="h6">Delete {name}</Title>
            <Text>Are you sure you want to delete {name}?</Text>
            <div className="mb-1 flex justify-end gap-3">
              <Button
                onClick={() => setOpen(false)}
                size="sm"
                variant="outline"
              >
                No
              </Button>
              <Button
                color="danger"
                isLoading={loading}
                size="sm"
                onClick={() => {
                  handleDelete().then(() => setOpen(false));
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
