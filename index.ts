import express from "express";
import { safeParse } from "valibot";
import { products } from "./products";
import { cartSchema } from "./schema/cart";
import handleError from "./utils/error";

const app = express();
const port = 3031;

app.use(express.json());

type product = (typeof products)[number] & { quantity: number };
let cartData: product[] = [];
let checkoutData: product[] = [];

app.get("/products", (_req, res) => {
  res.json({ data: products, status: 200, message: "Success" });
  return;
});

app.get("/products/:id", (req, res) => {
  if (!req.params.id) {
    handleError(res, 400, "Missing required fields");
    return;
  }
  if (typeof req.params.id !== "number") {
    handleError(res, 400, "ID must be a number");
    return;
  }
  const id = Number(req.params.id);
  const product = products.find((product) => product.id === id);
  if (product) {
    res.json({ data: product, status: 200, message: "Product found" });
    return;
  }
  handleError(res, 404, "Product not found");
  return;
});

app.post("/cart", (req, res) => {
  const parse = safeParse(cartSchema, req.body);
  if (parse.success) {
    const findProduct = products.find((product) => product.id === parse.output.id);

    if (!findProduct) {
      handleError(res, 404, "Product not found");
      return;
    }

    function addToCart(product: (typeof products)[number], quantity: number) {
      const sameProduct = cartData.findIndex((cart) => cart.id === product.id);

      if (sameProduct === -1) {
        const productWithQuantity = { ...product, quantity: quantity === 0 ? 1 : quantity };
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

    findProduct.inStock
      ? addToCart(findProduct, parse.output.quantity)
      : handleError(res, 400, "Cant add product to cart");
    return;
  }

  handleError(res, 400, "Missing required fields");
  return;
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
  console.log("run here");
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
