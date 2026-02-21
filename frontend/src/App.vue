<script setup lang="ts">
import { onMounted, ref } from "vue";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const API = "http://localhost:3001";

const todos = ref<Todo[]>([]);
const newTitle = ref("");
const loading = ref(false);
const error = ref<string | null>(null);

async function loadTodos() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`${API}/todos`);
    if (!res.ok) throw new Error(`Failed to load todos (${res.status})`);
    todos.value = await res.json();
  } catch (e: any) {
    error.value = e?.message ?? "Unknown error";
  } finally {
    loading.value = false;
  }
}

async function addTodo() {
  const title = newTitle.value.trim();
  if (!title) return;

  error.value = null;
  try {
    const res = await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? `Failed to create todo (${res.status})`);
    }
    const created: Todo = await res.json();
    todos.value.push(created);
    newTitle.value = "";
  } catch (e: any) {
    error.value = e?.message ?? "Unknown error";
  }
}

async function toggleTodo(todo: Todo) {
  const nextCompleted = !todo.completed;
  error.value = null;

  const old = todo.completed;
  todo.completed = nextCompleted;

  try {
    const res = await fetch(`${API}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: nextCompleted }),
    });
    if (!res.ok) throw new Error(`Failed to update todo (${res.status})`);
  } catch (e: any) {
    todo.completed = old;
    error.value = e?.message ?? "Unknown error";
  }
}

async function deleteTodo(todo: Todo) {
  error.value = null;
  try {
    const res = await fetch(`${API}/todos/${todo.id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error(`Failed to delete todo (${res.status})`);
    todos.value = todos.value.filter((t) => t.id !== todo.id);
  } catch (e: any) {
    error.value = e?.message ?? "Unknown error";
  }
}

onMounted(loadTodos);
</script>

<template>
  <main class="page">
    <h1 class="title">Todo App</h1>

    <form class="row" @submit.prevent="addTodo">
      <input class="input" v-model="newTitle" placeholder="Add a new task..." />
      <button class="btn" type="submit">Add</button>
    </form>

    <p v-if="loading" class="muted">Loading…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <ul class="list">
      <li v-for="t in todos" :key="t.id" class="item">
        <label class="itemLeft">
          <input type="checkbox" :checked="t.completed" @change="toggleTodo(t)" />
          <span :class="['text', t.completed && 'done']">{{ t.title }}</span>
        </label>
        <button class="btn danger" @click="deleteTodo(t)">Delete</button>
      </li>
    </ul>

    <p v-if="!loading && todos.length === 0" class="muted">No tasks yet.</p>
  </main>
</template>

<style scoped>
.page { max-width: 720px; margin: 40px auto; padding: 0 16px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
.title { font-size: 28px; margin-bottom: 16px; }
.row { display: flex; gap: 8px; margin-bottom: 16px; }
.input { flex: 1; padding: 10px 12px; border: 1px solid #444; border-radius: 8px; background: transparent; color: inherit; }
.btn { padding: 10px 12px; border: 1px solid #444; border-radius: 8px; background: transparent; color: inherit; cursor: pointer; }
.danger { border-color: #a44; }
.list { list-style: none; padding: 0; margin: 0; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid #333; border-radius: 10px; margin-bottom: 10px; }
.itemLeft { display: flex; align-items: center; gap: 10px; }
.done { text-decoration: line-through; opacity: 0.7; }
.muted { opacity: 0.7; }
.error { color: #ff6b6b; }
</style>
