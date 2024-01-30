import { number, minValue, object, string, boolean, minLength } from "valibot";

export const productSchema = object({
  name: string([minLength(1, "name is required")]),
  price: number([minValue(1, "price is required")]),
  in_stock: boolean(),
  description: string(),
});
