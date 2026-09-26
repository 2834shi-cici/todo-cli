import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTodos } from './format.js';
import type { Todo } from './storage.js';

/** 构造一个最小 Todo，仅保留 formatTodos 关心的字段 */
function makeTodo(partial: Partial<Todo>): Todo {
  return {
    id: 1,
    text: '默认内容',
    done: false,
    createdAt: '',
    ...partial,
  };
}

// 验收标准 1：空列表返回提示文案
test('formatTodos: 空列表返回提示文案', () => {
  assert.equal(formatTodos([]), '（暂无待办，用 todo add 添加）');
});

// 验收标准 2：未完成项显示 [ ]
test('formatTodos: 未完成项显示 [ ]', () => {
  const output = formatTodos([makeTodo({ id: 1, text: '买牛奶', done: false })]);
  assert.match(output, /\[ \]/);
  assert.doesNotMatch(output, /\[x\]/);
});

// 验收标准 3：已完成项显示 [x]
test('formatTodos: 已完成项显示 [x]', () => {
  const output = formatTodos([makeTodo({ id: 2, text: '写周报', done: true })]);
  assert.match(output, /\[x\]/);
  assert.doesNotMatch(output, /\[ \]/);
});

// 验收标准 4：id 右对齐 3 位（1 和 10 对齐）
test('formatTodos: id 右对齐 3 位', () => {
  const todos = [
    makeTodo({ id: 1, text: 'a' }),
    makeTodo({ id: 10, text: 'b' }),
  ];
  const lines = formatTodos(todos).split('\n');

  // id=1 的行：行首为两个空格 + "1"
  assert.match(lines[0], /^  1  /);
  // id=10 的行：行首为一个空格 + "10"
  assert.match(lines[1], /^ 10  /);
});
