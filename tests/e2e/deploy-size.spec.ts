import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LIMIT = 26214400;
let dir = '';

const run = (...args: string[]) =>
  spawnSync(process.execPath, ['scripts/deploy/check-size.mjs', ...args], { encoding: 'utf8' });

function sparse(rel: string, bytes: number): void {
  const f = path.join(dir, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, '');
  fs.truncateSync(f, bytes);
}

test.beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'k30-size-'));
});
test.afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

test('small files pass', () => {
  sparse('a.txt', 10);
  sparse('sub/b.txt', 20);
  const r = run(dir);
  expect(r.status).toBe(0);
  expect(r.stdout).toContain('SIZE OK 2 files');
});

test('a file exactly at the limit passes', () => {
  sparse('edge.bin', LIMIT);
  expect(run(dir).status).toBe(0);
});

test('one byte over the limit fails with the file named', () => {
  sparse('big/a.bin', LIMIT + 1);
  const r = run(dir);
  expect(r.status).toBe(1);
  expect(r.stderr).toContain('SIZE FAIL big/a.bin 26214401 B');
  expect(r.stderr).toContain('SIZE FAIL 1 file(s) over limit');
});

test('bad input exits with 2', () => {
  const missing = run(path.join(dir, 'nope'));
  expect(missing.status).toBe(2);
  expect(missing.stderr).toContain('SIZE ERROR');
  sparse('a.txt', 1);
  const bad = run(dir, '--max-bytes', 'abc');
  expect(bad.status).toBe(2);
  expect(bad.stderr).toContain('SIZE ERROR');
});
