# 格式化模块（format）

纯函数模块，将 `Todo[]` 转换为 `list` 命令的展示字符串。不涉及任何 I/O，可被独立测试。

> **源码** `src/format.ts:1-20`

## 对外接口

### `formatTodos(todos: Todo[]): string`

将待办列表格式化为多行字符串。

- 空列表 → `（暂无待办，用 todo add 添加）`
- 非空 → 每行格式 `{id:>3}  {[x]|[ ]} {text}`
  > **源码** `src/format.ts:11-20`

输出示例：
```
  1  [ ] 买牛奶
  2  [x] 写周报
  3  [ ] 回复邮件
```

## 关键设计

- **纯函数**：无副作用，输入相同则输出相同，便于单元测试
  > **源码** `src/format.ts:11`
- **id 右对齐 3 位**：用 `String(t.id).padStart(3)` 保证多位数对齐
  > **源码** `src/format.ts:17`

## 依赖

- [storage](./storage.md) — 仅依赖 `Todo` 类型（type-only import）
  > **源码** `src/format.ts:1`

## 调用者

- `index.ts` — `list` 命令将 `listTodos()` 的结果传入 `formatTodos` 后打印
  > **源码** `src/index.ts:33-34`
