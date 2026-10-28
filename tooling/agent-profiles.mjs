import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { adapterNames } from './agent-adapters.mjs';

export const agentRoles = Object.freeze(['definition', 'implementation', 'functional', 'security', 'logging', 'ui', 'ux']);
export const defaultLimits = Object.freeze({ max_concurrency: 2, timeout_seconds: 1800, max_correction_rounds: 2 });
const namePattern = /^[a-z][a-z0-9-]{0,63}$/;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function keys(value, allowed, label) {
  if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new Error(`Invalid ${label} fields`);
}
function text(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 512 || /[\x00-\x1f]/.test(value)) throw new Error(`Invalid ${label}`);
}
function limits(value = {}) {
  keys(value, Object.keys(defaultLimits), 'limits');
  for (const [key, number] of Object.entries(value)) {
    const max = { max_concurrency: 16, timeout_seconds: 86400, max_correction_rounds: 10 }[key];
    if (!Number.isInteger(number) || number < (key === 'max_correction_rounds' ? 0 : 1) || number > max) throw new Error(`Invalid limit ${key}`);
  }
  return value;
}
export function validatePersonal(value) {
  keys(value, ['schema_version', 'profiles', 'roles', 'limits'], 'personal configuration');
  if (value.schema_version !== 1) throw new Error('Unsupported personal configuration version; use setup to migrate');
  keys(value.profiles, Object.keys(value.profiles || {}), 'profiles');
  keys(value.roles, agentRoles, 'roles');
  for (const [name, profile] of Object.entries(value.profiles)) {
    if (!namePattern.test(name)) throw new Error('Invalid profile name');
    keys(profile, ['adapter', 'model', 'executable', 'permission', 'client_profile', 'shell_allowlist'], 'profile');
    if (!adapterNames.includes(profile.adapter)) throw new Error(`Unsupported adapter for ${name}`);
    text(profile.model, 'model');
    if (profile.adapter === 'opencode' && !/^[^/\s]+\/\S+$/.test(profile.model)) throw new Error('OpenCode model requires provider/model');
    if (profile.executable !== undefined) {
      text(profile.executable, 'executable');
      if (!path.isAbsolute(profile.executable) && /[\/\\\s]/.test(profile.executable)) throw new Error('Executable must be absolute or a PATH name');
    }
    if (profile.permission !== undefined && !['read-only', 'workspace-write'].includes(profile.permission)) throw new Error('Invalid profile permission');
    if (profile.client_profile !== undefined) { text(profile.client_profile, 'client profile'); if (profile.adapter !== 'codex') throw new Error('client_profile is only supported by Codex'); }
    if (profile.shell_allowlist !== undefined) {
      if (!Array.isArray(profile.shell_allowlist) || profile.shell_allowlist.length > 32) throw new Error('Invalid shell allowlist');
      for (const pattern of profile.shell_allowlist) text(pattern, 'shell pattern');
      if (profile.adapter === 'codex') throw new Error('Codex shell allowlist requires a client policy, not this profile');
    }
  }
  for (const name of Object.values(value.roles)) if (typeof name !== 'string' || !Object.hasOwn(value.profiles, name)) throw new Error('Role references unknown profile');
  limits(value.limits);
  return value;
}
export function validateProject(value) {
  keys(value, ['schema_version', 'required_roles', 'allowed_adapters', 'model_allowlist', 'limits'], 'project agents configuration');
  if (value.schema_version !== 1) throw new Error('Unsupported project agents configuration');
  for (const [key, allowed] of [['required_roles', agentRoles], ['allowed_adapters', adapterNames]]) {
    if (value[key] !== undefined && (!Array.isArray(value[key]) || value[key].some(item => !allowed.includes(item)) || new Set(value[key]).size !== value[key].length)) throw new Error(`Invalid ${key}`);
  }
  if (value.model_allowlist !== undefined) {
    keys(value.model_allowlist, agentRoles, 'model allowlist');
    for (const models of Object.values(value.model_allowlist)) {
      if (!Array.isArray(models) || !models.length) throw new Error('Invalid model allowlist');
      for (const model of models) text(model, 'allowed model');
    }
  }
  limits(value.limits);
  return value;
}
function rejectSymlinks(target) {
  let current = path.parse(target).root;
  for (const segment of target.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    const stat = fs.lstatSync(current, { throwIfNoEntry: false });
    if (stat?.isSymbolicLink()) throw new Error('Configuration symlink rejected');
  }
}
export function configurationPath(options = {}) {
  const env = options.env || process.env;
  return path.resolve(options.configPath || path.join(env.XDG_CONFIG_HOME || path.join(env.HOME || os.homedir(), '.config'), 'harness', 'profiles.json'));
}
function load(target) {
  rejectSymlinks(target);
  const stat = fs.statSync(target);
  if (!stat.isFile() || stat.size > 256 * 1024) throw new Error('Configuration must be a regular file <=256 KiB');
  return JSON.parse(fs.readFileSync(target, 'utf8'));
}
export function readConfiguration(root, options = {}) {
  const configPath = configurationPath(options);
  const personal = validatePersonal(load(configPath));
  const projectPath = path.resolve(root, '.harness/project/agents.json');
  const project = validateProject(fs.existsSync(projectPath) ? load(projectPath) : { schema_version: 1 });
  const effective = { ...defaultLimits, ...personal.limits };
  for (const [key, value] of Object.entries(project.limits || {})) effective[key] = Math.min(effective[key], value);
  return { ...personal, configPath, project, limits: effective, required_roles: project.required_roles || [...agentRoles] };
}
export async function setup(root, options = {}) {
  const configPath = configurationPath(options);
  rejectSymlinks(configPath);
  let previous = fs.existsSync(configPath) ? load(configPath) : undefined;
  let configuration = options.configuration || previous || { schema_version: 1, profiles: {}, roles: {}, limits: { ...defaultLimits } };
  let migrated = false;
  if (configuration.version === 0 && configuration.schema_version === undefined) {
    configuration = { ...configuration, schema_version: 1 };
    delete configuration.version;
    migrated = true;
  }
  configuration = structuredClone(validatePersonal(configuration));
  const interactive = options.interactive ?? (process.stdin.isTTY && process.stdout.isTTY && !options.configuration);
  if (interactive) {
    const rl = readline.createInterface({ input: options.input || process.stdin, output: options.output || process.stdout });
    try {
      while (true) {
        const name = (await rl.question('Nombre de perfil a crear/editar (vacío para asignar roles): ')).trim();
        if (!name) break;
        if (!namePattern.test(name)) throw new Error('Invalid profile name');
        const adapter = (await rl.question('Cliente (codex/claude/opencode): ')).trim();
        const model = (await rl.question('Modelo explícito (OpenCode: proveedor/modelo): ')).trim();
        const permission = (await rl.question('Permiso (read-only/workspace-write, defecto workspace-write): ')).trim() || 'workspace-write';
        configuration.profiles[name] = { adapter, model, permission };
        validatePersonal(configuration);
      }
      for (const role of agentRoles) {
        const answer = (await rl.question(`Perfil para ${role} [${configuration.roles[role] || 'pendiente'}]: `)).trim();
        if (answer) configuration.roles[role] = answer;
      }
    } finally { rl.close(); }
  }
  validatePersonal(configuration);
  fs.mkdirSync(path.dirname(configPath), { recursive: true, mode: 0o700 });
  const contents = `${JSON.stringify(configuration, null, 2)}\n`;
  let backup = null;
  if (previous && fs.readFileSync(configPath, 'utf8') !== contents) {
    backup = `${configPath}.backup-${Date.now()}-${crypto.randomUUID()}`;
    fs.copyFileSync(configPath, backup, fs.constants.COPYFILE_EXCL);
    fs.chmodSync(backup, 0o600);
  }
  const temporary = `${configPath}.${crypto.randomUUID()}.tmp`;
  try { fs.writeFileSync(temporary, contents, { flag: 'wx', mode: 0o600 }); fs.renameSync(temporary, configPath); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  return { configPath, backup, migrated, configured: Object.keys(configuration.profiles), diagnosis: doctor(root, { ...options, configPath }) };
}
function probe(command, args, env) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 5000, maxBuffer: 512 * 1024, env, shell: false });
  return { ok: !result.error && result.status === 0, output: `${result.stdout || ''}\n${result.stderr || ''}` };
}
export function doctor(root, options = {}) {
  const issues = [];
  let configuration;
  try { configuration = readConfiguration(root, options); }
  catch (error) { return { ok: false, configPath: configurationPath(options), issues: [error.message], profiles: {}, execution_verified: false }; }
  const profiles = {};
  for (const [name, profile] of Object.entries(configuration.profiles)) {
    const command = profile.executable || profile.adapter;
    const version = probe(command, ['--version'], options.env || process.env);
    const help = version.ok ? probe(command, profile.adapter === 'codex' ? ['exec', '--help'] : profile.adapter === 'opencode' ? ['run', '--help'] : ['--help'], options.env || process.env) : { ok: false, output: '' };
    const flags = { codex: ['--sandbox', '--json', '--output-last-message'], claude: ['--permission-prompts', '--tools', '--no-session-persistence'], opencode: ['--format', '--agent', '--model'] }[profile.adapter];
    let compatible = help.ok && flags.every(flag => help.output.includes(flag));
    if (profile.adapter === 'opencode') compatible &&= /(?:^|\s)v?2\.\d/.test(version.output);
    const ok = version.ok && compatible;
    profiles[name] = { available: version.ok, compatible, authentication: 'not_checked', execution_verified: false };
    if (!ok) issues.push(`Profile ${name}: client missing or incompatible (${profile.adapter})`);
    if (configuration.project.allowed_adapters && !configuration.project.allowed_adapters.includes(profile.adapter)) issues.push(`Profile ${name}: adapter disallowed by project`);
  }
  for (const role of configuration.required_roles) if (!configuration.roles[role]) issues.push(`Role ${role}: profile assignment required`);
  for (const [role, name] of Object.entries(configuration.roles)) {
    const profile = configuration.profiles[name];
    const allowed = configuration.project.model_allowlist?.[role];
    if (allowed && !allowed.includes(profile.model)) issues.push(`Role ${role}: model disallowed by project`);
    if (role === 'implementation' && profile.permission === 'read-only') issues.push('Implementation profile cannot be read-only');
  }
  return { ok: issues.length === 0, configPath: configuration.configPath, issues, profiles, limits: configuration.limits, execution_verified: false };
}
