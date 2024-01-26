import express from "express";
import { books } from "../books";
import { db } from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const app = express();
const port = 3000;
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// change db_name = bookstore
app.get("/books", (_req, res) => {
  const query = "select * from books";
  db.execute<RowDataPacket[]>(query, (err, result) => {
    if (err) res.json({ message: err?.message });
    if (result.length === 0) res.json({ message: "No books found" });
    res.json(result);
    result;
  });
  return;
});

app.get("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid book id" });
    return;
  }
  const query = `select * from books where id = ${id}`;
  db.execute<RowDataPacket[]>(query, (err, result) => {
    if (err) res.json({ message: err?.message });
    if (result.length === 0) res.json({ message: "Book not found" });
    res.json(result[0]);
    return;
  });
  return;
});

app.post("/books", (req, res) => {
  const { title, author, publication_year, genre, isbn }: (typeof books)[number] = req.body;
  if (!title || !author || !publication_year || !genre || !isbn) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const query = `insert into books (title, author, publication_year, genre, isbn) values ('${title}', '${author}', ${publication_year}, '${genre}', '${isbn}')`;
  db.execute<ResultSetHeader>(query, (err, result) => {
    if (err) res.json({ message: err?.message });
    if (result.affectedRows === 0) res.json({ message: "Book not created" });
    res.json(result);
    return;
  });
  return;
});

app.put("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid book id" });
    return;
  }
  const { title, author, publication_year, genre, isbn }: (typeof books)[number] = req.body;
  if (!title || !author || !publication_year || !genre || !isbn) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const query = `update books set title = '${title}', author = '${author}', publication_year = ${publication_year}, genre = '${genre}', isbn = '${isbn}' where id = ${id}`;
  db.execute<ResultSetHeader>(query, (err, result) => {
    if (err) res.json({ message: err?.message });
    if (result.affectedRows === 0) res.json({ message: "Book not updated" });
    res.json(result);
    return;
  });
  return;
});

app.delete("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid book id" });
    return;
  }
  const query = `delete from books where id = ${id}`;
  db.execute<ResultSetHeader>(query, (err, result) => {
    if (err) res.json({ message: err?.message });
    if (result.affectedRows === 0) res.json({ message: "Book not deleted" });
    res.json(result);
    return;
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
