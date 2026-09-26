import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setDataPath, DATA_PATH } from './storage.js';
import { addTodo, listTodos, markDone } from './todo.js';

/**
 * 通过 setDataPath 将存储指向临时目录，让 todo.ts 走真实的 storage 层
 * （loadStore/saveStore 读写临时文件），不触碰用户真实数据。
 * 这是集成式测试：仅替换文件系统边界，业务逻辑全部走真实代码。
 */
let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'todo-cli-test-'));
  setDataPath(join(tempDir, 'data.json'));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
  setDataPath(DATA_PATH);
});

// 行为 1：空内容拒绝（trim 后为空）
test('addTodo: 空内容抛出错误且不写入仓库', async () => {
  await assert.rejects(() => addTodo(''), /待办内容不能为空/);
  await assert.rejects(() => addTodo('   '), /待办内容不能为空/);
  assert.deepEqual(await listTodos(), []);
});

// 行为 2：trim 内容并分配递增 id
test('addTodo: trim 内容并分配递增 id，写入仓库', async () => {
  const t1 = await addTodo('  买牛奶  ');
  assert.equal(t1.text, '买牛奶');
  assert.equal(t1.id, 1);
  assert.equal(t1.done, false);

  const t2 = await addTodo('写周报');
  assert.equal(t2.id, 2);

  const list = await listTodos();
  assert.equal(list.length, 2);
  assert.deepEqual(list.map((t) => t.id), [1, 2]);
});

// 行为 3：createdAt 为有效 ISO 时间字符串
test('addTodo: createdAt 为有效的 ISO 时间字符串', async () => {
  const t = await addTodo('测试时间');
  assert.doesNotThrow(() => new Date(t.createdAt));
  assert.equal(new Date(t.createdAt).toISOString(), t.createdAt);
});

// 行为 4：listTodos 空仓库
test('listTodos: 空仓库返回空数组', async () => {
  assert.deepEqual(await listTodos(), []);
});

// 行为 5：listTodos 排序规则（未完成在前，同组按 id 升序）
test('listTodos: 未完成在前、已完成在后，同组内按 id 升序', async () => {
  await addTodo('a'); // id 1
  await addTodo('b'); // id 2
  await addTodo('c'); // id 3
  await markDone(3);  // 标记 id 3 为已完成

  const list = await listTodos();

  assert.deepEqual(list.map((t) => t.id), [1, 2, 3]);
  assert.equal(list[0].done, false);
  assert.equal(list[1].done, false);
  assert.equal(list[2].done, true);
});

// 行为 6：markDone 不存在的 id
test('markDone: 不存在的 id 抛出错误且不修改仓库', async () => {
  await addTodo('a'); // id 1

  await assert.rejects(() => markDone(999), /未找到 id 为 999 的待办/);

  const list = await listTodos();
  assert.equal(list[0].done, false);
});

// 行为 7：markDone 标记完成
test('markDone: 将未完成项标记为已完成', async () => {
  await addTodo('a'); // id 1

  const t = await markDone(1);

  assert.equal(t.done, true);
  const list = await listTodos();
  assert.equal(list[0].done, true);
});

// 行为 8：markDone 幂等性
test('markDone: 对已完成项再次标记不报错且仍为已完成', async () => {
  await addTodo('a'); // id 1
  await markDone(1);  // 第一次标记

  const t1 = await markDone(1); // 第二次标记
  const t2 = await markDone(1); // 第三次标记

  assert.equal(t1.done, true);
  assert.equal(t2.done, true);
  const list = await listTodos();
  assert.equal(list[0].done, true);
});
