import { z } from 'zod';
import { fileSchema } from '@/utils/validators/common-rules';

export const productFormSchema = z.object({
  productName: z.string().min(1, { message: 'Product name is required' }),
  productCode: z.string().min(1, { message: 'Product code is required' }),
  productType: z.enum(['Single', 'Variant'], {
    errorMap: (issue, ctx) => ({ message: 'Product type is required' }),
  }),
  category: z.string(),
  brand: z.string(),
  size: z.string().array().nonempty().min(1, { message: 'Size is required' }),
  color: z.string().array().nonempty().min(1, { message: 'Color is required' }),
  material: z
    .string()
    .array()
    .nonempty()
    .min(1, { message: 'Material is required' }),
  weight: z
    .string()
    .array()
    .nonempty()
    .min(1, { message: 'Weight is required' }),
  subCategory: z.string(),
  description: z.string().array().nonempty().optional(),
  price: z.coerce
    .number()
    .array()
    .nonempty()
    .min(1, { message: 'Price is required' }),
  promotionPrice: z.coerce.number().optional(),
  discountPercentage: z.coerce.number().optional(),
  quantity: z.coerce
    .number()
    .array()
    .nonempty()
    .min(1, { message: 'Available quantity is required' }),
  promotion: z.boolean().optional(),
  discount: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const editProductFormSchema = z.object({
  productName: z.string().min(1, { message: 'Product name is required' }),
  productCode: z.string().min(1, { message: 'Product code is required' }),
  category: z.string(),
  brand: z.string(),
  size: z.string().min(1, { message: 'Size is required' }),
  color: z.string().min(1, { message: 'Color is required' }),
  material: z.string().min(1, { message: 'Material is required' }),
  weight: z.string().min(1, { message: 'Weight is required' }),
  subCategory: z.string(),
  description: z.string().optional(),
  price: z.coerce.number().min(1, { message: 'Price is required' }),
  promotionPrice: z.coerce.number().optional(),
  discountPercentage: z.coerce.number().optional(),
  quantity: z.coerce
    .number()
    .min(1, { message: 'Available quantity is required' }),
  promotion: z.boolean().optional(),
  discount: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof productFormSchema>;
