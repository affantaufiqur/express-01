import { object, string, number, boolean, minLength, integer, toMinValue } from "valibot";

export const cartSchema = object({
  id: number([integer(), toMinValue(1)]),
  name: string([minLength(1)]),
  category: string([minLength(1)]),
  price: number([toMinValue(1)]),
  inStock: boolean(),
  description: string([minLength(1)]),
  quantity: number([integer()]),
});
