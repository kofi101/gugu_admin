'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import FormGroup from '@/app/shared/form-group';
import cn from '@/utils/class-names';
import { useFormContext } from 'react-hook-form';
import { merchantUrl } from '@/config/base-url';
import { fetchUtil } from '@/utils/fetch';
import { SelectComponent } from './product-summary';
import { Textarea } from '@/components/ui/textarea';
import { getUserToken } from '@/utils/get-token';

export default function ProductTags({
  className,
  index,
  editMode = false,
}: {
  className?: string;
  index?: number;
  editMode?: boolean;
}) {
  const [size, setSize] = useState<string[]>([]);
  const [color, setColor] = useState<string[]>([]);
  const [material, setMaterial] = useState<string[]>([]);

  const {
    register,
    formState: { errors },
  } = useFormContext();

  const getAllConfigs = async () => {
    const token = await getUserToken();
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    const [sizeData, colorData, materialData] = await Promise.all([
      fetchUtil(`${merchantUrl}/Sizes`, fetchOptions),
      fetchUtil(`${merchantUrl}/Colours`, fetchOptions),
      fetchUtil(`${merchantUrl}/Materials`, fetchOptions),
    ]);

    setSize(sizeData);
    setColor(colorData);
    setMaterial(materialData);
  };

  const sizeOptions =
    size && size.map((i) => ({ label: i.size, value: i.sizesId }));

  const colorOptions =
    color && color.map((i) => ({ label: i.colour, value: i.coloursId }));

  const materialOptions =
    material &&
    material.map((i) => ({ label: i.material, value: i.materialsId }));

  useEffect(() => {
    getAllConfigs();
  }, []);

  return (
    <FormGroup
      title="Product variants"
      description="Add your product variants here"
      className={cn(className)}
    >
      <Input
        label="Price GHC"
        placeholder="Enter product price"
        {...register(`${editMode ? 'price' : 'price.' + index}`)}
        error={errors.price?.message as string}
        type="number"
        min={0}
        step={0.001}
      />

      <Input
        label="Quantity of products"
        placeholder="Available quantity"
        {...register(`${editMode ? 'quantity' : 'quantity.' + index}`)}
        error={errors.quantity?.message as string}
        type="number"
        min={0}
      />
      <SelectComponent
        labelText="Size"
        options={sizeOptions}
        register={register(`${editMode ? 'size' : 'size.' + index}`)}
        error={errors?.size?.message as string}
        placeholder="Select product size"
      />
      <SelectComponent
        labelText="Color"
        options={colorOptions}
        register={register(`${editMode ? 'color' : 'color.' + index}`)}
        error={errors?.color?.message as string}
        placeholder="Select product color"
      />
      <SelectComponent
        labelText="Material"
        options={materialOptions}
        register={register(`${editMode ? 'material' : 'material.' + index}`)}
        error={errors?.material?.message as string}
        placeholder="Select product material"
      />

      <Input
        label="Weight (Kg)"
        type="number"
        placeholder="Enter product weight"
        {...register(`${editMode ? 'weight' : 'weight.' + index}`)}
        error={errors.weight?.message as string}
        min={0}
        step={0.001}
      />
      <Textarea
        size="lg"
        label="Product description"
        className="col-span-2 [&>label>span]:font-medium"
        placeholder="Describe the product"
        {...register(`${editMode ? 'description' : 'description.' + index}`)}
        error={errors.description?.message as string}
      />
    </FormGroup>
  );
}

// interface SizeComponentProps {
//   name: string;
//   items: string[];
//   setItems: React.Dispatch<React.SetStateAction<string[]>>;
// }

// function SizeComponent({
//   name,
//   items,
//   setItems,
// }: SizeComponentProps): JSX.Element {
//   const { register, setValue } = useFormContext();
//   const [itemText, setItemText] = useState<string>('');

//   function handleItemAdd(): void {
//     if (itemText.trim() !== '') {
//       const newItem: string = itemText;

//       setItems([...items, newItem]);
//       setValue('size', [...items, newItem]);
//       setItemText('');
//     }
//   }

//   function handleItemRemove(text: string): void {
//     const updatedItems = items.filter((item) => item !== text);
//     setItems(updatedItems);
//   }

//   return (
//     <div>
//       <div className="flex items-end">
//         <Input
//           value={itemText}
//           label="Sizes"
//           placeholder={`Enter a ${name}`}
//           onChange={(e) => setItemText(e.target.value)}
//           prefix={<PiTagBold className="h-4 w-4" />}
//           className="w-full"
//         />
//         <input type="hidden" {...register('size', { value: items })} />
//         <Button
//           onClick={handleItemAdd}
//           className="ms-4 shrink-0 text-sm @lg:ms-5 dark:bg-gray-100 dark:text-white dark:active:bg-gray-100"
//         >
//           Add {name}
//         </Button>
//       </div>

//       {items.length > 0 && (
//         <div className="mt-3 flex flex-wrap gap-2">
//           {items.map((text, index) => (
//             <div
//               key={index}
//               className="flex items-center rounded-full border border-gray-300 py-1 pe-2.5 ps-3 text-sm font-medium text-gray-700"
//             >
//               {text}
//               <button
//                 onClick={() => handleItemRemove(text)}
//                 className="ps-2 text-gray-500 hover:text-gray-900"
//               >
//                 <PiXBold className="h-3.5 w-3.5" />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
// function ColorComponent({
//   name,
//   items,
//   setItems,
// }: SizeComponentProps): JSX.Element {
//   const { register, setValue } = useFormContext();
//   const [itemText, setItemText] = useState<string>('');

//   function handleItemAdd(): void {
//     if (itemText.trim() !== '') {
//       const newItem: string = itemText;

//       setItems([...items, newItem]);
//       setValue('color', [...items, newItem]);
//       setItemText('');
//     }
//   }

//   function handleItemRemove(text: string): void {
//     const updatedItems = items.filter((item) => item !== text);
//     setItems(updatedItems);
//   }

//   return (
//     <div>
//       <div className="flex items-end">
//         <Input
//           value={itemText}
//           label="Colors"
//           placeholder={`Enter a ${name}`}
//           onChange={(e) => setItemText(e.target.value)}
//           prefix={<PiTagBold className="h-4 w-4" />}
//           className="w-full"
//         />
//         <input type="hidden" {...register('color', { value: items })} />
//         <Button
//           onClick={handleItemAdd}
//           className="ms-4 shrink-0 text-sm @lg:ms-5 dark:bg-gray-100 dark:text-white dark:active:bg-gray-100"
//         >
//           Add {name}
//         </Button>
//       </div>

//       {items.length > 0 && (
//         <div className="mt-3 flex flex-wrap gap-2">
//           {items.map((text, index) => (
//             <div
//               key={index}
//               className="flex items-center rounded-full border border-gray-300 py-1 pe-2.5 ps-3 text-sm font-medium text-gray-700"
//             >
//               {text}
//               <button
//                 onClick={() => handleItemRemove(text)}
//                 className="ps-2 text-gray-500 hover:text-gray-900"
//               >
//                 <PiXBold className="h-3.5 w-3.5" />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
