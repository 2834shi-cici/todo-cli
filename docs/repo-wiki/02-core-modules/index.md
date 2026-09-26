# 模块总览

todo-cli 采用极简分层，`src/` 下 4 个文件各负其责。入口层不包含业务逻辑，业务层不直接处理 CLI 参数。

## 模块列表

| 模块 | 文件 | 职责 |
|------|------|------|
| 入口 CLI | `src/index.ts` | 命令解析与分发、错误处理、退出码 |
| [存储 storage](./storage.md) | `src/storage.ts` | JSON 文件读写、目录创建、数据模型定义 |
| [业务 todo](./todo.md) | `src/todo.ts` | add / list / done 业务逻辑 |
| [格式化 format](./format.md) | `src/format.ts` | Todo[] → 展示字符串（纯函数） |

## 模块依赖关系

```
index.ts ──→ todo.ts ──→ storage.ts
   │                         ↑
   └──→ format.ts ───────────┘
```

- `index.ts` 依赖 `todo.ts` 和 `format.ts`
- `todo.ts` 依赖 `storage.ts`
- `format.ts` 只依赖 `storage.ts` 的 `Todo` 类型
- `storage.ts` 无内部依赖

> **源码** `src/index.ts:2-4`、`src/todo.ts:1`、`src/format.ts:1`
