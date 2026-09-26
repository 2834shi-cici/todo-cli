# 主执行链路

todo-cli 是单进程 CLI 工具，执行链路为：**命令行参数 → commander 解析 → 业务函数 → JSON 读写 → 控制台输出**。无网络、无并发。

## 端到端路径（以 `todo add "买牛奶"` 为例）

1. **进程启动**：`tsx` 执行 `src/index.ts`，创建 `commander` 实例并注册子命令
   > **源码** `src/index.ts:1-11`

2. **命令解析**：commander 匹配到 `add` 子命令，将参数 `"买牛奶"` 传入 action 回调
   > **源码** `src/index.ts:14-25`

3. **业务逻辑**：调用 `addTodo(text)`，校验非空后创建 Todo 对象并追加到内存 store
   > **源码** `src/todo.ts:9-26`

4. **持久化**：`addTodo` 内部调用 `loadStore()` 读取 JSON、`saveStore()` 写回 JSON
   > **源码** `src/todo.ts:15-24`、`src/storage.ts:27-61`

5. **输出**：业务函数返回 Todo，入口层打印 `已添加待办 #1: 买牛奶`
   > **源码** `src/index.ts:20-21`

## 各命令链路差异

| 命令 | 业务函数 | 读 | 写 |
|------|---------|-----|-----|
| `add` | `addTodo` | loadStore | saveStore |
| `list` | `listTodos` | loadStore | — |
| `done` | `markDone` | loadStore | saveStore |

> **源码** `src/todo.ts:9-55`

## 错误处理

- 业务层抛出 `Error`（空内容、id 不存在）
- 入口层 `handleError` 捕获并打印，退出码 1
- 参数层 `parseId` 对非数字 id 直接退出
  > **源码** `src/index.ts:56-71`
