# 扩展点

todo-cli v1 采用极简架构，扩展点主要体现在**模块间的接缝**和**预留的接口形态**上。

## 明确的扩展接缝

### 1. 新增 CLI 命令

在 `index.ts` 中注册新的 commander 子命令，调用 `todo.ts` 中新的业务函数。

> **源码** `src/index.ts:14-52`

示例扩展方向：
- `delete <id>` — 删除待办（利用已有 `nextId` 计数器保证 id 不复用）
- `clear` — 清除所有已完成待办
- `edit <id> <text>` — 修改待办内容

### 2. 新增业务逻辑

在 `todo.ts` 中添加新函数，遵循「读-改-写」模式。

> **源码** `src/todo.ts:9-55`

### 3. 替换存储后端

`todo.ts` 只依赖 `storage.ts` 的 `loadStore` / `saveStore` 接口。若未来要替换为 SQLite 等，只需改写 `storage.ts`，业务层无需改动。

> **源码** `src/todo.ts:1`、`src/storage.ts:27-61`

### 4. 修改输出格式

`format.ts` 是纯函数，可独立替换为表格、JSON 输出等。

> **源码** `src/format.ts:11-20`

## 隐式约束

- `Todo` 类型定义在 `storage.ts`，所有模块共享；新增字段需同步修改类型和 JSON 结构
  > **源码** `src/storage.ts:15-20`
- `nextId` 计数器策略保证 id 单调递增，删除操作不得重排 id
  > **源码** `src/storage.ts:10-13`
