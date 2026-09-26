# 数据与状态流

todo-cli 的数据全部存储在单个 JSON 文件中，状态模型极简：一个 `nextId` 计数器 + 一个 `todos` 数组。无缓存、无状态机、无事件传播。

## 持久化结构

```json
{
  "nextId": 4,
  "todos": [
    { "id": 1, "text": "买牛奶", "done": false, "createdAt": "..." },
    { "id": 2, "text": "写周报", "done": true,  "createdAt": "..." }
  ]
}
```

> **源码** `src/storage.ts:9-20`

## 数据流向

### 写入（add / done）

```
loadStore() → 内存 TodoStore → 修改 → saveStore() → JSON 文件
```

- `addTodo`：追加新 Todo 到 `todos`，`nextId += 1`
  > **源码** `src/todo.ts:15-24`
- `markDone`：找到对应 Todo，置 `done = true`
  > **源码** `src/todo.ts:47-53`

### 读取（list）

```
loadStore() → 内存 TodoStore → 排序 → 返回
```

- `listTodos`：按「未完成在前、已完成在后；同组 id 升序」排序后返回
  > **源码** `src/todo.ts:32-38`

## 状态特征

| 特征 | 说明 |
|------|------|
| 状态载体 | 单个 JSON 文件 |
| 一致性 | 强一致（每次操作整体读写） |
| 并发控制 | 无（单进程 CLI，假设无并发） |
| 缓存 | 无（每次操作重新读文件） |
| 状态机 | 无（Todo 只有 `done` 布尔状态） |
