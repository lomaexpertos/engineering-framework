import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {syncConsumer} from './sync-consumer.mjs';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-native-'));
const originalProvenance = [process.env.GITHUB_REPOSITORY, process.env.GITHUB_SHA];
function run(command, args, cwd, env = {}) {
  return spawnSync(command, args, {cwd, env: {...process.env, ...env}, encoding: 'utf8'});
}
function success(result) {
  assert.equal(result.status, 0, `${result.error?.message || ''}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
function git(cwd, ...args) {return success(run('git', args, cwd)).trim();}
function put(root, file, content, mode) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content, mode ? {mode} : {});
}
function fixture(name) {
  const root = path.join(temporary, name);
  fs.mkdirSync(root);
  git(root, 'init', '-q', '-b', 'feature/native');
  git(root, 'config', 'user.name', 'Harness native test');
  git(root, 'config', 'user.email', 'native@example.invalid');
  git(root, 'commit', '-qm', 'Initial fixture', '--allow-empty');
  return root;
}
function snapshot(root) {
  const entries = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      if (entry.name === '.git') continue;
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else entries.push([path.relative(root, target), fs.readFileSync(target).toString('base64')]);
    }
  }
  walk(root);
  return entries.sort();
}
function toolPath(name, {node = true, incompatible = false, docker = false} = {}) {
  const bin = path.join(temporary, name);
  fs.mkdirSync(bin);
  // Explicit shared utilities ensure absence of Docker/Node is real, independent of host PATH.
  for (const tool of ['bash', 'git', 'dirname', 'mktemp', 'rm', 'basename', 'cat', 'id', 'date', 'mkdir', 'timeout']) {
    const result = run('bash', ['-c', 'command -v "$1"', 'native-test', tool], source);
    if (result.status === 0) fs.symlinkSync(result.stdout.trim(), path.join(bin, tool));
  }
  if (incompatible) put(bin, 'node', '#!/bin/bash\nprintf "v20.19.0\\n"\n', 0o755);
  else if (node) fs.symlinkSync(process.execPath, path.join(bin, 'node'));
  if (docker) put(bin, 'docker', '#!/bin/bash\nprintf invoked >> "$DOCKER_SENTINEL"\nexit 97\n', 0o755);
  if (!node || incompatible) {
    const actualGit = fs.readlinkSync(path.join(bin, 'git'));
    fs.unlinkSync(path.join(bin, 'git'));
    put(bin, 'git', `#!/bin/bash\nprintf '%s\\n' "$*" >> "$GIT_PREFLIGHT_LOG"\nexec '${actualGit}' "$@"\n`, 0o755);
  }
  return bin;
}
try {
  process.env.GITHUB_REPOSITORY = 'lomaexpertos/engineering-framework';
  process.env.GITHUB_SHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const consumer = fixture('consumer');
  syncConsumer(consumer);
  git(consumer, 'add', '.');
  git(consumer, 'commit', '-qm', 'Install fixture');
  const sentinel = path.join(temporary, 'docker-invoked');
  const noDocker = toolPath('without-docker');
  const fakeDocker = toolPath('fake-docker', {docker: true});
  for (const PATH of [noDocker, fakeDocker]) {
    const env = {PATH, DOCKER_SENTINEL: sentinel};
    const check = JSON.parse(success(run('bash', ['.harness/check.sh', '--json'], consumer, env)));
    assert.equal(check.ok, true);
    assert.ok(JSON.parse(success(run('bash', ['.harness/work.sh', 'status'], consumer, env))));
  }
  const applicationMarker = path.join(temporary, 'application-executed-on-host');
  put(consumer, '.harness/project/config.json', JSON.stringify({
    schema_version: 1,
    runners: {application: {image: 'node:22.19.0-alpine3.22'}},
    checks: [{id: 'application', scope: 'product', required: true, runner: 'application',
      timeout_seconds: 10, argv: ['bash', '-c', `printf unsafe > '${applicationMarker}'`],
      evidence: 'process result', applicability: 'native runner isolation test'}],
  }));
  success(run('bash', ['.harness/check.sh', '--scope', 'context', '--json'], consumer, {PATH: noDocker}));
  const unavailableRunner = run('bash', ['.harness/check.sh', '--scope', 'product'], consumer, {PATH: noDocker});
  assert.equal(unavailableRunner.status, 2, unavailableRunner.stderr);
  assert.match(unavailableRunner.stderr, /docker/);
  assert.equal(fs.existsSync(applicationMarker), false, 'application command escaped its Docker runner');
  if (process.env.HARNESS_TEST_DOCKER === '1') {
    const runnerImage = 'node:22.19.0-alpine3.22';
    // Fail before execution if the explicit image is unavailable: this optional
    // integration test never needs to pull an image or install project tools.
    success(run('docker', ['image', 'inspect', runnerImage], consumer));
    const literal = `$(touch '${applicationMarker}'); \`touch '${applicationMarker}'\` "$HOME" *`;
    const program = [
      "const assert = require('node:assert/strict'); const fs = require('node:fs');",
      "assert.equal(process.cwd(), '/workspace');",
      "assert.equal(process.versions.node.split('.')[0], '22');",
      `assert.equal(process.argv[1], ${JSON.stringify(literal)});`,
      "assert.throws(() => fs.writeFileSync('/workspace/runner-write-attempt', 'unsafe'), {code: 'EROFS'});",
      "console.log('Docker runner literal argv and read-only workspace passed');",
    ].join('\n');
    const config = {
      schema_version: 1, runners: {application: {image: runnerImage}},
      checks: [{id: 'application', scope: 'product', required: true, runner: 'application',
        timeout_seconds: 30, argv: ['node', '-e', program, literal],
        evidence: 'process result', applicability: 'optional real Docker runner integration'}],
    };
    put(consumer, '.harness/project/config.json', JSON.stringify(config));
    const passed = run('bash', ['.harness/check.sh', '--scope', 'product', '--json'], consumer);
    assert.equal(JSON.parse(success(passed)).ok, true);
    assert.match(passed.stderr, /Docker runner literal argv and read-only workspace passed/);
    config.checks[0].argv = ['node', '-e', 'process.exit(5)'];
    put(consumer, '.harness/project/config.json', JSON.stringify(config));
    const failed = run('bash', ['.harness/check.sh', '--scope', 'product', '--json'], consumer);
    assert.equal(failed.status, 1, `${failed.stdout}\n${failed.stderr}`);
    const report = JSON.parse(failed.stdout);
    assert.equal(report.ok, false);
    assert.ok(report.results.some(result => result.status === 'failed' && /exit 5/.test(result.message)), JSON.stringify(report));
    assert.equal(fs.existsSync(applicationMarker), false, 'literal runner argument was evaluated by a shell');
    assert.equal(fs.existsSync(path.join(consumer, 'runner-write-attempt')), false);
    console.log('Optional Docker runner integration passed: native planner/results, literal argv, read-only mount and required check failure.');
  }
  fs.unlinkSync(path.join(consumer, '.harness/project/config.json'));
  const created = JSON.parse(success(run('bash', ['.harness/work.sh', 'create', '20261028_native', '--title', 'Native work', '--owner', 'test'], consumer, {PATH: noDocker})));
  assert.equal(created.status, 'draft');
  assert.equal(JSON.parse(success(run('bash', ['.harness/work.sh', 'status', '20261028_native'], consumer, {PATH: noDocker}))).id, '20261028_native');
  const absent = toolPath('without-node', {node: false});
  const old = toolPath('old-node', {incompatible: true});
  for (const PATH of [absent, old]) {
    for (const [script, args] of [
      [path.join(consumer, '.harness/check.sh'), ['--json']],
      [path.join(consumer, '.harness/work.sh'), ['create', '20261028_rejected', '--title', 'Rejected', '--owner', 'test']],
      [path.join(consumer, '.harness/update.sh'), []],
      [path.join(source, 'tooling/bootstrap-harness.sh'), [consumer]],
      [path.join(source, 'tooling/run-validation.sh'), []],
    ]) {
      const before = snapshot(consumer);
      const scratch = path.join(temporary, `preflight-${path.basename(PATH)}`);
      fs.mkdirSync(scratch, {recursive: true});
      const gitLog = path.join(temporary, 'preflight-git.log');
      fs.writeFileSync(gitLog, '');
      const result = run('bash', [script, ...args], consumer, {PATH, TMPDIR: scratch, GIT_PREFLIGHT_LOG: gitLog});
      assert.equal(result.status, 2, `${script}: ${result.stdout}\n${result.stderr}`);
      assert.match(result.stderr, /[Nn]ode/);
      assert.deepEqual(snapshot(consumer), before, `${script} mutated consumer before Node preflight`);
      assert.deepEqual(fs.readdirSync(scratch), [], `${script} created a source checkout before Node preflight`);
      assert.doesNotMatch(fs.readFileSync(gitLog, 'utf8'), /\b(?:init|fetch|clone)\b/, `${script} fetched before Node preflight`);
    }
  }
  const lintPreflight = run('bash', [path.join(source, 'tooling/run-validation.sh'), '--with-lint'], source, {PATH: noDocker});
  assert.equal(lintPreflight.status, 2, lintPreflight.stderr);
  assert.match(lintPreflight.stderr, /shellcheck/);
  assert.match(lintPreflight.stderr, /shfmt/);
  assert.equal(lintPreflight.stdout, '', 'validation started before lint prerequisites were checked');
  // A local committed source and process-only Git URL mapping exercise real fetch,
  // source validation and sync without depending on the network or GitHub credentials.
  const origin = path.join(temporary, 'origin');
  fs.cpSync(source, origin, {recursive: true, filter: file => !['.git', 'node_modules', '.harness_work'].includes(path.basename(file))});
  git(origin, 'init', '-q', '-b', 'main');
  git(origin, 'config', 'user.name', 'Harness native test');
  git(origin, 'config', 'user.email', 'native@example.invalid');
  git(origin, 'add', '.');
  git(origin, 'commit', '-qm', 'Local source');
  const sha = git(origin, 'rev-parse', 'HEAD');
  const env = {
    PATH: fakeDocker, DOCKER_SENTINEL: sentinel,
    GIT_CONFIG_COUNT: '2', GIT_CONFIG_KEY_0: `url.file://${origin}.insteadOf`,
    GIT_CONFIG_VALUE_0: 'https://github.com/lomaexpertos/engineering-framework.git',
    GIT_CONFIG_KEY_1: 'protocol.file.allow', GIT_CONFIG_VALUE_1: 'always',
  };
  const updateTarget = fixture('update-target');
  syncConsumer(updateTarget);
  git(updateTarget, 'add', '.');
  git(updateTarget, 'commit', '-qm', 'Install previous snapshot');
  const beforeUpdate = snapshot(updateTarget);
  success(run('bash', ['.harness/update.sh', '--ref', sha, '--check'], updateTarget, env));
  assert.deepEqual(snapshot(updateTarget), beforeUpdate, 'update --check mutated the consumer');
  success(run('bash', ['.harness/update.sh', '--ref', sha], updateTarget, env));
  const updated = JSON.parse(fs.readFileSync(path.join(updateTarget, '.harness/core/manifest.json')));
  assert.equal(updated.source_commit, sha);
  const bootstrapTarget = fixture('bootstrap-target');
  success(run('bash', [path.join(source, 'tooling/bootstrap-harness.sh'), bootstrapTarget], source, env));
  const bootstrapped = JSON.parse(fs.readFileSync(path.join(bootstrapTarget, '.harness/core/manifest.json')));
  assert.equal(bootstrapped.source_commit, sha);
  fs.unlinkSync(path.join(origin, 'README.md'));
  git(origin, 'add', '.');
  git(origin, 'commit', '-qm', 'Invalid source fixture');
  const invalidSha = git(origin, 'rev-parse', 'HEAD');
  const beforeInvalidSource = snapshot(updateTarget);
  const invalidSource = run('bash', ['.harness/update.sh', '--ref', invalidSha], updateTarget, env);
  assert.notEqual(invalidSource.status, 0, 'invalid source bypassed framework validation');
  assert.match(invalidSource.stderr, /Required structure|README\.md/);
  assert.deepEqual(snapshot(updateTarget), beforeInvalidSource, 'invalid source mutated consumer');
  fs.unlinkSync(path.join(origin, 'templates/project/.harness/environment.sh'));
  git(origin, 'add', '.');
  git(origin, 'commit', '-qm', 'Legacy snapshot without native helper');
  const legacyTarget = fixture('legacy-bootstrap-target');
  const beforeLegacyBootstrap = snapshot(legacyTarget);
  const legacyBootstrap = run('bash', [path.join(source, 'tooling/bootstrap-harness.sh'), legacyTarget], source, env);
  assert.equal(legacyBootstrap.status, 2, legacyBootstrap.stderr);
  assert.match(legacyBootstrap.stderr, /lacks the native harness environment helper/);
  assert.deepEqual(snapshot(legacyTarget), beforeLegacyBootstrap, 'legacy bootstrap mutated consumer');
  const pinnedTarget = fixture('pinned-bootstrap-target');
  success(run('bash', [path.join(source, 'tooling/bootstrap-harness.sh'), pinnedTarget, '--ref', sha], source, env));
  const pinned = JSON.parse(fs.readFileSync(path.join(pinnedTarget, '.harness/core/manifest.json')));
  assert.equal(pinned.source_commit, sha, 'bootstrap ignored its explicitly selected native snapshot');
  assert.equal(fs.existsSync(sentinel), false, 'native harness operations invoked Docker');
  console.log('Native runtime tests passed: Docker absent/sentinel, built-in checks, work, Node preflight, local-source update and bootstrap.');
} finally {
  for (const [index, key] of ['GITHUB_REPOSITORY', 'GITHUB_SHA'].entries()) {
    if (originalProvenance[index] === undefined) delete process.env[key];
    else process.env[key] = originalProvenance[index];
  }
  fs.rmSync(temporary, {recursive: true, force: true});
}
