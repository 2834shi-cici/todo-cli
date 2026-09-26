# 项目上下文（CONTEXT）

> 在此记录项目的领域术语表、核心业务概念、以及 Agent 在探索代码库前需要了解的背景信息。

## 项目简介

命令行待办清单工具（todo-cli）。v1 支持添加、列出、标记完成三个核心操作，数据持久化到本地 JSON 文件。

## 术语表

| 术语 | 定义 | 避免使用的同义词 |
|------|------|-----------------|
| 待办（Todo） | 用户要完成的一项任务，包含 id、text、done、createdAt 四个字段 | 任务、task、item |
| id | 待办的唯一数字标识，单调递增，永不复用 | 编号、序号、index |
| 完成（done） | 待办的布尔状态，true 表示已完成 | 已勾选、checked、finished |
| 待办清单（Todo list） | 所有待办的集合，按「未完成在前、已完成在后」排序展示 | 任务列表、task list |
| 数据文件（data.json） | 持久化存储，位于 `~/.todo-cli/data.json`，结构为 `{ nextId, todos[] }` | store、db、storage file |

## 架构决策

- **技术栈**：Node.js + TypeScript，CLI 解析用 `commander`，运行用 `tsx`
- **存储**：`~/.todo-cli/data.json`，JSON 格式，自动创建父目录
- **ID 策略**：`nextId` 计数器单调递增，删除不重排、不复用（为未来 delete 命令预留）
- **模块划分**：`storage.ts`（读写）、`todo.ts`（业务逻辑）、`format.ts`（展示）、`index.ts`（入口）
