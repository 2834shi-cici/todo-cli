import type { Todo } from './storage.js';

/**
 * 将待办列表格式化为展示字符串。
 * 格式示例：
 *   1  [ ] 买牛奶
 *   2  [x] 写周报
 *
 * 空列表返回提示文案。
 */
export function formatTodos(todos: Todo[]): string {
  if (todos.length === 0) {
    return '（暂无待办，用 todo add 添加）';
  }
  const lines = todos.map((t) => {
    const check = t.done ? '[x]' : '[ ]';
    return `${String(t.id).padStart(3)}  ${check} ${t.text}`;
  });
  return lines.join('\n');
}
