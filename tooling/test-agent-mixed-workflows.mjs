import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { setup, agentRoles } from './agent-profiles.mjs';
import { createWorkflow, runWorkflow, advanceWorkflow, workflowStatus } from './agent-workflow.mjs';
import { operate } from './harness-work.mjs';

// Optional integration uses real CLIs and deterministic loopback transport.
// It verifies orchestration, not model reasoning or application correctness.
const primaries = (process.env.HARNESS_MIXED_PRIMARIES || 'codex,claude').split(',');
assert.ok(primaries.length && primaries.every(client => ['codex', 'claude'].includes(client)), 'Unknown primary');
const previousEnvironment = { ...process.env };
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-mixed-workflows-'));
const captures = [];
const taskCaptures = new Map();
function strings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}
function resultFor(payload) {
  let task;
  for (const text of strings(payload)) {
    const start = text.indexOf('TASK\n');
    const end = text.indexOf('\nINITIATIVE SUMMARY', start);
    if (start !== -1 && end !== -1) {
      try { task = JSON.parse(text.slice(start + 5, end)); break; } catch { /* Other client messages may quote a prior result. */ }
    }
  }
  if (!task) return { title: 'Harness deterministic transport fixture' };
  taskCaptures.set(task.id, (taskCaptures.get(task.id) || 0) + 1);
  return { schema_version: 1, task_id: task.id, status: 'completed', summary: 'Deterministic client transport fixture; no model inference', changes: [],
    verification: [{ command: 'git diff --exit-code HEAD --', outcome: 'passed', evidence: 'Harness test executed this Git check before launching clients; workspace remains unchanged. Transport fixture evidence, not application test certification.' }],
    findings: [], questions: [], pending: [], durable_candidates: [] };
}
const server = http.createServer(async (request, response) => {
  let body = '';
  for await (const part of request) body += part;
  let payload;
  try { payload = JSON.parse(body); } catch { payload = {}; }
  captures.push({ url: request.url, payload });
  const text = JSON.stringify(resultFor(payload));
  const send = (event, data) => response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  if (request.url.includes('count_tokens')) {
    response.writeHead(200, { 'content-type': 'application/json' }); response.end('{"input_tokens":100}'); return;
  }
  if (request.url.includes('/responses')) {
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    const item = { type: 'message', id: 'msg_harness_fixture', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text, annotations: [] }] };
    send('response.created', { type: 'response.created', response: { id: 'resp_harness_fixture', status: 'in_progress', output: [] } });
    send('response.output_item.added', { type: 'response.output_item.added', output_index: 0, item: { ...item, status: 'in_progress', content: [] } });
    send('response.output_text.delta', { type: 'response.output_text.delta', item_id: item.id, output_index: 0, content_index: 0, delta: text });
    send('response.output_item.done', { type: 'response.output_item.done', output_index: 0, item });
    send('response.completed', { type: 'response.completed', response: { id: 'resp_harness_fixture', object: 'response', status: 'completed', output: [item], usage: { input_tokens: 100, output_tokens: 100, total_tokens: 200 } } });
    response.end(); return;
  }
  if (request.url.includes('/messages')) {
    const message = { id: 'msg_harness_fixture', type: 'message', role: 'assistant', model: payload.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 100, output_tokens: 0 } };
    if (!payload.stream) { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ ...message, content: [{ type: 'text', text }], stop_reason: 'end_turn' })); return; }
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    send('message_start', { type: 'message_start', message });
    send('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
    send('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } });
    send('content_block_stop', { type: 'content_block_stop', index: 0 });
    send('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 100 } });
    send('message_stop', { type: 'message_stop' }); response.end(); return;
  }
  if (request.url.includes('/chat/completions')) {
    if (!payload.stream) {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ id: 'chatcmpl_harness', object: 'chat.completion', model: payload.model, choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: 'stop' }], usage: { prompt_tokens: 100, completion_tokens: 100, total_tokens: 200 } })); return;
    }
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    for (const delta of [{ role: 'assistant', content: text }, {}]) response.write(`data: ${JSON.stringify({ id: 'chatcmpl_harness', object: 'chat.completion.chunk', created: 1, model: payload.model, choices: [{ index: 0, delta, finish_reason: delta.content ? null : 'stop' }] })}\n\n`);
    response.end('data: [DONE]\n\n'); return;
  }
  response.writeHead(200, { 'content-type': 'application/json' }); response.end('{}');
});
function replaceEnvironment(value) {
  for (const key of Object.keys(process.env)) delete process.env[key];
  Object.assign(process.env, value);
}
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const report = [];
  for (const primary of primaries) {
    const home = path.join(temporary, `${primary}-home`), root = path.join(temporary, `${primary}-workspace`);
    fs.mkdirSync(root); fs.mkdirSync(home);
    const env = { PATH: previousEnvironment.PATH, HOME: home, CODEX_HOME: path.join(home, '.codex'), XDG_CONFIG_HOME: path.join(home, 'config'), XDG_DATA_HOME: path.join(home, 'data'), XDG_CACHE_HOME: path.join(home, 'cache'), XDG_STATE_HOME: path.join(home, 'state'), ANTHROPIC_API_KEY: 'harness-fictional-local-only', ANTHROPIC_BASE_URL: origin, HARNESS_MOCK_API_KEY: 'harness-fictional-local-only', CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1', CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY: '1', DISABLE_TELEMETRY: '1', DISABLE_ERROR_REPORTING: '1', NO_PROXY: '*', OPENCODE_DISABLE_DEFAULT_PLUGINS: 'true', OPENCODE_DISABLE_MODELS_FETCH: 'true' };
    replaceEnvironment(env);
    fs.mkdirSync(env.CODEX_HOME);
    fs.writeFileSync(path.join(env.CODEX_HOME, 'config.toml'), `model_provider="harness_mock"\n[model_providers.harness_mock]\nname="Harness Mock"\nbase_url="${origin}/v1"\nwire_api="responses"\n`);
    fs.writeFileSync(path.join(root, 'AGENTS.md'), '# Mixed workflow fixture\n\nFollow the bounded task.\n');
    fs.writeFileSync(path.join(root, 'fixture.txt'), 'Harness integration fixture\n');
    fs.writeFileSync(path.join(root, 'opencode.json'), JSON.stringify({ providers: { harness: { name: 'Harness Local', env: ['HARNESS_MOCK_API_KEY'], package: '@opencode/ai/providers/openai-compatible', settings: { baseURL: `${origin}/v1` }, models: { mock: { name: 'Harness Mock', limit: { context: 32768, output: 4096 } } } } } }));
    const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    git('init', '-q', '-b', 'fixture-work'); git('add', 'AGENTS.md', 'fixture.txt', 'opencode.json');
    git('-c', 'user.name=Harness Fixture', '-c', 'user.email=harness@example.invalid', 'commit', '-qm', 'fixture baseline');
    git('diff', '--exit-code', 'HEAD', '--');
    const configPath = path.join(home, 'harness-profiles.json');
    await setup(root, { configPath, interactive: false, configuration: { schema_version: 1,
      profiles: { reasoning: { adapter: primary, model: primary === 'codex' ? 'gpt-5.4' : 'claude-sonnet-4-6', permission: 'read-only' }, worker: { adapter: 'opencode', model: 'harness/mock', permission: 'workspace-write' } },
      roles: Object.fromEntries(agentRoles.map(role => [role, role === 'implementation' ? 'worker' : 'reasoning'])), limits: { max_concurrency: 2, timeout_seconds: 120, max_correction_rounds: 2 } } });
    const versions = Object.fromEntries([primary, 'opencode'].map(client => [client, execFileSync(client, ['--version'], { encoding: 'utf8' }).trim()]));
    const initiative = `20261028_mixed_${primary}`;
    operate(root, 'create', [initiative], { title: 'Mixed client acceptance', owner: 'fixture-coordinator' });
    operate(root, 'transition', [initiative, 'ready'], { confirm: true });
    operate(root, 'transition', [initiative, 'active'], { confirm: true });
    createWorkflow(root, { id: `mixed-${primary}`, initiative, objective: 'Verify real mixed-client harness execution using deterministic local transport.', scope: ['Transport and orchestration fixture'], exclusions: ['Model intelligence certification', 'Application implementation'], ownership: ['fixture.txt'], references: ['AGENTS.md', 'fixture.txt'], acceptance: ['All configured role clients return collected structured results'], applicability: { ui: { applies: true, reason: 'Exercise UI reviewer transport' }, ux: { applies: true, reason: 'Exercise UX reviewer transport' } } }, { configPath });
    const executions = [];
    const stages = [];
    while (workflowStatus(root, initiative).stage !== 'ready_to_close') {
      const stage = workflowStatus(root, initiative).stage;
      assert.ok(['definition', 'implementation', 'review', 'verification'].includes(stage), `Unexpected stage: ${stage}`);
      stages.push(stage);
      const { results } = await runWorkflow(root, initiative, { configPath });
      assert.equal(results.length, stage === 'review' ? 5 : 1);
      for (const execution of results) {
        assert.equal(execution.status, 'completed', `${execution.task_id}: ${execution.error || execution.status}`);
        assert.ok(execution.collected_at, execution.task_id);
        assert.ok(taskCaptures.get(execution.task_id), `No actual model transport: ${execution.task_id}`);
        assert.equal(execution.adapter, stage === 'implementation' ? 'opencode' : primary);
        executions.push({ task: execution.task_id, adapter: execution.adapter, permission: execution.capabilities.permission, result: execution.status });
      }
      advanceWorkflow(root, initiative, { confirm: true, reviewer: 'real-client-fixture' });
    }
    assert.deepEqual(stages, ['definition', 'implementation', 'review', 'verification']);
    assert.equal(executions.length, 8);
    git('diff', '--exit-code', 'HEAD', '--');
    report.push({ coordinator_profile: primary, worker: 'opencode', versions, stages, review_count: 5, terminal: 'ready_to_close', executions });
  }
  console.log(JSON.stringify({ scope: 'complete mixed executor workflows with real CLIs, deterministic loopback model transport and fictional credentials; no model intelligence certification', report }, null, 2));
} finally {
  replaceEnvironment(previousEnvironment);
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  fs.rmSync(temporary, { recursive: true, force: true });
}
