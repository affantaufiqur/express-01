import { RowDataPacket } from "mysql2/promise";
import { db } from "../config/db.js";

export function getAllProducts() {
  return db.execute<RowDataPacket[]>(`select * from products`);
}

export function getProductById(id: number) {
  return db.execute<RowDataPacket[]>(`select * from products where id = ${id}`);
}
