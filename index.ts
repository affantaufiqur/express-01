import express from "express";
import { products } from "./products";
import { object, string, safeParse, number, boolean, minLength, integer, toMinValue } from "valibot";

const app = express();
const port = 3031;

app.use(express.json());

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
  const cartSchema = object({
    id: number([integer(), toMinValue(1)]),
    name: string([minLength(1)]),
    category: string([minLength(1)]),
    price: number([toMinValue(1)]),
    inStock: boolean(),
    description: string([minLength(1)]),
  });

  const parse = safeParse(cartSchema, req.body);
  if (parse.success) {
    res.json({ data: parse.output, status: 200, message: "success" });
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
