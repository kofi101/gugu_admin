import React, { useState } from 'react';

import FormGroup from '@/app/shared/form-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  MdOutlineClose,
  MdOutlineEdit,
} from 'react-icons/md';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';

import {
  Modal,
  Text,
  ActionIcon,
} from 'rizzui';

type ProductConfigType = {
  title: string;
  description: string;
  handleSubmit: () => void;
  value: string;
  setValue: any;
  placeholder: string;
  loading: boolean;
  name: string;
};

export const ProductConfig = ({
  title,
  description,
  handleSubmit,
  value,
  setValue,
  placeholder,
  loading = false,
  name,
  items,
}: ProductConfigType): React.ReactElement => {
  console.log('whait', items);
  return (
    <div className="border-b pb-4 md:w-full md:rounded-md md:border-b-0  md:pb-0">
      <FormGroup
        className="md:border md:p-6"
        title={title}
        description={description}
      >
        <div className="gap-4 md:flex">
          <Input
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            type="text"
            className="w-full md:w-96 lg:w-3/5"
          />
          <Button
            onClick={handleSubmit}
            isLoading={loading}
            type="button"
            size="md"
            rounded="lg"
            color="primary"
            className="mt-4 w-20 bg-black md:mt-0 md:w-28"
          >
            Add
          </Button>
        </div>
      </FormGroup>

      <div className="h-64 overflow-auto">
        {[1, 1, 1, 1, 1].map((i, index) => (
          <ListConfigDetails key={i}/>
        ))}
      </div>
    </div>
  );
};

export const ListConfigDetails = ({
  index,
  id,
  name,
}: {
  index: number;
  id?: number;
  name?: string;
}) => {
  return (
    <div className="my-4 flex h-12 w-full items-center justify-between rounded border px-4 shadow">
  <div className="flex items-center">
    <span className="mr-4">{index + 1}</span>
    <span>{name}</span>
  </div>
  <div className="flex h-2/3 w-auto items-center gap-6">
    <EditConfigList />
  </div>
</div>

  );
};

export default function EditConfigList() {
  const [modalState, setModalState] = useState(false);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await fetch('url', {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(term),
      });

      setModalState(false);
      if (!res.ok) {
        setModalState(false);
        return toast.error(<Text>Failed to update, something went wrong</Text>);
      }

      setLoading(false);
      toast.success(<Text>Update successful</Text>);
    } catch (err) {
      setModalState(false);
      console.error(err);
      toast.error(<Text>Failed to update</Text>);
    }
  };

  return (
    <>
      <button className="border-none" onClick={() => setModalState(true)}>
        <MdOutlineEdit size={24} />
      </button>
      <Modal isOpen={modalState} onClose={() => setModalState(false)}>
        <div className="relative m-auto px-7 pb-8 pt-6">
          <ActionIcon
            size="sm"
            variant="text"
            onClick={() => setModalState(false)}
            className="absolute right-4 top-1"
          >
            <MdOutlineClose size={24} />
          </ActionIcon>

          <div className="flex flex-col items-center [&_label>span]:font-medium">
            <Input
              type="text"
              label="Modify item"
              inputClassName="border-2"
              size="lg"
              className="w-full"
              value={term}
              placeholder="Enter new item name"
              onChange={(e) => setTerm(e.target.value)}
            />

            <Button
              type="submit"
              size="md"
              isLoading={loading}
              className="col-span-2 mt-6 w-fit min-w-20"
              onClick={handleUpdate}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
