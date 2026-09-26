# 选择 Node.js + TypeScript 作为技术栈

todo-cli 是一个轻量命令行工具，开发团队熟悉 JavaScript 生态，且 Node.js 跨平台、JSON 原生支持、依赖获取便捷。我们决定使用 Node.js + TypeScript，通过 `tsx` 直接运行 `.ts` 文件，无需预编译。TypeScript 提供类型安全，使数据模型（Todo 接口）定义清晰；`commander` 库提供成熟的 CLI 子命令解析。

**Status**: accepted

**Considered Options**:
- **Go** — 单二进制分发方便、并发好，但编译迭代慢，且团队对 Go 生态不如 Node 熟悉。
- **Python** — 上手快、标准库够用，但分发需 `pyinstaller` 等额外工具，类型支持弱于 TypeScript。
- **Rust** — 性能与类型安全极佳，但对 v1 如此小的功能学习成本过高，迭代速度慢。

**Consequences**: 分发时需目标机器预装 Node.js（或用 `pkg`/`nexe` 打包）；启动速度略慢于编译型语言，但对 CLI 工具可忽略。
