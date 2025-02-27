import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Modal, ActionIcon } from 'rizzui';
import { MdOutlineClose, MdOutlineEdit } from 'react-icons/md';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SpinnerLoader } from '@/components/ui/spinner';
import { managementUrl } from '@/config/base-url';
import { getUserToken } from '@/utils/get-token';
import { fetchUtil } from '@/utils/fetch';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { DeleteComponent } from '../../delete/delete';

type Region = {
  regionId: number;
  regionName: string;
};

type City = {
  regionId: number;
  cityId: number;
  cityName: string;
};

type PickUpType = {
  pickupStationName: string;
  address: string;
  locationDetails: string;
  contactionInformation: string;
  pickupStationId: number;
  regionId: number;
  cityId: number;
};

export const PickupStation = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pickUpStations, setPickUpStations] = useState<PickUpType[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [searchRegion, setSearchRegion] = useState<Region | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const fetchData = async (url: string, setter: (data: any) => void) => {
    try {
      const token = await getUserToken();
      const data = await fetchUtil(url, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setter(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getRegions = () => fetchData(`${managementUrl}/Regions`, setRegions);
  const getCities = (regionId: number) =>
    fetchData(`${managementUrl}/Cities/${regionId}`, setCities);
  const getPickupStations = () => {
    if (!searchRegion || !selectedCity) return;
    fetchData(
      `${managementUrl}/PickupStation/${searchRegion?.value}/${selectedCity?.value}`,
      setPickUpStations
    );
  };

  useEffect(() => {
    if (selectedRegion) getCities(selectedRegion.value);
  }, [selectedRegion]);

  useEffect(() => {
    if (searchRegion) getCities(searchRegion.value);
  }, [searchRegion]);

  useEffect(() => {
    if (selectedCity) getPickupStations();
  }, [selectedCity]);

  useEffect(() => {
    getRegions();
  }, []);

  const onSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const token = await getUserToken();

      const sendData = {
        pickupStationId: 0,
        pickupStationName: formData.pickupStationName,
        address: formData.address,
        locationDetails: formData.locationDetails,
        contactionInformation: formData.contactionInformation,
        regionId: formData?.regionId?.value,
        cityId: formData.cityId?.value,
        createdBy: user?.uid,
      };

      const fetchOptions = {
        method: 'POST',
        body: JSON.stringify(sendData),
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      };

      await fetchUtil(`${managementUrl}/AddPickupStation`, fetchOptions);

      toast.success('Pickup Station successfully added');
      reset();
      setFormLoading(false);
    } catch (error) {
      setFormLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="w-full rounded-lg bg-white p-6 shadow-md md:w-2/3">
      <h4 className="mb-6 text-xl font-bold">Add Pickup Station</h4>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="regionId"
            control={control}
            rules={{ required: 'Region selection is required' }}
            render={({ field: { onChange, value } }) => (
              <Select
                options={regions.map((region) => ({
                  label: region.regionName,
                  value: region.regionId,
                }))}
                value={value}
                onChange={(selected) => {
                  onChange(selected);
                  setSelectedRegion(selected);
                  setCities([]);
                }}
                label="Region"
                className="w-full"
                error={errors.regionId?.message as string}
              />
            )}
          />

          <Controller
            name="cityId"
            control={control}
            rules={{ required: 'City selection is required' }}
            render={({ field: { onChange, value } }) => (
              <Select
                options={cities?.map((city) => ({
                  label: city.cityName,
                  value: city.cityId,
                }))}
                value={value}
                onChange={(selected) => {
                  onChange(selected);
                }}
                label="City"
                className="w-full"
                error={errors.cityId?.message as string}
              />
            )}
          />

          <Input
            label="Pickup Station Name"
            type="text"
            {...register('pickupStationName', {
              required: 'Pickup station name is required',
            })}
            placeholder="Enter pickup station name"
            error={errors.pickupStationName?.message as string}
          />

          <Input
            label="Address"
            type="text"
            {...register('address', {
              required: 'Address is required',
            })}
            placeholder="Enter address"
            error={errors.address?.message as string}
          />

          <Input
            label="Location Details"
            type="text"
            {...register('locationDetails', {
              required: 'Location details are required',
            })}
            placeholder="Enter location details"
            error={errors.locationDetails?.message as string}
          />

          <Input
            label="Contact Information"
            type="text"
            {...register('contactionInformation', {
              required: 'Contact information is required',
            })}
            placeholder="Enter contact information"
            error={errors.contactionInformation?.message as string}
          />
        </div>

        <Button isLoading={formLoading} type="submit">
          Add Pickup Station
        </Button>
      </form>

      <div className="mt-16">
        <h3 className="mb-4 text-lg font-semibold">Stations</h3>
        <div className="flex flex-col gap-4 md:flex-row">
          <Select
            options={regions?.map((region) => ({
              label: region.regionName,
              value: region.regionId,
            }))}
            value={searchRegion}
            onChange={(value) => {
              setSearchRegion(value);
            }}
            label="Select region"
            className="w-full"
          />

          <Select
            options={cities?.map((city) => ({
              label: city.cityName,
              value: city.cityId,
            }))}
            value={selectedCity}
            onChange={(value) => {
              setSelectedCity(value);
            }}
            label="Select city to view stations"
          />
        </div>

        {loading ? (
          <SpinnerLoader />
        ) : (
          <ul className="mt-4 space-y-4">
            {pickUpStations?.length < 1 && (
              <p className="mt-8 text-center">No pick up station found</p>
            )}
            {pickUpStations?.map((station) => (
              <li
                key={station?.pickupStationName}
                className="flex flex-col rounded-lg bg-gray-100 px-4 py-2 shadow-sm"
              >
                <div className="flex justify-between">
                  <p className="font-semibold">{station?.pickupStationName}</p>
                  <div className="flex h-fit items-center gap-4">
                    <EditPickupStation
                      pickupStationName={station?.pickupStationName}
                      address={station?.address}
                      locationDetails={station?.locationDetails}
                      contactionInformation={station?.contactionInformation}
                      pickupStationId={station?.pickupStationId}
                      regionId={station?.regionId}
                      cityId={station?.cityId}
                    />
                    <DeleteComponent
                      buttonVariant="outline"
                      name={station?.pickupStationName}
                      url={`${managementUrl}/DeletePickupStation/${station?.pickupStationId}/${station.pickupStationName}/${user?.uid}`}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{station?.address}</p>
                <p className="text-sm text-gray-600">
                  {station?.locationDetails}
                </p>
                <p className="text-sm text-gray-600">
                  {station?.contactionInformation}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const EditPickupStation = ({
  pickupStationId,
  pickupStationName,
  address,
  locationDetails,
  contactionInformation,
  regionId,
  cityId,
}: {
  pickupStationId: number;
  pickupStationName: string;
  address: string;
  locationDetails: string;
  contactionInformation: string;
  regionId: number;
  cityId: number;
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
      pickupStationName,
      address,
      locationDetails,
      contactionInformation,
      regionId,
      cityId,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = await getUserToken();
      setFormLoading(true);

      const updatedData = {
        pickupStationId,
        pickupStationName: data.pickupStationName,
        address: data.address,
        locationDetails: data.locationDetails,
        contactionInformation: data.contactionInformation,
        regionId: regionId,
        cityId: cityId,
        modifiedBy: user?.uid,
      };

      const res = await fetch(`${managementUrl}/ModifyPickupStation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(updatedData),
      });

      if (res.status === 401) {
        setFormLoading(false);
        return toast.error('Unauthorized access');
      }
      reset();
      setFormLoading(false);
      toast.success('Pickup Station successfully updated');

      setModalState(false);
    } catch (error) {
      setFormLoading(false);
      toast.error('Failed to update pickup station');
      console.error(error);
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
            <h4 className="mb-4"> Edit Pickup Station</h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Pickup Station Name"
                type="text"
                className="w-full"
                {...register('pickupStationName', {
                  required: 'Pickup station name is required',
                })}
                size="md"
                placeholder="Enter pickup station name"
                error={errors.pickupStationName?.message as string}
              />

              <Input
                label="Address"
                type="text"
                className="w-full"
                {...register('address', {
                  required: 'Address is required',
                })}
                size="md"
                placeholder="Enter address"
                error={errors.address?.message as string}
              />

              <Input
                label="Location Details"
                type="text"
                className="w-full"
                {...register('locationDetails', {
                  required: 'Location details are required',
                })}
                size="md"
                placeholder="Enter location details"
                error={errors.locationDetails?.message as string}
              />

              <Input
                label="Contact Information"
                type="text"
                className="w-full"
                {...register('contactionInformation', {
                  required: 'Contact information is required',
                })}
                size="md"
                placeholder="Enter contact information"
                error={errors.contactionInformation?.message as string}
              />
            </div>

            <Button
              type="submit"
              size="md"
              isLoading={formLoading}
              className="col-span-2 mt-6 w-fit min-w-20"
            >
              Update Pickup Station
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};
