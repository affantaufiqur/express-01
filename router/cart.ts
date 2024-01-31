import { Router } from "express";
import { safeParse } from "valibot";
import { cartSchema } from "../schema/cart.js";
import { generateRandomNumber } from "../utils/common.js";
import handleError from "../utils/error.js";
import { findUniqueProduct } from "../app/product-controller.js";
import { findByCartId } from "../app/cart-controller.js";
import prisma from "../config/prisma.js";

const app = Router();

app.post("/cart", async (req, res) => {
  const parse = safeParse(cartSchema, req.body);
  if (parse.issues) {
    res.json({ message: parse.issues[0].message, code: "INVALID_PARAMS" });
    return;
  }
  const productId = parse.output.product_id;
  const cartId = parse.output.cart_id;

  try {
    const getProduct = await findUniqueProduct(productId);
    if (!getProduct) {
      return res.json({ message: "Product did not exist" });
    }
    if (!getProduct.in_stock) {
      return res.json({ message: "Product is out of stock" });
    }

    return await prisma.$transaction(async (tx) => {
      const getCart = await findByCartId(cartId);
      const finalData = { ...parse.output, price: parse.output.quantity * getProduct.price };

      if (getCart.data?.length === 0) {
        const newCart = await tx.carts.create({ data: finalData });
        return res.json({ message: "Success adding new", data: newCart });
      }

      const existingProduct = await tx.carts.findUnique({
        where: { cart_id_product_id: { cart_id: cartId, product_id: productId } },
      });

      if (existingProduct) {
        const quantity = existingProduct.quantity! + parse.output.quantity;
        const updateCart = await tx.carts.update({
          where: { cart_id_product_id: { cart_id: cartId, product_id: productId } },
          data: {
            quantity,
            price: quantity * getProduct.price,
          },
        });
        return res.json({ message: "Success updating", data: updateCart });
      } else {
        const newCart = await tx.carts.create({ data: finalData });
        return res.json({ message: "Success adding new", data: newCart });
      }
    });
  } catch (err) {
    console.log(err);
    handleError(res, 500, "Internal server error");
    return;
  }
});

app.get("/cart", async (req, res) => {
  const cartId = req.body.cart_id;
  if (!cartId) {
    return res.json({ message: "Cart id is required" });
  }
  try {
    const getCart = await findByCartId(cartId);
    if (!getCart.data) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const totalItem = getCart.data.reduce((a, b) => a + b.quantity!, 0);
    const totalPrice = getCart.data.reduce((a, b) => a + Number(b.price!), 0);
    const finalData = { ...getCart, totalItem, total_price: `$${totalPrice}` };

    return res.json(finalData);
  } catch (err) {
    return res.json({ message: "Error", code: "ERR_GET_CART_BY_ID" });
  }
});

app.delete("/cart/:id", async (req, res) => {
  const cartId = req.params.id;

  if (!cartId) {
    return res.json({ message: "Cart id is required" });
  }

  try {
    const getCart = await findByCartId(cartId);
    if (!getCart.data) {
      return res.status(404).json({ message: "Cart not found" });
    }
    await prisma.carts.deleteMany({ where: { cart_id: cartId } });
    return res.json({ message: "Success deleting cart" });
  } catch (err) {
    return res.json({ message: "Error", code: "DEL_ERR_CARTS_1" });
  }
});

export default app;
