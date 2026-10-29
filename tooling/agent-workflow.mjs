import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readConfiguration,validateProject} from './agent-profiles.mjs';
import {trackOf,maxTrack,resolveTrack} from './harness-tracks.mjs';
import {atomicJSON,readJSON,safePath,withWorkLock,initiativeDirectory,taskDirectory,prepareTask,runTask,statusTask,collectTask,cancelTask,validateResult,repositorySnapshot} from './agent-execution.mjs';

const reviews=['functional','security','logging','ui','ux'];
const fail=message=>{throw new Error(message);};
const workflowFile=(root,initiative)=>path.join(initiativeDirectory(root,initiative),'workflow.json');
const needsDefinition=workflow=>trackOf(workflow)==='reinforced'||workflow.needs_definition===true||workflow.assessment?.risks.includes('uncertainty');
function requiredReviews(workflow) {
  if(trackOf(workflow)==='minimal')return [];
  if(trackOf(workflow)==='standard')return ['functional'];
  return reviews.filter(role=>!['ui','ux'].includes(role)||workflow.applicability?.[role]?.applies);
}
function workflowRoles(workflow) {return [...new Set([...(needsDefinition(workflow)?['definition']:[]),'implementation',...workflow.required_reviews])];}
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
  const track=trackOf(workflow);
  if(resolveTrack(workflow.track,workflow.assessment)!==track||needsDefinition(workflow)&&track==='minimal')fail('Workflow track is below its assessment requirements');
  if(track==='reinforced'&&!workflow.applicability)fail('Reinforced workflow requires explicit applicability');
  const expected=requiredReviews(workflow);
  if(JSON.stringify(workflow.required_reviews)!==JSON.stringify(expected))fail('Workflow review coverage disagrees with applicability');
  if(track==='minimal'&&['definition','review','correction','verification'].includes(workflow.stage)||track==='standard'&&workflow.stage==='verification')fail('Workflow stage does not belong to selected track');
  const stages=[...(needsDefinition(workflow)?['definition']:[]),'implementation',...(track==='minimal'?[]:['review']),...(track==='reinforced'?['verification']:[])];
  const finalStage=track==='reinforced'?'verification':track==='standard'?'review':'implementation';
  if(workflow.stage==='ready_to_close'&&(!stages.every(stage=>workflow.history.some(entry=>entry.stage===stage))||workflow.history.at(-1)?.stage!==finalStage))fail('Workflow lacks final verification history for its track');
  return workflow;
}
function save(root,workflow) {workflow.updated_at=new Date().toISOString();atomicJSON(workflowFile(root,workflow.initiative),validateWorkflow(workflow));return workflow;}
export function workflowStatus(root,initiative) {
  const workflow=validateWorkflow(readJSON(workflowFile(root,initiative)));if(workflow.initiative!==initiative)fail('Workflow initiative mismatch');
  if(workflow.stage==='cancelled')return workflow;
  const state=readJSON(path.join(initiativeDirectory(root,initiative),'state.json'));
  if(maxTrack(trackOf(workflow),trackOf(state))!==trackOf(workflow))fail('Workflow cannot lower the initiative track');
  const projectFile=safePath(root,'.harness/project/agents.json'),project=validateProject(fs.existsSync(projectFile)?readJSON(projectFile):{schema_version:1});
  if(resolveTrack(workflow.track,workflow.assessment,project)!==trackOf(workflow))fail('Workflow is below the current project track requirements');
  for(const role of project.required_roles||[])if(!workflowRoles(workflow).includes(role))fail(`Workflow lacks current project required role: ${role}`);
  return workflow;
}
export function draftWorkflow(input,state=undefined,project={},limits={max_correction_rounds:2}) {
    if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!['id','initiative','objective','scope','exclusions','ownership','references','acceptance','workspace','applicability','track','assessment','needs_definition'].includes(key)))fail('Unknown workflow input fields');
    state??={track:input.track,assessment:input.assessment};
    if(!/^[a-z][a-z0-9_-]{0,47}$/.test(input.id||'')||typeof input.objective!=='string'||!input.objective.trim())fail('Workflow needs id and objective');
    for(const field of ['scope','exclusions','ownership','references','acceptance'])if(!Array.isArray(input[field])||input[field].some(x=>typeof x!=='string'||!x.trim())||(['scope','ownership','acceptance'].includes(field)&&!input[field].length))fail(`Invalid workflow ${field}`);
    if(input.needs_definition!==undefined&&typeof input.needs_definition!=='boolean')fail('Invalid needs_definition');
    const assessment=input.assessment===undefined?state.assessment:input.assessment;
    let track=maxTrack(resolveTrack(input.track===undefined?state.track:input.track,assessment,project),trackOf(state));
    const definition=track==='reinforced'||input.needs_definition===true||assessment?.risks.includes('uncertainty')||project.required_roles?.includes('definition');
    if(definition)track=maxTrack(track,'standard');
    const applicability=input.applicability;
    if(track==='reinforced'||applicability!==undefined)for(const role of ['ui','ux'])if(!applicability?.[role]||typeof applicability[role].applies!=='boolean'||typeof applicability[role].reason!=='string'||!applicability[role].reason.trim())fail(`Explicit applicability reason required for ${role}`);
    for(const role of ['ui','ux'])if(project.required_roles?.includes(role)&&!applicability?.[role]?.applies)fail(`Project requires ${role} review; applicability cannot exclude it`);
    const required=requiredReviews({track,applicability});
    return {schema_version:1,id:input.id,initiative:input.initiative,objective:input.objective,scope:input.scope,exclusions:input.exclusions,ownership:input.ownership,references:input.references,acceptance:input.acceptance,...(input.workspace?{workspace:input.workspace}:{}),...(input.track!==undefined||state.track!==undefined?{track,assessment,needs_definition:!!definition}:{}),...(applicability?{applicability}:{}),stage:definition?'definition':'implementation',round:0,max_correction_rounds:limits.max_correction_rounds,required_reviews:required,tasks:{},history:[],decisions:[],created_at:new Date().toISOString(),updated_at:new Date().toISOString(),blocked_from:null,block_reason:null};
}
export function createWorkflow(root,input,options={}) {
  const configuration=readConfiguration(root,options);
  return withWorkLock(root,()=>{
    const file=workflowFile(root,input.initiative);if(fs.existsSync(file))fail('Workflow already exists');
    const state=readJSON(path.join(initiativeDirectory(root,input.initiative),'state.json'));
    if(!['draft','ready','active','blocked','validating'].includes(state.status))fail('Initiative is not open');
    const workflow=draftWorkflow(input,state,configuration.project,configuration.limits);
    const requiredRoles=[...workflowRoles(workflow),...(configuration.project.required_roles||[])];
    for(const role of requiredRoles)if(!configuration.profiles[configuration.roles[role]])fail(`Missing role: ${role}`);
    return save(root,workflow);
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
    const reinforced=trackOf(workflow)==='reinforced';
    const stageObjective={definition:reinforced?'Complete the specification, verify facts with sources, distinguish hypotheses, and return indispensable questions as needs_input. Explain acceptance criteria before implementation.':'Resolve the indispensable definition gaps, verify uncertain facts with sources, and explain acceptance criteria. Return needs_input only for unanswered questions necessary to proceed; do not create ritual questions.',implementation:reinforced?'Implement the approved specification and execute pertinent tests in the project environment.':'Implement the accepted objective and execute pertinent validation in the project environment. Scale the work and evidence to the actual change.',review:reinforced?`Independently review the same code baseline from the ${role} perspective. Report evidence-based findings, without modifying code.`:`Independently review the same code baseline covering all applicable dimensions: functional correctness, contracts, data integrity, security, logging, comments, UI and UX. Report evidence-based findings, without modifying code. Confirm acceptance criteria and the implementation validation evidence on the delivered version. Record observed inspection evidence as passed, and identify any tests not repeated as not_run with inherited evidence. Applicability: ${JSON.stringify(workflow.applicability||'Determine relevant dimensions from the bounded change')}.`,correction:'Correct the consolidated blocker findings from the previous review results. Escalate unresolved design decisions instead of guessing.',verification:'Verify final acceptance criteria and corrections on the delivered version. Execute applicable tests when your client permissions allow; otherwise verify the implementation test evidence against the delivered baseline and explicitly identify inherited evidence. Recheck previous blocker conditions.'}[workflow.stage];
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
function completeWorkflow(root,workflow,results,ids,options) {
  if(results.some(result=>result.pending.length||result.verification.some(v=>v.outcome==='failed')))fail('Final acceptance requires no failures or pending work');
  if(workflow.stage==='review'&&results.some(result=>!result.verification.some(v=>v.outcome==='passed'&&v.evidence.trim())))fail('Final review requires passing inspection evidence; inherited implementation tests need not be repeated');
  if(workflow.stage==='review'&&results.some(result=>result.verification.some(v=>v.outcome==='not_run'&&!v.evidence.trim())))fail('Skipped review validation requires a reason or inherited evidence');
  const writerIds=['implementation','correction'].includes(workflow.stage)?ids:[...workflow.history].reverse().find(entry=>['implementation','correction'].includes(entry.stage))?.tasks;
  if(!writerIds?.length)fail('Missing implementation validation evidence');
  for(const id of writerIds) {
    const directory=taskDirectory(root,workflow.initiative,id),execution=readJSON(path.join(directory,'execution.json')),result=readJSON(path.join(directory,'result.json'));
    if(JSON.stringify(execution.final_snapshot)!==JSON.stringify(repositorySnapshot(execution.workspace))||!result.verification.some(v=>v.outcome==='passed'&&v.evidence.trim()))fail('Implementation validation must have passing evidence on the delivered baseline');
  }
  const findings=[];
  for(const result of results)for(const finding of result.findings)if(finding.severity!=='blocker'&&finding.status==='open')findings.push({task_id:result.task_id,finding_id:finding.id});
  for(const history of workflow.history)for(const id of history.tasks) {
    const result=readJSON(path.join(taskDirectory(root,workflow.initiative,id),'result.json'));
    for(const finding of result.findings)if(finding.severity!=='blocker'&&finding.status==='open')findings.push({task_id:id,finding_id:finding.id});
  }
  const decisions=options.decisions||[];
  for(const finding of findings)if(![...workflow.decisions,...decisions].some(d=>d.task_id===finding.task_id&&d.finding_id===finding.finding_id&&['accepted','resolved'].includes(d.decision)&&typeof d.reason==='string'&&d.reason.trim()&&typeof d.evidence==='string'&&d.evidence.trim()))fail(`Missing recommendation disposition: ${finding.task_id}/${finding.finding_id}`);
  workflow.decisions.push(...decisions);workflow.stage='ready_to_close';
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
      if(trackOf(workflow)==='minimal')completeWorkflow(root,workflow,results,ids,options);
      else workflow.stage='review';
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
      } else if(trackOf(workflow)==='standard')completeWorkflow(root,workflow,results,ids,options);
      else workflow.stage='verification';
    } else if(workflow.stage==='verification') {
      if(blockerFindings.length||results.some(r=>r.pending.length||r.verification.some(v=>v.outcome==='failed'))||!results.some(r=>r.verification.some(v=>v.outcome==='passed'&&v.evidence.trim())))fail('Final verification requires executed passing tests, no failures/pending/blockers');
      completeWorkflow(root,workflow,results,ids,options);
    } else fail('Workflow cannot advance from current stage');
    workflow.history.push({stage:previous,round:previous==='review'&&workflow.stage==='correction'?workflow.round-1:workflow.round,tasks:ids,reviewed_at:new Date().toISOString(),reviewer:options.reviewer||'coordinator',snapshot:repositorySnapshot(root)});
    return save(root,workflow);
  });
}
export function escalateWorkflow(root,initiative,options={}) {
  if(!options.confirm||!options.input||Object.keys(options.input).some(key=>!['reason','reviewer'].includes(key))||['reason','reviewer'].some(key=>typeof options.input[key]!=='string'||!options.input[key].trim()))fail('Escalation requires --confirm and explicit reason/reviewer');
  const config=readConfiguration(root,options);
  return withWorkLock(root,()=>{const workflow=workflowStatus(root,initiative);if(workflow.stage!=='blocked'||config.limits.max_correction_rounds<=workflow.round)fail('Escalation requires blocked workflow and an explicitly increased configured round limit');workflow.decisions.push({type:'escalation',reason:options.input.reason,reviewer:options.input.reviewer,reviewed_at:new Date().toISOString(),profiles:Object.fromEntries(workflowRoles(workflow).map(role=>{const name=config.roles[role],profile=config.profiles[name];if(!profile)fail(`Missing role: ${role}`);return [role,{profile:name,adapter:profile.adapter,model:profile.model}];}))});workflow.max_correction_rounds=config.limits.max_correction_rounds;workflow.round++;workflow.stage='correction';workflow.blocked_from=null;workflow.block_reason=null;return save(root,workflow);});
}
export async function cancelWorkflow(root,initiative) {
  const workflow=validateWorkflow(readJSON(workflowFile(root,initiative)));if(workflow.initiative!==initiative)fail('Workflow initiative mismatch');
  for(const ids of Object.values(workflow.tasks))for(const id of ids)if(!statusTask(root,initiative,id).collected_at)await cancelTask(root,initiative,id);
  return withWorkLock(root,()=>{const current=validateWorkflow(readJSON(workflowFile(root,initiative)));current.stage='cancelled';return save(root,current);});
}
