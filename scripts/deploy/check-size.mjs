// 배포 폴더 안 파일마다 크기 상한(기본 25 MiB, 정적 호스팅의 파일당 제한)을 넘는지 검사한다.
// 실행: node scripts/deploy/check-size.mjs [dir] [--max-bytes N]   (PLAN §4.7)
// exit 0 = 통과, 1 = 넘는 파일 있음, 2 = 인자·경로 오류. node 내장 모듈만 쓴다.
import { lstat, readdir } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_MAX = 26214400;

function fail(reason) {
  process.stderr.write(`SIZE ERROR ${reason}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  let dir = 'dist';
  let dirSet = false;
  let max = DEFAULT_MAX;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--max-bytes') {
      const raw = argv[i + 1];
      i++;
      if (raw === undefined || !/^\d+$/.test(raw) || Number(raw) <= 0 || !Number.isSafeInteger(Number(raw))) {
        fail(`--max-bytes must be a positive integer (got ${raw === undefined ? 'nothing' : JSON.stringify(raw)})`);
      }
      max = Number(raw);
    } else if (arg.startsWith('-')) {
      fail(`unknown option ${arg}`);
    } else if (!dirSet) {
      dir = arg;
      dirSet = true;
    } else {
      fail(`unexpected argument ${arg}`);
    }
  }
  return { dir, max };
}

async function walk(root, rel, out) {
  const entries = await readdir(path.join(root, rel), { withFileTypes: true });
  for (const entry of entries) {
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      await walk(root, childRel, out);
    } else if (entry.isFile()) {
      const st = await lstat(path.join(root, childRel));
      out.push({ rel: childRel, size: st.size });
    }
  }
}

async function main() {
  const { dir, max } = parseArgs(process.argv.slice(2));
  const root = path.resolve(process.cwd(), dir);
  let st;
  try {
    st = await lstat(root);
  } catch {
    fail(`directory not found: ${dir}`);
  }
  if (!st.isDirectory()) fail(`not a directory: ${dir}`);

  const files = [];
  await walk(root, '', files);
  files.sort((a, b) => b.size - a.size || a.rel.localeCompare(b.rel));

  const over = files.filter((f) => f.size > max);
  if (over.length > 0) {
    for (const f of over) process.stderr.write(`SIZE FAIL ${f.rel} ${f.size} B > ${max} B\n`);
    process.stderr.write(`SIZE FAIL ${over.length} file(s) over limit\n`);
    process.exit(1);
  }

  const largest = files[0];
  const largestText = largest ? `${largest.rel} ${largest.size} B` : '- 0 B';
  process.stdout.write(`SIZE OK ${files.length} files, largest ${largestText} (limit ${max} B)\n`);
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
