import express from "express";
import { products } from "./products";
import { cartSchema } from "./schema/cart";
import { safeParse } from "valibot";

const app = express();
const port = 3031;

app.use(express.json());

type product = (typeof products)[number] & { quantity: number };
let cartData: product[] = [];

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

  function isInStock(product: (typeof products)[number]) {
    return product.inStock;
  }

  function addToCart(product: (typeof products)[number], quantity: number) {
    const sameProduct = cartData.findIndex((cart) => cart.id === product.id);

    if (sameProduct === -1) {
      const productWithQuantity = { ...product, quantity };
      cartData.push(productWithQuantity);
      res.json({
        data: cartData,
        status: 200,
        message: "New product added to cart",
      });
      return;
    }

    const updatedQuantity = cartData[sameProduct].quantity + quantity;
    const updatedProduct = { ...cartData[sameProduct], quantity: updatedQuantity };
    cartData[sameProduct] = updatedProduct;
    res.json({
      data: cartData,
      status: 200,
      message: "Product quantity increased",
    });
    return;
  }

  if (parse.success) {
    const findProduct = products.find((product) => product.id === parse.output.id);
    if (!findProduct) {
      res.json({ data: null, status: 404, message: "Product not found" });
      return;
    }

    isInStock(findProduct)
      ? addToCart(findProduct, parse.output.quantity)
      : res.json({ data: cartData, status: 400, message: "Can't add product to cart, out of stock" });
    return;
  }

  res.json({ data: null, status: 400, message: "Bad request" });
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
