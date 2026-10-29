import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {checkSecretScan,gitleaksVersion} from './harness-secret-scan.mjs';

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-secret-scan-test-'));
const root=path.join(temporary,'repo');fs.mkdirSync(root);
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:'pipe'}).trim();
const fixture=path.join(temporary,'scanner');
const canary='fixture-sensitive-output-must-never-be-returned';
const binary=process.env.HARNESS_TEST_GITLEAKS;
function fake(mode) {
  fs.writeFileSync(fixture,`#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';
const args=process.argv.slice(2),mode=${JSON.stringify(mode)};
if(args[0]==='version'){console.log(mode==='wrong-version'?'0.0.0':${JSON.stringify(gitleaksVersion)});process.exit(0);}
const get=flag=>args[args.indexOf(flag)+1];
if(!args.includes('--redact=100')||!args.includes('--ignore-gitleaks-allow')||!args.includes('--config')||Object.keys(process.env).some(key=>key.startsWith('GITLEAKS_')))process.exit(3);
if((fs.statSync(path.dirname(get('--report-path'))).mode&0o777)!==0o700)process.exit(4);
if((process.umask()&0o077)!==0o077)process.exit(5);
console.log(${JSON.stringify(canary)});console.error(${JSON.stringify(canary)});
if(mode==='timeout'){setTimeout(()=>process.exit(0),5000);}else{
if(mode==='error')process.exit(1);
if(mode==='missing')process.exit(0);
const report=mode==='malformed'?'not json '+${JSON.stringify(canary)}:JSON.stringify(mode==='finding'?[{RuleID:'fixture-rule',File:path.join(args.at(-1),'files/finding.txt'),StartLine:3,Secret:${JSON.stringify(canary)},Match:${JSON.stringify(canary)}}]:[]);
fs.writeFileSync(get('--report-path'),report);
process.exit(mode==='finding'||mode==='mismatch'?42:0);
}
`,{mode:0o755});
}
const scan=(config={mode:'worktree'},options={})=>checkSecretScan(root,config,{executable:fixture,...options});
const error=rows=>assert.ok(rows.some(row=>row.status==='error'),JSON.stringify(rows));
try {
  git(['init','-q','-b','feature/secrets']);git(['config','user.name','Harness fixture']);git(['config','user.email','fixture@example.invalid']);
  fs.writeFileSync(path.join(root,'clean.txt'),'A harmless fixture\n');git(['add','clean.txt']);git(['commit','-qm','clean fixture']);
  const base=git(['rev-parse','HEAD']);
  fake('clean');assert.equal(scan()[0].status,'passed');
  assert.equal(scan({mode:'changes',base_ref:base})[0].status,'passed');
  for(const [flag,release] of [['--assume-unchanged','--no-assume-unchanged'],['--skip-worktree','--no-skip-worktree']]) {
    git(['update-index',flag,'clean.txt']);const flags=git(['ls-files','-v']);
    try {error(scan({mode:'changes',base_ref:base}));assert.equal(git(['ls-files','-v']),flags,'Scanner must not modify index flags');}
    finally {git(['update-index',release,'clean.txt']);}
  }
  error(scan({mode:'changes'}));error(scan({mode:'changes',base_ref:'--all'}));error(scan({mode:'worktree',base_ref:base}));error(scan({mode:'unknown'}));
  error(checkSecretScan(root,{mode:'worktree'},{executable:path.join(temporary,'missing')}));
  for(const mode of ['wrong-version','error','missing','malformed','mismatch']) {fake(mode);const rows=scan();error(rows);assert.ok(!JSON.stringify(rows).includes(canary));}
  fake('finding');const finding=scan();assert.equal(finding[0].status,'failed');assert.equal(finding[0].file,'finding.txt');assert.ok(!JSON.stringify(finding).includes(canary));
  fake('timeout');error(scan({mode:'worktree'},{timeoutSeconds:0.01}));
  fake('clean');
  const old=process.env.GITLEAKS_CONFIG_TOML;process.env.GITLEAKS_CONFIG_TOML=canary;
  try{assert.equal(scan()[0].status,'passed');}finally{if(old===undefined)delete process.env.GITLEAKS_CONFIG_TOML;else process.env.GITLEAKS_CONFIG_TOML=old;}
  fs.symlinkSync(temporary,path.join(root,'linked-dir'));
  assert.equal(scan()[0].status,'passed','a link itself is scanned as text without following outside the repository');fs.unlinkSync(path.join(root,'linked-dir'));

  if(binary) {
    const real=config=>checkSecretScan(root,config,{executable:binary});
    const leaked=rows=>assert.ok(rows.some(row=>row.status==='failed'),JSON.stringify(rows));
    assert.equal(real({mode:'history'})[0].status,'passed');
    // A synthetic token-shaped value is generated at runtime, never an issued credential.
    const token='ghp_'+'aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5';
    if(process.platform==='linux') {
      const invalidPath=Buffer.concat([Buffer.from(root+path.sep),Buffer.from([0xff]),Buffer.from('.txt')]);
      fs.writeFileSync(invalidPath,'token = "'+token+'"\n');
      try {const unsupported=real({mode:'worktree'});error(unsupported);assert.match(unsupported[0].message,/UTF-8/);assert.ok(!JSON.stringify(unsupported).includes(token));}
      finally {fs.unlinkSync(invalidPath);}
    }
    const secret=path.join(root,'candidate.txt');fs.writeFileSync(secret,'token = "'+token+'" # gitleaks:allow\n');
    const untracked=real({mode:'changes',base_ref:base});leaked(untracked);assert.ok(!JSON.stringify(untracked).includes(token));
    const probeRules=path.join(temporary,'probe-rules.toml'),probeReport=path.join(temporary,'probe-report.json');
    fs.writeFileSync(probeRules,'[extend]\nuseDefault=true\n',{mode:0o600});
    const probe=spawnSync(binary,['dir','--config',probeRules,'--ignore-gitleaks-allow','--redact=100','--report-format','json','--report-path',probeReport,root],{encoding:'utf8'});
    assert.equal(probe.status,1);
    const fingerprints=JSON.parse(fs.readFileSync(probeReport,'utf8')).map(row=>row.Fingerprint);assert.ok(fingerprints.length);
    fs.unlinkSync(probeReport);
    fs.writeFileSync(path.join(root,'.gitleaks.toml'),'[[rules]]\nid="only-never"\nregex="NEVERMATCHHARNESS"\n');
    fs.writeFileSync(path.join(root,'.gitleaksignore'),fingerprints.flatMap(value=>[value,'files/'+value]).join('\n')+'\n');
    leaked(real({mode:'worktree'}));
    git(['add','candidate.txt']);leaked(real({mode:'changes',base_ref:base}));
    fs.writeFileSync(secret,'clean working tree\n');
    leaked(real({mode:'changes',base_ref:base}));leaked(real({mode:'history'}));leaked(real({mode:'worktree'}));
    fs.writeFileSync(secret,'token = "'+token+'"\n');git(['add','candidate.txt']);git(['commit','-qm','synthetic token fixture']);
    fs.writeFileSync(secret,'clean working tree\n');git(['add','candidate.txt']);git(['commit','-qm','remove token fixture']);
    leaked(real({mode:'changes',base_ref:base}));leaked(real({mode:'history'}));
    const shallow=path.join(temporary,'shallow');execFileSync('git',['clone','-q','--depth','1','file://'+root,shallow],{stdio:'pipe'});
    error(checkSecretScan(shallow,{mode:'history'},{executable:binary}));
    const unborn=path.join(temporary,'unborn');fs.mkdirSync(unborn);execFileSync('git',['init','-q'],{cwd:unborn});
    assert.equal(checkSecretScan(unborn,{mode:'worktree'},{executable:binary})[0].status,'passed');
    fs.writeFileSync(path.join(unborn,'candidate.txt'),'token = "'+token+'"\n');
    leaked(checkSecretScan(unborn,{mode:'worktree'},{executable:binary}));
    execFileSync('git',['add','candidate.txt'],{cwd:unborn});fs.writeFileSync(path.join(unborn,'candidate.txt'),'clean\n');
    leaked(checkSecretScan(unborn,{mode:'worktree'},{executable:binary}));
    const branches=path.join(temporary,'branches');fs.mkdirSync(branches);
    const branchGit=args=>execFileSync('git',args,{cwd:branches,stdio:'pipe'});
    branchGit(['init','-q','-b','feature/main']);branchGit(['config','user.name','Harness fixture']);branchGit(['config','user.email','fixture@example.invalid']);
    fs.writeFileSync(path.join(branches,'clean.txt'),'clean\n');branchGit(['add','clean.txt']);branchGit(['commit','-qm','clean fixture']);
    branchGit(['switch','-qc','feature/other']);fs.writeFileSync(path.join(branches,'candidate.txt'),'token = "'+token+'"\n');branchGit(['add','candidate.txt']);branchGit(['commit','-qm','other ref token']);branchGit(['switch','-q','feature/main']);
    assert.equal(checkSecretScan(branches,{mode:'worktree'},{executable:binary})[0].status,'passed');
    const cleanBase=execFileSync('git',['rev-parse','HEAD'],{cwd:branches,encoding:'utf8'}).trim();
    for(const [flag,release] of [['--assume-unchanged','--no-assume-unchanged'],['--skip-worktree','--no-skip-worktree']]) {
      branchGit(['update-index',flag,'clean.txt']);fs.writeFileSync(path.join(branches,'clean.txt'),'token = "'+token+'"\n');
      try {
        const hidden=checkSecretScan(branches,{mode:'changes',base_ref:cleanBase},{executable:binary});error(hidden);
        assert.match(hidden[0].message,/assume-unchanged|skip-worktree/);assert.ok(!JSON.stringify(hidden).includes(token));
        leaked(checkSecretScan(branches,{mode:'worktree'},{executable:binary}));
      } finally {fs.writeFileSync(path.join(branches,'clean.txt'),'clean\n');branchGit(['update-index',release,'clean.txt']);}
    }
    leaked(checkSecretScan(branches,{mode:'history'},{executable:binary}));
    const replaced=path.join(temporary,'replaced');fs.mkdirSync(replaced);
    const replaceGit=args=>execFileSync('git',args,{cwd:replaced,encoding:'utf8',stdio:'pipe'}).trim();
    replaceGit(['init','-q','-b','feature/replaced']);replaceGit(['config','user.name','Harness fixture']);replaceGit(['config','user.email','fixture@example.invalid']);
    fs.writeFileSync(path.join(replaced,'candidate.txt'),'token = "'+token+'"\n');replaceGit(['add','candidate.txt']);replaceGit(['commit','-qm','original token fixture']);const originalCommit=replaceGit(['rev-parse','HEAD']);
    fs.writeFileSync(path.join(replaced,'candidate.txt'),'clean\n');replaceGit(['add','candidate.txt']);replaceGit(['commit','-qm','clean fixture']);
    const substitute=replaceGit(['commit-tree','HEAD^{tree}','-m','sanitized replacement fixture']);replaceGit(['replace',originalCommit,substitute]);
    const replacementRefs=replaceGit(['for-each-ref','refs/replace']);
    leaked(checkSecretScan(replaced,{mode:'history'},{executable:binary}));
    assert.equal(replaceGit(['for-each-ref','refs/replace']),replacementRefs,'Scanner must not edit replacement refs');
    const detached=path.join(temporary,'detached');fs.mkdirSync(detached);
    const detachedGit=args=>execFileSync('git',args,{cwd:detached,encoding:'utf8',stdio:'pipe'}).trim();
    detachedGit(['init','-q','-b','feature/detached']);detachedGit(['config','user.name','Harness fixture']);detachedGit(['config','user.email','fixture@example.invalid']);
    fs.writeFileSync(path.join(detached,'candidate.txt'),'clean\n');detachedGit(['add','candidate.txt']);detachedGit(['commit','-qm','clean base fixture']);const detachedBase=detachedGit(['rev-parse','HEAD']);
    fs.writeFileSync(path.join(detached,'candidate.txt'),'token = "'+token+'"\n');detachedGit(['add','candidate.txt']);detachedGit(['commit','-qm','detached token fixture']);
    fs.writeFileSync(path.join(detached,'candidate.txt'),'clean\n');detachedGit(['add','candidate.txt']);detachedGit(['commit','-qm','remove detached token fixture']);
    detachedGit(['switch','--detach','--quiet','HEAD']);detachedGit(['branch','-D','feature/detached']);assert.equal(detachedGit(['for-each-ref']),'');
    leaked(checkSecretScan(detached,{mode:'history'},{executable:binary}));
    leaked(checkSecretScan(detached,{mode:'changes',base_ref:detachedBase},{executable:binary}));
    console.log('Gitleaks real '+gitleaksVersion+': clean scope, untracked/staged/index-hidden token, deleted historical token, local config/ignore/comment bypass prevention, shallow rejection and redaction passed.');
  }
  console.log('Secret scan contract passed: explicit scope, version, sanitized reports/errors, private artifacts, timeout and environment overrides; real scanner '+(binary?'executed':'not requested (synthetic process fixtures only)')+'.');
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
