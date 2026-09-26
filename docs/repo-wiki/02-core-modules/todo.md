# 业务模块（todo）

包含待办的核心业务逻辑：添加、列出、标记完成。是 CLI 命令的直接实现层，不涉及命令行参数解析和控制台输出格式化。

> **源码** `src/todo.ts:1-55`
> **术语** 见 [CONTEXT.md](../../../CONTEXT.md#待办todo)

## 对外接口

### `addTodo(text): Promise<Todo>`

添加一条待办。

- 校验 `text.trim()` 非空，否则抛 `Error('待办内容不能为空')`
- 分配 `id = store.nextId`，`done = false`，`createdAt = ISO 时间戳`
- 追加到 `todos`，`nextId += 1`，持久化
  > **源码** `src/todo.ts:9-26`

### `listTodos(): Promise<Todo[]>`

列出所有待办，排序规则：未完成在前、已完成在后；同组内按 `id` 升序。

> **源码** `src/todo.ts:32-38`

### `markDone(id): Promise<Todo>`

标记指定 id 的待办为已完成。幂等：已完成的再次标记仍为已完成。id 不存在时抛 `Error('未找到 id 为 N 的待办')`。

> **源码** `src/todo.ts:46-55`

## 关键设计

- **读-改-写模式**：每个写操作都遵循 `loadStore → 修改内存 → saveStore`，无并发控制（单进程 CLI 无需）
  > **源码** `src/todo.ts:15-24`、`src/todo.ts:47-53`
- **错误通过 throw 传递**：业务层不处理退出码，由入口层统一处理
  > **源码** `src/todo.ts:12`、`src/todo.ts:50`

## 依赖

- [storage](./storage.md) — 通过 `loadStore` / `saveStore` 读写数据
  > **源码** `src/todo.ts:1`

## 调用者

- `index.ts` — 三个子命令的 action 回调分别调用这三个函数
  > **源码** `src/index.ts:20`、`src/index.ts:33`、`src/index.ts:47`
