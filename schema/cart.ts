import { object, number, integer, string, toMinValue, minLength } from "valibot";

export const cartSchema = object({
  cart_id: string([minLength(1)]),
  product_id: number([toMinValue(1)]),
  quantity: number([integer()]),
});
