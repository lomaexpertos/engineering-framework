import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {checkDeployments} from './harness-deployment.mjs';
import {readYaml,safePath} from './harness-yaml.mjs';
import YAML from './vendor/yaml/dist/index.js';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'harness-deployment-'));
const relative='infra/deploy/production/deployment.yaml';
const manifest=path.join(root,relative),directory=path.dirname(manifest);
function write(relative,content='fixture\n') {
  const target=path.join(root,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);
}
const base={schema_version:1,environment:'production',units:[{id:'primary',topology:'single-host',runtime:'docker-compose',artifact:'compose/core.yml',automation:'scripts/deploy.sh'}],services:[{id:'api',unit:'primary',strategy:'recreate',health_check:{command:['curl','--fail','http://api/health']},depends_on:[],modifies_schema:false,migrations:'none'}]};
function result(value=base){write(relative,YAML.stringify(value));return checkDeployments(root,[relative]);}
function bad(change,pattern) {
  const value=structuredClone(base);change(value);
  const rows=result(value);assert.equal(rows[0].status,'failed');if(pattern)assert.match(rows[0].message,pattern);
}
try {
  write('infra/deploy/production/compose/core.yml');write('infra/deploy/production/scripts/deploy.sh');
  write('infra/deploy/production/runbooks/restore.md');write('infra/deploy/production/scripts/migrate.sh');write('infra/deploy/production/edge/switch.sh');
  assert.equal(result()[0].status,'passed');
  assert.equal(checkDeployments(root,[])[0].status,'not_applicable');
  assert.equal(checkDeployments(root,[relative,relative])[0].status,'error');
  assert.equal(checkDeployments(root,'wrong')[0].status,'error');
  assert.equal(checkDeployments(root,['infra/deploy/production/missing/deployment.yaml'])[0].status,'failed');
  for(const field of ['schema_version','environment','units','services'])bad(value=>delete value[field],/fields/);
  bad(value=>value.extra='SENSITIVE_VALUE',/fields/);
  bad(value=>value.schema_version=2,/Unsupported/);
  bad(value=>value.environment='preview',/Unsupported/);
  bad(value=>value.units.push(structuredClone(value.units[0])),/Duplicate/);
  bad(value=>value.services.push(structuredClone(value.services[0])),/Duplicate/);
  bad(value=>value.services[0].unit='unknown',/unit/);
  bad(value=>value.services[0].depends_on=['missing'],/Unknown service/);
  bad(value=>value.services[0].depends_on=['api'],/dependencies/);
  bad(value=>value.services[0].strategy='unknown',/strategy/);
  bad(value=>value.services[0].health_check={reason:'',command:['true']},/Health/);
  bad(value=>value.services[0].health_check={reason:'   '},/Health/);
  bad(value=>value.services[0].modifies_schema=true,/Schema writer/);
  bad(value=>value.services[0].migrations='automated',/Non-schema writer/);
  bad(value=>value.units[0].artifact='missing.yml',/missing/);
  bad(value=>value.units[0].artifact='compose/core.yml/child',/could not be inspected/);
  bad(value=>value.units[0].automation='/etc/passwd',/Unsafe/);
  bad(value=>value.units[0].artifact='../../../../outside',/escapes/);
  bad(value=>value.services[0].strategy='blue-green',/traffic controller/);
  bad(value=>{value.services[0].strategy='rolling';value.services[0].health_check={reason:'no check'};},/health command/);
  bad(value=>value.services[0].strategy='stateful',/recovery procedure/);

  const complete=structuredClone(base);
  Object.assign(complete.services[0],{strategy:'blue-green',traffic_controller:'edge/switch.sh',modifies_schema:true,migrations:'external',migration_entrypoint:'scripts/migrate.sh'});
  assert.equal(result(complete)[0].status,'passed');
  complete.services[0].strategy='stateful';complete.services[0].recovery='runbooks/restore.md';assert.equal(result(complete)[0].status,'passed');
  write('infra/deploy/shared/compose.yml');const shared=structuredClone(base);shared.units[0].artifact='../shared/compose.yml';assert.equal(result(shared)[0].status,'passed');

  fs.symlinkSync(path.join(directory,'compose'),path.join(directory,'linked'));
  bad(value=>value.units[0].artifact='linked/core.yml',/Symbolic/);
  bad(value=>value.units[0].artifact='linked/../compose/core.yml',/Symbolic/);
  assert.throws(()=>safePath(root,'infra/deploy/production/linked/core.yml'),/Symbolic/);
  for(const unsafe of ['../escape','infra/../escape','/absolute','C:\\file','infra\\file','infra//file','./file'])assert.throws(()=>safePath(root,unsafe),/Unsafe/);

  for(const content of ['a: 1\na: SENSITIVE_VALUE\n','a: 1\n---\nb: SENSITIVE_VALUE\n','a: !custom SENSITIVE_VALUE\n','a: &a [1]\nb: *a\n','a: &a [*a]\n','? [a,b]\n: SENSITIVE_VALUE\n']) {
    write(relative,content);assert.throws(()=>readYaml(manifest),/Invalid YAML/);
    const rows=checkDeployments(root,[relative]);assert.equal(rows[0].status,'failed');assert.ok(!JSON.stringify(rows).includes('SENSITIVE_VALUE'));
  }
  write(relative,'key: '+ 'x'.repeat(1024*1024));assert.throws(()=>readYaml(manifest),/Invalid YAML/);
  fs.unlinkSync(manifest);fs.symlinkSync(path.join(directory,'compose/core.yml'),manifest);assert.equal(checkDeployments(root,[relative])[0].status,'failed');
  console.log('Deployment contract passed: YAML safety, required fields, identities/dependencies, migration authority, strategy prerequisites, bounded paths and sanitized diagnostics; no deployment or health commands executed.');
} finally {fs.rmSync(root,{recursive:true,force:true});}
