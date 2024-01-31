import prisma from "../config/prisma.js";

export async function findByCartId(cartId: string) {
  try {
    const cartData = await prisma.carts.findMany({
      where: { cart_id: cartId },
    });
    if (!cartData || cartData.length === 0) {
      return {
        data: null,
        message: "Cart not found",
        code: "CART_NOT_FOUND",
      };
    }
    return { data: cartData, message: "Success", code: "FND_SUCC_PRODUCTS" };
  } catch (err) {
    return {
      data: null,
      message: "Error",
      code: "ERR_GET_CART_BY_ID",
    };
  }
}
