# PRD：todo-cli v1 — 命令行待办清单

## 问题陈述

用户需要一个轻量、本地的待办清单工具，在终端中快速记录和追踪待办事项。当前没有合适的工具满足这一需求——要么功能过重（带 GUI、需要登录、云端同步），要么过于简陋（缺少持久化）。用户希望在任何目录下都能用一条命令添加、查看、完成待办，数据保存在本地，不依赖网络。

## 解决方案

构建一个命令行待办清单工具（`todo`），提供三个核心命令：`add`（添加待办）、`list`（列出待办）、`done`（标记完成）。数据以 JSON 格式持久化到用户主目录下的 `~/.todo-cli/data.json`，自动创建目录，无需网络。

## 用户故事

US-1：作为终端用户，我想要用 `todo add "内容"` 添加一条待办，以便快速记录要做的事。

US-2：作为终端用户，我想要用 `todo list` 查看所有待办，以便了解还有哪些事没做、哪些已完成。

US-3：作为终端用户，我想要用 `todo done <id>` 把一条待办标记为已完成，以便追踪进度。

US-4：作为终端用户，我希望待办数据保存在本地文件中，以便不联网也能使用，且数据归属自己掌控。

US-5：作为终端用户，我希望 `list` 时未完成的待办排在前面、已完成的排在后面，以便一眼看到待处理事项。

US-6：作为终端用户，我希望输入非法参数时（如空内容、不存在的 id、非数字 id）能看到清晰的错误提示，以便知道哪里出错了。

US-7：作为终端用户，我希望 `done` 命令对已完成的待办再次执行不会报错，以便重复操作是安全的。

## 实现决策

### 技术栈

- **运行时**：Node.js + TypeScript，通过 `tsx` 直接运行 `.ts` 文件，无需预编译。
- **CLI 解析**：`commander` 库，子命令风格（`add` / `list` / `done`）。
- **持久化**：Node.js 内置 `fs/promises`，JSON 文件存储。

> 架构决策摘要见 `CONTEXT.md`「架构决策」章节。

### 数据模型

- **待办（Todo）**：`{ id: number, text: string, done: boolean, createdAt: string }`
- **数据文件结构**：`{ nextId: number, todos: Todo[] }`
- **存储路径**：`~/.todo-cli/data.json`（`homedir() + '.todo-cli/data.json'`）

### `todo add` 命令

- 接受一个字符串参数（待办内容）。
- 内容经 `trim()` 后若为空，抛出错误「待办内容不能为空」。
- 分配 `id = nextId`，`done = false`，`createdAt = new Date().toISOString()`。
- 追加到 `todos` 数组，`nextId += 1`，写回数据文件。
- 成功输出：`已添加待办 #N: {text}`。

### `todo list` 命令

- 读取所有待办，按以下规则排序后输出：
  - 未完成（`done=false`）在前，已完成（`done=true`）在后；
  - 同组内按 `id` 升序。
- 输出格式：每行 `{id:>3}  {[x]|[ ]} {text}`（id 右对齐 3 位）。
- 空列表输出：`（暂无待办，用 todo add 添加）`。

### `todo done` 命令

- 接受一个数字 id 参数；非数字直接输出错误「id 必须是数字」并以退出码 1 退出。
- 查找对应 id 的待办；不存在则抛出错误「未找到 id 为 N 的待办」。
- 置 `done = true`（幂等：已完成的再次执行仍为 true，不报错）。
- 写回数据文件，输出：`已完成待办 #N: {text}`。

### 错误处理与退出码

- 成功操作 → 退出码 0。
- 用户错误（空内容、id 不存在、id 非数字）→ stderr 输出 `错误：{message}`，退出码 1。
- 数据文件不存在 → 自动返回空仓库（`nextId=1, todos=[]`），不报错。
- 数据文件 JSON 损坏 → 抛出错误「数据文件损坏，请检查 {path}」。

### 测试接缝

- **`format.ts` 纯函数 seam**：`formatTodos(todos)` 可独立测试，覆盖空列表、单条、多条、done/undone 混合、id 对齐。
- **`todo.ts` 业务逻辑 seam**：`addTodo` / `listTodos` / `markDone` 可测试，覆盖空内容校验、id 递增、排序规则、id 不存在、幂等性。
- **CLI 端到端 seam**：通过 `tsx src/index.ts <args>` 验证命令解析、stdout/stderr、退出码。

## 测试决策

### format.ts 纯函数

- **空列表**：`formatTodos([])` 返回 `（暂无待办，用 todo add 添加）`。
- **未完成项**：`formatTodos([{id:1, text:'x', done:false, createdAt:''}])` 包含 `[ ]`。
- **已完成项**：`formatTodos([{id:1, text:'x', done:true, createdAt:''}])` 包含 `[x]`。
- **id 对齐**：id 为 1 和 10 时，输出行首对齐（`padStart(3)`）。

### todo.ts 业务逻辑

- **空内容拒绝**：`addTodo("")` 和 `addTodo("   ")` 抛出 Error。
- **id 单调递增**：连续 `addTodo` 两次，id 分别为 `nextId` 和 `nextId+1`。
- **排序规则**：`listTodos` 返回未完成在前、已完成在后。
- **id 不存在**：`markDone(999)` 抛出 Error。
- **幂等性**：对同一 id 连续 `markDone` 两次，第二次不报错且 `done` 仍为 true。

### CLI 端到端

- `todo add "测试"` → stdout 含 `已添加待办 #`，退出码 0。
- `todo list` → stdout 含格式化列表，退出码 0。
- `todo done <id>` → stdout 含 `已完成待办 #`，退出码 0。
- `todo done abc` → stderr 含 `id 必须是数字`，退出码 1。
- `todo add ""` → stderr 含 `待办内容不能为空`，退出码 1。

## 范围外

以下功能不在 v1 范围内（Not now）：

- 删除待办（`delete` 命令）
- 编辑待办内容（`edit` 命令）
- 清除所有已完成待办（`clear` 命令）
- 优先级、标签、截止日期等字段
- 按条件筛选/搜索
- 数据导出/导入
- 多设备同步
- 彩色终端输出
- 配置文件（自定义数据路径等）

## 补充说明

- **数据安全**：当前无并发控制（读-改-写模式无文件锁），单进程 CLI 场景可接受；若需多进程安全可后续引入文件锁。
- **ID 策略**：`nextId` 计数器单调递增，删除（未来）不重排、不复用 id，保证 id 稳定。
- **旧格式兼容**：`loadStore` 兼容纯数组格式（无 `nextId`），自动迁移为新结构。
- **当前实现状态**：v1 代码已实现，位于 `src/` 目录，含 `index.ts` / `storage.ts` / `todo.ts` / `format.ts`。

---

**本计划 UI 模式**：headless（纯 CLI，无可视化 UI）
