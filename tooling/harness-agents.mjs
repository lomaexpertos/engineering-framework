import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {setup,doctor} from './agent-profiles.mjs';
import {prepareTask,runTask,statusTask,collectTask,cancelTask,validateTask,validateResult} from './agent-execution.mjs';
import {createWorkflow,workflowNext,runWorkflow,workflowStatus,advanceWorkflow,cancelWorkflow,escalateWorkflow} from './agent-workflow.mjs';
export {validateTask,validateResult};
export const agentCommandContracts={
  setup:{arity:0,flags:['config','input']},doctor:{arity:0,flags:['config','roles']},prepare:{arity:0,flags:['input'],required:['input']},
  run:{arity:2,flags:['config','answers','background']},status:{arity:2,flags:[]},collect:{arity:2,flags:[]},cancel:{arity:2,flags:[]},
  'workflow create':{arity:0,flags:['config','input'],required:['input']},'workflow next':{arity:1,flags:[]},'workflow run':{arity:1,flags:['config','answers']},
  'workflow status':{arity:1,flags:[]},'workflow advance':{arity:1,flags:['confirm','decisions','reviewer'],required:['confirm']},
  'workflow escalate':{arity:1,flags:['config','confirm','input'],required:['confirm','input']},'workflow cancel':{arity:1,flags:[]}
};
export const agentValueOptions=['root','config','input','answers','decisions','reviewer','roles'];
const help=`Usage: agents.sh COMMAND [arguments] [options]
  setup [--input profiles.json] [--config file]  Configure personal profiles
  doctor [--config file] [--roles implementation,functional]
                                               Diagnose active roles, or all configured clients
  prepare --input task.json                     Prepare immutable task instructions
  run INITIATIVE TASK [--answers answers.json] [--background] [--config file]
  status|collect|cancel INITIATIVE TASK
  workflow create --input workflow.json [--config file]
  workflow next|status|cancel INITIATIVE
  workflow run INITIATIVE [--answers answers.json] [--config file]
  workflow advance INITIATIVE --confirm [--decisions decisions.json] [--reviewer name]
  workflow escalate INITIATIVE --confirm --input escalation.json [--config file]
Global: --root directory, --json (output is always JSON), --help
Answers: JSON array of nonempty strings; required to resume needs_input.
Workflow input: optional track minimal|standard|reinforced (legacy default reinforced),
assessment {reason,risks}, and needs_definition. Explicit track requires assessment.
Material risks and project/initiative floors can elevate the requested track.
Collect releases active-task bookkeeping; needs_input/failed tasks can be rerun.
Escalation input: {"reason":"decision evidence","reviewer":"coordinator"};
increase the effective configured correction limit before escalating a blocked workflow.
Exit codes: 0 success, 1 execution needs attention or workflow blocked/cancelled,
2 invalid usage/configuration. Help does not read configuration or mutate files.
`;
export async function main(argv=process.argv.slice(2)) {
  const args=[],options={},seen=new Set();let root=process.cwd();
  const valued=new Set(agentValueOptions);
  for(let index=0;index<argv.length;index++) {
    const value=argv[index]==='-h'?'--help':argv[index];
    if(value.startsWith('--')) {
      const key=value.slice(2);
      if(seen.has(key))throw new Error(`Duplicate option: ${value}`);seen.add(key);
      if(valued.has(key)) {if(!argv[index+1]||argv[index+1].startsWith('--'))throw new Error(`Missing --${key}`);const input=argv[++index];if(key==='root')root=input;else if(key==='config')options.configPath=input;else options[key]=input;}
      else if(['background','confirm','json','help'].includes(key))options[key]=true;
      else throw new Error(`Unknown option: ${value}`);
    } else args.push(value);
  }
  const key=args[0]==='workflow'?args.slice(0,2).join(' '):args[0];
  const contract=agentCommandContracts[key];
  if(options.help) {
    if(args.length&&!contract&&!(args.length===1&&args[0]==='workflow'))throw new Error(`Unknown command: ${args.join(' ')}`);
    return {help};
  }
  if(!contract)throw new Error(`Unknown command: ${args.join(' ') || '(missing)'}; use --help`);
  const count=args.length-(args[0]==='workflow'?2:1);
  if(count!==contract.arity)throw new Error(`${key} requires ${contract.arity} positional argument(s); use --help`);
  for(const option of seen)if(!['root','json'].includes(option)&&!contract.flags.includes(option))throw new Error(`Option --${option} is not supported by ${key}`);
  for(const option of contract.required||[])if(!seen.has(option))throw new Error(`${key} requires --${option}`);
  root=fs.realpathSync(root);
  const load=file=>JSON.parse(fs.readFileSync(path.resolve(root,file),'utf8'));
  if(options.answers)options.answers=load(options.answers);
  if(options.decisions)options.decisions=load(options.decisions);
  if(options.roles)options.roles=options.roles.split(',');
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
  if(['failed','timed_out','interrupted','orphaned','needs_input','cancelled'].includes(result?.status)||['blocked','cancelled'].includes(result?.workflow?.stage)||['blocked','cancelled'].includes(result?.stage)||result?.results?.some(r=>r.status!=='completed'))process.exitCode=1;
  return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url))main().then(result=>process.stdout.write(result.help||JSON.stringify(result,null,2)+'\n')).catch(error=>{process.stderr.write(error.message+'\n');process.exitCode=2;});
