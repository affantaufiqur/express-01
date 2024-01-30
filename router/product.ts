import { Router } from "express";
import prisma from "../config/prisma.js";
import { safeParse } from "valibot";
import { productSchema } from "../schema/product.js";

const app = Router();

app.get("/products", async (_req, res) => {
  try {
    const testing = await prisma.products.findMany();
    return res.json(testing);
  } catch (err) {
    return res.json({ message: "Error" });
  }
});

app.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  try {
    const data = await prisma.products.findUnique({
      where: { id },
      select: {
        name: true,
        in_stock: true,
        price: true,
      },
    });
    if (!data) {
      return res.json({ message: "Product not found" });
    }
    return res.json({ data, messsage: "Success" });
  } catch (err) {
    return res.json({ message: "Error" });
  }
});

app.post("/products", async (req, res) => {
  const parse = safeParse(productSchema, req.body);
  if (parse.issues) {
    return res.json({ message: parse.issues[0].message, code: "INVALID_PARAMS" });
  }
  const data = parse.output;
  try {
    await prisma.products.create({ data });
    res.json({ message: "Success adding new product" });
    return;
  } catch (err) {
    return res.json({ message: "Error", code: "INS_ERR_PRODUCTS_1" });
  }
});

export default app;
