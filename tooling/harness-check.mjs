import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateState } from './harness-work.mjs';
import { runnerPlan } from './harness-runner-plan.mjs';
import { validateManifest } from './harness-manifest.mjs';
import { buildSkillAdapters } from './harness-profiles.mjs';
import { markdownLinks } from './harness-markdown.mjs';
export { markdownLinks } from './harness-markdown.mjs';

const scopes = new Set(['context', 'documentation', 'installation', 'work', 'extensions']);
const temporary = /(?:^|\/)\.harness_work\/(?:initiatives|runtime)\//;

function filesUnder(root, relative = '') {
  const output = [];
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return output;
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const name = path.posix.join(relative, item.name);
    if (['.git', 'node_modules'].includes(item.name) || ['.harness_work/runtime', '.harness/core/runtime', '.harness/core/templates'].includes(name)) continue;
    if (item.isSymbolicLink()) {
      if (/^(?:docs|\.harness|\.harness_work|\.agents|\.claude)(?:\/|$)/.test(name)) throw new Error(`No se siguen symlinks: ${name}`);
      continue;
    }
    if (item.isDirectory()) output.push(...filesUnder(root, name));
    else if (item.isFile()) output.push(name);
  }
  return output;
}

function anchors(content) {
  const counts = new Map();
  const output = new Set();
  for (const match of content.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = match[1].toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}_\-\s]/gu, '').trim().replace(/\s/g, '-');
    const count = counts.get(base) || 0;
    output.add(count ? `${base}-${count}` : base);
    counts.set(base, count + 1);
  }
  for (const match of content.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) output.add(match[1]);
  return output;
}

export function checkRepository(root, { scope, externalResults } = {}) {
  root = fs.realpathSync(root);
  if (scope && !scopes.has(scope) && !runnerPlan(root).checks.some(check => check.scope === scope)) throw new Error(`Scope desconocido: ${scope}`);
  const results = [];
  const add = (group, id, status, message, file) => {
    if (!scope || group === scope) results.push({ scope: group, id, status, message, ...(file ? { file } : {}) });
  };
  const assert = (group, id, condition, message, file) => add(group, id, condition ? 'passed' : 'failed', message, file);
  const all = filesUnder(root);
  const text = file => fs.readFileSync(path.join(root, file), 'utf8');
  const exists = file => fs.existsSync(path.join(root, file));
  function safeFile(file) {
    if (!file || path.isAbsolute(file) || file.split(/[\\/]/).some(part => !part || part === '..')) throw new Error(`Ruta administrada insegura: ${file}`);
    let current = root;
    for (const part of file.split('/')) {
      current = path.join(current, part);
      if (fs.lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error(`Symlink administrado: ${file}`);
    }
    return current;
  }
  const markdown = all.filter(file => file.endsWith('.md'));
  if (!scope || scope === 'context') {
    for (const file of all.filter(file => /\.(?:md|json|mjs|sh|ya?ml|env)$/.test(file))) {
      const suspect = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}|AKIA[A-Z0-9]{16}/.test(text(file));
      if (suspect) add('context', 'credential-pattern', 'failed', 'Posible credencial; revisar sin imprimir su valor', file);
    }
  }
  for (const file of markdown) {
    const content = text(file);
    if (path.basename(file) === 'AGENTS.md') {
      const lines = content.replace(/\n$/, '').split('\n').length;
      assert('context', 'agents-lines', lines <= 100, `${lines}/100 líneas`, file);
    }
    if (file === '.harness_work/memory/current.md') {
      assert('context', 'memory-budget', content.replace(/\n$/, '').split('\n').length <= 100, 'Memoria general ≤100 líneas', file);
    }
    for (const target of markdownLinks(content)) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
      let decoded;
      try { decoded = decodeURIComponent(target); } catch { add('context', 'link', 'failed', `Enlace inválido: ${target}`, file); continue; }
      const [raw, fragment] = decoded.split('#');
      const destination = path.resolve(root, path.dirname(file), raw.split('?')[0] || path.basename(file));
      const relative = path.relative(root, destination).split(path.sep).join('/');
      if (relative.startsWith('../') || path.isAbsolute(relative)) {
        add('context', 'link', 'failed', `Destino fuera del repositorio: ${target}`, file); continue;
      }
      const present = fs.existsSync(destination);
      assert('context', 'link', present, `Destino: ${target}`, file);
      if (present && fragment && destination.endsWith('.md')) {
        assert('context', 'anchor', anchors(fs.readFileSync(destination, 'utf8')).has(fragment), `Ancla: ${target}`, file);
      }
      if (file.startsWith('docs/')) {
        assert('documentation', 'durable-reference', !temporary.test(relative), `Independencia temporal: ${target}`, file);
      }
    }
  }
  assert('context', 'agents-entrypoint', exists('AGENTS.md'), 'Existe AGENTS.md', 'AGENTS.md');
  const reached = new Set();
  const queue = exists('docs/README.md') ? ['docs/README.md'] : [];
  while (queue.length) {
    const current = queue.pop();
    if (reached.has(current)) continue;
    reached.add(current);
    for (const link of markdownLinks(text(current))) {
      if (/^[a-z][a-z\d+.-]*:/i.test(link)) continue;
      const destination = path.posix.normalize(path.posix.join(path.posix.dirname(current), decodeURIComponent(link.split('#')[0])));
      if (destination.startsWith('docs/') && exists(destination) && destination.endsWith('.md')) queue.push(destination);
    }
  }
  for (const file of markdown.filter(file => file.startsWith('docs/'))) {
    assert('documentation', 'reachable', reached.has(file), 'Alcanzable desde docs/README.md', file);
  }
  for (const platform of ['.agents/skills', '.claude/skills']) {
    const entries = all.filter(file => file.startsWith(`${platform}/`) && file.endsWith('/SKILL.md'));
    const discovery = entries.map(file => {
      const content = text(file);
      const name = /^name:\s*(.+)$/m.exec(content)?.[1] || '';
      const description = /^description:\s*(.+)$/m.exec(content)?.[1] || '';
      return `${name}: ${description} (${file})`;
    }).join('\n');
    assert('context', 'discovery-budget', discovery.length <= 8000, `${platform}: ${discovery.length}/8000 caracteres`);
  }
  const manifestPath = '.harness/core/manifest.json';
  if (scope && scope !== 'installation') { /* Other scopes do not parse installation metadata. */ }
  else if (!exists(manifestPath)) add('installation', 'manifest', 'failed', 'Falta manifest de instalación', manifestPath);
  else {
    const manifest = validateManifest(JSON.parse(text(manifestPath)));
    assert('installation', 'manifest-schema', true, 'Schema de manifest soportado', manifestPath);
    for (const [file, entry] of Object.entries(manifest.files || {})) {
      const destination = safeFile(file);
      const valid = exists(file) && fs.lstatSync(destination).isFile() && !fs.lstatSync(destination).isSymbolicLink();
      const expected = typeof entry === 'string' ? entry : entry.sha256;
      assert('installation', 'integrity', valid && crypto.createHash('sha256').update(fs.readFileSync(destination)).digest('hex') === expected, 'Integridad administrada', file);
    }
    const inspectManaged = relative => {
      const directory = safeFile(relative);
      if (!fs.existsSync(directory)) return;
      for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
        const file = `${relative}/${item.name}`;
        safeFile(file);
        if (item.isDirectory()) inspectManaged(file);
        else if (file !== manifestPath) assert('installation', 'ownership', Object.hasOwn(manifest.files, file), 'Archivo reconocido por manifest', file);
      }
    };
    inspectManaged('.harness/core');
    for (const skill of manifest.managed_skills) for (const platform of ['.agents', '.claude']) inspectManaged(`${platform}/skills/${skill}`);
    const templatePath = '.harness/core/templates/project/AGENTS.md';
    if (exists(templatePath) && exists('AGENTS.md')) {
      const block = content => /^<!-- engineering-framework:start -->[\s\S]*?^<!-- engineering-framework:end -->/m.exec(content)?.[0];
      assert('installation', 'instruction-region', Boolean(block(text('AGENTS.md'))) && block(text('AGENTS.md')) === block(text(templatePath)), 'Región de instrucciones administrada coherente', 'AGENTS.md');
    }
  }
  const states = all.filter(file => /^\.harness_work\/initiatives\/[^/]+\/state\.json$/.test(file));
  for (const file of (!scope || scope === 'work' ? states : [])) {
    const state = JSON.parse(text(file));
    let valid = true;
    try { validateState(state); } catch { valid = false; }
    assert('work', 'state-schema', valid, 'Identidad y revisión de estado', file);
    assert('work', 'state-status', ['draft','ready','active','blocked','validating','closing','closed','cancelled'].includes(state.status), 'Estado conocido', file);
    if (['closed', 'cancelled'].includes(state.status)) {
      const closed = Date.parse(state.closed_at);
      assert('work', 'retention', Number.isFinite(closed) && Date.parse(state.retain_until) === closed + 60 * 86400000, 'Retención de sesenta días', file);
    }
  }
  let matchingProjectScope = false;
  if (scope && scopes.has(scope) && scope !== 'extensions' && exists('.harness/project/config.json')) {
    try {
      const config = JSON.parse(text('.harness/project/config.json'));
      matchingProjectScope = Array.isArray(config.checks) && config.checks.some(check => check.scope === scope);
    } catch { /* A built-in scope remains usable when unrelated extension metadata is malformed. */ }
  }
  if (scope && scopes.has(scope) && scope !== 'extensions' && !matchingProjectScope) { /* No project check applies to this built-in scope. */ }
  else if (!exists('.harness/project/config.json')) add('extensions', 'configuration', 'not_applicable', 'Sin configuración local');
  else {
    const config = JSON.parse(text('.harness/project/config.json'));
    if (exists('.harness/core/skills')) buildSkillAdapters(path.join(root, '.harness/core'), root);
    else if (config.profiles !== undefined && (!Array.isArray(config.profiles) || config.profiles.some(profile => !['core','database','frontend','infrastructure','security'].includes(profile)))) throw new Error('Perfiles del proyecto inválidos');
    const plan = runnerPlan(root);
    const group = scope || 'extensions';
    assert(group, 'configuration', config.schema_version === 1, 'Schema local soportado');
    for (const check of plan.checks.filter(check => !scope || check.scope === scope)) {
      const valid = typeof check.id === 'string' && Array.isArray(check.argv) && check.argv.length > 0 && check.argv.every(arg => typeof arg === 'string') && typeof check.runner === 'string' && Number.isFinite(check.timeout_seconds) && check.timeout_seconds > 0;
      assert(group, 'check-contract', valid, `Contrato de check ${check.id || '(sin id)'}`);
      const configHash = crypto.createHash('sha256').update(text('.harness/project/config.json')).digest('hex');
      const records = externalResults?.schema_version === 1 && externalResults.config_sha256 === configHash ? externalResults.checks || [] : [];
      const record = records.find(entry => entry.id === check.id);
      const passed = record && record.exit_code === 0 && Number.isFinite(Date.parse(record.executed_at));
      add(group, 'check-execution', passed ? 'passed' : check.required || record ? 'failed' : 'not_applicable', `Check ${check.id}: ${record ? `exit ${record.exit_code}` : 'sin evidencia de ejecución Docker'}`);
    }
  }
  return { schema_version: 1, results, ok: results.every(result => result.status !== 'failed') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const value = flag => args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined;
    const resultsFile = value('--results');
    const report = checkRepository(value('--root') || process.cwd(), { scope: value('--scope'), externalResults: resultsFile ? JSON.parse(fs.readFileSync(resultsFile, 'utf8')) : undefined });
    if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
    else for (const item of report.results) console.log(`${item.status}: ${item.scope}/${item.id}: ${item.file || ''} ${item.message}`);
    process.exitCode = report.ok ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
