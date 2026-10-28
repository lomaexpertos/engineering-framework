import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {syncConsumer} from './sync-consumer.mjs';
import {operate,categories} from './harness-work.mjs';
import {checkRepository} from './harness-check.mjs';

// Deterministic lifecycle pilot: handoffs model the file contract, not live AI clients.
const root=fs.mkdtempSync(path.join(os.tmpdir(),'harness-pilot-'));
const id='20261028_active_notes';
const now='2026-10-28T12:00:00.000Z';
const envBefore={repository:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA};
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'});
const put=(file,text)=>{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),text);};
const json=(file,value)=>put(file,JSON.stringify(value,null,2)+'\n');
const work=(command,args=[],options={})=>operate(root,command,args,{now,...options});
const stateFile=`.harness_work/initiatives/${id}/state.json`;
const steps=[];
function observe(label,action){action();steps.push(label);console.log(`pilot: ${label}`);}
try {
  process.env.GITHUB_REPOSITORY='lomaexpertos/engineering-framework';
  process.env.GITHUB_SHA='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  git('init','--quiet');git('config','user.name','Harness pilot');git('config','user.email','pilot@example.invalid');
  observe('install consumer and discover platform skills',()=> {
    const installed=syncConsumer(root);
    assert.equal(installed.operation,'install');
    assert.ok(fs.readFileSync(path.join(root,'AGENTS.md'),'utf8').split('\n').length<=101);
    assert.ok(fs.existsSync(path.join(root,'.agents/skills/coordinate-work/SKILL.md')));
    assert.ok(fs.existsSync(path.join(root,'.claude/skills/close-initiative/SKILL.md')));
    const full = checkRepository(root);
    assert.equal(full.ok, true, JSON.stringify(full.results.filter(result => result.status === 'failed')));
    for (const scope of ['context','documentation','installation','work','extensions']) {
      const config={schema_version:1,runners:{node:{image:'node:22.19.0-alpine3.22'}},checks:[{id:'required',scope,required:true,argv:['false'],runner:'node',timeout_seconds:10,evidence:'process result',applicability:'pilot validation'}]};
      json('.harness/project/config.json',config);
      const failure={schema_version:1,config_sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'.harness/project/config.json'))).digest('hex'),checks:[{id:'required',exit_code:1,executed_at:now}]};
      assert.equal(checkRepository(root,{scope,externalResults:failure}).ok,false,`required failure in ${scope}`);
      assert.equal(checkRepository(root,{scope}).ok,false,`required missing evidence in ${scope}`);
    }
    fs.unlinkSync(path.join(root,'.harness/project/config.json'));
  });
  put('.gitignore','.harness_work/runtime/\n');
  observe('define work and bounded handoff',()=> {
    work('create',[id],{title:'List active notes',owner:'coordinator'});
    put(`.harness_work/initiatives/${id}/brief.md`,'# Active notes\n\nShow active notes alphabetically. Archived notes stay stored and are hidden.\n');
    work('transition',[id,'ready'],{confirm:true});work('transition',[id,'active']);
    json(`.harness_work/initiatives/${id}/agents/notes/brief.json`,{objective:'Return active note titles alphabetically',write_scope:['src/notes.mjs','test/notes.mjs'],excluded:['docs/','.harness/'],acceptance:['archived hidden','sorted titles'],context:['docs/domains/notes/README.md']});
    const state=work('status',[id]);state.active_tasks=['notes'];state.revision++;json(stateFile,state);
    assert.throws(()=>work('transition',[id,'closing'],{confirm:true}),/active tasks/);
  });
  observe('worker implementation and observable behavior',()=> {
    put('src/notes.mjs',"export function activeTitles(notes) { return notes.filter(note => !note.archived).map(note => note.title).sort(); }\n");
    put('test/notes.mjs',"import assert from 'node:assert/strict';\nimport {activeTitles} from '../src/notes.mjs';\nassert.deepEqual(activeTitles([{title:'Zulu'},{title:'Hidden',archived:true},{title:'Alpha'}]),['Alpha','Zulu']);\nassert.deepEqual(activeTitles([]),[]);\nconsole.log('active notes behavior passed');\n");
    const output=execFileSync(process.execPath,['test/notes.mjs'],{cwd:root,encoding:'utf8'});
    assert.match(output,/behavior passed/);
    put(`.harness_work/initiatives/${id}/agents/notes/result.md`,'# Worker result\n\nActive note titles sorted; archived entries remain stored. Behavior verified by test/notes.mjs. Next: integrated review and canonical explanation.\n');
    const state=work('status',[id]);state.active_tasks=[];state.revision++;json(stateFile,state);
  });
  observe('fresh process reconstructs bounded continuation',()=> {
    const output=execFileSync(process.execPath,['--input-type=module','-e',"import fs from 'node:fs';const brief=JSON.parse(fs.readFileSync(process.argv[1]));const result=fs.readFileSync(process.argv[2],'utf8');if(brief.write_scope.length!==2||!result.includes('Next: integrated review'))process.exit(1);console.log(brief.objective);",`.harness_work/initiatives/${id}/agents/notes/brief.json`,`.harness_work/initiatives/${id}/agents/notes/result.md`],{cwd:root,encoding:'utf8'});
    assert.match(output,/active note titles/);
    work('transition',[id,'validating'],{confirm:true});
  });
  observe('review and consolidate lasting knowledge',()=> {
    put(`.harness_work/initiatives/${id}/reviews/code.md`,'# Fixture review\n\nAutomated fixture review: observable behavior passes; no external side effects, credentials or UI. This does not certify independent human/model review.\n');
    put('docs/README.md','# Project knowledge\n\n- [Notes](domains/notes/README.md)\n- [Decision](decisions/retain-archived.md)\n- [Invariants](invariants.md)\n- [Roadmap](roadmap/README.md)\n- [Backlog](roadmap/backlog.md)\n');
    put('docs/domains/notes/README.md','# Notes\n\nActive notes appear alphabetically by title. Archiving hides a note while preserving its content.\n');
    put('docs/decisions/retain-archived.md','# Retain archived notes\n\nDecision: retain content when archived so hiding is reversible. Deleting notes requires a separate user action.\n');
    put('docs/invariants.md','# Invariants\n\nArchived notes never appear in active results; see [Notes](domains/notes/README.md).\n');
    put('docs/roadmap/README.md','# Roadmap\n\nDelivered: viewing active notes alphabetically. Availability: validated locally; no production deployment claimed.\n');
    put('docs/roadmap/backlog.md','# Backlog\n\nPlanned: allow users to edit notes.\n');
    put('.harness_work/memory/current.md','# Current context\n\nNo active initiatives. Next product priority: editing notes, described in docs/roadmap/backlog.md.\n');
    const closure={reviewer:'fixture-contract-review',reviewed_at:now};
    const sources={validation:`test/notes.mjs`,reviews:`.harness_work/initiatives/${id}/reviews/code.md`,documentation:'docs/domains/notes/README.md',decisions:'docs/decisions/retain-archived.md',invariants:'docs/invariants.md',roadmap:'docs/roadmap/README.md',backlog:'docs/roadmap/backlog.md',memory:'.harness_work/memory/current.md'};
    for(const category of categories) closure[category]={status:'complete',reason:'Fixture promotion reviewed',sources:[sources[category]]};
    json(`.harness_work/initiatives/${id}/closure.json`,closure);
    work('transition',[id,'closing'],{confirm:true});
    assert.equal(work('close',[id],{check:true}).ready,true);work('close',[id]);
    assert.equal(checkRepository(root,{scope:'documentation'}).ok,true);
    assert.equal(checkRepository(root,{scope:'work'}).ok,true);
  });
  git('add','.');git('commit','--quiet','-m','Complete fixture capability');
  const durableFiles=['docs/domains/notes/README.md','docs/decisions/retain-archived.md','docs/invariants.md','docs/roadmap/README.md','docs/roadmap/backlog.md','src/notes.mjs','test/notes.mjs'];
  const durableBefore=durableFiles.map(file=>fs.readFileSync(path.join(root,file),'utf8'));
  observe('enforce retention then purge eligible work',()=> {
    assert.throws(()=>work('purge',[id],{now:'2026-12-26T12:00:00.000Z',check:true}),/Not eligible/);
    assert.deepEqual(work('purge',[id],{now:'2026-12-27T12:00:00.000Z',check:true}).eligible,[id]);
    assert.equal(work('purge',[id],{now:'2026-12-27T12:00:00.000Z'}).status,'complete');
    assert.equal(fs.existsSync(path.join(root,`.harness_work/initiatives/${id}`)),false);
  });
  observe('lasting knowledge and product tests survive without work archive',()=> {
    assert.deepEqual(durableFiles.map(file=>fs.readFileSync(path.join(root,file),'utf8')),durableBefore);
    assert.equal(checkRepository(root,{scope:'documentation'}).ok,true);
    assert.match(execFileSync(process.execPath,['test/notes.mjs'],{cwd:root,encoding:'utf8'}),/behavior passed/);
    assert.match(fs.readFileSync(path.join(root,'docs/roadmap/backlog.md'),'utf8'),/edit notes/);
  });
  console.log(`Harness pilot passed: ${steps.length} observable stages. Synthetic handoff fixture, not live client certification.`);
} finally {
  if(envBefore.repository===undefined)delete process.env.GITHUB_REPOSITORY;else process.env.GITHUB_REPOSITORY=envBefore.repository;
  if(envBefore.sha===undefined)delete process.env.GITHUB_SHA;else process.env.GITHUB_SHA=envBefore.sha;
  fs.rmSync(root,{recursive:true,force:true});
}
