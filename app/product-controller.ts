import prisma from "../config/prisma.js";
import { Input as Infer } from "valibot";
import { productSchema, updateProductSchema } from "../schema/product.js";

export async function findUniqueProduct(id: number) {
  return await prisma.products.findUnique({ where: { id } });
}

export async function insertProduct(data: Infer<typeof productSchema>) {
  try {
    return await prisma.products.create({ data });
  } catch (err) {
    return {
      message: "Error",
      code: "INS_ERR_PRODUCTS_1",
    };
  }
}

export async function updateProduct({ data, id }: { data: Infer<typeof updateProductSchema>; id: number }) {
  try {
    await prisma.$transaction(async (tx) => {
      const product = await findUniqueProduct(id);
      if (!product) {
        return {
          message: "Product not found",
          code: "UPD_NOT_FOUND_PRODUCTS_1",
        };
      }
      return await tx.products.update({
        where: { id },
        data,
      });
    });
  } catch (err) {
    return {
      message: "Error",
      code: "UPD_ERR_PRODUCTS_1",
    };
  }
}
