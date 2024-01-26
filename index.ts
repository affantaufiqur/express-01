import express from "express";
import cartRoute from "./router/cart.js";
import productRoute from "./router/product.js";
import handleError from "./utils/error.js";

const app = express();
const port = 3020;
app.use(express.json());
app.use(productRoute);
app.use(cartRoute);

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
