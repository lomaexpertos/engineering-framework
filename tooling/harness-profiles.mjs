import fs from 'node:fs';
import path from 'node:path';

export const profileSkills = Object.freeze({
  database: ['database-schema-change', 'database-data-change', 'database-routine-change', 'optimize-database-query'],
  frontend: ['implement-ui-change'],
  infrastructure: ['infra-change', 'infra-adopt-framework', 'implement-deployment-automation', 'add-observability', 'investigate-production-incident'],
  security: ['security-review', 'manage-secrets'],
});
const knownProfiles = new Set(['core', ...Object.keys(profileSkills)]);
const namePattern = /^[a-z0-9][a-z0-9-]*$/;
const platforms = ['.agents/skills', '.claude/skills'];

function safe(root, relative) {
  let current = root;
  for (const segment of relative.split('/')) {
    if (!segment || segment === '.' || segment === '..') throw new Error(`Unsafe skill source: ${relative}`);
    current = path.join(current, segment);
    const stat = fs.lstatSync(current, { throwIfNoEntry: false });
    if (stat?.isSymbolicLink()) throw new Error(`Skill source symlink rejected: ${relative}`);
  }
  return current;
}
function tree(root, relative, output = new Map(), prefix = '') {
  const target = safe(root, relative);
  const stat = fs.lstatSync(target);
  if (stat.isFile()) output.set(prefix, { content: fs.readFileSync(target), mode: stat.mode & 0o111 ? 0o755 : 0o644 });
  else if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target).sort()) tree(root, `${relative}/${entry}`, output, prefix ? `${prefix}/${entry}` : entry);
  } else throw new Error(`Skill source is not a regular file/directory: ${relative}`);
  return output;
}
function metadata(content, expected) {
  const source = content.toString('utf8');
  const header = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)?.[1];
  if (!header) throw new Error(`Missing skill front matter: ${expected}`);
  const names = [...header.matchAll(/^name:\s*(.+)$/gm)];
  const descriptions = [...header.matchAll(/^description:\s*(.+)$/gm)];
  const unquote = value => value.trim().replace(/^(['"])(.*)\1$/, '$2');
  if (names.length !== 1 || unquote(names[0][1]) !== expected || descriptions.length !== 1 || !unquote(descriptions[0][1])) {
    throw new Error(`Invalid skill metadata: ${expected}`);
  }
  return { description: descriptions[0][1].trim(), source };
}

export function buildSkillAdapters(frameworkRoot, consumerRoot) {
  frameworkRoot = fs.realpathSync(frameworkRoot);
  consumerRoot = fs.realpathSync(consumerRoot);
  const configPath = safe(consumerRoot, '.harness/project/config.json');
  const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : { schema_version: 1 };
  if (!config || config.schema_version !== 1) throw new Error('Unsupported project configuration');
  let profiles = null;
  if (config.profiles !== undefined) {
    if (!Array.isArray(config.profiles) || config.profiles.some(name => typeof name !== 'string' || !knownProfiles.has(name)) || new Set(config.profiles).size !== config.profiles.length) {
      throw new Error('Unknown or duplicate harness profile; use core/database/frontend/infrastructure/security');
    }
    profiles = [...new Set(['core', ...config.profiles])].sort();
  }
  const directory = safe(frameworkRoot, 'skills');
  const allSkills = fs.readdirSync(directory).filter(name => {
    const stat = fs.lstatSync(safe(frameworkRoot, `skills/${name}`));
    return stat.isDirectory();
  }).sort();
  for (const name of allSkills) if (!namePattern.test(name)) throw new Error(`Unsafe corporate skill name: ${name}`);
  const domainSkills = new Set(Object.values(profileSkills).flat());
  const selected = profiles ? allSkills.filter(name => !domainSkills.has(name) || profiles.some(profile => profileSkills[profile]?.includes(name))) : allSkills;
  const localDirectory = safe(consumerRoot, '.harness/project/skills');
  const locals = fs.existsSync(localDirectory) ? fs.readdirSync(localDirectory).filter(name => fs.lstatSync(safe(consumerRoot, `.harness/project/skills/${name}`)).isDirectory()).sort() : [];
  const files = new Map();
  const descriptions = new Map();
  const putSkill = (root, relative, sourceName, outputName, local = false) => {
    const contents = tree(root, relative);
    if (!contents.has('SKILL.md')) throw new Error(`Missing SKILL.md: ${sourceName}`);
    const info = metadata(contents.get('SKILL.md').content, sourceName);
    if (local) contents.set('SKILL.md', {
      ...contents.get('SKILL.md'),
      content: Buffer.from(info.source.replace(/^name:\s*[^\r\n]+/m, `name: ${outputName}`)),
    });
    descriptions.set(outputName, info.description);
    for (const platform of platforms) for (const [file, value] of contents) files.set(`${platform}/${outputName}/${file}`, value);
  };
  for (const name of selected) putSkill(frameworkRoot, `skills/${name}`, name, name);
  const localSkills = [];
  for (const name of locals) {
    if (!namePattern.test(name)) throw new Error(`Unsafe project skill name: ${name}`);
    const outputName = `project-${name}`;
    if (allSkills.includes(outputName)) throw new Error(`Project skill collides with corporate namespace: ${outputName}`);
    putSkill(consumerRoot, `.harness/project/skills/${name}`, name, outputName, true);
    localSkills.push(outputName);
  }
  const names = [...selected, ...localSkills].sort();
  for (const platform of platforms) {
    const discovery = names.map(name => `${name}: ${descriptions.get(name)} (${platform}/${name}/SKILL.md)`).join('\n');
    if (discovery.length > 8000) throw new Error(`Discovery budget exceeded: ${platform} ${discovery.length}/8000 characters`);
  }
  return { skills: selected, localSkills, files, profiles };
}
