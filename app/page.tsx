"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [todos, setTodos] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  async function refresh(p = page) {
    const res = await fetch(`/api/todos?page=${p}`);
    const data = await res.json();
    setTodos(data.todos);
    setTotal(data.total);
    setPage(data.page);
  }

  useEffect(() => {
    refresh(1);
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    refresh(1);
  }

  async function toggle(id: string, done: boolean) {
    await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: !done }),
    });
    refresh();
  }

  async function remove(id: string) {
    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="container">
      <h1>📋 Todo CRUD</h1>

      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tambah todo..."
          required
        />
        <button type="submit">Tambah</button>
      </form>

      <ul className="todo-list">
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id, t.done)}
              />
              <span className={t.done ? "done" : ""}>{t.title}</span>
            </label>
            <button onClick={() => remove(t.id)}>❌</button>
          </li>
        ))}
      </ul>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => refresh(n)}
            className={n === page ? "active" : ""}
          >
            {n}
          </button>
        ))}
      </div>
    </main>
  );
}
