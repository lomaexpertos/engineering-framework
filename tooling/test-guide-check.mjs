import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {checkOperationalGuides} from './harness-guide-check.mjs';
import {syncConsumer} from './sync-consumer.mjs';
import {checkRepository} from './harness-check.mjs';

const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-guides-'));
const previous={repository:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA};
const failures=(root,layout)=>checkOperationalGuides(root,{layout}).filter(result=>result.status==='failed');
function clean(root,layout) {assert.deepEqual(failures(root,layout),[],`Operational guide failures (${layout})`);}
function mutate(root,layout,relative,change,id) {
  const file=path.join(root,relative),original=fs.readFileSync(file);
  try {
    const changed=change(original.toString());
    if(changed===null)fs.unlinkSync(file);else fs.writeFileSync(file,changed);
    const result=failures(root,layout);
    assert.ok(result.some(row=>row.id===id),`Mutation accepted: ${relative} (${id})\n${JSON.stringify(result)}`);
    assert.ok(result.every(row=>typeof row.file==='string'&&typeof row.message==='string'));
    if(layout==='consumer'&&['guide-inventory','guide-routing','guide-json-example','guide-adapters'].includes(id))for(const scope of ['context','documentation']) {
      const report=checkRepository(root,{scope});
      assert.equal(report.ok,false,`Normal ${scope} check accepted corrupt guide`);
      assert.ok(report.results.some(row=>row.id===id&&row.status==='failed'),`Normal ${scope} check omitted ${id}`);
    }
  } finally {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,original);}
}
function exercise(root,layout) {
  const prefix=layout==='source'?'':'.harness/core/';
  const guide=prefix+'skills/coordinate-work/references/workflow-operations.md';
  clean(root,layout);
  mutate(root,layout,guide,()=>null,'guide-inventory');
  mutate(root,layout,prefix+'skills/coordinate-work/SKILL.md',text=>text.replace(/\[[^\]]*\]\(references\/workflow-operations\.md\)/,''),'guide-routing');
  mutate(root,layout,guide,text=>text.replace('"id": "entrada"','"id": '),'guide-json-example');
  mutate(root,layout,prefix+'skills/coordinate-work/references/profiles-and-start.md',text=>text.replace('"schema_version": 1','"schema_version": 999'),'guide-json-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nif then\n```\n','guide-shell-syntax');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/agents.sh workflow nonexistent\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/agents.sh prepare\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/work.sh create ID\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n`bash .harness/agents.sh doctor --invalid-inline-flag`\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/agents.sh doctor --bogus-option\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/check.sh --bogus-option\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/check.sh --rm\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/agents.sh doctor --bogus --help\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/not-a-command.sh\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/update.sh --bogus-option\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/work.sh create ID --title T --bogus-option X\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/work.sh hold ID\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/work.sh transition ID ready\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n```bash\nbash .harness/work.sh transition ID blocked\n```\n','guide-cli-example');
  mutate(root,layout,guide,text=>text+'\n[missing relative resource](missing.md)\n','guide-links');
  mutate(root,layout,guide,text=>text+'\n[missing heading](profiles-and-start.md#heading-that-does-not-exist)\n','guide-links');
  mutate(root,layout,guide,text=>text+'\n[valid heading](profiles-and-start.md#diagnóstico-y-elección-personal)\n','guide-adapters');
  mutate(root,layout,prefix+'schemas/agent-task.schema.json',()=>'{broken','guide-json-resource');
  mutate(root,layout,prefix+'templates/context/work/closure.example.json',text=>text.replace('"pending"','"unknown"'),'guide-json-resource');
  clean(root,layout);
}
try {
  process.env.GITHUB_REPOSITORY='lomaexpertos/engineering-framework';process.env.GITHUB_SHA='a'.repeat(40);
  const startup=path.join(temporary,'inherited-startup.sh'),marker=path.join(temporary,'startup-ran');
  fs.writeFileSync(startup,`printf unsafe > '${marker}'\n`);
  const previousStartup=process.env.BASH_ENV;
  try {process.env.BASH_ENV=startup;clean(source,'source');assert.equal(fs.existsSync(marker),false,'Guide check executed inherited shell startup');}
  finally {if(previousStartup===undefined)delete process.env.BASH_ENV;else process.env.BASH_ENV=previousStartup;}

  const fixture=path.join(temporary,'source');fs.mkdirSync(fixture);
  for(const name of ['policies','skills','checks','templates','schemas'])fs.cpSync(path.join(source,name),path.join(fixture,name),{recursive:true});
  // Source fixtures have no adapters: the anchor-positive mutation is checked
  // independently below, while consumer fixtures must detect copied divergence.
  const root=path.join(temporary,'consumer');fs.mkdirSync(root);
  const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
  git('init','-b','feature/guides');git('-c','user.name=Guide fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-m','fixture');
  syncConsumer(root);
  const local=path.join(root,'.agents/skills/local');fs.mkdirSync(local,{recursive:true});
  fs.writeFileSync(path.join(local,'SKILL.md'),'---\nname: local\ndescription: Local product contract fixture\n---\n\n```json\n{"schema_version":1,"business":"foo"}\n```\n');
  exercise(root,'consumer');

  const installed=await import(pathToFileURL(path.join(root,'.harness/core/runtime/tooling/harness-guide-check.mjs')));
  assert.deepEqual(installed.checkOperationalGuides(root,{layout:'consumer'}).filter(row=>row.status==='failed'),[]);
  const guide='skills/coordinate-work/references/workflow-operations.md';
  for(const [relative,change,id] of [
    [guide,()=>null,'guide-inventory'],
    ['skills/coordinate-work/SKILL.md',text=>text.replace('references/workflow-operations.md','references/missing.md'),'guide-routing'],
    [guide,text=>text.replace('"id": "entrada"','"id": '),'guide-json-example'],
    ['skills/coordinate-work/references/profiles-and-start.md',text=>text.replace('"schema_version": 1','"schema_version": 999'),'guide-json-example'],
    [guide,text=>text+'\n```bash\nbash .harness/agents.sh prepare\n```\n','guide-cli-example'],
    [guide,text=>text+'\n```bash\nbash .harness/agents.sh doctor --no-such-flag\n```\n','guide-cli-example'],
    [guide,text=>text+'\n```sh\nif then\n```\n','guide-shell-syntax'],
    [guide,text=>text+'\n[invalid anchor](profiles-and-start.md#missing)\n','guide-links'],
  ])mutate(fixture,'source',relative,change,id);
  const domainFile=path.join(fixture,'skills/implement-feature/SKILL.md');
  fs.appendFileSync(domainFile,'\n```json\n{"schema_version":1,"business":"foo"}\n```\n');clean(fixture,'source');
  const original=fs.readFileSync(path.join(fixture,guide));
  fs.appendFileSync(path.join(fixture,guide),'\n[valid anchor](profiles-and-start.md#diagnóstico-y-elección-personal)\n');clean(fixture,'source');fs.writeFileSync(path.join(fixture,guide),original);
  mutate(root,'consumer','.agents/skills/coordinate-work/references/individual-tasks.md',()=>null,'guide-adapters');
  mutate(root,'consumer','.claude/skills/coordinate-work/SKILL.md',text=>text+'\nDivergent fixture\n','guide-adapters');
  const router='.harness/README.md';
  mutate(root,'consumer',router,text=>text.replace(/\[[^\]]*\]\(core\/checks\/repository-compliance\/operations\.md\)/,''),'guide-router');

  // A legitimate profile filters adapters while retaining all corporate sources.
  const profiled=path.join(temporary,'core-profile');fs.mkdirSync(profiled);
  execFileSync('git',['init','-b','feature/core-profile'],{cwd:profiled,stdio:'pipe'});
  fs.mkdirSync(path.join(profiled,'.harness/project'),{recursive:true});
  fs.writeFileSync(path.join(profiled,'.harness/project/config.json'),JSON.stringify({schema_version:1,profiles:['core']}));
  execFileSync('git',['-c','user.name=Guide fixture','-c','user.email=fixture@example.invalid','add','.'],{cwd:profiled});
  execFileSync('git',['-c','user.name=Guide fixture','-c','user.email=fixture@example.invalid','commit','-m','fixture'],{cwd:profiled,stdio:'pipe'});
  syncConsumer(profiled);clean(profiled,'consumer');
  const omitted=path.join(profiled,'.claude/skills/spec-planear');
  fs.renameSync(omitted,omitted+'.hidden');
  assert.ok(failures(profiled,'consumer').some(row=>row.id==='guide-adapters'&&/Missing selected/.test(row.message)));
  console.log('Operational guides passed: source and installed consumers, filtered profiles, real runtime contracts, JSON/shell/CLI/link checks and negative mutation probes; no providers or example execution.');
} finally {
  for(const [key,value] of [['GITHUB_REPOSITORY',previous.repository],['GITHUB_SHA',previous.sha]])if(value===undefined)delete process.env[key];else process.env[key]=value;
  fs.rmSync(temporary,{recursive:true,force:true});
}
