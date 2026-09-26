import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

/**
 * CLI 端到端测试：通过子进程实际运行 `tsx src/index.ts <args>`，
 * 验证命令解析、stdout/stderr 与退出码。
 * 每个测试使用独立的临时 HOME 目录，隔离数据文件，互不干扰。
 */

const require = createRequire(import.meta.url);
const tsxPkgPath = require.resolve('tsx/package.json');
const TSX_CLI = join(dirname(tsxPkgPath), 'dist', 'cli.mjs');

const PROJECT_ROOT = join(import.meta.dirname, '..');
const INDEX_TS = join(PROJECT_ROOT, 'src', 'index.ts');

interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** 以指定 HOME 运行 CLI 子进程，收集退出码与输出 */
function runCli(args: string[], homeDir: string): Promise<CliResult> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [TSX_CLI, INDEX_TS, ...args], {
      env: { ...process.env, HOME: homeDir, USERPROFILE: homeDir },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('close', (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

/** 为每个测试创建独立临时 HOME，测试结束后清理 */
async function withTempHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), 'todo-cli-test-'));
  try {
    return await fn(home);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

// —— RED→GREEN 循环 1：添加待办成功 ——
test('todo add "测试" 输出已添加待办且退出码为 0', async () => {
  await withTempHome(async (home) => {
    const res = await runCli(['add', '测试'], home);
    assert.equal(res.code, 0, `期望退出码 0，stderr: ${res.stderr}`);
    assert.match(res.stdout, /已添加待办 #/);
  });
});

// —— RED→GREEN 循环 2：空列表提示 ——
test('todo list 空列表时输出提示文案且退出码为 0', async () => {
  await withTempHome(async (home) => {
    const res = await runCli(['list'], home);
    assert.equal(res.code, 0);
    assert.match(res.stdout, /暂无待办/);
  });
});

// —— RED→GREEN 循环 3：列出已添加的待办 ——
test('todo list 输出格式化列表且退出码为 0', async () => {
  await withTempHome(async (home) => {
    await runCli(['add', '买牛奶'], home);
    const res = await runCli(['list'], home);
    assert.equal(res.code, 0);
    assert.match(res.stdout, /买牛奶/);
    assert.match(res.stdout, /\[ \]/);
  });
});

// —— RED→GREEN 循环 4：标记完成成功 ——
test('todo done <id> 输出已完成待办且退出码为 0', async () => {
  await withTempHome(async (home) => {
    await runCli(['add', '写周报'], home);
    const res = await runCli(['done', '1'], home);
    assert.equal(res.code, 0, `期望退出码 0，stderr: ${res.stderr}`);
    assert.match(res.stdout, /已完成待办 #/);
  });
});

// —— RED→GREEN 循环 5：非数字 id 报错 ——
test('todo done abc 输出 id 必须是数字且退出码为 1', async () => {
  await withTempHome(async (home) => {
    const res = await runCli(['done', 'abc'], home);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /id 必须是数字/);
  });
});

// —— RED→GREEN 循环 6：空内容报错 ——
test('todo add "" 输出待办内容不能为空且退出码为 1', async () => {
  await withTempHome(async (home) => {
    const res = await runCli(['add', ''], home);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /待办内容不能为空/);
  });
});

// —— RED→GREEN 循环 7：不存在的 id 报错（US-6） ——
test('todo done 999 输出未找到 id 且退出码为 1', async () => {
  await withTempHome(async (home) => {
    const res = await runCli(['done', '999'], home);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /未找到 id 为 999 的待办/);
  });
});
