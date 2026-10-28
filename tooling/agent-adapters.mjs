import fs from 'node:fs';
import path from 'node:path';

export const adapterNames = Object.freeze(['codex', 'claude', 'opencode']);
export const adapterSources = Object.freeze({
  codex: 'https://developers.openai.com/codex/cli/reference/',
  claude: 'https://code.claude.com/docs/en/cli-reference',
  opencode: 'https://opencode.ai/v2/docs/permissions/',
});

// Capabilities describe client controls, not an OS security boundary.
export function buildInvocation(profile, { prompt, workspace, resultPath, readOnly = false }) {
  if (!adapterNames.includes(profile?.adapter)) throw new Error('Unsupported agent adapter');
  if (typeof profile.model !== 'string' || !profile.model.trim()) throw new Error('Explicit agent model required');
  if (typeof prompt !== 'string' || !path.isAbsolute(workspace)) throw new Error('Prompt and absolute workspace required');
  const readonly = readOnly || profile.permission === 'read-only';
  const command = profile.executable || profile.adapter;
  const capabilities = {
    fresh_conversation: true, shared_filesystem: true,
    permission: readonly ? 'read-only' : 'workspace-write',
    permission_boundary: profile.adapter === 'codex' ? 'client-sandbox' : 'client-tool-controls',
    inherited_configuration: true, authentication: 'client-managed',
    shell_control: profile.adapter === 'codex' ? 'client-sandbox' : 'explicit-allowlist',
  };
  if (profile.adapter === 'codex') {
    const args = ['exec', '--json', '--model', profile.model, '--sandbox', capabilities.permission,
      '-c', 'approval_policy="never"', '--cd', workspace];
    if (profile.client_profile) args.push('--profile', profile.client_profile);
    if (resultPath) args.push('--output-last-message', resultPath);
    args.push('-');
    return { command, args, stdin: prompt, env: {}, capabilities };
  }
  if (profile.adapter === 'claude') {
    const tools = ['Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch'];
    if (!readonly) tools.push('Edit', 'Write');
    const allowed = [];
    if (!readonly && profile.shell_allowlist?.length) {
      tools.push('Bash');
      allowed.push(...profile.shell_allowlist.map(pattern => `Bash(${pattern})`));
    }
    const args = ['--print', '--model', profile.model, '--output-format', 'json',
      '--no-session-persistence', '--permission-mode', 'dontAsk', '--permission-prompts', 'none',
      '--tools', tools.join(','), '--disallowedTools', 'mcp__*'];
    // dontAsk denies commands outside the explicit unattended allowlist.
    if (allowed.length) args.push('--allowedTools', allowed.join(','));
    return { command, args, stdin: prompt, env: {}, capabilities };
  }
  if (!/^[^/\s]+\/\S+$/.test(profile.model)) throw new Error('OpenCode model requires provider/model');
  const permissions = [{ action: '*', resource: '*', effect: 'deny' }];
  for (const action of ['read', 'glob', 'grep', 'webfetch', 'websearch']) permissions.push({ action, resource: '*', effect: 'allow' });
  if (!readonly) {
    permissions.push({ action: 'edit', resource: '*', effect: 'allow' });
    for (const pattern of profile.shell_allowlist || []) permissions.push({ action: 'shell', resource: pattern, effect: 'allow' });
  }
  for (const resource of ['*.env', '*.env.*']) permissions.push({ action: 'read', resource, effect: 'deny' });
  permissions.push({ action: 'external_directory', resource: '*', effect: 'deny' });
  const config = { agents: { 'harness-worker': {
    description: 'Scoped harness worker', mode: 'primary', permissions,
    system: 'Use the supplied harness assignment. Return questions as needs_input. Do not delegate.',
  } } };
  return { command, args: ['--standalone', 'run', '--format', 'json', '--model', profile.model, '--agent', 'harness-worker'],
    stdin: prompt, env: { OPENCODE_CONFIG_CONTENT: JSON.stringify(config) }, capabilities };
}

export function normalizeOutput(profile, stdout, resultPath) {
  if (resultPath && fs.existsSync(resultPath)) return JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  const parse = value => {
    if (typeof value !== 'string') return value;
    const cleaned = value.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/, '$1');
    try { return JSON.parse(cleaned); } catch { return undefined; }
  };
  const direct = parse(stdout);
  if (direct?.schema_version) return direct;
  if (direct?.structured_output) return direct.structured_output;
  if (direct?.result) { const result = parse(direct.result); if (result) return result; }
  let text = '';
  for (const line of stdout.split('\n')) {
    const event = parse(line);
    if (!event) continue;
    if (event.type === 'text') text += event.part?.text || event.text || '';
    if (event.type === 'item.completed' && event.item?.type === 'agent_message') text = event.item.text;
    if (event.type === 'result') text = event.result || text;
    if (event.type === 'message.part.updated' && event.part?.type === 'text') text = event.part.text;
  }
  const result = parse(text);
  if (!result || typeof result !== 'object') throw new Error(`No structured result from ${profile.adapter}`);
  return result;
}
