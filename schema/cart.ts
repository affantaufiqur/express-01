import { object, string, number, boolean, minLength, integer, toMinValue } from "valibot";

export const cartSchema = object({
  id: number([integer(), toMinValue(1)]),
  quantity: number([integer()]),
});
