import { Router } from "express";
import { getAllProducts, getProductById } from "../app/functions.js";

const app = Router();

app.get("/products", async (_req, res) => {
  try {
    const [results] = await getAllProducts();
    if (results.length === 0) return res.json({ message: "No products found" });
    return res.json(results);
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
    const [results] = await getProductById(id);
    if (results.length === 0) return res.json({ message: "Product not found" });
    return res.json(results);
  } catch (err) {
    return res.json({ message: "Error" });
  }
});

export default app;
