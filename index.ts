import express from "express";
import { db, type ResultSetHeader, type RowDataPacket } from "./config/db.js";
import { books } from "./books";
import { safeParse } from "valibot";
import { cartSchema } from "./schema/cart.js";
import handleError from "./utils/error.js";
import { products } from "./products.js";
import { generateRandomNumber } from "./utils/common.js";

const app = express();
const port = 3020;
app.use(express.json());

app.get("/products", async (_req, res) => {
  const query = "select * from products";
  try {
    const [results] = await db.execute<RowDataPacket[]>(query);
    if (results.length === 0) return res.json({ message: "No products found" });
    return res.json(results);
  } catch (err) {
    return res.json({ message: "Error" });
  }
});

app.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }
  const query = `select * from products where id = ${id}`;
  try {
    const [results] = await db.execute<RowDataPacket[]>(query);
    if (results.length === 0) return res.json({ message: "Product not found" });
    return res.json(results);
  } catch (err) {
    return res.json({ message: "Error" });
  }
});

app.post("/cart", async (req, res) => {
  // check if id exist in product db
  const parse = safeParse(cartSchema, req.body);
  if (parse.issues) {
    res.json({ message: parse.issues[0].message, code: "INVALID_PARAMS" });
    return;
  }
  const productId = parse.output.product_id;
  const cartId = parse.output.cart_id;
  if (!productId || isNaN(productId)) {
    handleError(res, 400, "Invalid product id");
    return;
  }
  try {
    const [results] = await db.execute<RowDataPacket[]>(`select * from products where id = ${productId}`);
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
        `insert into carts (cart_id, product_id, quantity, price) values (${generateId}, ${product.id}, ${req.body.quantity}, (select price from products where id = ${productId})) on duplicate key update quantity = quantity + VALUES(quantity)`,
      );
      if (fields.affectedRows === 0) handleError(res, 500, "Internal server error, code: INS_CART_01");
      return;
    }
    if (getCart[0].product_id === product.id && getCart[0].cart_id === cartId) {
      const [fields] = await db.execute<ResultSetHeader>(
        `update carts set quantity = quantity + ${req.body.quantity} where product_id = ${product.id} and cart_id = ${cartId}`,
      );
      if (fields.affectedRows === 0) handleError(res, 500, "Internal server error, code: UPD_CART_01");
      res.json({ message: "Cart updated" });
      return;
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
  res.json({ data: cartData, status: 200, message: "Success" });
  return;
});

app.delete("/cart/:id", (req, res) => {
  if (cartData.length === 0) {
    handleError(res, 400, "Cart is empty");
    return;
  }
  if (!req.params.id) {
    handleError(res, 400, "Missing required fields");
    return;
  }
  const isValid = parseInt(req.params.id, 10);
  if (isNaN(isValid)) {
    handleError(res, 400, "ID must be a number");
    return;
  }
  const product = cartData.findIndex((cart) => cart.id === Number(req.params.id));
  if (product === -1) {
    handleError(res, 404, "Product not found");
    return;
  }
  cartData.splice(product, 1);
  res.json({ data: cartData, status: 200, message: "Product removed from cart" });
  return;
});

app.post("/checkout", (_req, res) => {
  if (cartData.length === 0) {
    handleError(res, 400, "Cart is empty");
    return;
  }
  checkoutData = cartData;
  const totalPrice = checkoutData.reduce((acc, init) => {
    return (acc = acc + init.price * init.quantity);
  }, 0);
  cartData = [];
  res.json({ data: checkoutData, status: 200, message: "Checkout successful", totalPrice });
  return;
});

app.get("/order", (_req, res) => {
  res.json({ data: checkoutData, status: 200, message: "Success" });
  return;
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
