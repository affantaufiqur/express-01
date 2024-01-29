import { db, RowDataPacket } from "../config/db.js";

export function getAllProducts() {
  return db.execute<RowDataPacket[]>(`select * from products`);
}

export function getProductById(id: number) {
  return db.execute<RowDataPacket[]>(`select * from products where id = ${id}`);
}

export function getAllFromQuery(tableName: string) {
  return db.execute<RowDataPacket[]>(`select * from ${tableName}`);
}
