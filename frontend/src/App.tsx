import { useEffect, useState } from "react";
import type { Todo } from "./types";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState<string>("");

  const fetchTodos = async (): Promise<void> => {
    const res = await fetch(`${API}/api/todos`);
    const data: Todo[] = await res.json();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (): Promise<void> => {
    if (!text.trim()) return;
    await fetch(`${API}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
    fetchTodos();
  };

  const toggleTodo = async (id: number): Promise<void> => {
    await fetch(`${API}/api/todos/${id}`, { method: "PATCH" });
    fetchTodos();
  };

  const deleteTodo = async (id: number): Promise<void> => {
    await fetch(`${API}/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>📝 Todo App</h1>
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="What needs to be done?"
        />
        <button style={styles.btn} onClick={addTodo}>Add</button>
      </div>
      <ul style={styles.list}>
        {todos.map((todo) => (
          <li key={todo.id} style={styles.item}>
            <span
              onClick={() => toggleTodo(todo.id)}
              style={{
                ...styles.text,
                textDecoration: todo.done ? "line-through" : "none",
                opacity: todo.done ? 0.5 : 1,
              }}
            >
              {todo.done ? "✅" : "⬜"} {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)} style={styles.del}>✕</button>
          </li>
        ))}
        {todos.length === 0 && <p style={styles.empty}>No todos yet. Add one!</p>}
      </ul>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: "#fff", borderRadius: 12, padding: 32, width: 480, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 20, color: "#1a1a2e" },
  inputRow: { display: "flex", gap: 8, marginBottom: 20 },
  input: { flex: 1, padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 15, outline: "none" },
  btn: { padding: "10px 18px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  list: { listStyle: "none" },
  item: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" },
  text: { cursor: "pointer", fontSize: 15, flex: 1 },
  del: { background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 16, padding: "0 4px" },
  empty: { color: "#aaa", textAlign: "center", padding: 20 },
};