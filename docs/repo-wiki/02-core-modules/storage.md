# 存储模块（storage）

负责 JSON 数据文件的读写、目录自动创建、以及 `Todo` / `TodoStore` 类型定义。是整个应用的数据层，所有持久化操作的唯一入口。

> **源码** `src/storage.ts:1-61`
> **术语** 见 [CONTEXT.md](../../../CONTEXT.md#数据文件datajson)

## 对外接口

### 类型

- `Todo` — 单条待办：`{ id, text, done, createdAt }`
  > **源码** `src/storage.ts:15-20`
- `TodoStore` — 持久化结构：`{ nextId, todos[] }`
  > **源码** `src/storage.ts:9-13`

### 常量

- `DATA_PATH` — 数据文件路径，`~/.todo-cli/data.json`
  > **源码** `src/storage.ts:6-7`

### 函数

- `loadStore(): Promise<TodoStore>` — 读取数据文件，不存在返回空仓库，JSON 损坏抛错
  > **源码** `src/storage.ts:27-51`
- `saveStore(store): Promise<void>` — 写入数据文件，自动创建父目录
  > **源码** `src/storage.ts:58-61`

## 关键设计

- **`nextId` 计数器**：单调递增，删除操作（未来）不重排、不复用 id，保证 id 稳定
  > **源码** `src/storage.ts:10-13`
- **旧格式兼容**：若读到的是纯数组（无 `nextId`），自动迁移为新结构并计算 `nextId`
  > **源码** `src/storage.ts:31-39`
- **错误语义**：`ENOENT`（文件不存在）视为正常返回空仓库；`SyntaxError`（JSON 损坏）向上抛错
  > **源码** `src/storage.ts:40-50`

## 依赖

- Node.js 内置：`fs/promises`、`path`、`os` — 无第三方依赖
  > **源码** `src/storage.ts:1-4`

## 调用者

- `todo.ts` — `addTodo`、`listTodos`、`markDone` 均通过 `loadStore` / `saveStore` 访问数据
  > **源码** `src/todo.ts:15`、`src/todo.ts:33`、`src/todo.ts:47`
