import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readConfiguration} from './agent-profiles.mjs';
import {atomicJSON,readJSON,withWorkLock,initiativeDirectory,taskDirectory,prepareTask,runTask,statusTask,collectTask,cancelTask,validateResult,repositorySnapshot} from './agent-execution.mjs';

const reviews=['functional','security','logging','ui','ux'];
const fail=message=>{throw new Error(message);};
const workflowFile=(root,initiative)=>path.join(initiativeDirectory(root,initiative),'workflow.json');
function validateSchema(schema,value,document,label='workflow') {
  if(schema.$ref)return validateSchema(schema.$ref.slice(2).split('/').reduce((node,key)=>node[key],document),value,document,label);
  const matches=part=>{try{validateSchema(part,value,document,label);return true;}catch{return false;}};
  if(schema.allOf&&!schema.allOf.every(matches)||schema.oneOf&&schema.oneOf.filter(matches).length!==1||schema.not&&matches(schema.not))fail(`Invalid ${label} alternatives`);
  if(schema.const!==undefined&&value!==schema.const||schema.enum&&!schema.enum.includes(value))fail(`Invalid ${label} value`);
  const type=value===null?'null':Array.isArray(value)?'array':typeof value;
  if(schema.type&&!([schema.type].flat().includes(type)||schema.type==='integer'&&Number.isInteger(value)))fail(`Invalid ${label} type`);
  if(type==='string'&&(schema.minLength&&value.length<schema.minLength||schema.pattern&&!new RegExp(schema.pattern).test(value)||schema.format==='date-time'&&!Number.isFinite(Date.parse(value))))fail(`Invalid ${label} text`);
  if(type==='number'&&(schema.minimum!==undefined&&value<schema.minimum||schema.maximum!==undefined&&value>schema.maximum))fail(`Invalid ${label} range`);
  if(type==='array'){if(schema.minItems&&value.length<schema.minItems||schema.uniqueItems&&new Set(value.map(v=>JSON.stringify(v))).size!==value.length)fail(`Invalid ${label} items`);if(schema.items)value.forEach((item,index)=>validateSchema(schema.items,item,document,`${label}[${index}]`));}
  if(type==='object'){for(const key of schema.required||[])if(!Object.hasOwn(value,key))fail(`Missing ${label}.${key}`);for(const [key,item] of Object.entries(value)){if(schema.propertyNames)validateSchema(schema.propertyNames,key,document,label+' key');if(schema.properties?.[key])validateSchema(schema.properties[key],item,document,`${label}.${key}`);else if(schema.additionalProperties===false)fail(`Unknown ${label}.${key}`);else if(schema.additionalProperties&&typeof schema.additionalProperties==='object')validateSchema(schema.additionalProperties,item,document,`${label}.${key}`);}}
}
export function validateWorkflow(workflow) {
  const source=fileURLToPath(new URL('../schemas/agent-workflow.schema.json',import.meta.url));
  const schema=readJSON(fs.existsSync(source)?source:fileURLToPath(new URL('../../schemas/agent-workflow.schema.json',import.meta.url)));
  validateSchema(schema,workflow,schema);
  const expected=reviews.filter(role=>!['ui','ux'].includes(role)||workflow.applicability[role].applies);
  if(JSON.stringify(workflow.required_reviews)!==JSON.stringify(expected))fail('Workflow review coverage disagrees with applicability');
  if(workflow.stage==='ready_to_close'&&(!['definition','implementation','review','verification'].every(stage=>workflow.history.some(entry=>entry.stage===stage))||workflow.history.at(-1)?.stage!=='verification'))fail('Workflow lacks final verification history');
  return workflow;
}
function save(root,workflow) {workflow.updated_at=new Date().toISOString();atomicJSON(workflowFile(root,workflow.initiative),validateWorkflow(workflow));return workflow;}
export function workflowStatus(root,initiative) {const workflow=validateWorkflow(readJSON(workflowFile(root,initiative)));if(workflow.initiative!==initiative)fail('Workflow initiative mismatch');return workflow;}
export function createWorkflow(root,input,options={}) {
  const configuration=readConfiguration(root,options);
  return withWorkLock(root,()=>{
    const file=workflowFile(root,input.initiative);if(fs.existsSync(file))fail('Workflow already exists');
    const state=readJSON(path.join(initiativeDirectory(root,input.initiative),'state.json'));
    if(!['draft','ready','active','blocked','validating'].includes(state.status))fail('Initiative is not open');
    if(!/^[a-z][a-z0-9_-]{0,47}$/.test(input.id||'')||typeof input.objective!=='string'||!input.objective.trim())fail('Workflow needs id and objective');
    for(const field of ['scope','exclusions','ownership','references','acceptance'])if(!Array.isArray(input[field])||input[field].some(x=>typeof x!=='string'||!x.trim())||(['scope','ownership','acceptance'].includes(field)&&!input[field].length))fail(`Invalid workflow ${field}`);
    const applicability=input.applicability;
    for(const role of ['ui','ux'])if(!applicability?.[role]||typeof applicability[role].applies!=='boolean'||typeof applicability[role].reason!=='string'||!applicability[role].reason.trim())fail(`Explicit applicability reason required for ${role}`);
    const required=reviews.filter(role=>!['ui','ux'].includes(role)||applicability[role].applies);
    for(const role of ['definition','implementation',...required])if(!configuration.profiles[configuration.roles[role]])fail(`Missing role: ${role}`);
    return save(root,{schema_version:1,id:input.id,initiative:input.initiative,objective:input.objective,scope:input.scope,exclusions:input.exclusions,ownership:input.ownership,references:input.references,acceptance:input.acceptance,...(input.workspace?{workspace:input.workspace}:{}),applicability,stage:'definition',round:0,max_correction_rounds:configuration.limits.max_correction_rounds,required_reviews:required,tasks:{},history:[],decisions:[],created_at:new Date().toISOString(),updated_at:new Date().toISOString(),blocked_from:null,block_reason:null});
  });
}
function stageKey(workflow) {return `${workflow.stage}-${workflow.round}`;}
export function workflowNext(root,initiative) {
  let workflow=workflowStatus(root,initiative);
  if(['ready_to_close','cancelled','blocked'].includes(workflow.stage))return {workflow,tasks:[]};
  const key=stageKey(workflow);
  if(workflow.tasks[key])return {workflow,tasks:workflow.tasks[key]};
  const stageRoles=workflow.stage==='review'?workflow.required_reviews:workflow.stage==='definition'?['definition']:workflow.stage==='verification'?['functional']:['implementation'];
  const previous=[...new Set([...(workflow.history.find(entry=>entry.stage==='definition')?.tasks||[]),...(workflow.history.filter(entry=>['implementation','correction'].includes(entry.stage)).at(-1)?.tasks||[]),...(workflow.history.at(-1)?.tasks||[])])];
  const ids=[];
  for(const role of stageRoles) {
    const id=`${workflow.id}-${workflow.stage}-${workflow.round}-${role}`;
    const dir=taskDirectory(root,initiative,id);
    const writer=['implementation','correction'].includes(workflow.stage);
    const stageObjective={definition:'Complete the specification, verify facts with sources, distinguish hypotheses, and return indispensable questions as needs_input. Explain acceptance criteria before implementation.',implementation:'Implement the approved specification and execute pertinent tests in the project environment.',review:`Independently review the same code baseline from the ${role} perspective. Report evidence-based findings, without modifying code.`,correction:'Correct the consolidated blocker findings from the previous review results. Escalate unresolved design decisions instead of guessing.',verification:'Verify final acceptance criteria and corrections on the delivered version. Execute applicable tests when your client permissions allow; otherwise verify the implementation test evidence against the delivered baseline and explicitly identify inherited evidence. Recheck previous blocker conditions.'}[workflow.stage];
    const task={schema_version:1,id,initiative,role,objective:`${workflow.objective}\n${stageObjective}`,scope:workflow.scope,exclusions:workflow.exclusions,ownership:writer?workflow.ownership:[],references:workflow.references,acceptance:workflow.acceptance,dependencies:previous,permissions:writer?'workspace-write':'read-only',...(workflow.workspace?{workspace:workflow.workspace}:{})};
    if(!fs.existsSync(dir))prepareTask(root,task);
    else if(JSON.stringify(readJSON(path.join(dir,'task.json')))!==JSON.stringify(task))fail('Interrupted workflow task disagrees with immutable instructions');
    ids.push(id);
  }
  return withWorkLock(root,()=>{
    workflow=workflowStatus(root,initiative);
    if(stageKey(workflow)!==key)fail('Workflow stage changed during preparation');
    workflow.tasks[key]=ids;save(root,workflow);return {workflow,tasks:ids};
  });
}
export async function runWorkflow(root,initiative,options={}) {
  const {workflow,tasks}=workflowNext(root,initiative),config=readConfiguration(root,options);
  if(!tasks.length)return {workflow,results:[]};
  const results=[];
  // The same logical review set works on machines with different concurrency budgets.
  for(let offset=0;offset<tasks.length;offset+=config.limits.max_concurrency) {
    const batch=tasks.slice(offset,offset+config.limits.max_concurrency);
    results.push(...await Promise.all(batch.map(async id=>{
      let execution=statusTask(root,initiative,id);
      if(!execution.collected_at||['needs_input','failed','timed_out','interrupted'].includes(execution.status)) {
        while(['starting','running'].includes(execution.status)) {await new Promise(resolve=>setTimeout(resolve,100));execution=statusTask(root,initiative,id);}
        if(['prepared','failed','timed_out','interrupted'].includes(execution.status)||execution.status==='needs_input'&&options.answers?.length)execution=await runTask(root,initiative,id,{...options,background:false});
        if(execution.status==='completed')execution=collectTask(root,initiative,id);
      }
      return execution;
    })));
  }
  return {workflow:workflowStatus(root,initiative),results};
}
export function advanceWorkflow(root,initiative,options={}) {
  if(!options.confirm)fail('Workflow advance requires coordinator --confirm after inspecting results/diffs');
  return withWorkLock(root,()=>{
    const workflow=workflowStatus(root,initiative),key=stageKey(workflow),ids=workflow.tasks[key];
    if(!ids?.length)fail('No prepared tasks for this stage');
    const results=[];
    for(const id of ids) {
      const execution=statusTask(root,initiative,id);
      if(execution.status!=='completed'||!execution.collected_at)fail(`Task is not completed and collected: ${id}`);
      results.push(validateResult(readJSON(path.join(taskDirectory(root,initiative,id),'result.json')),id));
      if(['definition','review','verification'].includes(workflow.stage)&&JSON.stringify(repositorySnapshot(execution.workspace))!==JSON.stringify(execution.baseline))fail('Code changed after review; prepare a new review baseline');
    }
    const blockerFindings=results.flatMap(result=>result.findings.filter(f=>f.severity==='blocker'&&f.status==='open'));
    const previous=workflow.stage;
    if(workflow.stage==='definition') {
      if(blockerFindings.length)fail('Definition has unresolved blockers');
      workflow.stage='implementation';
    } else if(['implementation','correction'].includes(workflow.stage)) {
      if(blockerFindings.length||results.some(result=>result.pending.length||result.verification.some(v=>v.outcome==='failed')))fail('Implementation has unresolved failures or pending work');
      workflow.stage='review';
    } else if(workflow.stage==='review') {
      const consolidated=new Map();
      for(const result of results)for(const finding of result.findings) {
        const signature=JSON.stringify([finding.dimension,finding.location,finding.evidence,finding.impact,finding.resolution,finding.severity,finding.status]);
        const item=consolidated.get(signature)||{...finding,sources:[]};item.sources.push({task_id:result.task_id,finding_id:finding.id});consolidated.set(signature,item);
      }
      atomicJSON(path.join(initiativeDirectory(root,initiative),`review-${workflow.round}-findings.json`),{schema_version:1,round:workflow.round,reviewed_at:new Date().toISOString(),reviewer:options.reviewer||'coordinator',findings:[...consolidated.values()]});
      if(blockerFindings.length) {
        if(workflow.round>=workflow.max_correction_rounds) {
          workflow.blocked_from='review';workflow.stage='blocked';workflow.block_reason='Correction round limit reached; escalate decision or implementation capability';
        } else {workflow.round++;workflow.stage='correction';}
      } else workflow.stage='verification';
    } else if(workflow.stage==='verification') {
      if(blockerFindings.length||results.some(r=>r.pending.length||r.verification.some(v=>v.outcome==='failed'))||!results.some(r=>r.verification.some(v=>v.outcome==='passed'&&v.evidence.trim())))fail('Final verification requires executed passing tests, no failures/pending/blockers');
      const writerHistory=[...workflow.history].reverse().find(entry=>['implementation','correction'].includes(entry.stage));
      if(!writerHistory)fail('Missing implementation test evidence');
      for(const id of writerHistory.tasks) {
        const directory=taskDirectory(root,initiative,id),execution=readJSON(path.join(directory,'execution.json')),result=readJSON(path.join(directory,'result.json'));
        if(JSON.stringify(execution.final_snapshot)!==JSON.stringify(repositorySnapshot(execution.workspace))||!result.verification.some(v=>v.outcome==='passed'&&v.evidence.trim()))fail('Implementation tests must have passing evidence on the delivered baseline');
      }
      const openRecommendations=results.flatMap(result=>result.findings.filter(f=>f.severity!=='blocker'&&f.status==='open').map(f=>({task_id:result.task_id,finding_id:f.id})));
      for(const history of workflow.history)for(const id of history.tasks) {
        const result=readJSON(path.join(taskDirectory(root,initiative,id),'result.json'));
        for(const finding of result.findings)if(finding.severity!=='blocker'&&finding.status==='open')openRecommendations.push({task_id:id,finding_id:finding.id});
      }
      const decisions=options.decisions||[];
      for(const finding of openRecommendations)if(!decisions.some(d=>d.task_id===finding.task_id&&d.finding_id===finding.finding_id&&['accepted','resolved'].includes(d.decision)&&typeof d.reason==='string'&&d.reason.trim()&&typeof d.evidence==='string'&&d.evidence.trim()))fail(`Missing recommendation disposition: ${finding.task_id}/${finding.finding_id}`);
      workflow.decisions.push(...decisions);workflow.stage='ready_to_close';
    } else fail('Workflow cannot advance from current stage');
    workflow.history.push({stage:previous,round:previous==='review'&&workflow.stage==='correction'?workflow.round-1:workflow.round,tasks:ids,reviewed_at:new Date().toISOString(),reviewer:options.reviewer||'coordinator',snapshot:repositorySnapshot(root)});
    return save(root,workflow);
  });
}
export function escalateWorkflow(root,initiative,options={}) {
  if(!options.confirm||!options.input||Object.keys(options.input).some(key=>!['reason','reviewer'].includes(key))||['reason','reviewer'].some(key=>typeof options.input[key]!=='string'||!options.input[key].trim()))fail('Escalation requires --confirm and explicit reason/reviewer');
  const config=readConfiguration(root,options);
  return withWorkLock(root,()=>{const workflow=workflowStatus(root,initiative);if(workflow.stage!=='blocked'||config.limits.max_correction_rounds<=workflow.round)fail('Escalation requires blocked workflow and an explicitly increased configured round limit');workflow.decisions.push({type:'escalation',reason:options.input.reason,reviewer:options.input.reviewer,reviewed_at:new Date().toISOString(),profiles:Object.fromEntries(Object.entries(config.roles).map(([role,name])=>[role,{profile:name,adapter:config.profiles[name].adapter,model:config.profiles[name].model}]))});workflow.max_correction_rounds=config.limits.max_correction_rounds;workflow.round++;workflow.stage='correction';workflow.blocked_from=null;workflow.block_reason=null;return save(root,workflow);});
}
export async function cancelWorkflow(root,initiative) {
  const workflow=workflowStatus(root,initiative);
  for(const ids of Object.values(workflow.tasks))for(const id of ids)if(!statusTask(root,initiative,id).collected_at)await cancelTask(root,initiative,id);
  return withWorkLock(root,()=>{const current=workflowStatus(root,initiative);current.stage='cancelled';return save(root,current);});
}
