# 配置边界

todo-cli v1 的配置极简，**无环境变量、无配置文件、无 feature flag**。所有行为由代码硬编码决定。

## 硬编码配置项

| 配置项 | 值 | 位置 |
|--------|-----|------|
| 数据文件路径 | `~/.todo-cli/data.json` | `src/storage.ts:7` |
| CLI 命令名 | `todo` | `src/index.ts:9` |
| 版本号 | `1.0.0` | `src/index.ts:11` |
| id 对齐宽度 | 3 位 | `src/format.ts:17` |

> **源码** `src/storage.ts:6-7`、`src/index.ts:8-11`、`src/format.ts:17`

## 无配置边界内容

本项目不包含以下内容：

- 环境变量（`.env`）
- 配置文件（`config.json`、`yaml`）
- Feature flag
- 可配置的数据路径（路径写死在 `DATA_PATH`）

> 注：v1 刻意不提供配置入口，保持极简。若未来需要可配置数据路径，可在 `storage.ts` 中引入环境变量覆盖。
