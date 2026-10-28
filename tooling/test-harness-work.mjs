import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {operate,categories,validateState} from './harness-work.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'harness-work-'));
const id='20261028_example', second='20261028_second';
const now='2026-10-28T00:00:00.000Z';
function git(...args){return execFileSync('git',args,{cwd:root,encoding:'utf8'});}
function run(command,args=[],options={}){return operate(root,command,args,{now,...options});}
function json(file,value){fs.writeFileSync(path.join(root,file),JSON.stringify(value,null,2)+'\n');}
function close(initiative){
  run('create',[initiative],{title:'Example',owner:'coordinator'});
  assert.throws(()=>run('transition',[initiative,'closed']),/Invalid transition/);
  run('transition',[initiative,'ready'],{confirm:true});run('transition',[initiative,'active']);
  run('transition',[initiative,'validating'],{confirm:true});run('transition',[initiative,'closing'],{confirm:true});
  assert.throws(()=>run('close',[initiative]),/Missing closure/);
  const closure={reviewer:'independent reviewer',reviewed_at:now};
  for(const category of categories) closure[category]={status:'complete',reason:'Reviewed outcome',sources:['docs/system.md']};
  json(`.harness_work/initiatives/${initiative}/closure.json`,closure);
  const durable=path.join(root,'docs/system.md');
  const stable=fs.readFileSync(durable,'utf8');
  for(const link of [
    `[work](../.harness_work/initiatives/${initiative}/brief.md)`,
    `[work][evidence]\n\n[evidence]: ../.%68arness_work/initiatives/${initiative}/brief.md`,
  ]) {
    fs.writeFileSync(durable,`# System\n\n${link}\n`);
    assert.throws(()=>run('close',[initiative],{check:true}),/depends on temporary work/);
  }
  fs.writeFileSync(durable,stable);
  assert.equal(run('close',[initiative],{check:true}).ready,true);
  assert.equal(run('status',[initiative]).status,'closing');
  const state=run('close',[initiative]);assert.equal(state.retain_until,'2026-12-27T00:00:00.000Z');
  assert.throws(()=>validateState({...state,closed_at:'2026-10-28T00:00:00+00:00'}),/Invalid closure/);
  assert.equal(run('close',[initiative]).revision,state.revision);
}
try {
  git('init','--quiet');git('config','user.email','test@example.invalid');git('config','user.name','Test');
  fs.mkdirSync(path.join(root,'docs'));fs.writeFileSync(path.join(root,'docs/system.md'),'# System\n\nStable behavior.\n');
  fs.writeFileSync(path.join(root,'.gitignore'),'.harness_work/runtime/\n');
  assert.throws(()=>run('create',['../escape'],{title:'No',owner:'No'}),/Invalid initiative/);
  close(id);
  assert.throws(()=>run('purge',[id],{now:'2026-12-26T00:00:00Z',check:true}),/Not eligible/);
  run('hold',[id],{reason:'Investigating'});
  assert.throws(()=>run('purge',[id],{now:'2026-12-28T00:00:00Z',check:true}),/Not eligible/);
  run('hold',[id],{release:true});
  run('reopen',[id]);assert.equal(run('status',[id]).retain_until,null);
  run('transition',[id,'blocked'],{reason:'paused'});
  assert.throws(()=>run('transition',[id,'active']),/--resume/);
  run('transition',[id,'active'],{resume:true});
  run('transition',[id,'closing'],{confirm:true});
  assert.throws(()=>run('close',[id]),/Missing closure/);
  const archive=fs.readdirSync(path.join(root,`.harness_work/initiatives/${id}`)).find(name=>name.startsWith('closure.previous.'));
  json(`.harness_work/initiatives/${id}/closure.json`,JSON.parse(fs.readFileSync(path.join(root,`.harness_work/initiatives/${id}`,archive),'utf8')));
  run('close',[id]);
  close(second);
  fs.mkdirSync(path.join(root,'.harness_work/runtime/update.lock'));
  assert.throws(()=>run('reopen',[id]),/Update operation active/);
  fs.rmdirSync(path.join(root,'.harness_work/runtime/update.lock'));
  json('.harness_work/runtime/update.json',{});
  assert.throws(()=>run('hold',[id],{reason:'must not mutate partial installation'}),/Interrupted update/);
  fs.unlinkSync(path.join(root,'.harness_work/runtime/update.json'));
  git('add','.');git('commit','-qm','Fixture');
  fs.appendFileSync(path.join(root,'docs/system.md'),`\n${id}\n`);
  assert.throws(()=>run('purge',[id],{now:'2026-12-28T00:00:00Z',check:true}),/Incoming references/);
  fs.writeFileSync(path.join(root,'docs/system.md'),'# System\n\nStable behavior.\n');
  fs.appendFileSync(path.join(root,`.harness_work/initiatives/${id}/brief.md`),'changed\n');
  assert.throws(()=>run('purge',[id],{now:'2026-12-28T00:00:00Z',check:true}),/Uncommitted/);
  git('restore',`.harness_work/initiatives/${id}/brief.md`);
  assert.deepEqual(run('purge',[id],{now:'2026-12-27T00:00:00Z',check:true}).eligible,[id]);
  const dir=path.join(root,`.harness_work/initiatives/${id}`);
  fs.symlinkSync('/tmp',path.join(dir,'escape'));
  assert.throws(()=>run('purge',[id],{now:'2026-12-28T00:00:00Z',check:true}),/Symlink/);
  fs.unlinkSync(path.join(dir,'escape'));
  assert.throws(()=>run('purge',[id,second],{now:'2026-12-28T00:00:00Z',afterMove:()=>{throw new Error('interrupt');}}),/interrupt/);
  const operation=fs.readdirSync(path.join(root,'.harness_work/runtime/purge'))[0];
  assert.throws(()=>run('reopen',[second]),/Pending purge/);
  run('recover',[operation],{restore:true});assert.equal(run('status',[id]).status,'closed');
  const purge=run('purge',[id,second],{now:'2026-12-28T00:00:00Z'});
  assert.equal(purge.status,'complete');assert.equal(fs.existsSync(dir),false);
  assert.equal(fs.readFileSync(path.join(root,'docs/system.md'),'utf8'),'# System\n\nStable behavior.\n');
  assert.equal(run('recover',[purge.operation]).status,'complete');
  assert.throws(()=>validateState({}),/Invalid initiative/);
  console.log('Lifecycle tests passed: transitions, pause, closure, reopen, 60-day boundary, holds, references, clean Git, symlinks, interrupted batch restore and purge.');
} finally {fs.rmSync(root,{recursive:true,force:true});}
