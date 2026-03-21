import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { prisma } from "./config/prisma";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// Get all todos
app.get("/api/todos", async (_req: Request, res: Response) => {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: "asc" } });
  console.log(`[TODOS] Fetched all todos, count: ${todos.length}`);
  res.json(todos);
});

// Create a todo
app.post("/api/todos", async (req: Request, res: Response) => {
  const { text }: { text?: string } = req.body;
  if (!text) {
    console.warn(`[TODOS] Create failed - missing text in body`);
    res.status(400).json({ error: "Text is required" });
    return;
  }
  const todo = await prisma.todo.create({ data: { text } });
  console.log(`[TODOS] Created todo #${todo.id}: "${todo.text}"`);
  res.status(201).json(todo);
});

// Toggle done
app.patch("/api/todos/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing) {
    console.warn(`[TODOS] Toggle failed - todo #${id} not found`);
    res.status(404).json({ error: "Not found" });
    return;
  }
  const todo = await prisma.todo.update({
    where: { id },
    data: { done: !existing.done },
  });
  console.log(`[TODOS] Todo #${id} marked as ${todo.done ? "done" : "undone"}`);
  res.json(todo);
});

// Delete a todo
app.delete("/api/todos/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing) {
    console.warn(`[TODOS] Delete failed - todo #${id} not found`);
    res.status(404).json({ error: "Not found" });
    return;
  }
  await prisma.todo.delete({ where: { id } });
  console.log(`[TODOS] Deleted todo #${id}`);
  res.status(204).send();
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[SERVER] Backend running on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);
});