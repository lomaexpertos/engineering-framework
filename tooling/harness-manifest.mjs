const namePattern = /^[a-z0-9][a-z0-9-]*$/;
const versionPattern = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

export function validateManifest(manifest) {
  const bad = message => { throw new Error(`Manifest inválido: ${message}`); };
  if (!manifest || Array.isArray(manifest) || manifest.schema_version !== 2) bad('schema_version');
  if (!versionPattern.test(manifest.framework_version || '')) bad('framework_version');
  if (manifest.source_repository !== 'lomaexpertos/engineering-framework') bad('source_repository');
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(manifest.source_commit || '')) bad('source_commit');
  for (const field of ['managed_skills', 'corporate_skills', 'local_skills']) {
    if (field !== 'managed_skills' && manifest[field] === undefined) continue;
    const names = manifest[field];
    if (!Array.isArray(names) || names.some(name => typeof name !== 'string' || !namePattern.test(name)) || new Set(names).size !== names.length) bad(field);
  }
  if (manifest.corporate_skills && manifest.local_skills) {
    const union = [...manifest.corporate_skills, ...manifest.local_skills].sort();
    if (new Set(union).size !== union.length || JSON.stringify(union) !== JSON.stringify([...manifest.managed_skills].sort())) bad('skill ownership');
  }
  if (manifest.profiles !== undefined && manifest.profiles !== null && (!Array.isArray(manifest.profiles) || manifest.profiles.some(profile => !['core','database','frontend','infrastructure','security'].includes(profile)) || new Set(manifest.profiles).size !== manifest.profiles.length)) bad('profiles');
  if (!manifest.files || Array.isArray(manifest.files) || typeof manifest.files !== 'object' || !Object.keys(manifest.files).length) bad('files');
  for (const [file, hash] of Object.entries(manifest.files)) {
    if (file.includes('\\') || file.split('/').some(part => !part || part === '.' || part === '..') || !/^[a-f0-9]{64}$/.test(hash)) bad('path/hash');
    const core = file.startsWith('.harness/core/') && file !== '.harness/core/manifest.json';
    const wrapper = /^\.harness\/(?:README\.md|update\.sh|check\.sh|work\.sh)$/.test(file);
    const skill = /^\.(?:agents|claude)\/skills\/([^/]+)\/.+$/.exec(file);
    if (!core && !wrapper && !(skill && manifest.managed_skills.includes(skill[1]))) bad(`ownership ${file}`);
  }
  for (const skill of manifest.managed_skills) {
    for (const platform of ['.agents', '.claude']) if (!manifest.files[`${platform}/skills/${skill}/SKILL.md`]) bad(`missing adapter ${skill}`);
  }
  return manifest;
}
