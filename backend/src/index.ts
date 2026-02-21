import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

let todos: Todo[] = [];
let nextId = 1;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 1) Get all todos
app.get("/todos", (req, res) => {
  res.json(todos);
});

// 2) Create a todo
app.post("/todos", (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  if (!title) return res.status(400).json({ error: "title is required" });

  const todo: Todo = { id: nextId++, title, completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// 3) Update a todo (title and/or completed)
app.put("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ error: "todo not found" });

  if (req.body?.title !== undefined) {
    const title = String(req.body.title).trim();
    if (!title) return res.status(400).json({ error: "title cannot be empty" });
    todo.title = title;
  }

  if (req.body?.completed !== undefined) {
    todo.completed = Boolean(req.body.completed);
  }

  res.json(todo);
});

// 4) Delete a todo
app.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = todos.length;
  todos = todos.filter(t => t.id !== id);
  if (todos.length === before) return res.status(404).json({ error: "todo not found" });

  res.status(204).send();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

