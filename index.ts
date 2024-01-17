import express from "express";
import { products } from "./products";
import { cartSchema } from "./schema/cart";
import { safeParse, Input } from "valibot";

const app = express();
const port = 3031;

app.use(express.json());

let carts = [] as Input<typeof cartSchema>[];

app.get("/products", (_req, res) => {
  res.json({ data: products, status: 200 });
});

app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((product) => product.id === id);
  if (product) {
    res.json({ data: product, status: 200 });
  }
  res.json({ data: null, status: 404 });
  return;
});

app.post("/cart", (req, res) => {
  const parse = safeParse(cartSchema, req.body);
  if (parse.success) {
    let quantity = parse.output.quantity;
    const sameProduct = carts.find((cart) => cart.id === parse.output.id);

    if (sameProduct) {
      carts[carts.indexOf(sameProduct)].quantity += quantity;
      res.json({ data: carts, status: 200, message: "success" });
      return;
    }

    carts.push(parse.output);
    res.json({ data: carts, status: 200, message: "success" });
    return;
  }

  const message = parse.issues[0].message === "Invalid type" ? "Missing required fields" : parse.issues[0].message;
  res.json({ data: null, status: 400, message });
  return;
});

app.get("/cart", (_req, res) => {
  res.json({ cart: "" });
  return;
});

app.get("/order", (_req, res) => {
  res.json({ orders: "" });
  return;
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
