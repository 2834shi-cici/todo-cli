import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

/** 默认数据文件路径：~/.todo-cli/data.json */
export const DATA_PATH = join(homedir(), '.todo-cli', 'data.json');

// 内部数据路径，默认等于 DATA_PATH；可通过 setDataPath 覆盖（主要供测试隔离真实用户数据）
let currentDataPath = DATA_PATH;

/** 覆盖数据文件路径（供测试使用，避免污染用户真实数据） */
export function setDataPath(path: string): void {
  currentDataPath = path;
}

/** JSON 文件的持久化结构 */
export interface TodoStore {
  nextId: number;
  todos: Todo[];
}

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
}

/**
 * 读取数据文件。
 * - 文件不存在 → 返回空仓库（nextId=1, todos=[]）
 * - JSON 解析失败 → 抛出 Error，由上层处理
 */
export async function loadStore(): Promise<TodoStore> {
  try {
    const raw = await readFile(currentDataPath, 'utf-8');
    const parsed = JSON.parse(raw) as TodoStore;
    // 兼容旧格式：若只有数组无 nextId，迁移为新结构
    if (Array.isArray(parsed)) {
      const maxId = parsed.reduce((m, t) => Math.max(m, t.id), 0);
      return { nextId: maxId + 1, todos: parsed };
    }
    if (!parsed.todos || !Array.isArray(parsed.todos)) {
      return { nextId: parsed.nextId ?? 1, todos: [] };
    }
    return { nextId: parsed.nextId ?? 1, todos: parsed.todos };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { nextId: 1, todos: [] };
    }
    if (err instanceof SyntaxError) {
      throw new Error(
        `数据文件损坏，请检查 ${currentDataPath}（JSON 解析失败）`
      );
    }
    throw err;
  }
}

/**
 * 写入数据文件。
 * - 自动创建父目录
 * - 返回 Promise<void>，失败时抛出 Error
 */
export async function saveStore(store: TodoStore): Promise<void> {
  await mkdir(dirname(currentDataPath), { recursive: true });
  await writeFile(currentDataPath, JSON.stringify(store, null, 2), 'utf-8');
}
