import React, { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MdOutlineClose, MdOutlineEdit } from 'react-icons/md';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { Modal, ActionIcon } from 'rizzui';
import { useForm } from 'react-hook-form';
import { fetchUtil } from '@/utils/fetch';
import { managementUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Unauthorized } from '../../(product-page)/products/configs/page';
import { SpinnerLoader } from '@/components/ui/spinner';
import { DeleteComponent } from '../../delete/delete';
import { Cities } from './cities';

type RegionType = {
  regionId: number;
  regionName: string;
};

export const RegionPage = () => {
  const [regions, setRegions] = useState<Array<RegionType>>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const getRegions = async () => {
    const token = await getUserToken();

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    setLoading(true);
    const data = await fetchUtil(`${managementUrl}/Regions`, fetchOptions);
    setRegions(data);
    setLoading(false);
  };

  useEffect(() => {
    getRegions();
  }, []);

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/AddRegion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          regionId: 0,
          regionName: data.regionName,
          createdBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('Region successfully added');
    } catch (error) {
      toast.error('Failed to add region');
      setFormLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
        <h4 className="mb-6 text-xl font-bold">Add Region</h4>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Region Name"
            type="text"
            {...register('regionName', {
              required: 'Region name is required',
            })}
            size="md"
            placeholder="Enter region name"
            error={errors.regionName?.message as string}
          />

          <Button isLoading={formLoading} type="submit">
            Add region
          </Button>
        </form>

        <div className="mt-8">
          <h5 className="mb-4 text-lg font-semibold">All regions</h5>

          {loading && <SpinnerLoader />}
          {!loading && (
            <ul className="h-[24.8rem] space-y-2 overflow-auto">
              {regions?.map((item) => (
                <li
                  key={item?.regionId}
                  className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 shadow-sm"
                >
                  <p>{item?.regionName}</p>
                  <div className="flex h-fit items-center gap-4">
                    <EditRegions
                      name={item.regionName}
                      id={item.regionId}
                      fetchConfig={getRegions}
                    />
                    <DeleteComponent
                      buttonVariant="outline"
                      name={item.regionName}
                      url={`${managementUrl}/DeleteRegions/${item.regionId}/${item.regionName}/${user?.uid}`}
                      fetchConfig={getRegions}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Cities regions={regions} />
    </div>
  );
};

export default function EditRegions({
  name,
  id,
  fetchConfig,
}: {
  name: string;
  id: number;
  fetchConfig: () => void;
}) {
  const [modalState, setModalState] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      regionName: name,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/ModifyRegion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          regionId: id,
          regionName: data.regionName,
          modifiedBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('Regions successfully modified');
      fetchConfig();
    } catch (error) {
      toast.error('Failed to modify region');
      setFormLoading(false);
      console.log(error);
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center [&_label>span]:font-medium"
          >
            <h4 className="mb-4"> Edit regions</h4>
            <Input
              type="text"
              label="Modify regions"
              inputClassName="border-2"
              size="lg"
              className="w-full"
              error={errors.regionName?.message as string}
              {...register('regionName')}
              placeholder="Edit regions"
            />

            <Button
              type="submit"
              size="md"
              isLoading={formLoading}
              className="col-span-2 mt-6 w-fit min-w-20"
            >
              Update Region
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
