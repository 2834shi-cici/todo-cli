#!/usr/bin/env tsx
import { Command } from 'commander';
import { addTodo, listTodos, markDone } from './todo.js';
import { formatTodos } from './format.js';

const program = new Command();

program
  .name('todo')
  .description('命令行待办清单工具')
  .version('1.0.0');

// add [text]
program
  .command('add')
  .description('添加一条待办')
  .argument('[text]', '待办内容')
  .action(async (text: string | undefined) => {
    try {
      const todo = await addTodo(text ?? '');
      console.log(`已添加待办 #${todo.id}: ${todo.text}`);
    } catch (err) {
      handleError(err);
    }
  });

// list
program
  .command('list')
  .description('列出所有待办')
  .action(async () => {
    try {
      const todos = await listTodos();
      console.log(formatTodos(todos));
    } catch (err) {
      handleError(err);
    }
  });

// done <id>
program
  .command('done')
  .description('标记指定 id 的待办为已完成')
  .argument('<id>', '待办 id', parseId)
  .action(async (id: number) => {
    try {
      const todo = await markDone(id);
      console.log(`已完成待办 #${todo.id}: ${todo.text}`);
    } catch (err) {
      handleError(err);
    }
  });

program.parseAsync(process.argv);

/** 将命令行参数解析为数字 id，非数字时退出 */
function parseId(value: string): number {
  const n = Number(value);
  if (!Number.isInteger(n)) {
    console.error('错误：id 必须是数字');
    process.exit(1);
  }
  return n;
}

/** 统一错误处理：打印错误信息并以退出码 1 退出 */
function handleError(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`错误：${message}`);
  process.exit(1);
}
