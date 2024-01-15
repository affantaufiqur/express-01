import express from "express";
import { books } from "./books";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
  return;
});

app.get("/books", (req, res) => {
  const query = req.query.query;
  if (query) {
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes((query as string).toLowerCase()),
    );
    res.send(filteredBooks);
    return;
  }
  res.send(books);
  return;
});

app.get("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((book) => book.id === id);
  res.send(book);
  return;
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
