import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {syncConsumer} from './sync-consumer.mjs';
import {markdownLinks} from './harness-markdown.mjs';

// Proves distribution/discovery and failure of damaged guidance, not semantic
// correctness of a product's architecture, release selection or remote Actions.
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-monorepo-'));
const root=path.join(temporary,'consumer');
const previous={repository:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA};
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
function command(executable,args,expected=0) {
  const result=spawnSync(executable,args,{cwd:root,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});
  assert.ifError(result.error);
  assert.equal(result.status,expected,`${executable} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result;
}
function check(scope,expected=0) {
  return JSON.parse(command('bash',['.harness/check.sh','--scope',scope,'--json'],expected).stdout);
}
function missingRoute(relative,target) {
  const file=path.join(root,relative),original=read(relative);
  assert.ok(original.includes(target));
  try {
    fs.writeFileSync(file,original.replaceAll(target,'README.md'));
    for(const scope of ['context','documentation']) {
      const report=check(scope,1);
      assert.ok(report.results.some(row=>row.status==='failed'&&['guide-entrypoint','guide-routing'].includes(row.id)),`Lost monorepo route was accepted: ${relative}`);
    }
  } finally {fs.writeFileSync(file,original);}
}
try {
  process.env.GITHUB_REPOSITORY='lomaexpertos/engineering-framework';process.env.GITHUB_SHA='b'.repeat(40);
  fs.mkdirSync(root);
  command('git',['init','--quiet','-b','feature/monorepo']);
  command('git',['-c','user.name=Monorepo fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','--quiet','-m','fixture']);

  // Existing app, docs, SQL, ignores and CI are owned by the project, even when
  // ignored locally. Installing methodological guidance must preserve their bytes.
  const owned={
    'legacy-api/main.php':'<?php // legacy fixture\n',
    'docs/README.md':'# Existing knowledge\n',
    'infra/deploy/README.md':'# Existing environments\n',
    'database/changes.sql':'-- Existing SQL\n',
    '.gitignore':'legacy-api/cache/\n',
    '.github/workflows/existing.yml':'name: existing\n',
    'package.json':'{"private":true}\n',
  };
  for(const [relative,content] of Object.entries(owned)) {
    fs.mkdirSync(path.dirname(path.join(root,relative)),{recursive:true});fs.writeFileSync(path.join(root,relative),content);
  }
  // Explicit core profile must still expose app/release governance to both clients.
  fs.mkdirSync(path.join(root,'.harness/project'),{recursive:true});
  fs.writeFileSync(path.join(root,'.harness/project/config.json'),JSON.stringify({schema_version:1,profiles:['core']}));
  syncConsumer(root);
  for(const [relative,content] of Object.entries(owned))assert.equal(read(relative),content,`Installation changed project-owned ${relative}`);
  assert.equal(fs.existsSync(path.join(root,'apps')),false,'Installation must not scaffold or migrate product apps');
  assert.equal(fs.existsSync(path.join(root,'.github/workflows/release.yml')),false,'Installation must not activate product publication');
  const resources=['policies/development/monorepo.md','policies/git/application-releases.md',
    'skills/configure-monorepo/SKILL.md','skills/configure-monorepo/references/application-layout.md','skills/configure-monorepo/references/releases-and-workflows.md'];
  for(const relative of resources)assert.equal(read('.harness/core/'+relative),fs.readFileSync(path.join(source,relative),'utf8'));
  for(const platform of ['.agents/skills','.claude/skills'])for(const relative of ['SKILL.md','references/application-layout.md','references/releases-and-workflows.md'])assert.equal(read(`${platform}/configure-monorepo/${relative}`),read(`.harness/core/skills/configure-monorepo/${relative}`));
  assert.ok(markdownLinks(read('.harness/core/policies/development/monorepo.md')).includes('../../skills/configure-monorepo/SKILL.md'));
  for(const scope of ['context','documentation','installation'])assert.equal(check(scope).ok,true);
  for(const relative of resources) {
    const file=path.join(root,'.harness/core',relative),original=fs.readFileSync(file);
    try {
      fs.unlinkSync(file);
      for(const scope of ['context','documentation'])assert.ok(check(scope,1).results.some(row=>row.id==='guide-inventory'&&row.status==='failed'),`Missing monorepo resource accepted: ${relative}`);
    } finally {fs.writeFileSync(file,original);}
  }
  missingRoute('AGENTS.md','.harness/core/policies/development/monorepo.md');
  missingRoute('AGENTS.md','.harness/core/skills/configure-monorepo/SKILL.md');
  missingRoute('.harness/core/policies/development/README.md','monorepo.md');
  missingRoute('.harness/core/policies/git/README.md','application-releases.md');
  missingRoute('.harness/core/skills/configure-monorepo/SKILL.md','references/releases-and-workflows.md');
  for(const scope of ['context','documentation'])assert.equal(check(scope).ok,true);
  console.log('Monorepo guidance passed: installed policies, core-profile Codex/Claude discovery, required resources/routes, and project-owned apps/docs/SQL/CI preservation without migration or publication.');
} finally {
  if(previous.repository===undefined)delete process.env.GITHUB_REPOSITORY;else process.env.GITHUB_REPOSITORY=previous.repository;
  if(previous.sha===undefined)delete process.env.GITHUB_SHA;else process.env.GITHUB_SHA=previous.sha;
  fs.rmSync(temporary,{recursive:true,force:true});
}
