import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { buildInvocation, normalizeOutput } from './agent-adapters.mjs';

// Optional integration: real client programs, deterministic local HTTP model transport.
// No provider credentials or model inference are used. Run Claude in the existing
// client-compatibility image with HARNESS_AGENT_CLIENTS=claude and --network none.
const clients = (process.env.HARNESS_AGENT_CLIENTS || 'codex,opencode').split(',');
assert.ok(clients.length && clients.every(client => ['codex', 'claude', 'opencode'].includes(client)), 'Unknown test client');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-agent-clients-'));
const workspace = path.join(temporary, 'workspace');
fs.mkdirSync(workspace);
execFileSync('git', ['init', '-q'], { cwd: workspace });
fs.writeFileSync(path.join(workspace, 'AGENTS.md'), '# Fixture\n\nFollow only the supplied assignment.\n');
let expected;
const captures = [];
const server = http.createServer(async (request, response) => {
  let body = '';
  for await (const part of request) body += part;
  let payload;
  try { payload = JSON.parse(body); } catch { payload = {}; }
  captures.push({ url: request.url, payload });
  const text = JSON.stringify(expected);
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
function run(invocation, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(invocation.command, invocation.args, { cwd: workspace, env: { ...env, ...invocation.env }, stdio: ['pipe', 'pipe', 'pipe'], shell: false });
    let stdout = ''; let stderr = '';
    const timer = setTimeout(() => { child.kill('SIGKILL'); }, 40000);
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
    child.stdin.on('error', () => {});
    child.stdin.end(invocation.stdin);
  });
}
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const results = [];
  for (const client of clients) {
    let previousMarker = null;
    for (const readOnly of [true, false]) {
      const id = `${client}-${readOnly ? 'readonly' : 'write'}`;
      const marker = `HARNESS_FRESH_${id}`;
      expected = { schema_version: 1, task_id: id, status: 'completed', summary: 'Deterministic local fixture', changes: [], verification: [], findings: [], questions: [], pending: [], durable_candidates: [] };
      const home = path.join(temporary, id); fs.mkdirSync(home);
      const env = { PATH: process.env.PATH, HOME: home, CODEX_HOME: path.join(home, '.codex'), XDG_CONFIG_HOME: path.join(home, 'config'), XDG_DATA_HOME: path.join(home, 'data'), XDG_CACHE_HOME: path.join(home, 'cache'), XDG_STATE_HOME: path.join(home, 'state'), ANTHROPIC_API_KEY: 'harness-fictional-local-only', ANTHROPIC_BASE_URL: origin, HARNESS_MOCK_API_KEY: 'harness-fictional-local-only', CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1', CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY: '1', DISABLE_TELEMETRY: '1', DISABLE_ERROR_REPORTING: '1', NO_PROXY: '*', OPENCODE_DISABLE_DEFAULT_PLUGINS: 'true', OPENCODE_DISABLE_MODELS_FETCH: 'true' };
      fs.mkdirSync(env.CODEX_HOME);
      const profile = { adapter: client, model: client === 'opencode' ? 'harness/mock' : client === 'claude' ? 'claude-sonnet-4-6' : 'gpt-5.4' };
      const resultPath = path.join(home, 'result.json');
      const invocation = buildInvocation(profile, { prompt: `${marker}\nReturn exactly ${JSON.stringify(expected)}. Do not call tools.`, workspace, resultPath, readOnly });
      if (client === 'codex') {
        invocation.args.splice(1, 0, '-c', 'model_provider="harness_mock"', '-c', 'model_providers.harness_mock.name="Harness Mock"', '-c', `model_providers.harness_mock.base_url="${origin}/v1"`, '-c', 'model_providers.harness_mock.wire_api="responses"');
      }
      if (client === 'opencode') {
        const config = JSON.parse(invocation.env.OPENCODE_CONFIG_CONTENT);
        config.providers = { harness: { name: 'Harness Local', env: ['HARNESS_MOCK_API_KEY'], package: '@opencode/ai/providers/openai-compatible', settings: { baseURL: `${origin}/v1` }, models: { mock: { name: 'Harness Mock', limit: { context: 32768, output: 4096 } } } } };
        invocation.env.OPENCODE_CONFIG_CONTENT = JSON.stringify(config);
      }
      const before = captures.length;
      const result = await run(invocation, env);
      assert.equal(result.code, 0, `${id}: ${result.stderr.slice(-2500)} ${result.stdout.slice(-2500)}`);
      const actual = JSON.stringify(captures.slice(before));
      assert.ok(actual.includes(marker), `${id}: missing assignment request`);
      if (previousMarker) assert.ok(!actual.includes(previousMarker), `${id}: prior assignment leaked`);
      assert.deepEqual(normalizeOutput(profile, result.stdout, resultPath), expected);
      previousMarker = marker;
      results.push({ client, permission: invocation.capabilities.permission, structured_result: true, assignment_captured: true, prior_conversation_absent: true });
    }
  }
  console.log(JSON.stringify({ scope: 'real clients and local deterministic transport; no model quality or OS isolation certification', authentication: 'fictional only; isolated HOME/XDG', results }, null, 2));
} finally {
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  fs.rmSync(temporary, { recursive: true, force: true });
}
