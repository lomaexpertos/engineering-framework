import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const files = [];
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.harness_work'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (entry.isFile()) files.push(file);
  }
}
visit('.');
let failed = false;
function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    failed = true;
    console.error(result.error?.message || result.stdout + result.stderr);
  }
}
for (const file of files) {
  if (file.endsWith('.mjs')) run(process.execPath, ['--check', file]);
  if (file.endsWith('.sh')) {
    run('bash', ['-n', file]);
    run('shellcheck', ['--severity=warning', file]);
    run('shfmt', ['-d', '-i', '2', '-ci', file]);
  }
  if (/\.(?:md|mjs|json|sh|ya?ml)$/.test(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}|AKIA[A-Z0-9]{16}/.test(content)) {
      failed = true;
      console.error(`Posible credencial en ${file}; revisar sin imprimir su valor.`);
    }
  }
}
if (failed) process.exitCode = 1;
else console.log('Source lint passed: JavaScript/Bash syntax, ShellCheck, shfmt and credential patterns.');
