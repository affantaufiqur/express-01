import { object, number, integer, toMinValue } from "valibot";

export const cartSchema = object({
  cart_id: number([toMinValue(1)]),
  product_id: number([toMinValue(1)]),
  quantity: number([integer()]),
});
