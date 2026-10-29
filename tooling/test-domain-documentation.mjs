import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {syncConsumer} from './sync-consumer.mjs';
import {checkOperationalGuides} from './harness-guide-check.mjs';
import {markdownLinks} from './harness-markdown.mjs';

// This is acceptance of distributed instructions and local checks. It does not
// evaluate model intent recognition, investigate a product or certify its docs.
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-domain-docs-'));
const root=path.join(temporary,'consumer');
const previous={repository:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA};
const environment={...process.env,HOME:path.join(temporary,'home'),XDG_CONFIG_HOME:path.join(temporary,'personal')};
const guide='skills/spec-documentar/references/domain-investigation.md';
const policy='policies/ai-assisted-development/domain-documentation.md';
const template='templates/context/docs/domain.md';
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');

function command(executable,args,expected=0) {
  const result=spawnSync(executable,args,{cwd:root,env:environment,encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
  assert.ifError(result.error);
  assert.equal(result.status,expected,`${executable} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result;
}
function check(scope,expected=0) {
  return JSON.parse(command('bash',['.harness/check.sh','--scope',scope,'--json'],expected).stdout);
}
function route(relative,target) {
  assert.ok(markdownLinks(read(relative)).includes(target),`Unreachable domain contract: ${relative} -> ${target}`);
}
function mutation(relative,change,id) {
  const file=path.join(root,relative),original=fs.readFileSync(file);
  try {
    const changed=change(original.toString());
    if(changed===null)fs.unlinkSync(file);else {
      assert.notEqual(changed,original.toString(),`Mutation did not change ${relative}`);
      fs.writeFileSync(file,changed);
    }
    for(const scope of ['context','documentation']) {
      const report=check(scope,1);
      assert.equal(report.ok,false,`Normal ${scope} check accepted corrupt domain instructions`);
      assert.ok(report.results.some(row=>row.id===id&&row.status==='failed'),`Normal ${scope} check omitted ${id}: ${relative}\n${JSON.stringify(report.results.filter(row=>row.status==='failed'))}`);
    }
  } finally {fs.writeFileSync(file,original);}
}

try {
  process.env.GITHUB_REPOSITORY='lomaexpertos/engineering-framework';process.env.GITHUB_SHA='a'.repeat(40);
  fs.mkdirSync(root);fs.mkdirSync(environment.HOME,{recursive:true});
  command('git',['init','--quiet','-b','feature/domain-docs']);
  command('git',['-c','user.name=Domain documentation fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','--quiet','-m','fixture']);
  syncConsumer(root);

  for(const relative of [guide,policy,template])assert.deepEqual(fs.readFileSync(path.join(root,'.harness/core',relative)),fs.readFileSync(path.join(source,relative)),`Incomplete installed domain resource: ${relative}`);
  for(const platform of ['.agents/skills','.claude/skills'])for(const relative of ['SKILL.md','references/domain-investigation.md'])assert.deepEqual(fs.readFileSync(path.join(root,platform,'spec-documentar',relative)),fs.readFileSync(path.join(source,'skills/spec-documentar',relative)),`Incomplete domain skill adapter: ${platform}/${relative}`);
  route('.harness/core/skills/spec-documentar/SKILL.md','references/domain-investigation.md');
  route('.harness/core/policies/ai-assisted-development/README.md','domain-documentation.md');
  route('.harness/core/templates/context/README.md','docs/domain.md');
  assert.deepEqual(checkOperationalGuides(source,{layout:'source'}).filter(row=>row.status==='failed'),[],'Source domain instructions must satisfy the normal guide contract');
  for(const scope of ['context','documentation'])assert.equal(check(scope).ok,true);

  mutation('.harness/core/'+guide,()=>null,'guide-inventory');
  mutation('.harness/core/'+policy,()=>null,'guide-inventory');
  mutation('.harness/core/'+template,()=>null,'guide-inventory');
  mutation('.harness/core/skills/spec-documentar/SKILL.md',text=>text.replace(/\[[^\]]*\]\(references\/domain-investigation\.md\)/,''),'guide-routing');
  mutation('.harness/core/policies/ai-assisted-development/README.md',text=>text.replace(/\[[^\]]*\]\(domain-documentation\.md\)/,''),'guide-routing');
  mutation('AGENTS.md',text=>text.replaceAll('.harness/core/skills/spec-documentar/SKILL.md','.harness/core/skills/README.md'),'guide-entrypoint');
  mutation('AGENTS.md',text=>text.replaceAll('.harness/core/policies/ai-assisted-development/domain-documentation.md','.harness/core/policies/ai-assisted-development/README.md'),'guide-entrypoint');
  mutation('.harness/core/'+guide,text=>text+'\n```json\n{"broken": }\n```\n','guide-json-example');
  mutation('.harness/core/'+guide,text=>text+'\n[Missing investigation reference](missing-domain-guide.md)\n','guide-links');
  mutation('.agents/skills/spec-documentar/references/domain-investigation.md',()=>null,'guide-adapters');
  mutation('.claude/skills/spec-documentar/references/domain-investigation.md',()=>null,'guide-adapters');

  // Domain examples are ordinary documented data, not agent/workflow contracts.
  // Keep all distributed copies equal so this probes the JSON rule itself.
  const copies=['.harness/core/skills','.agents/skills','.claude/skills'].map(prefix=>path.join(root,prefix,'spec-documentar/references/domain-investigation.md'));
  const originals=copies.map(file=>fs.readFileSync(file));
  try {
    copies.forEach((file,index)=>fs.writeFileSync(file,originals[index].toString()+'\n```json\n{"example":"domain documentation syntax fixture"}\n```\n'));
    for(const scope of ['context','documentation'])assert.equal(check(scope).ok,true,'A valid domain example must not require an unrelated harness schema');
  } finally {copies.forEach((file,index)=>fs.writeFileSync(file,originals[index]));}

  // The name of an existing financial domain does not itself assert that a task
  // changes money, data or production. Explicit affected risks retain their floor.
  const id='20261029_documentar_pagos';
  const work=(...args)=>JSON.parse(command('bash',['.harness/work.sh',...args]).stdout);
  const minimal=work('create',id,'--title','Documentar AS-IS del dominio de pagos','--owner','fixture','--track','minimal','--reason','Clarify existing prose without changing money, data or production');
  assert.equal(minimal.track,'minimal','A financial word in a documentation title must not force reinforced delivery');
  assert.deepEqual(fs.readdirSync(path.join(root,'.harness_work/initiatives',id)),['state.json'],'A bounded documentation task must not acquire ceremonial files');
  const financial=work('create','20261029_regla_pagos','--title','Cambiar regla de pagos','--owner','fixture','--track','minimal','--reason','The requested change affects a financial rule','--risk','financial');
  assert.equal(financial.track,'reinforced','A real affected financial risk must retain the reinforced floor');
  assert.equal(fs.existsSync(path.join(root,'docs')),false,'Installation and intent fixtures must not manufacture canonical domain knowledge');
  assert.equal(fs.existsSync(environment.XDG_CONFIG_HOME),false,'Domain documentation checks must not configure personal model profiles');
  for(const scope of ['context','documentation'])assert.equal(check(scope).ok,true);
  console.log('Domain documentation passed: fresh consumer resources and adapters, routed guide/policy/template, missing-resource and missing-route failures in normal checks, domain JSON syntax without unrelated schemas, explicit risk floors without title inference. Structural instructions only; no product investigation or model execution.');
} finally {
  if(previous.repository===undefined)delete process.env.GITHUB_REPOSITORY;else process.env.GITHUB_REPOSITORY=previous.repository;
  if(previous.sha===undefined)delete process.env.GITHUB_SHA;else process.env.GITHUB_SHA=previous.sha;
  fs.rmSync(temporary,{recursive:true,force:true});
}
