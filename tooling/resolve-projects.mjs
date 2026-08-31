import fs from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";

function scalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseProjects(content, expectedOwner = "") {
  const projects = [];
  const seenRepositories = new Set();
  let schemaVersion;
  let projectsDeclared = false;
  let currentProject;

  const finishCurrentProject = () => {
    if (!currentProject) {
      return;
    }

    const requiredFields = ["repository", "enabled", "auto_merge"];
    for (const field of requiredFields) {
      if (!(field in currentProject)) {
        throw new Error(`projects.yml: falta ${field} en una entrada`);
      }
    }

    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(currentProject.repository)) {
      throw new Error(`projects.yml: repository inválido: ${currentProject.repository}`);
    }

    const [owner] = currentProject.repository.split("/", 1);
    if (expectedOwner && owner !== expectedOwner) {
      throw new Error(
        `projects.yml: ${currentProject.repository} no pertenece a ${expectedOwner}`,
      );
    }

    if (seenRepositories.has(currentProject.repository)) {
      throw new Error(`projects.yml: repository duplicado: ${currentProject.repository}`);
    }

    seenRepositories.add(currentProject.repository);
    projects.push(currentProject);
    currentProject = undefined;
  };

  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const lineNumber = index + 1;
    const line = rawLine.replace(/\s+#.*$/, "");

    if (!line.trim() || line.trimStart().startsWith("#")) {
      continue;
    }

    const schemaMatch = line.match(/^schema_version:\s*(\d+)\s*$/);
    if (schemaMatch) {
      if (schemaVersion !== undefined) {
        throw new Error(`projects.yml:${lineNumber}: schema_version duplicado`);
      }
      schemaVersion = Number(schemaMatch[1]);
      continue;
    }

    if (/^projects:\s*\[\s*\]\s*$/.test(line)) {
      finishCurrentProject();
      projectsDeclared = true;
      continue;
    }

    if (/^projects:\s*$/.test(line)) {
      finishCurrentProject();
      projectsDeclared = true;
      continue;
    }

    const repositoryMatch = line.match(/^\s{2}-\s+repository:\s*(.+?)\s*$/);
    if (repositoryMatch) {
      if (!projectsDeclared) {
        throw new Error(`projects.yml:${lineNumber}: repository aparece antes de projects`);
      }
      finishCurrentProject();
      currentProject = { repository: scalar(repositoryMatch[1]) };
      continue;
    }

    const fieldMatch = line.match(/^\s{4}(enabled|auto_merge):\s*(true|false)\s*$/);
    if (fieldMatch) {
      if (!currentProject) {
        throw new Error(`projects.yml:${lineNumber}: campo fuera de una entrada`);
      }
      const [, field, value] = fieldMatch;
      if (field in currentProject) {
        throw new Error(`projects.yml:${lineNumber}: campo duplicado: ${field}`);
      }
      currentProject[field] = value === "true";
      continue;
    }

    throw new Error(`projects.yml:${lineNumber}: sintaxis o campo no soportado`);
  }

  finishCurrentProject();

  if (schemaVersion !== 1) {
    throw new Error(`projects.yml: schema_version debe ser 1`);
  }
  if (!projectsDeclared) {
    throw new Error("projects.yml: falta projects");
  }

  return projects;
}

function writeMultilineOutput(outputFile, name, values) {
  const delimiter = `engineering_framework_${name}`;
  fs.appendFileSync(
    outputFile,
    `${name}<<${delimiter}\n${values.join("\n")}\n${delimiter}\n`,
  );
}

function run() {
  const expectedOwner = process.env.ENGINEERING_FRAMEWORK_CONSUMER_ORGANIZATION?.trim();
  const githubOutput = process.env.GITHUB_OUTPUT?.trim();
  const projectsOutputPath = process.env.ENGINEERING_FRAMEWORK_PROJECTS_OUTPUT?.trim();

  if (!expectedOwner) {
    throw new Error("falta ENGINEERING_FRAMEWORK_CONSUMER_ORGANIZATION");
  }
  if (!githubOutput) {
    throw new Error("falta GITHUB_OUTPUT");
  }
  if (!projectsOutputPath) {
    throw new Error("falta ENGINEERING_FRAMEWORK_PROJECTS_OUTPUT");
  }

  const projects = parseProjects(fs.readFileSync("projects.yml", "utf8"), expectedOwner);
  const enabledProjects = projects.filter((project) => project.enabled);
  const repositoryNames = enabledProjects.map((project) => project.repository.split("/")[1]);

  fs.writeFileSync(
    projectsOutputPath,
    enabledProjects
      .map((project) => `${project.repository}\t${String(project.auto_merge)}`)
      .join("\n") + (enabledProjects.length > 0 ? "\n" : ""),
  );

  fs.appendFileSync(githubOutput, `count=${enabledProjects.length}\n`);
  writeMultilineOutput(githubOutput, "repositories", repositoryNames);
  console.log(`Resolved ${enabledProjects.length} enabled consumer repositories.`);
  for (const project of enabledProjects) {
    console.log(
      `- ${project.repository}: auto_merge=${String(project.auto_merge)}`,
    );
  }
}

const invokedFile = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedFile) {
  try {
    run();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
