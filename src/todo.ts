import { loadStore, saveStore, type Todo } from './storage.js';

/**
 * 添加一条待办。
 * @param text 待办内容，非空
 * @returns 新创建的 Todo
 * @throws Error 当 text 为空字符串
 */
export async function addTodo(text: string): Promise<Todo> {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error('待办内容不能为空');
  }

  const store = await loadStore();
  const todo: Todo = {
    id: store.nextId,
    text: trimmed,
    done: false,
    createdAt: new Date().toISOString(),
  };
  store.todos.push(todo);
  store.nextId += 1;
  await saveStore(store);
  return todo;
}

/**
 * 列出所有待办。
 * 排序规则：未完成在前，已完成在后；同组内按 id 升序。
 */
export async function listTodos(): Promise<Todo[]> {
  const store = await loadStore();
  return [...store.todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.id - b.id;
  });
}

/**
 * 标记指定 id 的待办为已完成（幂等：已完成的再次标记仍为已完成）。
 * @param id 待办 id
 * @returns 被标记的 Todo
 * @throws Error 当 id 不存在
 */
export async function markDone(id: number): Promise<Todo> {
  const store = await loadStore();
  const todo = store.todos.find((t) => t.id === id);
  if (!todo) {
    throw new Error(`未找到 id 为 ${id} 的待办`);
  }
  todo.done = true;
  await saveStore(store);
  return todo;
}
