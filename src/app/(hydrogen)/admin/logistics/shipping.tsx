'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { Modal, ActionIcon } from 'rizzui';
import { SpinnerLoader } from '@/components/ui/spinner';
import { getUserToken } from '@/utils/get-token';
import { fetchUtil } from '@/utils/fetch';
import { managementUrl } from '@/config/base-url';
import { MdOutlineClose, MdOutlineEdit } from 'react-icons/md';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Unauthorized } from '../../(product-page)/products/configs/page';
import { DeleteComponent } from '../../delete/delete';

type ShippingOptionType = {
  shippingOptionId: number;
  shippingOption: string;
  shippingCost: number;
};

export const ShippingOptions = () => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionType[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const getShippingOptions = async () => {
    setLoading(true);

    const token = await getUserToken();
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    const shippingData = await fetchUtil(
      `${managementUrl}/ShippingOptions`,
      fetchOptions
    );
    setShippingOptions(shippingData);
    setLoading(false);
  };

  useEffect(() => {
    getShippingOptions();
  }, []);

  const onSubmit = async (data) => {
    const token = await getUserToken();
    try {
      setFormLoading(true);

      const res = await fetch(`${managementUrl}/AddShippingOptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          shippingOptionId: 0,
          shippingOption: data.shippingOption,
          shippingCost: data.shippingCost,
          createdBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      reset();
      setFormLoading(false);
      getShippingOptions();
      toast.success('Shipping option successfully added');
    } catch (error) {
      toast.error('Failed to add option');
      setFormLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h4 className="mb-6 text-xl font-bold">Shipping Options</h4>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Shipping Option"
            type="text"
            {...register('shippingOption', {
              required: 'Shipping option name is required',
            })}
            placeholder="Enter shipping option"
            error={errors.shippingOption?.message as string}
          />
          <Input
            label="Shipping Cost GHC"
            type="number"
            {...register('shippingCost', {
              required: 'Shipping cost is required',
            })}
            placeholder="Enter shipping cost"
            error={errors.shippingCost?.message as string}
          />
        </div>
        <Button isLoading={formLoading} type="submit">
          Create Shipping Option
        </Button>
      </form>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">All Shipping Options</h3>

        {loading ? (
          <SpinnerLoader />
        ) : (
          <ul className="space-y-4">
            {shippingOptions &&
              shippingOptions?.map((option) => (
                <li
                  key={option.shippingOptionId}
                  className="flex items-center justify-between rounded-lg bg-gray-100 p-4 shadow-sm"
                >
                  <div>
                    <p>
                      <strong>Option:</strong> {option.shippingOption}
                    </p>
                    <p>
                      <strong>Cost:</strong> GHC{option.shippingCost}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <EditShipping
                      fetchConfig={getShippingOptions}
                      shippingCost={option.shippingCost}
                      shippingOption={option.shippingOption}
                      shippingOptionId={option.shippingOptionId}
                    />
                    <DeleteComponent
                      url={`${managementUrl}/DeleteShippingOption/${option.shippingOptionId}/${option.shippingOption}/${user?.uid}`}
                      name={option.shippingOption}
                      buttonVariant="outline"
                      fetchConfig={getShippingOptions}
                    />
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const EditShipping = ({
  fetchConfig,
  shippingOptionId,
  shippingOption,
  shippingCost,
}: {
  shippingOptionId: number;
  shippingOption: string;
  shippingCost: number;
  fetchConfig: () => void;
}) => {
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
      shippingOption: shippingOption,
      shippingCost: shippingCost,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/ModifyShippingOption`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          modifiedBy: user?.uid,
          shippingOptionId: shippingOptionId,
          shippingOption: data.shippingOption,
          shippingCost: data.shippingCost,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('Shipping Option successfully updated');
      fetchConfig();
    } catch (error) {
      toast.error('Failed to update shipping option');
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
            <h4 className="mb-4"> Edit Shipping Option</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Shipping Option"
                type="text"
                {...register('shippingOption')}
                placeholder="Enter shipping option"
                error={errors.shippingOption?.message as string}
              />
              <Input
                label="Shipping Cost GHC"
                type="number"
                {...register('shippingCost')}
                placeholder="Enter shipping cost"
                error={errors.shippingCost?.message as string}
              />
            </div>
            <Button
              type="submit"
              size="md"
              isLoading={formLoading}
              className="col-span-2 mt-6 w-fit min-w-20"
            >
              Update Shipping Option
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};
