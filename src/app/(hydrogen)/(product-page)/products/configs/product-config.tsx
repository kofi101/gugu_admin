import React, { SetStateAction, useEffect, useState } from 'react';

import FormGroup from '@/app/shared/form-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MdOutlineClose, MdOutlineEdit } from 'react-icons/md';
import { auth } from '@/config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { baseUrl, merchantUrl } from '@/config/base-url';
import { useForm } from 'react-hook-form';
import { Modal, Text, ActionIcon } from 'rizzui';
import { Unauthorized } from './page';
import { getUserToken } from '@/utils/get-token';
import { fetchUtil } from '@/utils/fetch';
import { SpinnerLoader } from '@/components/ui/spinner';

export const MerchantSizeConfig = ({
  userToken,
  userId,
}: {
  userToken: string;
  userId?: string;
}): React.ReactElement => {
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [sizeData, setSizeData] = useState([]);

  const fetchConfigData = async () => {
    setLoading(true);
    try {
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + userToken,
        },
      };

      const data = await fetchUtil(`${baseUrl}/Merchant/Sizes`, fetchOptions);
      setSizeData(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch sizes');
      setLoading(false);
      console.error(`Failed to fetch size data`, error);
    }
  };

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({});

  const onSubmit = async (formData) => {
    setFormLoading(true);

    try {
      if (formData['size'] === '') {
        setFormLoading(false);
        return toast.error(<Text>{`Size cannot be empty`}</Text>);
      }

      const response = await fetch(`${merchantUrl}/AddSizes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + userToken,
        },
        body: JSON.stringify({
          sizesId: 0,
          size: formData['size'],
          createdBy: userId,
        }),
      });

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        throw new Error('Failed to add size');
      }

      setFormLoading(false);
      setRefresh((prev) => !prev);
      reset();
      toast.success(<Text>{'Size added successfully'}</Text>);
    } catch (error) {
      console.error(error);
      setFormLoading(false);
      toast.error(
        <Text as="b" className="font-semibold text-gray-900">
          {error?.message}
        </Text>
      );
    }
  };

  useEffect(() => {
    fetchConfigData();
  }, [refresh]);

  return (
    <div className="border-b pb-4 md:w-full md:rounded-md md:border-b-0  md:pb-0">
      <FormGroup
        className="md:border md:p-6"
        title="Size"
        description="Add new size"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="gap-4 md:flex">
          <Input
            {...register('size', {
              required: `Size is required`,
            })}
            placeholder="Enter new size"
            type="text"
            error={errors['size']?.message as string}
            className="w-full md:w-96 lg:w-3/5"
          />
          <Button
            type="submit"
            isLoading={formLoading}
            size="md"
            rounded="lg"
            color="primary"
            className="mt-4 w-20 bg-black md:mt-0 md:w-28"
          >
            Add
          </Button>
        </form>
      </FormGroup>

      <div className="h-64 overflow-auto">
        {loading && <SpinnerLoader />}
        {!loading &&
          sizeData &&
          sizeData?.map((i, index) => (
            <ListConfigDetails
              key={`${index}-${i}`}
              index={index}
              name={i?.size}
              id={i?.sizesId}
              parentName={'size'}
              setRefresh={setRefresh}
            />
          ))}
      </div>
    </div>
  );
};

export const MerchantColorConfig = ({
  userToken,
  userId,
}: {
  userToken: string;
  userId?: string;
}): React.ReactElement => {
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [colorData, setColorData] = useState([]);

  const fetchConfigData = async () => {
    setLoading(true);
    try {
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + userToken,
        },
      };

      const data = await fetchUtil(`${baseUrl}/Merchant/Colours`, fetchOptions);
      setColorData(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch colors');
      setLoading(false);
      console.error(`Failed to fetch color data`, error);
    }
  };

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({});

  const onSubmit = async (formData) => {
    setFormLoading(true);

    try {
      if (formData['color'] === '') {
        setFormLoading(false);
        return toast.error(<Text>{`Color cannot be empty`}</Text>);
      }

      const response = await fetch(`${merchantUrl}/AddColours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + userToken,
        },
        body: JSON.stringify({
          coloursId: 0,
          colour: formData['color'],
          createdBy: userId,
        }),
      });

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        throw new Error('Failed to add color');
      }

      setFormLoading(false);
      setRefresh((prev) => !prev);
      reset();

      toast.success(<Text>{'Color added successfully'}</Text>);
    } catch (error) {
      console.error(error);
      setFormLoading(false);
      toast.error(
        <Text as="b" className="font-semibold text-gray-900">
          {error?.message}
        </Text>
      );
    }
  };

  useEffect(() => {
    fetchConfigData();
  }, [refresh]);

  return (
    <div className="border-b pb-4 md:w-full md:rounded-md md:border-b-0  md:pb-0">
      <FormGroup
        className="md:border md:p-6"
        title="Color"
        description="Add new color"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="gap-4 md:flex">
          <Input
            {...register('color', {
              required: `Color is required`,
            })}
            placeholder="Enter new color"
            type="text"
            error={errors['color']?.message as string}
            className="w-full md:w-96 lg:w-3/5"
          />
          <Button
            type="submit"
            isLoading={formLoading}
            size="md"
            rounded="lg"
            color="primary"
            className="mt-4 w-20 bg-black md:mt-0 md:w-28"
          >
            Add
          </Button>
        </form>
      </FormGroup>

      <div className="h-64 overflow-auto">
        {loading && <SpinnerLoader />}
        {!loading &&
          colorData &&
          colorData?.map((i, index) => (
            <ListConfigDetails
              key={`${index}-${i}`}
              index={index}
              name={i.colour}
              id={i.coloursId}
              parentName={'colour'}
              setRefresh={setRefresh}
            />
          ))}
      </div>
    </div>
  );
};
export const MerchantMaterialConfig = ({
  userToken,
  userId,
}: {
  userToken: string;
  userId?: string;
}): React.ReactElement => {
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [materialData, setMaterialData] = useState([]);

  const fetchConfigData = async () => {
    setLoading(true);
    try {
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + userToken,
        },
      };

      const data = await fetchUtil(
        `${baseUrl}/Merchant/Materials`,
        fetchOptions
      );
      setMaterialData(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(`Failed to fetch material data`, error);
    }
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({});

  const onSubmit = async (formData) => {
    setFormLoading(true);

    try {
      if (formData['material'] === '') {
        setFormLoading(false);
        return toast.error(<Text>{`Material cannot be empty`}</Text>);
      }

      const response = await fetch(`${merchantUrl}/AddMaterials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + userToken,
        },
        body: JSON.stringify({
          materialsId: 0,
          material: formData['material'],
          createdBy: userId,
        }),
      });

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        throw new Error('Failed to add material');
      }

      setFormLoading(false);
      setRefresh((prev) => !prev);

      toast.success(<Text>{'Material added successfully'}</Text>);
    } catch (error) {
      console.error(error);
      setFormLoading(false);
      toast.error(
        <Text as="b" className="font-semibold text-gray-900">
          {error?.message}
        </Text>
      );
    }
  };

  useEffect(() => {
    fetchConfigData();
  }, [refresh]);

  return (
    <div className="border-b pb-4 md:w-full md:rounded-md md:border-b-0  md:pb-0">
      <FormGroup
        className="md:border md:p-6"
        title="Material"
        description="Add new material"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="gap-4 md:flex">
          <Input
            {...register('material', {
              required: `Material is required`,
            })}
            placeholder="Enter new "
            type="text"
            error={errors['material']?.message as string}
            className="w-full md:w-96 lg:w-3/5"
          />
          <Button
            type="submit"
            isLoading={formLoading}
            size="md"
            rounded="lg"
            color="primary"
            className="mt-4 w-20 bg-black md:mt-0 md:w-28"
          >
            Add
          </Button>
        </form>
      </FormGroup>

      <div className="h-64 overflow-auto">
        {loading && <SpinnerLoader />}
        {!loading &&
          materialData &&
          materialData?.map((i, index) => (
            <ListConfigDetails
              key={`${index}-${i?.material}`}
              index={index}
              name={i?.material}
              id={i?.materialsId}
              parentName={'material'}
              setRefresh={setRefresh}
            />
          ))}
      </div>
    </div>
  );
};

export const ListConfigDetails = ({
  index,
  id,
  name,
  parentName,
  setRefresh,
}: {
  index: number;
  id?: number;
  name?: string;
  parentName: string;
  setRefresh: React.Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="my-4 flex h-12 w-full items-center justify-between rounded border px-4 shadow">
      <div>
        <span className="mr-4">{index + 1}.</span>
        <span>{name}</span>
      </div>
      <div className="flex h-2/3 w-fit items-center gap-6">
        <EditConfigList
          setRefresh={setRefresh}
          itemName={name}
          itemId={id}
          parentName={parentName}
        />
      </div>
    </div>
  );
};

export default function EditConfigList({
  setRefresh,
  itemName,
  itemId,
  parentName,
}: {
  setRefresh: React.Dispatch<SetStateAction<boolean>>;
  itemName?: string;
  itemId?: number;
  parentName: string;
}) {
  const [modalState, setModalState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      [parentName]: itemName,
    },
  });

  const handleUpdate = async (formData) => {
    try {
      const token = await getUserToken();
      const sendData = {
        [`${parentName}sId`]: itemId,
        [parentName]: formData[`${parentName}`],
        modifiedBy: user?.uid,
      };
      setLoading(true);
      const res = await fetch(
        `${merchantUrl}/Modify${
          parentName.charAt(0).toUpperCase() + parentName.slice(1)
        }`,
        {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify(sendData),
        }
      );

      setModalState(false);
      if (!res.ok) {
        setLoading(false);
        setModalState(false);
        return toast.error(<Text>Failed to update, something went wrong</Text>);
      }
      reset();
      setRefresh((prev) => !prev);
      setLoading(false);
      toast.success(<Text>Update successful</Text>);
    } catch (err) {
      setLoading(false);
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

          <form
            onSubmit={handleSubmit(handleUpdate)}
            className="flex flex-col items-center [&_label>span]:font-medium"
          >
            <Input
              type="text"
              label="Modify item"
              inputClassName="border-2"
              size="lg"
              className="w-full"
              {...register(`${parentName}`)}
              placeholder="Enter new item name"
            />

            <Button
              type="submit"
              size="md"
              isLoading={loading}
              className="col-span-2 mt-6 w-fit min-w-20"
            >
              Update {parentName.charAt(0).toUpperCase() + parentName.slice(1)}
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
