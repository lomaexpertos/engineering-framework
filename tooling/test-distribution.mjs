import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { planConsumer, syncConsumer } from './sync-consumer.mjs';
import { recoverTransaction } from './distribution-transaction.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-distribution-'));
process.env.GITHUB_REPOSITORY = 'lomaexpertos/engineering-framework';
process.env.GITHUB_SHA = '0123456789abcdef0123456789abcdef01234567';
const manifestPath = '.harness/core/manifest.json';
function git(directory, ...args) {
  const result = spawnSync('git', args, { cwd: directory, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
function write(directory, file, content) {
  fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
  fs.writeFileSync(path.join(directory, file), content);
}
function commit(directory) { git(directory, 'add', '--all'); git(directory, 'commit', '--allow-empty', '-m', 'fixture'); }
function fixture(name) {
  const directory = path.join(root, name);
  fs.mkdirSync(directory);
  git(directory, 'init', '-b', 'feature/harness');
  git(directory, 'config', 'user.name', 'Harness test');
  git(directory, 'config', 'user.email', 'test@example.invalid');
  commit(directory);
  return directory;
}
function read(directory, file) { return fs.readFileSync(path.join(directory, file), 'utf8'); }
function snapshot(directory) {
  const entries = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.git' || path.relative(directory, current).startsWith('.harness_work/runtime')) continue;
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) walk(file);
      else entries.push([path.relative(directory, file), entry.isSymbolicLink() ? fs.readlinkSync(file) : fs.readFileSync(file).toString('base64')]);
    }
  }
  walk(directory);
  return entries.sort();
}
function rejects(directory, pattern) {
  const before = snapshot(directory);
  assert.throws(() => planConsumer(directory), pattern);
  assert.throws(() => syncConsumer(directory), pattern);
  assert.deepEqual(snapshot(directory), before);
}
function assertSafe(directory, relative) {
  let target = directory;
  for (const part of relative.split('/')) {
    assert.ok(part && part !== '..' && part !== '.');
    target = path.join(target, part);
    if (fs.lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('symbolic link');
  }
}
try {
  const consumer = fixture('consumer');
  write(consumer, 'AGENTS.md', '# Local\nPreserve local rules.\n');
  write(consumer, 'docs/business.md', '# Existing knowledge\n');
  write(consumer, '.harness/project/policies/local.md', '# Local policy\n');
  write(consumer, '.agents/skills/local/SKILL.md', '# Local skill\n');
  commit(consumer);
  const before = snapshot(consumer);
  assert.equal(planConsumer(consumer).operation, 'install');
  assert.deepEqual(snapshot(consumer), before);
  const head = git(consumer, 'rev-parse', 'HEAD');
  syncConsumer(consumer);
  assert.equal(git(consumer, 'rev-parse', 'HEAD'), head);
  assert.equal(git(consumer, 'diff', '--cached', '--name-only'), '');
  assert.match(read(consumer, 'AGENTS.md'), /Preserve local rules/);
  assert.ok(read(consumer, 'AGENTS.md').trimEnd().split('\n').length <= 100);
  assert.equal(read(consumer, 'docs/business.md'), '# Existing knowledge\n');
  assert.equal(read(consumer, '.harness/project/policies/local.md'), '# Local policy\n');
  assert.equal(read(consumer, 'CLAUDE.md'), '@AGENTS.md\n');
  const manifest = JSON.parse(read(consumer, manifestPath));
  assert.equal(manifest.schema_version, 2);
  assert.ok(Object.keys(manifest.files).length > 50);
  assert.ok(fs.existsSync(path.join(consumer, '.harness/update.sh')));
  for (const name of manifest.managed_skills) {
    assert.equal(read(consumer, `.agents/skills/${name}/SKILL.md`), read(consumer, `.claude/skills/${name}/SKILL.md`));
    assert.equal(read(consumer, `.agents/skills/${name}/SKILL.md`), read(consumer, `.harness/core/skills/${name}/SKILL.md`));
  }
  commit(consumer);
  const installed = snapshot(consumer);
  assert.equal(planConsumer(consumer).operation, 'unchanged');
  syncConsumer(consumer);
  assert.deepEqual(snapshot(consumer), installed);
  write(consumer, '.harness/core/README.md', 'uncommitted user edit\n');
  rejects(consumer, /cambios locales/);
  git(consumer, 'add', '.harness/core/README.md');
  rejects(consumer, /cambios locales/);
  commit(consumer);
  assert.throws(() => planConsumer(consumer), /divergente/);
  assert.equal(planConsumer(consumer, { repair: true }).operation, 'repair');
  syncConsumer(consumer, { repair: true });
  commit(consumer);
  for (const flag of ['skip-worktree', 'assume-unchanged']) {
    git(consumer, 'update-index', `--${flag}`, '.harness/core/README.md');
    rejects(consumer, /skip-worktree|assume-unchanged/);
    git(consumer, 'update-index', `--no-${flag}`, '.harness/core/README.md');
  }
  write(consumer, '.gitignore', '.harness/core/\n');
  rejects(consumer, /ignorados/);
  fs.unlinkSync(path.join(consumer, '.gitignore'));
  write(consumer, 'application.txt', 'unrelated staged work\n');
  git(consumer, 'add', 'application.txt');
  const index = fs.readFileSync(path.join(consumer, '.git/index'));
  process.env.GITHUB_SHA = '1'.repeat(40);
  syncConsumer(consumer);
  assert.deepEqual(fs.readFileSync(path.join(consumer, '.git/index')), index);
  commit(consumer);
  for (const [name, configure, pattern] of [
    ['markers', d => write(d, 'AGENTS.md', '<!-- engineering-framework:start -->\n'), /marcadores/],
    ['long-agents', d => write(d, 'AGENTS.md', 'local instruction\n'.repeat(99)), /100 líneas/],
    ['collision', d => write(d, '.agents/skills/add-observability/SKILL.md', 'local'), /colisiona/],
    ['unknown', d => write(d, '.harness/core/custom.md', 'unknown'), /ownership/],
    ['wrapper-collision', d => write(d, '.harness/update.sh', 'project owned'), /ownership/],
    ['environment-collision', d => write(d, '.harness/environment.sh', 'project owned'), /ownership/],
    ['incomplete', d => write(d, 'FRAMEWORK_VERSION', '1.0.0\n'), /incompleta/],
    ['parent-file', d => write(d, '.harness', 'file'), /not a directory/],
    ['symlink', d => fs.symlinkSync(root, path.join(d, '.agents')), /symbolic link/],
  ]) {
    const directory = fixture(name);
    configure(directory);
    commit(directory);
    rejects(directory, pattern);
  }
  const legacy = fixture('legacy');
  const nativeMigration = fixture('v2-runtime-migration');
  syncConsumer(nativeMigration);
  const v2 = JSON.parse(read(nativeMigration, manifestPath));
  v2.framework_version = '2.0.0';
  fs.unlinkSync(path.join(nativeMigration, '.harness/environment.sh'));
  delete v2.files['.harness/environment.sh'];
  const oldRuntime = '.harness/core/runtime/Dockerfile';
  const oldRuntimeContent = 'FROM node:22.19.0-alpine3.22\nWORKDIR /runtime\nCOPY . .\nUSER node\n';
  write(nativeMigration, oldRuntime, oldRuntimeContent);
  v2.files[oldRuntime] = createHash('sha256').update(oldRuntimeContent).digest('hex');
  write(nativeMigration, manifestPath, JSON.stringify(v2));
  commit(nativeMigration);
  const migrationBefore = snapshot(nativeMigration);
  assert.throws(() => syncConsumer(nativeMigration), /MAJOR/);
  assert.deepEqual(snapshot(nativeMigration), migrationBefore);
  syncConsumer(nativeMigration, {allowMajor: true});
  assert.ok(fs.existsSync(path.join(nativeMigration, '.harness/environment.sh')));
  assert.ok(!fs.existsSync(path.join(nativeMigration, oldRuntime)));
  const unownedLegacy = fixture('unowned-legacy-symlink');
  syncConsumer(unownedLegacy);
  commit(unownedLegacy);
  const external = path.join(root, 'external-preserve');
  fs.mkdirSync(path.join(external, 'empty/nested'), { recursive: true });
  fs.mkdirSync(path.join(unownedLegacy, 'engineering'));
  fs.symlinkSync(external, path.join(unownedLegacy, 'engineering/corporate'));
  commit(unownedLegacy);
  const externalBefore = fs.readdirSync(external, { recursive: true }).sort();
  const savedSource = process.env.GITHUB_SHA;
  process.env.GITHUB_SHA = 'a'.repeat(40);
  syncConsumer(unownedLegacy);
  assert.deepEqual(fs.readdirSync(external, { recursive: true }).sort(), externalBefore);
  assert.ok(fs.lstatSync(path.join(unownedLegacy, 'engineering/corporate')).isSymbolicLink());
  process.env.GITHUB_SHA = savedSource;
  const profiled = fixture('profiled');
  write(profiled, 'CLAUDE.md', '# Local Claude preferences\nKeep my conventions.\n');
  write(profiled, '.harness/project/config.json', JSON.stringify({ schema_version: 1, profiles: ['frontend'] }));
  write(profiled, '.harness/project/skills/reconcile/SKILL.md', '---\nname: reconcile\ndescription: Reconcile local domain state.\n---\n# Local procedure\n');
  write(profiled, '.harness/project/skills/reconcile/references/contract.md', '# Own contract\n');
  commit(profiled);
  syncConsumer(profiled);
  assert.match(read(profiled, 'CLAUDE.md'), /Keep my conventions/);
  assert.equal((read(profiled, 'CLAUDE.md').match(/^@AGENTS\.md$/gm) || []).length, 1);
  const profiledManifest = JSON.parse(read(profiled, manifestPath));
  assert.ok(profiledManifest.managed_skills.includes('project-reconcile'));
  assert.ok(profiledManifest.corporate_skills.includes('implement-ui-change'));
  assert.ok(!profiledManifest.corporate_skills.includes('database-schema-change'));
  assert.ok(fs.existsSync(path.join(profiled, '.harness/core/skills/database-schema-change/SKILL.md')));
  assert.match(read(profiled, '.agents/skills/project-reconcile/SKILL.md'), /name: project-reconcile/);
  assert.equal(read(profiled, '.agents/skills/project-reconcile/references/contract.md'), '# Own contract\n');
  assert.match(read(profiled, '.harness/project/skills/reconcile/SKILL.md'), /name: reconcile/);
  commit(profiled);
  write(profiled, '.harness/project/config.json', JSON.stringify({ schema_version: 1, profiles: [] }));
  syncConsumer(profiled);
  assert.equal((read(profiled, 'CLAUDE.md').match(/^@AGENTS\.md$/gm) || []).length, 1);
  assert.ok(!fs.existsSync(path.join(profiled, '.agents/skills/implement-ui-change/SKILL.md')));
  assert.ok(fs.existsSync(path.join(profiled, '.agents/skills/project-reconcile/SKILL.md')));
  write(legacy, 'FRAMEWORK_VERSION', '1.2.0\n');
  write(legacy, 'engineering/corporate/metadata/installation.json', JSON.stringify({ schema_version: 1, framework_version: '1.2.0', source_repository: 'engineering-framework', source_commit: null, managed_skills: [] }));
  write(legacy, 'engineering/corporate/policies/README.md', '# Old generated policies\n');
  write(legacy, 'engineering/docs/index.md', '# Legacy project knowledge\n');
  commit(legacy);
  assert.equal(planConsumer(legacy).major_update, true);
  assert.throws(() => syncConsumer(legacy), /MAJOR/);
  syncConsumer(legacy, { allowMajor: true });
  assert.ok(!fs.existsSync(path.join(legacy, 'FRAMEWORK_VERSION')));
  assert.equal(read(legacy, 'engineering/docs/index.md'), '# Legacy project knowledge\n');
  const interrupted = fixture('interrupted');
  const killed = fixture('killed-mid-write');
  const killedBefore = snapshot(killed);
  const syncModule = new URL('./sync-consumer.mjs', import.meta.url).href;
  const crash = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import fs from 'node:fs';
    import { syncConsumer } from ${JSON.stringify(syncModule)};
    const open = fs.openSync, write = fs.writeFileSync;
    const staged = new Set();
    fs.openSync = (file, ...args) => {
      const fd = open(file, ...args);
      if (String(file).endsWith('.harness-update-tmp') && !String(file).includes('update.json')) staged.add(fd);
      return fd;
    };
    fs.writeFileSync = (file, data, ...args) => {
      if (staged.has(file)) { fs.writeSync(file, Buffer.from(data).subarray(0, 5)); process.exit(99); }
      return write(file, data, ...args);
    };
    syncConsumer(${JSON.stringify(killed)});
  `], { encoding: 'utf8' });
  assert.equal(crash.status, 99, crash.stderr);
  // The process is confirmed terminal; release only its fixture lock before recovery.
  fs.rmdirSync(path.join(killed, '.harness_work/runtime/update.lock'));
  recoverTransaction(killed, assertSafe);
  assert.deepEqual(snapshot(killed), killedBefore);
  const interruptedBefore = snapshot(interrupted);
  assert.throws(() => syncConsumer(interrupted, { failAfter: 3 }), /interrupted/);
  assert.ok(fs.existsSync(path.join(interrupted, '.harness_work/runtime/update.json')));
  recoverTransaction(interrupted, assertSafe);
  assert.deepEqual(snapshot(interrupted), interruptedBefore);
  syncConsumer(interrupted);
  commit(interrupted);
  process.env.GITHUB_SHA = '2'.repeat(40);
  assert.throws(() => syncConsumer(interrupted, { failAfter: 1 }), /interrupted/);
  write(interrupted, manifestPath, 'later user edit');
  assert.throws(() => recoverTransaction(interrupted, assertSafe), /edición posterior/);
  const linkedBase = fixture('worktree-base');
  const invalidMetadata = fixture('metadata-invalid');
  syncConsumer(invalidMetadata);
  commit(invalidMetadata);
  const validMetadata = JSON.parse(read(invalidMetadata, manifestPath));
  for (const [change, pattern] of [
    [{ schema_version: 99 }, /metadata/],
    [{ managed_skills: ['same', 'same'] }, /metadata/],
    [{ files: { '../escape': '0'.repeat(64) } }, /inseguro/],
    [{ source_commit: 'short' }, /metadata/],
    [{ framework_version: '99.0.0' }, /downgrade/],
  ]) {
    write(invalidMetadata, manifestPath, JSON.stringify({ ...validMetadata, ...change }));
    rejects(invalidMetadata, pattern);
  }
  write(invalidMetadata, manifestPath, JSON.stringify(validMetadata));
  commit(invalidMetadata);
  write(invalidMetadata, '.harness/core/unknown-committed.md', 'must preserve');
  commit(invalidMetadata);
  rejects(invalidMetadata, /ownership/);
  fs.unlinkSync(path.join(invalidMetadata, '.harness/core/unknown-committed.md'));
  commit(invalidMetadata);
  fs.mkdirSync(path.join(invalidMetadata, '.harness_work/runtime/work.lock'), { recursive: true });
  process.env.GITHUB_SHA = '3'.repeat(40);
  assert.throws(() => syncConsumer(invalidMetadata), /work lock/);
  const linked = path.join(root, 'worktree');
  git(linkedBase, 'worktree', 'add', '-b', 'linked', linked);
  syncConsumer(linked);
  assert.equal(git(linked, 'branch', '--show-current'), 'linked');
  const detached = fixture('detached');
  git(detached, 'switch', '--detach');
  rejects(detached, /Git/);
  const noSource = fixture('no-source');
  delete process.env.GITHUB_SHA;
  rejects(noSource, /GITHUB_SHA/);
} finally { fs.rmSync(root, { recursive: true, force: true }); }
console.log('Distribution tests passed.');
