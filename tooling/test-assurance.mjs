import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {syncConsumer} from './sync-consumer.mjs';
import {checkRepository} from './harness-check.mjs';
import {validateAssurance} from './harness-assurance.mjs';
import {checkOperationalGuides} from './harness-guide-check.mjs';
import {installTool,toolPins} from './harness-tool-install.mjs';

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-assurance-test-'));
const root=path.join(temporary,'consumer'),bin=path.join(temporary,'bin');
const before={path:process.env.PATH,repo:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA};
function put(relative,content) {const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);}
function wrapper(scope) {return spawnSync('bash',['.harness/check.sh','--scope',scope,'--json'],{cwd:root,encoding:'utf8',env:process.env});}
function failed(report,id) {assert.equal(report.ok,false);assert.ok(report.results.some(row=>row.id===id&&['error','failed'].includes(row.status)));}
try {
  fs.mkdirSync(root);fs.mkdirSync(bin);
  const git=args=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
  git(['init','-q','-b','feature/assurance']);git(['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-qm','fixture']);
  process.env.GITHUB_REPOSITORY='lomaexpertos/engineering-framework';process.env.GITHUB_SHA=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  syncConsumer(root);
  assert.ok(fs.existsSync(path.join(root,'.harness/core/runtime/tooling/vendor/yaml/LICENSE')));
  assert.ok(fs.existsSync(path.join(root,'.harness/core/runtime/tooling/harness-tools.json')));
  for(const scope of ['context','documentation','installation'])assert.equal(wrapper(scope).status,0,scope);
  assert.equal(wrapper('deployment').status,0);assert.equal(wrapper('secrets').status,0);
  // An explicit scanner cannot become success when the pinned binary is absent.
  const missing=path.join(bin,'gitleaks');fs.writeFileSync(missing,'#!/bin/sh\nexit 127\n',{mode:0o755});process.env.PATH=bin+path.delimiter+before.path;
  assert.equal(wrapper('security').status,2);
  put('.harness/project/assurance.json',JSON.stringify({schema_version:1,secret_scan:{mode:'worktree'}}));
  assert.equal(wrapper('context').status,0,'Context must not require security tools');
  assert.equal(checkRepository(root).ok,false,'Adopted aggregate must not skip missing scanner');
  put('.harness/project/assurance.json','{"schema_version":1,"secret_scan":{"mode":"BAD"},"marker":"DO_NOT_ECHO"}');
  const invalid=wrapper('security');assert.equal(invalid.status,2);assert.ok(!invalid.stdout.includes('DO_NOT_ECHO'));assert.ok(!invalid.stderr.includes('DO_NOT_ECHO'));
  assert.equal(wrapper('context').status,0,'Unrelated scope remains independent of assurance configuration');
  fs.unlinkSync(path.join(root,'.harness/project/assurance.json'));
  const env='infra/deploy/production';
  put('.gitignore','infra/deploy/production/.terraform/\n');
  put(env+'/.terraform/deployment.yaml','generated cache, not a source contract');
  fs.symlinkSync(temporary,path.join(root,env+'/.terraform/cache-link'));
  assert.equal(wrapper('deployment').status,0,'Ignored infrastructure caches do not create obligations');
  put(env+'/deployment.yaml','schema_version: 1\nenvironment: production\nunits: []\nservices: []\n');
  const invalidDeployment=wrapper('deployment');assert.equal(invalidDeployment.status,1);failed(JSON.parse(invalidDeployment.stdout),'deployment-contract');
  put(env+'/compose.yml','services: {}\n');put(env+'/deploy.sh','#!/bin/sh\nexit 0\n');
  const manifest={schema_version:1,environment:'production',units:[{id:'core',topology:'single-host',runtime:'docker-compose',artifact:'compose.yml',automation:'deploy.sh'}],services:[{id:'api',unit:'core',strategy:'recreate',health_check:{reason:'Fixture without running service'},depends_on:[],modifies_schema:false,migrations:'none'}]};
  put(env+'/deployment.yaml',JSON.stringify(manifest));assert.equal(wrapper('deployment').status,0,'Installed YAML parser and runtime must work');
  manifest.services[0].depends_on=['missing'];put(env+'/deployment.yaml',JSON.stringify(manifest));assert.equal(wrapper('deployment').status,1);
  fs.unlinkSync(path.join(root,env+'/deployment.yaml'));
  put(env+'/config/secret-files.conf','core|secrets/api.sops.env|api.env|API_TOKEN\n');
  failed(checkRepository(root,{scope:'secrets'}),'secret-contract-adoption');
  put('.harness/project/assurance.json',JSON.stringify({schema_version:1,secret_contracts:[{root:env,runtime_files:['api.env']}]}));
  assert.equal(wrapper('secrets').status,1,'A declared but incomplete contract must not pass');
  fs.unlinkSync(path.join(root,env+'/config/secret-files.conf'));fs.unlinkSync(path.join(root,'.harness/project/assurance.json'));
  put('.harness/project/assurance.json',JSON.stringify({schema_version:1,deployments:['legacy/deployment.yaml']}));assert.equal(wrapper('deployment').status,1,'Missing explicit manifest must fail');
  fs.unlinkSync(path.join(root,'.harness/project/assurance.json'));
  for(const config of [{schema_version:1,secret_scan:{mode:'changes'}},{schema_version:1,secret_scan:{mode:'worktree',base_ref:'HEAD'}},{schema_version:1,secret_contracts:[{root:env,runtime_files:[]}]}])assert.throws(()=>validateAssurance(config));
  const guide=path.join(root,'.harness/core/checks/assurance/README.md'),original=fs.readFileSync(guide);
  fs.unlinkSync(guide);failed(checkRepository(root,{scope:'documentation'}),'guide-inventory');fs.writeFileSync(guide,original);
  fs.appendFileSync(guide,'\n```json\n{"schema_version":1,"secret_scan":{"mode":"changes"}}\n```\n');
  assert.ok(checkOperationalGuides(root).some(row=>row.id==='guide-json-example'&&row.status==='failed'));fs.writeFileSync(guide,original);
  // Installer has no implicit overwrite, even when the existing tool is a symlink.
  const destination=path.join(temporary,'personal');fs.mkdirSync(destination);fs.writeFileSync(path.join(destination,'gitleaks'),'personal');
  assert.throws(()=>installTool('gitleaks',destination),/already exists/);assert.equal(fs.readFileSync(path.join(destination,'gitleaks'),'utf8'),'personal');
  fs.symlinkSync(path.join(destination,'gitleaks'),path.join(destination,'sops'));assert.throws(()=>installTool('sops',destination),/already exists/);
  for(const pin of Object.values(toolPins))for(const asset of Object.values(pin.assets))assert.match(asset.sha256,/^[a-f0-9]{64}$/);
  console.log('Assurance integration passed: installed vendor/runtime/guides, scoped checks, fail-closed missing tools/configuration, discovered and declared contracts, guide mutation probes and personal tool preservation.');
}finally {
  process.env.PATH=before.path;
  for(const [key,value] of [['GITHUB_REPOSITORY',before.repo],['GITHUB_SHA',before.sha]])if(value===undefined)delete process.env[key];else process.env[key]=value;
  fs.rmSync(temporary,{recursive:true,force:true});
}
