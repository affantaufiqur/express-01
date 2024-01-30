import { number, minValue, object, string, boolean, minLength, optional } from "valibot";

export const productSchema = object({
  name: string([minLength(1, "name is required")]),
  price: number([minValue(1, "price is required")]),
  in_stock: boolean(),
  description: string(),
});

export const updateProductSchema = object({
  name: optional(string()),
  price: optional(number()),
  in_stock: optional(boolean()),
  description: optional(string()),
});
