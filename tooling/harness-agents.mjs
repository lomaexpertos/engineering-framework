import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {setup,doctor} from './agent-profiles.mjs';
import {prepareTask,runTask,statusTask,collectTask,cancelTask,validateTask,validateResult} from './agent-execution.mjs';
import {createWorkflow,workflowNext,runWorkflow,workflowStatus,advanceWorkflow,cancelWorkflow,escalateWorkflow} from './agent-workflow.mjs';
export {validateTask,validateResult};
export async function main(argv=process.argv.slice(2)) {
  const args=[],options={};let root=process.cwd();
  const valued=new Set(['root','config','input','answers','decisions','reviewer']);
  for(let index=0;index<argv.length;index++) {
    const value=argv[index];
    if(value.startsWith('--')) {
      const key=value.slice(2);
      if(valued.has(key)) {if(!argv[index+1]||argv[index+1].startsWith('--'))throw new Error(`Missing --${key}`);const input=argv[++index];if(key==='root')root=input;else if(key==='config')options.configPath=input;else options[key]=input;}
      else if(['background','confirm','json'].includes(key))options[key]=true;
      else throw new Error(`Unknown option: ${value}`);
    } else args.push(value);
  }
  root=fs.realpathSync(root);
  const load=file=>JSON.parse(fs.readFileSync(path.resolve(root,file),'utf8'));
  if(options.answers)options.answers=load(options.answers);
  if(options.decisions)options.decisions=load(options.decisions);
  const [command,...remaining]=args;let result;
  if(command==='setup')result=await setup(root,{...options,...(options.input?{configuration:load(options.input)}:{})});
  else if(command==='doctor') {result=doctor(root,options);if(!result.ok)process.exitCode=2;}
  else if(command==='prepare') {if(!options.input)throw new Error('prepare requires --input task.json');result=prepareTask(root,load(options.input));}
  else if(command==='run')result=await runTask(root,...remaining,options);
  else if(command==='status')result=statusTask(root,...remaining);
  else if(command==='collect')result=collectTask(root,...remaining);
  else if(command==='cancel')result=await cancelTask(root,...remaining);
  else if(command==='workflow') {
    const [operation,initiative]=remaining;
    if(operation==='create') {if(!options.input)throw new Error('workflow create requires --input');result=createWorkflow(root,load(options.input),options);}
    else if(operation==='next')result=workflowNext(root,initiative);
    else if(operation==='run')result=await runWorkflow(root,initiative,options);
    else if(operation==='status')result=workflowStatus(root,initiative);
    else if(operation==='advance')result=advanceWorkflow(root,initiative,options);
    else if(operation==='escalate') {if(!options.input)throw new Error('escalate requires --input');result=escalateWorkflow(root,initiative,{...options,input:load(options.input)});}
    else if(operation==='cancel')result=await cancelWorkflow(root,initiative);
    else throw new Error('Unknown workflow operation');
  } else throw new Error('Usage: agents.sh setup|doctor|prepare|run|status|collect|cancel|workflow [operation] [initiative] [task] [--input file] [--config file] [--root directory] [--background] [--confirm]');
  if(['failed','timed_out','interrupted','orphaned','needs_input'].includes(result?.status)||result?.results?.some(r=>r.status!=='completed'))process.exitCode=1;
  return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url))main().then(result=>process.stdout.write(JSON.stringify(result,null,2)+'\n')).catch(error=>{process.stderr.write(error.message+'\n');process.exitCode=2;});
