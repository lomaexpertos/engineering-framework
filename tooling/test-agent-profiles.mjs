import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setup, doctor, readConfiguration, validatePersonal, validateProject, configurationPath, agentRoles } from './agent-profiles.mjs';
import { buildInvocation, normalizeOutput } from './agent-adapters.mjs';

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-agent-profiles-'));
try {
  const root = path.join(temporary, 'project'); fs.mkdirSync(path.join(root, '.harness/project'), { recursive: true });
  const configPath = path.join(temporary, 'user/harness/profiles.json');
  const executable = path.join(temporary, 'client-fixture');
  fs.writeFileSync(executable, `#!/usr/bin/env node\nif(process.argv.includes('--version')) console.log('fixture 2.2.0');else console.log('--sandbox --json --output-last-message --permission-prompts --tools --no-session-persistence --format --agent --model');\n`, { mode: 0o755 });
  const configuration = {
    schema_version: 1,
    profiles: { reasoning: { adapter: 'codex', model: 'explicit-test-model', executable }, worker: { adapter: 'opencode', model: 'test-provider/test-model', executable } },
    roles: Object.fromEntries(agentRoles.map(role => [role, role === 'implementation' ? 'worker' : 'reasoning'])),
    limits: { max_concurrency: 4, timeout_seconds: 60, max_correction_rounds: 2 },
  };
  const initial = await setup(root, { configPath, configuration, interactive: false });
  assert.equal(initial.diagnosis.ok, true);
  assert.equal(initial.diagnosis.execution_verified, false);
  assert.equal(fs.statSync(configPath).mode & 0o777, 0o600);
  assert.equal(configurationPath({ env: { HOME: temporary } }), path.join(temporary, '.config/harness/profiles.json'));
  assert.equal(configurationPath({ env: { XDG_CONFIG_HOME: temporary } }), path.join(temporary, 'harness/profiles.json'));
  fs.writeFileSync(path.join(root, '.harness/project/agents.json'), JSON.stringify({ schema_version: 1, limits: { max_concurrency: 1, timeout_seconds: 30 }, model_allowlist: { implementation: ['test-provider/test-model'] } }));
  assert.equal(readConfiguration(root, { configPath }).limits.max_concurrency, 1);
  assert.equal(readConfiguration(root, { configPath }).limits.timeout_seconds, 30);
  const legacy = { ...configuration, version: 0 }; delete legacy.schema_version;
  fs.writeFileSync(configPath, JSON.stringify(legacy));
  const migrated = await setup(root, { configPath, interactive: false });
  assert.equal(migrated.migrated, true);
  assert.ok(migrated.backup);
  assert.equal(JSON.parse(fs.readFileSync(migrated.backup)).version, 0);
  assert.equal(readConfiguration(root, { configPath }).schema_version, 1);
  assert.throws(() => validatePersonal({ ...configuration, token: 'forbidden' }), /fields/);
  assert.throws(() => validatePersonal({ ...configuration, roles: { definition: 'missing' } }), /unknown/);
  assert.throws(() => validatePersonal({ ...configuration, limits: { max_concurrency: 0 } }), /limit/);
  assert.throws(() => validatePersonal({ ...configuration, profiles: { bad: { adapter: 'codex', model: 'm', shell_allowlist: ['*'] } } }), /policy/);
  assert.throws(() => validateProject({ schema_version: 1, allowed_adapters: ['unknown'] }), /allowed_adapters/);
  assert.throws(() => validateProject({ schema_version: 1, minimum_track: 'unknown' }), /minimum_track/);
  assert.equal(validateProject({ schema_version: 1, minimum_track: 'standard' }).minimum_track, 'standard');
  fs.writeFileSync(path.join(root, '.harness/project/agents.json'), JSON.stringify({ schema_version: 1, allowed_adapters: ['claude'] }));
  assert.equal(doctor(root, { configPath }).ok, false);
  fs.unlinkSync(path.join(root, '.harness/project/agents.json'));
  const focused = { schema_version: 1, profiles: { worker: configuration.profiles.worker, unused: { adapter: 'codex', model: 'unused-model', executable: path.join(temporary, 'not-installed') } }, roles: { implementation: 'worker', security: 'unused' } };
  fs.writeFileSync(configPath, JSON.stringify(focused));
  assert.equal(doctor(root, { configPath, roles: ['implementation'] }).ok, true, 'active-role preflight must not require absent roles or unavailable unused clients');
  assert.deepEqual(Object.keys(doctor(root, { configPath, roles: ['implementation'] }).profiles), ['worker']);
  assert.equal(doctor(root, { configPath }).ok, false, 'general diagnosis still reports the incomplete team');
  fs.writeFileSync(path.join(root, '.harness/project/agents.json'), JSON.stringify({ schema_version: 1, allowed_adapters: ['opencode'], model_allowlist: { security: ['different-model'] } }));
  assert.equal(doctor(root, { configPath, roles: ['implementation'] }).ok, true, 'constraints apply to the roles actually used');
  fs.writeFileSync(path.join(root, '.harness/project/agents.json'), JSON.stringify({ schema_version: 1, required_roles: ['security'] }));
  assert.equal(doctor(root, { configPath, roles: ['implementation'] }).ok, false, 'explicit project role requirements cannot be relaxed by scoped preflight');
  assert.equal(doctor(root, { configPath, roles: ['unknown'] }).ok, false);
  fs.unlinkSync(path.join(root, '.harness/project/agents.json'));
  const partial = { schema_version: 1, profiles: {}, roles: {} };
  await setup(root, { configPath, configuration: partial, interactive: false });
  assert.ok(doctor(root, { configPath }).issues.some(issue => issue.includes('definition')));
  const linked = path.join(temporary, 'link.json'); fs.symlinkSync(configPath, linked);
  await assert.rejects(setup(root, { configPath: linked, interactive: false }), /symlink/);
  assert.equal(doctor(root, { configPath: path.join(temporary, 'absent') }).ok, false);
  const prompt = 'Literal $(touch forbidden) `id` $HOME; do not execute.';
  for (const adapter of ['codex', 'claude', 'opencode']) {
    const profile = { adapter, model: adapter === 'opencode' ? 'test/model' : 'test-model' };
    const invocation = buildInvocation(profile, { prompt, workspace: root, resultPath: path.join(temporary, 'result.json'), readOnly: true });
    assert.equal(invocation.stdin, prompt);
    assert.ok(!invocation.args.includes(prompt));
    assert.equal(invocation.capabilities.permission, 'read-only');
    assert.ok(!invocation.args.some(argument => argument.includes('bypass')));
    if (adapter === 'claude') {
      const tools = invocation.args[invocation.args.indexOf('--tools') + 1];
      assert.ok(!tools.includes('Edit') && !tools.includes('Bash'));
    }
    if (adapter === 'opencode') {
      const permissions = JSON.parse(invocation.env.OPENCODE_CONFIG_CONTENT).agents['harness-worker'].permissions;
      assert.ok(permissions.some(rule => rule.action === '*' && rule.effect === 'deny'));
      assert.ok(!permissions.some(rule => rule.action === 'edit' && rule.effect === 'allow'));
      assert.ok(invocation.args.includes('--standalone'));
    }
  }
  const body = { schema_version: 1, task_id: 'test', status: 'completed', summary: 'fixture only' };
  assert.deepEqual(normalizeOutput({ adapter: 'claude' }, JSON.stringify({ result: JSON.stringify(body) })), body);
  assert.deepEqual(normalizeOutput({ adapter: 'opencode' }, JSON.stringify({ type: 'text', part: { text: JSON.stringify(body) } })), body);
  assert.deepEqual(normalizeOutput({ adapter: 'codex' }, JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: JSON.stringify(body) } })), body);
  assert.throws(() => normalizeOutput({ adapter: 'claude' }, 'not a result'), /structured/);
  console.log('Agent profiles: configuración, migración, restricciones, diagnóstico y argv verificados; clientes simulados explícitos.');
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
