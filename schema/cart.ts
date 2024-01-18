import { object, number, integer, toMinValue } from "valibot";

export const cartSchema = object({
  id: number([integer(), toMinValue(1)]),
  quantity: number([integer()]),
});

// const testRegex = object({
//     name: string([regex(/[a-z]/g, "hello")]),
// })
