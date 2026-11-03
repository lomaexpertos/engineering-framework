import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {syncConsumer} from './sync-consumer.mjs';

// This suite certifies installed documentation and local orchestration only.
// It never launches a model, contacts a provider or reads personal credentials.
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-discovery-'));
const root=path.join(temporary,'consumer');
fs.mkdirSync(root);
const environment={...process.env,HOME:temporary,XDG_CONFIG_HOME:path.join(temporary,'personal'),GITHUB_REPOSITORY:'lomaexpertos/engineering-framework',GITHUB_SHA:'a'.repeat(40)};
const previous={repository:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA};
function command(binary,args,expected=0) {
  const result=spawnSync(binary,args,{cwd:root,env:environment,encoding:'utf8',timeout:15000});
  assert.ifError(result.error);
  assert.equal(result.status,expected,`${binary} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result;
}
const agent=(args,expected=0)=>command('bash',['.harness/agents.sh',...args],expected);
const work=(...args)=>JSON.parse(command('bash',['.harness/work.sh',...args]).stdout);
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function files(directory) {
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
}
function links(file) {
  return [...read(file).matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].map(match=>match[1]);
}
function validateLinks(file) {
  for(const link of links(file)) {
    if(/^(?:[a-z]+:|#)/i.test(link))continue;
    const target=path.resolve(root,path.dirname(file),decodeURIComponent(link.split('#')[0]));
    assert.ok(target.startsWith(root+path.sep),`Installed link escapes consumer: ${file} -> ${link}`);
    assert.ok(fs.existsSync(target),`Broken installed link: ${file} -> ${link}`);
  }
}
function checkDiscovery() {
  assert.ok(read('AGENTS.md').replace(/\n$/, '').split('\n').length<=100);
  assert.match(read('CLAUDE.md'),/^@AGENTS\.md$/m);
  for(const resource of ['.harness/README.md','.harness/core/policies/README.md','.harness/core/skills/coordinate-work/SKILL.md'])assert.ok(read('AGENTS.md').includes(resource)||resource==='.harness/README.md',`Missing entrypoint: ${resource}`);
  const expectedGuides={
    'coordinate-work':['profiles-and-start.md','workflow-operations.md','individual-tasks.md','delivery-tracks.md'],
    'close-initiative':['closure-and-retention.md'],
    'spec-documentar':['domain-investigation.md'],
  };
  for(const [skill,guides] of Object.entries(expectedGuides))for(const prefix of ['.harness/core/skills','.agents/skills','.claude/skills']) {
    const entry=`${prefix}/${skill}/SKILL.md`;
    for(const guide of guides)assert.ok(links(entry).includes(`references/${guide}`),`Required operational reference unreachable: ${entry} -> ${guide}`);
  }
  for(const prefix of ['policies','skills','checks','schemas','templates'])for(const original of files(path.join(source,prefix))) {
    const relative=path.relative(source,original);
    assert.deepEqual(fs.readFileSync(path.join(root,'.harness/core',relative)),fs.readFileSync(original),`Incomplete installed resource: ${relative}`);
  }
  for(const original of files(path.join(source,'skills'))) {
    const relative=path.relative(path.join(source,'skills'),original);
    if(!relative.includes(path.sep))continue;
    for(const prefix of ['.agents/skills','.claude/skills'])assert.deepEqual(fs.readFileSync(path.join(root,prefix,relative)),fs.readFileSync(original),`Incomplete skill adapter: ${prefix}/${relative}`);
  }
  for(const prefix of ['.harness/core/policies','.harness/core/skills','.harness/core/checks','.agents/skills','.claude/skills'])for(const absolute of files(path.join(root,prefix)))if(absolute.endsWith('.md'))validateLinks(path.relative(root,absolute));
  validateLinks('.harness/README.md');
}
try {
  command('git',['init','--quiet','-b','feature/discovery']);
  command('git',['-c','user.name=Discovery fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','--quiet','-m','fixture']);
  process.env.GITHUB_REPOSITORY=environment.GITHUB_REPOSITORY;process.env.GITHUB_SHA=environment.GITHUB_SHA;
  syncConsumer(root);
  checkDiscovery();
  // Mutation probes prove this detects both dropped references and missing resources.
  const skillFile=path.join(root,'.agents/skills/coordinate-work/SKILL.md');
  const original=fs.readFileSync(skillFile);
  fs.writeFileSync(skillFile,original.toString().replaceAll('references/individual-tasks.md','references/missing-tasks.md'));
  assert.throws(checkDiscovery,/reference|resource|adapter/i);
  fs.writeFileSync(skillFile,original);
  const resource=path.join(root,'.claude/skills/coordinate-work/references/individual-tasks.md');
  const content=fs.readFileSync(resource);fs.unlinkSync(resource);
  assert.throws(checkDiscovery,/ENOENT|resource|link/);fs.writeFileSync(resource,content);

  assert.match(agent(['--help']).stdout,/setup[\s\S]*workflow/);
  assert.match(agent(['--root',root,'--help']).stdout,/Usage/);
  assert.match(agent(['workflow','--help']).stdout,/create[\s\S]*advance/);
  assert.match(agent(['setup','--help']).stdout,/input|config/);
  assert.match(agent(['--unknown-option'],2).stderr,/Unknown option/);
  const setup=JSON.parse(agent(['setup']).stdout);
  assert.deepEqual(setup.configured,[]);
  const doctor=JSON.parse(agent(['doctor'],2).stdout);
  assert.equal(doctor.ok,false);assert.equal(doctor.execution_verified,false);
  assert.ok(doctor.issues.some(issue=>/Role/.test(issue)));

  const example=(skill,file,index=0)=>{const values=[...read(`.harness/core/skills/${skill}/references/${file}`).matchAll(/```json\n([\s\S]*?)\n```/g)].map(match=>JSON.parse(match[1]));return typeof index==='function'?values.find(index):values[index];};
  const task=example('coordinate-work','individual-tasks.md');
  const initiative=task.initiative;
  assert.equal(work('create',initiative,'--title','Installed consumer discovery','--owner','coordinator').status,'draft');
  fs.writeFileSync(path.join(root,'task.json'),JSON.stringify(task));
  const prepared=JSON.parse(agent(['prepare','--input','task.json']).stdout);
  assert.ok(prepared);
  assert.equal(JSON.parse(agent(['status',initiative,task.id]).stdout).status,'prepared');
  assert.match(agent(['collect',initiative,task.id],2).stderr,/result|collect|completed|prepared/i);
  fs.writeFileSync(path.join(root,'task-invalid.json'),JSON.stringify({...task,id:'invalid',permissions:'workspace-write'}));
  assert.match(agent(['prepare','--input','task-invalid.json'],2).stderr,/read|permission|ownership/i);
  agent(['cancel',initiative,task.id],1);
  assert.equal(JSON.parse(agent(['status',initiative,task.id],1).stdout).status,'cancelled');

  // Read actual distributed examples, not a parallel hand-maintained contract.
  // Model strings remain documented placeholders. The deliberately missing
  // executable prevents even probing a real user's client or credentials.
  const configuration=example('coordinate-work','profiles-and-start.md');
  for(const profile of Object.values(configuration.profiles))profile.executable=path.join(temporary,'no-provider-client');
  fs.writeFileSync(path.join(root,'profiles-input.json'),JSON.stringify(configuration));
  const personal=path.join(temporary,'example-profiles.json');
  agent(['setup','--input','profiles-input.json','--config',personal]);
  assert.equal(fs.statSync(personal).mode&0o777,0o600);
  const workflow=example('coordinate-work','workflow-operations.md');
  fs.mkdirSync(path.join(root,'src'));fs.writeFileSync(path.join(root,'src/entrada.js'),'// Documentation fixture; never executed.\n');
  fs.writeFileSync(path.join(root,'workflow-input.json'),JSON.stringify(workflow));
  assert.equal(JSON.parse(agent(['workflow','create','--input','workflow-input.json','--config',personal]).stdout).stage,'definition');
  const next=JSON.parse(agent(['workflow','next',initiative]).stdout);
  assert.equal(next.tasks.length,1);
  assert.deepEqual(JSON.parse(agent(['workflow','next',initiative]).stdout).tasks,next.tasks);
  assert.equal(JSON.parse(agent(['workflow','status',initiative]).stdout).stage,'definition');
  assert.match(agent(['workflow','advance',initiative],2).stderr,/confirm/i);
  fs.writeFileSync(path.join(root,'decisions.json'),JSON.stringify(example('coordinate-work','workflow-operations.md',2)));
  assert.match(agent(['workflow','advance',initiative,'--confirm','--decisions','decisions.json'],2).stderr,/collected|completed|finished/i);
  fs.writeFileSync(path.join(root,'escalation.json'),JSON.stringify(example('coordinate-work','workflow-operations.md',3)));
  assert.match(agent(['workflow','escalate',initiative,'--confirm','--input','escalation.json','--config',personal],2).stderr,/blocked workflow|round limit/i);
  fs.writeFileSync(path.join(root,'answers.json'),JSON.stringify(example('coordinate-work','workflow-operations.md',1)));
  assert.match(agent(['workflow','run',initiative,'--answers','answers.json','--config',personal],2).stderr,/configuration|client|unavailable/i);
  assert.equal(JSON.parse(agent(['workflow','cancel',initiative],1).stdout).stage,'cancelled');
  assert.equal(JSON.parse(agent(['workflow','status',initiative],1).stdout).stage,'cancelled');

  const closure=example('close-initiative','closure-and-retention.md',value=>Boolean(value.documentation&&value.roadmap));
  for(const entry of Object.values(closure))if(entry&&typeof entry==='object')for(const relative of entry.sources||[]) {
    if(fs.existsSync(path.join(root,relative)))continue;
    fs.mkdirSync(path.dirname(path.join(root,relative)),{recursive:true});fs.writeFileSync(path.join(root,relative),'# Documentation fixture\n\nStructural test evidence only.\n');
  }
  fs.writeFileSync(path.join(root,`.harness_work/initiatives/${initiative}/closure.json`),JSON.stringify(closure));
  work('transition',initiative,'ready','--confirm');work('transition',initiative,'active');
  work('transition',initiative,'validating','--confirm');work('transition',initiative,'closing','--confirm');
  const stateFile=`.harness_work/initiatives/${initiative}/state.json`;
  const beforeClose=read(stateFile);
  assert.equal(work('close',initiative,'--cancelled','--check').ready,true);
  assert.equal(read(stateFile),beforeClose,'Closure preview mutated initiative state');
  const closed=work('close',initiative,'--cancelled');
  assert.equal(closed.status,'cancelled');
  assert.equal(Date.parse(closed.retain_until)-Date.parse(closed.closed_at),60*24*60*60*1000);
  assert.equal(work('close',initiative,'--cancelled').revision,closed.revision);

  console.log('Installed consumer discovery passed: complete resources and adapters, reachable operating guides, mutation probes, CLI help, documented JSON examples, incomplete setup/doctor, bounded tasks/workflow and closure retention; no model execution.');
} finally {
  for(const [key,value] of [['GITHUB_REPOSITORY',previous.repository],['GITHUB_SHA',previous.sha]])if(value===undefined)delete process.env[key];else process.env[key]=value;
  fs.rmSync(temporary,{recursive:true,force:true});
}
