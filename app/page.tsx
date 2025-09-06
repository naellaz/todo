"use client";
import { useEffect, useState } from "react";

interface Todo {
  id: string;
  title: string;
  done: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://todo-1116-crud.vercel.app/";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const limit = 5;

  async function refresh(p = page) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/todos?page=${p}`);
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();

      setTodos(data.todos ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh(1);
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to add todo");
      setTitle("");
      refresh(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to add todo");
    }
  }

  async function toggle(id: string, done: boolean) {
    try {
      const res = await fetch(`${BASE_URL}/api/todos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done: !done }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update todo");
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/todos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete todo");
    }
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/todos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editTitle }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      setEditId(null);
      setEditTitle("");
      refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update todo");
    }
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
        <button type="submit" disabled={loading}>
          Tambah
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="todo-list">
          {todos.map((t) => (
            <li key={t.id}>
              {editId === t.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <button onClick={() => saveEdit(t.id)}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggle(t.id, t.done)}
                    />
                    <span className={t.done ? "done" : ""}>{t.title}</span>
                  </label>
                  <button
                    onClick={() => {
                      setEditId(t.id);
                      setEditTitle(t.title);
                    }}
                  >
                    ✏️
                  </button>
                  <button onClick={() => remove(t.id)}>❌</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

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
