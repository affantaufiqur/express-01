import express from "express";
import cartRoute from "./router/cart.js";
import productRoute from "./router/product.js";

const app = express();
const port = 3020;

app.use(express.json());
app.use(productRoute);
app.use(cartRoute);

app.listen(port, () => console.log(`Example app listening on port ${port}`));
