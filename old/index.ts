import express from "express";
import { books } from "../books";

const app = express();
const port = 3000;

app.use(express.json());
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  res.send("Hello World!");
  return;
});

app.get("/books", (req, res) => {
  const query = req.query.query;
  if (query) {
    const filteredBooks = books.filter((book) =>
      book.title
        .toLowerCase()
        .trim()
        .includes((query as string).toLowerCase().trim()),
    );
    res.json(filteredBooks);
    return;
  }
  res.json(books);
  return;
});

app.get("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((book) => book.id === id);
  res.json(book);
  return;
});

app.post("/books", (req, res) => {
  const { title, author, publication_year, genre, isbn }: (typeof books)[number] = req.body;
  if (!title || !author || !publication_year || !genre || !isbn) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const newBook = {
    id: books.length + 1,
    ...req.body,
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

app.put("/book/:id", (req, res) => {
  const id = Number(req.params.id);
  let book = books.find((item) => item.id === id);
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  book = { id, ...req.body };
  books[book!.id - 1] = book!;
  res.json(books);
});

app.delete("/book/:id", (req, res) => {
  const id = Number(req.params.id);
  let book = books.find((item) => item.id === id);
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  books.splice(book!.id - 1, 1);
  res.json(books);
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
