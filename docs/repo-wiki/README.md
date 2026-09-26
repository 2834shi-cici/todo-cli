# todo-cli — 代码库架构导读

命令行待办清单工具。v1 支持添加、列出、标记完成三个核心操作，数据持久化到本地 JSON 文件。

## 技术栈

- **运行时**：Node.js + TypeScript — 通过 `tsx` 直接运行 `.ts`，无需预编译
  > **源码** `package.json:2-18`
- **CLI 解析**：`commander` — 子命令风格（add / list / done）
  > **源码** `src/index.ts:14-52`
- **持久化**：Node.js `fs/promises` — JSON 文件存储于 `~/.todo-cli/data.json`
  > **源码** `src/storage.ts:1-7`

## 入口

> **源码** `src/index.ts:1-11`

`src/index.ts` 是 CLI 入口，用 `commander` 注册三个子命令，解析后分发到 `todo.ts` 的业务函数。完整链路见 [主执行链路](./01-execution-flow.md)。

## 如何使用本 Wiki

- 规范文档（术语、决策、需求）见 [CONTEXT.md](../../CONTEXT.md)、`docs/adr/`
- 本 Wiki 描述**代码现状**；冲突时以规范文档为准
- 元数据见 [_meta.yaml](./_meta.yaml)
