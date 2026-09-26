import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadStore, saveStore, setDataPath, DATA_PATH } from './storage.js';
import type { TodoStore } from './storage.js';

let tempDir: string;
let dataFile: string;

// 每个测试使用独立的临时目录，隔离真实用户数据
beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'todo-cli-test-'));
  dataFile = join(tempDir, 'data.json');
  setDataPath(dataFile);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
  // 恢复默认路径，避免影响其他测试文件
  setDataPath(DATA_PATH);
});

// 行为 1：文件不存在 → 返回空仓库
test('loadStore: 文件不存在时返回空仓库（nextId=1, todos=[]）', async () => {
  const store = await loadStore();
  assert.deepEqual(store, { nextId: 1, todos: [] });
});

// 行为 2：有效 JSON → 返回解析后的 store
test('loadStore: 有效 JSON 时返回解析后的 store', async () => {
  const data: TodoStore = {
    nextId: 3,
    todos: [
      { id: 1, text: '买牛奶', done: false, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 2, text: '写周报', done: true, createdAt: '2026-01-02T00:00:00.000Z' },
    ],
  };
  await writeFile(dataFile, JSON.stringify(data), 'utf-8');

  const store = await loadStore();
  assert.deepEqual(store, data);
});

// 行为 3：旧格式纯数组 → 自动迁移为新结构（nextId = maxId + 1）
test('loadStore: 旧格式纯数组时自动迁移为新结构', async () => {
  const oldFormat = [
    { id: 5, text: 'a', done: false, createdAt: '' },
    { id: 3, text: 'b', done: true, createdAt: '' },
  ];
  await writeFile(dataFile, JSON.stringify(oldFormat), 'utf-8');

  const store = await loadStore();
  assert.equal(store.nextId, 6);
  assert.deepEqual(store.todos, oldFormat);
});

// 行为 4：JSON 损坏 → 抛出错误
test('loadStore: JSON 损坏时抛出错误', async () => {
  await writeFile(dataFile, '{ 无效的 json ', 'utf-8');

  await assert.rejects(
    () => loadStore(),
    (err: Error) => {
      assert.match(err.message, /数据文件损坏/);
      return true;
    }
  );
});

// 行为 5：缺少 todos 字段 → 返回空仓库（容错）
test('loadStore: 缺少 todos 字段时返回空仓库', async () => {
  await writeFile(dataFile, JSON.stringify({ nextId: 5 }), 'utf-8');

  const store = await loadStore();
  assert.deepEqual(store, { nextId: 5, todos: [] });
});

// 行为 6：saveStore → 自动创建父目录并写入 JSON
test('saveStore: 自动创建父目录并写入 JSON 文件', async () => {
  // 将数据文件指向尚不存在的嵌套子目录，验证 mkdir({recursive:true}) 生效
  const nestedFile = join(tempDir, 'sub', 'dir', 'data.json');
  setDataPath(nestedFile);

  const store: TodoStore = {
    nextId: 2,
    todos: [{ id: 1, text: 'x', done: false, createdAt: '' }],
  };

  await saveStore(store);

  // 验证文件已写入且内容正确
  const raw = await readFile(nestedFile, 'utf-8');
  assert.deepEqual(JSON.parse(raw), store);
});

// 行为 7：save 后 load 往返一致
test('saveStore 后 loadStore 往返一致', async () => {
  const store: TodoStore = {
    nextId: 5,
    todos: [{ id: 4, text: 'test', done: false, createdAt: '2026-09-26T00:00:00.000Z' }],
  };

  await saveStore(store);
  const loaded = await loadStore();

  assert.deepEqual(loaded, store);
});

// 行为 8：nextId 字段缺失时默认回退为 1
test('loadStore: nextId 缺失时默认回退为 1', async () => {
  await writeFile(dataFile, JSON.stringify({ todos: [] }), 'utf-8');

  const store = await loadStore();
  assert.equal(store.nextId, 1);
});
