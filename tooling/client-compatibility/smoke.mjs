import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { syncConsumer } from '../sync-consumer.mjs';

const temporary = fs.mkdtempSync(path.join(os.homedir(), 'harness-client-discovery-'));
const consumer = path.join(temporary, 'consumer');
const captures = [];
const instructionMarker = 'HARNESS_DISCOVERY_INSTRUCTIONS_20261028';
const descriptionMarker = 'HARNESS_DISCOVERY_SKILL_METADATA_20261028';
const bodyMarker = 'HARNESS_SKILL_BODY_NOT_PRELOADED_20261028';
const write = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
const server = http.createServer(async (request, response) => {
  let body = '';
  for await (const part of request) body += part;
  let payload;
  try { payload = JSON.parse(body); } catch { payload = {}; }
  captures.push({ url: request.url, payload });
  if (request.url.includes('count_tokens')) {
    response.writeHead(200, { 'content-type': 'application/json' }); response.end('{"input_tokens":100}'); return;
  }
  const send = (event, data) => response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  if (request.url.includes('/responses')) {
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    const text = 'Harness mock discovery completed.';
    const item = { type: 'message', id: 'msg_harness_mock', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text, annotations: [] }] };
    send('response.created', { type: 'response.created', response: { id: 'resp_harness_mock', status: 'in_progress', output: [] } });
    send('response.output_item.added', { type: 'response.output_item.added', output_index: 0, item: { ...item, status: 'in_progress', content: [] } });
    send('response.output_text.delta', { type: 'response.output_text.delta', item_id: item.id, output_index: 0, content_index: 0, delta: text });
    send('response.output_item.done', { type: 'response.output_item.done', output_index: 0, item });
    send('response.completed', { type: 'response.completed', response: { id: 'resp_harness_mock', object: 'response', status: 'completed', output: [item], usage: { input_tokens: 100, output_tokens: 8, total_tokens: 108 } } });
    response.end(); return;
  }
  if (request.url.includes('/messages')) {
    const message = { id: 'msg_harness_mock', type: 'message', role: 'assistant', model: payload.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 100, output_tokens: 0 } };
    if (!payload.stream) { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ ...message, content: [{ type: 'text', text: 'Harness mock discovery completed.' }], stop_reason: 'end_turn' })); return; }
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    send('message_start', { type: 'message_start', message });
    send('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
    send('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Harness mock discovery completed.' } });
    send('content_block_stop', { type: 'content_block_stop', index: 0 });
    send('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 8 } });
    send('message_stop', { type: 'message_stop' }); response.end(); return;
  }
  response.writeHead(200, { 'content-type': 'application/json' }); response.end('{}');
});

function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: consumer, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`${command} timed out: ${output.slice(-3000)}`)); }, 45000);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('exit', code => { clearTimeout(timer); resolve({ code, output }); });
  });
}
try {
  fs.mkdirSync(consumer);
  write(path.join(consumer, 'AGENTS.md'), `# Project instructions\n\n${instructionMarker}\n`);
  write(path.join(consumer, '.harness/project/config.json'), '{"schema_version":1,"profiles":["core"]}\n');
  write(path.join(consumer, '.harness/project/skills/discovery-smoke/SKILL.md'), `---\nname: discovery-smoke\ndescription: ${descriptionMarker}\n---\n\n${bodyMarker}\n`);
  const git = args => execFileSync('git', args, { cwd: consumer, stdio: 'pipe' });
  git(['init', '-q']); git(['add', '.']); git(['-c', 'user.name=Harness Test', '-c', 'user.email=harness@example.invalid', 'commit', '-qm', 'Fixture baseline']);
  process.env.GITHUB_REPOSITORY = 'lomaexpertos/engineering-framework';
  process.env.GITHUB_SHA = 'a'.repeat(40);
  syncConsumer(consumer);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const home = path.join(temporary, 'home'); fs.mkdirSync(home);
  fs.mkdirSync(path.join(home, '.codex'));
  const env = { PATH: process.env.PATH, HOME: home, CODEX_HOME: path.join(home, '.codex'), ANTHROPIC_API_KEY: 'harness-fictional-local-only', ANTHROPIC_BASE_URL: origin, DISABLE_TELEMETRY: '1', DISABLE_ERROR_REPORTING: '1', CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1', CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY: '1', NO_PROXY: '*' };
  const report = [];
  for (const client of ['codex', 'claude']) {
    const before = captures.length;
    const version = execFileSync(client, ['--version'], { env, encoding: 'utf8' }).trim();
    const prompt = 'Respond with a short acknowledgement. Do not use any tools.';
    const args = client === 'codex'
      ? ['exec', '--skip-git-repo-check', '--sandbox', 'read-only', '--json', '-c', 'model_provider="harness_mock"', '-c', 'model="gpt-5.4"', '-c', 'model_providers.harness_mock.name="Harness Mock"', '-c', `model_providers.harness_mock.base_url="${origin}/v1"`, '-c', 'model_providers.harness_mock.wire_api="responses"', prompt]
      : ['-p', prompt, '--model', 'claude-sonnet-4-6', '--output-format', 'json', '--max-turns', '1', '--setting-sources', 'project'];
    const result = await run(client, args, env);
    const messages = captures.slice(before).filter(capture => capture.url.includes('/responses') || capture.url.includes('/messages'));
    const actual = JSON.stringify(messages);
    assert.ok(messages.length > 0, `${client}: no captured model request: ${result.output}`);
    assert.ok(actual.includes(instructionMarker), `${client}: AGENTS instructions missing: ${result.output}`);
    assert.ok(actual.includes(descriptionMarker), `${client}: skill metadata missing: ${result.output}`);
    assert.ok(!actual.includes(bodyMarker), `${client}: skill body loaded eagerly`);
    assert.equal(result.code, 0, `${client}: unsuccessful mock request: ${result.output}`);
    report.push({ client, version, instructions_discovered: true, skill_metadata_discovered: true, skill_body_lazy: true, exit_code: result.code, captured_model_requests: messages.length });
  }
  console.log(JSON.stringify({ schema_version: 1, network: 'container loopback only; execution requires --network none', authentication: 'fictional API credential only', scope: 'real CLI discovery against deterministic local transport; no model or subagent certification', clients: report }, null, 2));
} finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); fs.rmSync(temporary, { recursive: true, force: true }); }
