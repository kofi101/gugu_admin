'use client';

import React, { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { MdOutlineClose, MdOutlineEdit } from 'react-icons/md';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { Modal, ActionIcon, Radio, RadioGroup } from 'rizzui';
import { useForm } from 'react-hook-form';
import { fetchUtil } from '@/utils/fetch';
import { managementUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { Unauthorized } from '../../(product-page)/products/configs/config';
import { SpinnerLoader } from '@/components/ui/spinner';
import { DeleteComponent } from '../../delete/delete';

type ServiceCharge = {
  serviceChargeId: number;
  serviceChargeType: string;
  serviceCharge: number;
  isApplicable: number;
  createdBy?: string;
};

export const ServiceChargePage = () => {
  const [serviceCharges, setServiceCharges] = useState<Array<ServiceCharge>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [applicable, setApplicable] = useState('1');

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const getServiceCharges = async () => {
    const token = await getUserToken();

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    setLoading(true);
    const data = await fetchUtil(
      `${managementUrl}/ServiceCharges`,
      fetchOptions
    );
    setServiceCharges(data);
    setLoading(false);
  };

  useEffect(() => {
    getServiceCharges();
  }, []);

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/AddServiceCharges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          serviceChargeId: 0,
          serviceChargeType: data.serviceChargeType,
          serviceCharge: data.serviceCharge,
          isApplicable: applicable,
          createdBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('Service charge successfully added');
    } catch (error) {
      toast.error('Failed to add service charge');
      setFormLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
        <h4 className="mb-6 text-xl font-bold">Add Service Charge</h4>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex w-full flex-col gap-4 md:w-2/3 md:flex-row">
            <Input
              label="Service Charge Type"
              type="text"
              {...register('serviceChargeType', {
                required: 'Service Charge Type is required',
              })}
              className="w-full"
              size="md"
              placeholder="Enter service charge type"
              error={errors.serviceChargeType?.message as string}
            />
            <Input
              label="Charge Amount"
              type="number"
              step={'any'}
              {...register('serviceCharge', {
                required: 'Charge Amount is required',
              })}
              className="w-full"
              size="md"
              placeholder="Enter charge amount"
              error={errors.serviceCharge?.message as string}
            />
          </div>

          <div>
            <label className="mb-2" htmlFor="is_applicable">
              Is Applicable
            </label>

            <RadioGroup
              id="is_applicable"
              value={applicable}
              setValue={setApplicable}
              className="mt-2 flex flex-col gap-4"
            >
              <Radio label="Yes" value="1" />
              <Radio label="No" value="0" />
            </RadioGroup>
          </div>

          <Button isLoading={formLoading} type="submit">
            Add Service Charge
          </Button>
        </form>

        <div className="mt-8">
          <h5 className="mb-4 text-lg font-semibold">All Service Charges</h5>

          {loading && <SpinnerLoader />}

          {!loading && (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-4">ID</th>
                  <th className="p-4">Charge Type</th>
                  <th className="p-4">Charge Amount</th>
                  <th className="p-4">Is Applicable</th>
                  <th className="p-4">{}</th>
                </tr>
              </thead>
              <tbody>
                {serviceCharges.map((charge, index) => (
                  <tr key={charge.serviceChargeId} className="border-b">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{charge.serviceChargeType}</td>
                    <td className="p-4">{charge.serviceCharge}</td>
                    <td className="p-4">
                      {charge.isApplicable == 1 ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex h-fit items-center gap-4">
                        <EditServiceCharge
                          serviceChargeType={charge?.serviceChargeType}
                          serviceCharge={charge.serviceCharge}
                          isApplicable={charge.isApplicable}
                          serviceChargeId={charge.serviceChargeId}
                          fetchConfig={getServiceCharges}
                        />
                        <DeleteComponent
                          buttonVariant="outline"
                          name={charge?.serviceChargeType}
                          url={`${managementUrl}/DeleteServiceCharges/${charge?.serviceChargeId}/${charge?.serviceCharge}/${user?.uid}`}
                          fetchConfig={getServiceCharges}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EditServiceCharge({
  serviceChargeType,
  serviceCharge,
  isApplicable,
  serviceChargeId,
  fetchConfig,
}: ServiceCharge & { fetchConfig: () => Promise<void> }) {
  const [modalState, setModalState] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [applicable, setApplicable] = useState(String(isApplicable));

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      serviceChargeType,
      serviceCharge,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/ModifyServiceCharges`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          serviceChargeId,
          serviceChargeType: data.serviceChargeType,
          serviceCharge: data.serviceCharge,
          isApplicable: applicable || isApplicable,
          modifiedBy: user?.uid,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('Service charge successfully modified');
      fetchConfig();
    } catch (error) {
      toast.error('Failed to modify service charge');
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
            className="flex flex-col [&_label>span]:font-medium"
          >
            <h4 className="mb-4 text-center">Edit Service Charge</h4>

            <div className="">
              <Input
                label="Service Charge Type"
                type="text"
                {...register('serviceChargeType')}
                className="w-full"
                size="md"
                placeholder="Enter service charge type"
                error={errors.serviceChargeType?.message as string}
              />
              <Input
                label="Charge Amount"
                type="number"
                step={'any'}
                {...register('serviceCharge')}
                className="my-4 w-full"
                size="md"
                placeholder="Enter charge amount"
                error={errors.serviceCharge?.message as string}
              />
            </div>

            <div>
              <label className="mb-2" htmlFor="is_applicable">
                Is Applicable
              </label>

              <RadioGroup
                id="is_applicable"
                value={applicable}
                setValue={setApplicable}
                className="mt-2 flex flex-col gap-4"
              >
                <Radio label="Yes" value="1" />
                <Radio label="No" value="0" />
              </RadioGroup>
            </div>

            <Button
              type="submit"
              size="md"
              isLoading={formLoading}
              className="col-span-2 mt-6 w-fit min-w-20"
            >
              Update Service Charge
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
