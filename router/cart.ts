import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { safeParse } from "valibot";
import { db } from "../config/db.js";
import { products } from "../products.js";
import { cartSchema } from "../schema/cart.js";
import { generateRandomNumber } from "../utils/common.js";
import handleError from "../utils/error.js";
import { getProductById } from "../app/functions.js";

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
    const [results] = await getProductById(productId);
    if (results.length === 0) {
      handleError(res, 404, "Product not found");
      return;
    }
    if (results[0].in_stock === 0) {
      handleError(res, 400, "Product is out of stock");
      return;
    }
    const product = results[0] as (typeof products)[number];
    const [getCart] = await db.execute<RowDataPacket[]>(`select * from carts where cart_id = ${cartId}`);
    if (getCart.length === 0) {
      const generateId = generateRandomNumber();
      const [fields] = await db.execute<ResultSetHeader>(
        `insert into carts (cart_id, product_id, quantity, price) values (${generateId}, ${product.id}, ${parse.output.quantity}, (select price from products where id = ${productId})) on duplicate key update quantity = quantity + VALUES(quantity)`,
      );
      if (fields.affectedRows === 0) {
        handleError(res, 500, "Internal server error, code: INS_CART_01");
        return;
      } else {
        res.json({ message: "Cart created" });
        return;
      }
    }
    if (getCart[0].product_id === product.id && getCart[0].cart_id === cartId) {
      const [fields] = await db.execute<ResultSetHeader>(
        `update carts set quantity = quantity + ${parse.output.quantity} where product_id = ${product.id} and cart_id = ${cartId}`,
      );
      if (fields.affectedRows === 0) {
        handleError(res, 500, "Internal server error, code: UPD_CART_01");
        return;
      } else {
        res.json({ message: "Cart updated" });
        return;
      }
    }
    const [fields] = await db.execute<ResultSetHeader>(
      `insert into carts (cart_id, product_id, quantity, price) values (${cartId}, ${product.id}, ${req.body.quantity}, (select price from products where id = ${productId})) on duplicate key update quantity = quantity + VALUES(quantity)`,
    );
    if (fields.affectedRows === 0) handleError(res, 500, "Internal server error, code: UPD_CART_01");
    res.json({ message: "Cart updated" });
    return;
  } catch (err) {
    console.log(err);
    handleError(res, 500, "Internal server error");
    return;
  }
});

app.get("/cart", (_req, res) => {
  return;
});

app.delete("/cart/:id", (req, res) => {
  return;
});

export default app;
