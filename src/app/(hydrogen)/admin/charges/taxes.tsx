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

type TaxRate = {
  taxId: number;
  taxType: string;
  taxRate: number;
  isApplicable: number;
};

export const TaxPage = () => {
  const [taxes, setTaxes] = useState<Array<TaxRate>>([]);
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

  const getTaxes = async () => {
    const token = await getUserToken();

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    setLoading(true);
    const data = await fetchUtil(`${managementUrl}/Taxes`, fetchOptions);
    setTaxes(data);
    setLoading(false);
  };

  useEffect(() => {
    getTaxes();
  }, []);

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/AddTaxes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          taxId: 0,
          taxType: data.taxType,
          taxRate: data.taxRate,
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
      toast.success('Tax successfully added');
    } catch (error) {
      toast.error('Failed to add tax');
      setFormLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
        <h4 className="mb-6 text-xl font-bold">Add Tax</h4>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex w-full flex-col gap-4 md:w-2/3 md:flex-row">
            <Input
              label="Tax Type"
              type="text"
              {...register('taxType', {
                required: 'Tax Type is required',
              })}
              className="w-full"
              size="md"
              placeholder="Enter tax type"
              error={errors.taxType?.message as string}
            />
            <Input
              label="Rate"
              type="number"
              step={'any'}
              {...register('taxRate', {
                required: 'Tax Rate is required',
              })}
              className="w-full"
              size="md"
              placeholder="Enter tax rate"
              error={errors.taxRate?.message as string}
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
            Add Tax
          </Button>
        </form>

        <div className="mt-8">
          <h5 className="mb-4 text-lg font-semibold">All taxes</h5>

          {loading && <SpinnerLoader />}

          {!loading && (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-4">Tax ID</th>
                  <th className="p-4">Tax Type</th>
                  <th className="p-4">Tax Rate (%)</th>
                  <th className="p-4">Is Applicable</th>
                  <th className="p-4">{}</th>
                </tr>
              </thead>
              <tbody>
                {taxes.map((tax, index) => (
                  <tr key={tax.taxId} className="border-b">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{tax.taxType}</td>
                    <td className="p-4">{tax.taxRate}</td>
                    <td className="p-4">
                      {tax.isApplicable == 1 ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex h-fit items-center gap-4">
                        <EditTaxes
                          taxType={tax?.taxType}
                          taxRate={tax.taxRate}
                          isApplicable={tax.isApplicable}
                          taxId={tax.taxId}
                          fetchConfig={getTaxes}
                        />
                        <DeleteComponent
                          buttonVariant="outline"
                          name={tax?.taxType}
                          url={`${managementUrl}/Deletetaxes/${tax?.taxId}/${tax?.taxRate}/${user?.uid}`}
                          fetchConfig={getTaxes}
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

export default function EditTaxes({
  taxType,
  taxRate,
  isApplicable,
  taxId,
  fetchConfig,
}: TaxRate & { fetchConfig: () => Promise<void> }) {
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
      taxType,
      taxRate,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/ModifyTaxes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          taxId: taxId,
          taxType: data.taxType,
          taxRate: data.taxRate,
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
      toast.success('Tax successfully modified');
      fetchConfig();
    } catch (error) {
      toast.error('Failed to modify tax');
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
            <h4 className="mb-4 text-center"> Edit tax</h4>

            <div className="">
              <Input
                label="Tax Type"
                type="text"
                {...register('taxType')}
                className="w-full"
                size="md"
                placeholder="Enter tax type"
                error={errors.taxType?.message as string}
              />
              <Input
                label="Rate"
                type="number"
                step={'any'}
                {...register('taxRate')}
                className="my-4 w-full"
                size="md"
                placeholder="Enter tax rate"
                error={errors.taxRate?.message as string}
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
              Update Tax
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
