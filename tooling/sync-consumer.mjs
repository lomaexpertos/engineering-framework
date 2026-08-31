import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const startMarker = "<!-- engineering-framework:start -->";
const endMarker = "<!-- engineering-framework:end -->";

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function removeManagedPath(target, consumerRoot) {
  const resolvedTarget = path.resolve(target);
  const resolvedConsumer = path.resolve(consumerRoot);
  if (!resolvedTarget.startsWith(`${resolvedConsumer}${path.sep}`)) {
    throw new Error(`refusing to remove path outside consumer: ${resolvedTarget}`);
  }
  fs.rmSync(resolvedTarget, { recursive: true, force: true });
}

function readPreviousManagedSkills(consumerRoot) {
  const metadataPath = path.join(
    consumerRoot,
    "engineering/corporate/metadata/installation.json",
  );
  if (!fs.existsSync(metadataPath)) {
    return [];
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  if (!Array.isArray(metadata.managed_skills)) {
    throw new Error(`${metadataPath} no contiene managed_skills válido`);
  }

  for (const skill of metadata.managed_skills) {
    if (typeof skill !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(skill)) {
      throw new Error(`${metadataPath} contiene un nombre de Skill inseguro`);
    }
  }

  return metadata.managed_skills;
}

function corporateAgentBlock() {
  const template = fs.readFileSync(path.join(frameworkRoot, "templates/project/AGENTS.md"), "utf8");
  const start = template.indexOf(startMarker);
  const end = template.indexOf(endMarker);

  if (start === -1 || end === -1 || end < start) {
    throw new Error("templates/project/AGENTS.md no contiene una región corporativa válida");
  }

  return template.slice(start, end + endMarker.length);
}

function updateAgentsFile(consumerRoot) {
  const agentsPath = path.join(consumerRoot, "AGENTS.md");
  const templatePath = path.join(frameworkRoot, "templates/project/AGENTS.md");
  const block = corporateAgentBlock();

  if (!fs.existsSync(agentsPath)) {
    fs.copyFileSync(templatePath, agentsPath);
    return;
  }

  const current = fs.readFileSync(agentsPath, "utf8");
  const startCount = current.split(startMarker).length - 1;
  const endCount = current.split(endMarker).length - 1;

  if (startCount === 0 && endCount === 0) {
    const prefix = current.trimEnd();
    fs.writeFileSync(agentsPath, `${prefix}${prefix ? "\n\n" : ""}${block}\n`);
    return;
  }

  if (startCount !== 1 || endCount !== 1) {
    throw new Error(`${agentsPath} contiene marcadores corporativos incompletos o duplicados`);
  }

  const start = current.indexOf(startMarker);
  const end = current.indexOf(endMarker);
  if (end < start) {
    throw new Error(`${agentsPath} contiene marcadores corporativos fuera de orden`);
  }

  const updated = `${current.slice(0, start)}${block}${current.slice(end + endMarker.length)}`;
  fs.writeFileSync(agentsPath, updated.endsWith("\n") ? updated : `${updated}\n`);
}

export function syncConsumer(consumerDirectory) {
  const consumerRoot = path.resolve(consumerDirectory);
  if (consumerRoot === frameworkRoot || consumerRoot === path.parse(consumerRoot).root) {
    throw new Error("consumer path is not safe");
  }
  if (!fs.existsSync(path.join(consumerRoot, ".git"))) {
    throw new Error(`${consumerRoot} no es un checkout Git`);
  }

  const version = fs.readFileSync(path.join(frameworkRoot, "VERSION"), "utf8").trim();
  const skillNames = fs
    .readdirSync(path.join(frameworkRoot, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const skillName of skillNames) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(skillName)) {
      throw new Error(`nombre de Skill no distribuible: ${skillName}`);
    }
  }
  const previousManagedSkills = readPreviousManagedSkills(consumerRoot);
  const previouslyManaged = new Set(previousManagedSkills);
  const platformSkillRoots = [
    path.join(consumerRoot, ".agents/skills"),
    path.join(consumerRoot, ".claude/skills"),
  ];

  for (const skillRoot of platformSkillRoots) {
    for (const skillName of skillNames) {
      const target = path.join(skillRoot, skillName);
      if (fs.existsSync(target) && !previouslyManaged.has(skillName)) {
        throw new Error(`Skill local colisiona con Skill corporativa: ${target}`);
      }
    }
  }

  const corporateRoot = path.join(consumerRoot, "engineering/corporate");
  removeManagedPath(corporateRoot, consumerRoot);
  ensureDirectory(path.join(corporateRoot, "metadata"));
  fs.cpSync(path.join(frameworkRoot, "policies"), path.join(corporateRoot, "policies"), {
    recursive: true,
  });

  const corporateReadmeTemplate = fs.readFileSync(
    path.join(frameworkRoot, "templates/project/engineering/corporate/README.md"),
    "utf8",
  );
  fs.writeFileSync(
    path.join(corporateRoot, "README.md"),
    corporateReadmeTemplate.replaceAll("{{FRAMEWORK_VERSION}}", version),
  );
  fs.writeFileSync(
    path.join(corporateRoot, "metadata/installation.json"),
    `${JSON.stringify(
      {
        schema_version: 1,
        framework_version: version,
        source_repository: process.env.GITHUB_REPOSITORY || "engineering-framework",
        managed_skills: skillNames,
      },
      null,
      2,
    )}\n`,
  );

  for (const skillRoot of platformSkillRoots) {
    ensureDirectory(skillRoot);
    for (const skillName of previousManagedSkills) {
      removeManagedPath(path.join(skillRoot, skillName), consumerRoot);
    }
    for (const skillName of skillNames) {
      fs.cpSync(
        path.join(frameworkRoot, "skills", skillName),
        path.join(skillRoot, skillName),
        { recursive: true },
      );
    }
  }

  fs.writeFileSync(path.join(consumerRoot, "FRAMEWORK_VERSION"), `${version}\n`);
  updateAgentsFile(consumerRoot);

  console.log(`Synchronized Engineering Framework ${version} into ${consumerRoot}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const consumerDirectory = process.argv[2];
  if (!consumerDirectory) {
    console.error("usage: node tooling/sync-consumer.mjs <consumer-checkout>");
    process.exit(1);
  }

  try {
    syncConsumer(consumerDirectory);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
