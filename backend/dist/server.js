"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./config/prisma");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logger middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
    });
    next();
});
// Get all todos
app.get("/api/todos", async (_req, res) => {
    const todos = await prisma_1.prisma.todo.findMany({ orderBy: { createdAt: "asc" } });
    console.log(`[TODOS] Fetched all todos, count: ${todos.length}`);
    res.json(todos);
});
// Create a todo
app.post("/api/todos", async (req, res) => {
    const { text } = req.body;
    if (!text) {
        console.warn(`[TODOS] Create failed - missing text in body`);
        res.status(400).json({ error: "Text is required" });
        return;
    }
    const todo = await prisma_1.prisma.todo.create({ data: { text } });
    console.log(`[TODOS] Created todo #${todo.id}: "${todo.text}"`);
    res.status(201).json(todo);
});
// Toggle done
app.patch("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const existing = await prisma_1.prisma.todo.findUnique({ where: { id } });
    if (!existing) {
        console.warn(`[TODOS] Toggle failed - todo #${id} not found`);
        res.status(404).json({ error: "Not found" });
        return;
    }
    const todo = await prisma_1.prisma.todo.update({
        where: { id },
        data: { done: !existing.done },
    });
    console.log(`[TODOS] Todo #${id} marked as ${todo.done ? "done" : "undone"}`);
    res.json(todo);
});
// Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const existing = await prisma_1.prisma.todo.findUnique({ where: { id } });
    if (!existing) {
        console.warn(`[TODOS] Delete failed - todo #${id} not found`);
        res.status(404).json({ error: "Not found" });
        return;
    }
    await prisma_1.prisma.todo.delete({ where: { id } });
    console.log(`[TODOS] Deleted todo #${id}`);
    res.status(204).send();
});
// Graceful shutdown
process.on("SIGINT", async () => {
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
app.listen(PORT, () => {
    console.log(`[SERVER] Backend running on port ${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);
});
