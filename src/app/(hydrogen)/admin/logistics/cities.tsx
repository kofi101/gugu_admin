import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SpinnerLoader } from '@/components/ui/spinner';
import { managementUrl } from '@/config/base-url';
import { Modal, ActionIcon } from 'rizzui';
import { MdOutlineClose, MdOutlineEdit } from 'react-icons/md';
import { getUserToken } from '@/utils/get-token';
import { Unauthorized } from '../../(product-page)/products/configs/page';
import { DeleteComponent } from '../../delete/delete';
import { fetchUtil } from '@/utils/fetch';

import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';

type Region = {
  regionId: number;
  regionName: string;
};

type City = {
  regionId: number;
  cityId: number;
  cityName: string;
  createdBy: string;
};

export const Cities = ({
  regions,
}: {
  regions: Array<{
    regionId: number;
    regionName: string;
  }>;
}) => {
  //   const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  //   const [createRegion, setCreateRegion] = useState(null);

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({});

  const getCities = async () => {
    try {
      setLoading(true);

      const token = await getUserToken();
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      };
      const data = await fetchUtil(
        `${managementUrl}/Cities/${selectedRegion?.value}`,
        fetchOptions
      );
      setCities(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedRegion !== null) {
      getCities();
    }
  }, [selectedRegion]);

  const onSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const token = await getUserToken();

      const sendData = {
        regionId: formData.regionId?.value,
        cityId: 0,
        cityName: formData?.cityName,
        createdBy: user?.uid,
      };

      const fetchOptions = {
        method: 'POST',
        body: JSON.stringify(sendData),
        headers: {
          Authorization: 'Bearer ' + token,
        },
      };
      await fetchUtil(`${managementUrl}/AddCities`, fetchOptions);

      toast.success('City successfully added');
      reset();
      setFormLoading(false);
      setLoading(false);
    } catch (error) {
      setFormLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <h4 className="mb-6 text-xl font-bold">Add Cities</h4>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="regionId"
            control={control}
            rules={{ required: 'Region selection is required' }}
            render={({ field: { onChange, value } }) => (
              <Select
                options={regions?.map((region) => ({
                  label: region.regionName,
                  value: region.regionId,
                }))}
                value={value}
                onChange={onChange}
                label="Region"
                className="w-full"
                error={errors.regionId?.message as string}
              />
            )}
          />
          <Input
            label="City Name"
            type="text"
            {...register('cityName', {
              required: 'City name is required',
            })}
            placeholder="Enter city name"
            error={errors.cityName?.message as string}
          />
        </div>
        <Button isLoading={formLoading} type="submit">
          Add City
        </Button>
      </form>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">Cities</h3>

        <Controller
          name="regions"
          control={control}
          rules={{ required: 'Region selection is required' }}
          render={({ field: { onChange, value } }) => (
            <Select
              options={regions?.map((region) => ({
                label: region.regionName,
                value: region.regionId,
              }))}
              value={value}
              onChange={(value) => {
                setSelectedRegion(value);
              }}
              label="Select region view city"
              className="w-full"
            />
          )}
        />

        {loading ? (
          <SpinnerLoader />
        ) : (
          <ul className="mt-4 space-y-4">
            {cities?.map((city) => (
              <li
                key={city.cityId}
                className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-2 shadow-sm"
              >
                <p>{city.cityName}</p>

                <div className="flex h-fit items-center gap-4">
                  <EditCity
                    name={city.cityName}
                    id={city.cityId}
                    fetchConfig={getCities}
                    regionId={selectedRegion?.value}
                  />
                  <DeleteComponent
                    buttonVariant="outline"
                    name={city.cityName}
                    url={`${managementUrl}/DeleteCity/${city.cityId}/${city.cityName}/${user?.uid}`}
                    fetchConfig={getCities}
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

function EditCity({
  name,
  id,
  regionId,
  fetchConfig,
}: {
  name: string;
  id: number;
  regionId: number;
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
      cityName: name,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);
      const res = await fetch(`${managementUrl}/ModifyCity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          modifiedBy: user?.uid,
          regionId: regionId,
          cityId: id,
          cityName: data.cityName,
        }),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }
      reset();
      setFormLoading(false);
      toast.success('City successfully updated');
      fetchConfig();
    } catch (error) {
      toast.error('Failed to update city');
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
            <h4 className="mb-4"> Edit City</h4>

            <Input
              label="City Name"
              type="text"
              className="w-full"
              {...register('cityName')}
              size="md"
              placeholder="Enter new city name"
              error={errors.cityName?.message as string}
            />

            <Button
              type="submit"
              size="md"
              isLoading={formLoading}
              className="col-span-2 mt-6 w-fit min-w-20"
            >
              Update city
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
