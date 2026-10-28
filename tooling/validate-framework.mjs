import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseProjects } from "./resolve-projects.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(repositoryRoot);

const failures = [];

function repositoryFiles() {
  const collected = [];
  const ignoredDirectories = new Set([".git", "node_modules"]);

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
        continue;
      }

      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
      } else if (entry.isFile()) {
        collected.push(path.relative(repositoryRoot, absolutePath));
      }
    }
  }

  walk(repositoryRoot);
  return collected.sort();
}

function addFailure(group, message) {
  failures.push(`${group}: ${message}`);
}

function runCheck(group, validation) {
  const initialFailureCount = failures.length;

  try {
    validation();
  } catch (error) {
    addFailure(group, error instanceof Error ? error.message : String(error));
  }

  if (failures.length === initialFailureCount) {
    console.log(`✓ ${group}`);
  } else {
    console.error(`✗ ${group}`);
  }
}

function markdownTargets(file) {
  const content = fs.readFileSync(file, "utf8");
  const targets = [];
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

  for (const match of content.matchAll(linkPattern)) {
    let target = match[1].trim();

    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }

    if (/^(?:https?:\/\/|mailto:|#)/.test(target)) {
      continue;
    }

    target = target.split("#", 1)[0].split("?", 1)[0];
    if (!target) {
      continue;
    }

    try {
      target = decodeURIComponent(target);
    } catch {
      addFailure("Markdown links", `${file} contiene una ruta inválida: ${target}`);
      continue;
    }

    targets.push(path.resolve(path.dirname(file), target));
  }

  return targets;
}

function markdownReachableFrom(entrypoint, scopeDirectory) {
  const visited = new Set();
  const pending = [path.resolve(entrypoint)];
  const scope = path.resolve(scopeDirectory);

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || visited.has(current) || !fs.existsSync(current)) {
      continue;
    }

    const candidate = fs.statSync(current).isDirectory()
      ? path.join(current, "README.md")
      : current;

    if (!candidate.endsWith(".md") || !fs.existsSync(candidate) || visited.has(candidate)) {
      continue;
    }

    visited.add(candidate);
    for (const target of markdownTargets(candidate)) {
      if (target === scope || target.startsWith(`${scope}${path.sep}`)) {
        pending.push(target);
      }
    }
  }

  return visited;
}

const files = repositoryFiles();

runCheck("Required structure", () => {
  const requiredPaths = [
    "AGENTS.md",
    "README.md",
    "INSTALL.md",
    "VERSION",
    "docs/architecture/distribution.md",
    "docs/governance/decisions/0011-assisted-installation.md",
    "policies/ai-assisted-development/project-artifact-layout.md",
    "policies/README.md",
    "projects.yml",
    "skills/README.md",
    "tooling/validate-framework.mjs",
    "tooling/publish-projects.sh",
    "tooling/resolve-projects.mjs",
    "tooling/sync-consumer.mjs",
    "tooling/test-distribution.mjs",
    "tooling/test-publication.mjs",
    "tooling/harness-check.mjs",
    "tooling/harness-work.mjs",
  ];

  for (const requiredPath of requiredPaths) {
    if (!fs.existsSync(requiredPath)) {
      addFailure("Required structure", `falta ${requiredPath}`);
    }
  }

  for (const entry of fs.readdirSync("policies", { withFileTypes: true })) {
    if (entry.isDirectory() && !fs.existsSync(path.join("policies", entry.name, "README.md"))) {
      addFailure("Required structure", `policies/${entry.name}/ no tiene README.md`);
    }
  }
});

runCheck("Installation routing", () => {
  const entrypoint = path.resolve("INSTALL.md");
  for (const router of ["README.md", "AGENTS.md"]) {
    if (!markdownReachableFrom(router, repositoryRoot).has(entrypoint)) {
      addFailure("Installation routing", `${entrypoint} no es alcanzable desde ${router}`);
    }
  }
});

runCheck("Workflow suspension", () => {
  for (const file of files) {
    if (/^\.github\/workflows\/[^/]+\.ya?ml$/i.test(file)) {
      addFailure("Workflow suspension", `${file}: los workflows están retirados por decisión del mantenedor`);
    }
  }
});

runCheck("Semantic version", () => {
  const version = fs.readFileSync("VERSION", "utf8").trim();
  if (!/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version)) {
    addFailure("Semantic version", `VERSION no contiene SemVer X.Y.Z: ${version}`);
  }
});

runCheck("Project registry", () => {
  parseProjects(fs.readFileSync("projects.yml", "utf8"));
});

runCheck("Skill contracts", () => {
  const skillDirectories = fs
    .readdirSync("skills", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (skillDirectories.length === 0) {
    addFailure("Skill contracts", "no hay Skills publicadas");
  }

  const declaredNames = new Set();
  const normalizedDescriptions = new Map();
  const discoveryEntries = [];

  for (const skillName of skillDirectories) {
    const skillFile = path.join("skills", skillName, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      addFailure("Skill contracts", `${skillName} no contiene SKILL.md`);
      continue;
    }

    const content = fs.readFileSync(skillFile, "utf8");
    const frontMatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!frontMatter) {
      addFailure("Skill contracts", `${skillFile} no contiene front matter válido`);
      continue;
    }

    const declaredName = frontMatter[1].match(/^name:\s*["']?([^\n"']+)/m)?.[1]?.trim();
    const description = frontMatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();

    if (declaredName !== skillName) {
      addFailure(
        "Skill contracts",
        `${skillFile} declara name=${declaredName ?? "<missing>"}; se esperaba ${skillName}`,
      );
    }
    if (!description || description === '""' || description === "''") {
      addFailure("Skill contracts", `${skillFile} no tiene description`);
    }

    if (declaredName) {
      if (declaredNames.has(declaredName)) {
        addFailure("Skill contracts", `nombre declarado duplicado: ${declaredName}`);
      }
      declaredNames.add(declaredName);
    }

    if (description) {
      const normalizedDescription = description
        .replace(/^["']|["']$/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const previousSkill = normalizedDescriptions.get(normalizedDescription);
      if (previousSkill) {
        addFailure(
          "Skill contracts",
          `${skillName} y ${previousSkill} tienen descriptions equivalentes`,
        );
      }
      normalizedDescriptions.set(normalizedDescription, skillName);
      discoveryEntries.push(`${skillName}: ${normalizedDescription} (${skillFile})`);
    }

    const openAiMetadata = path.join("skills", skillName, "agents/openai.yaml");
    if (fs.existsSync(openAiMetadata)) {
      const metadata = fs.readFileSync(openAiMetadata, "utf8");
      if (!/^interface:\s*$/m.test(metadata)) {
        addFailure("Skill contracts", `${openAiMetadata} no contiene interface`);
      }
      const invocationPolicy = metadata.match(/^\s*allow_implicit_invocation:\s*(\S+)/m)?.[1];
      if (invocationPolicy && !["true", "false"].includes(invocationPolicy)) {
        addFailure(
          "Skill contracts",
          `${openAiMetadata} contiene allow_implicit_invocation inválido`,
        );
      }
    }

    const skillRoot = path.resolve("skills", skillName);
    const reachable = markdownReachableFrom(skillFile, skillRoot);
    const markdownFiles = files
      .filter((file) => file.startsWith(`skills/${skillName}/`) && file.endsWith(".md"))
      .map((file) => path.resolve(file));

    for (const markdownFile of markdownFiles) {
      if (!reachable.has(markdownFile)) {
        addFailure("Skill contracts", `${markdownFile} no es alcanzable desde ${skillFile}`);
      }
    }
  }

  const catalog = fs.readFileSync("skills/README.md", "utf8");
  const catalogSkills = [...catalog.matchAll(/\]\(([^/)]+)\/SKILL\.md\)/g)]
    .map((match) => match[1])
    .sort();

  const missingFromCatalog = skillDirectories.filter((skill) => !catalogSkills.includes(skill));
  const unknownInCatalog = catalogSkills.filter((skill) => !skillDirectories.includes(skill));

  for (const skill of missingFromCatalog) {
    addFailure("Skill contracts", `${skill} no aparece en skills/README.md`);
  }
  for (const skill of unknownInCatalog) {
    addFailure("Skill contracts", `skills/README.md referencia una Skill inexistente: ${skill}`);
  }

  const discoveryBudget = discoveryEntries.join("\n").length;
  if (discoveryBudget > 8000) {
    addFailure(
      "Skill contracts",
      `catálogo de discovery usa ${discoveryBudget} caracteres; máximo 8000`,
    );
  }
});

runCheck("Canonical contracts", () => {
  const liveRoutingFiles = files.filter(
    (file) =>
      (file.startsWith("skills/") || file.startsWith("templates/project/")) &&
      file.endsWith(".md"),
  );
  const retiredTerms = [
    "engineering/architecture/",
    "engineering/project/",
    "spec-analizar",
    "spec-clarificar",
    "discover-business-process",
  ];

  for (const file of liveRoutingFiles) {
    const content = fs.readFileSync(file, "utf8");
    for (const term of retiredTerms) {
      if (content.includes(term)) {
        addFailure("Canonical contracts", `${file} conserva referencia retirada: ${term}`);
      }
    }
  }

  const schemaConventions = fs.readFileSync(
    "policies/database/schema-conventions.md",
    "utf8",
  );
  if (!schemaConventions.includes("UUIDv4") || schemaConventions.includes("Nano ID")) {
    addFailure("Canonical contracts", "schema-conventions no usa UUIDv4 como fallback único");
  }

  const sqlLayout = fs.readFileSync("policies/database/sql-artifact-layout.md", "utf8");
  if (!sqlLayout.includes("migrations/<YYYYMMDD_nombre_descriptivo>.sql")) {
    addFailure("Canonical contracts", "sql-artifact-layout no declara el archivo SQL único");
  }
  if (sqlLayout.includes("migrations/<YYYYMMDD_nombre_descriptivo>/")) {
    addFailure("Canonical contracts", "sql-artifact-layout conserva el paquete SQL anterior");
  }

  const documentationSkill = fs.readFileSync("skills/spec-documentar/SKILL.md", "utf8");
  if (!documentationSkill.includes("docs/domains/<dominio>/README.md")) {
    addFailure("Canonical contracts", "spec-documentar no declara documentación canónica por dominio");
  }
});

runCheck("Policy routing", () => {
  const reachable = markdownReachableFrom("policies/README.md", "policies");
  const policyFiles = files
    .filter((file) => file.startsWith("policies/") && file.endsWith(".md"))
    .map((file) => path.resolve(file));

  for (const policyFile of policyFiles) {
    if (!reachable.has(policyFile)) {
      addFailure("Policy routing", `${policyFile} no es alcanzable desde policies/README.md`);
    }
  }
});

runCheck("Markdown links", () => {
  for (const file of files.filter((candidate) => candidate.endsWith(".md"))) {
    for (const target of markdownTargets(file)) {
      const generatedCore = path.resolve("templates/project/.harness/core");
      const templateSource = file.startsWith("templates/project/.harness/") && target.startsWith(`${generatedCore}${path.sep}`)
        ? path.resolve(repositoryRoot, path.relative(generatedCore, target)) : target;
      if (!fs.existsSync(templateSource)) {
        addFailure("Markdown links", `${file} referencia una ruta inexistente: ${target}`);
      }
    }
  }
});

runCheck("Agent entrypoint budget", () => {
  for (const file of files.filter(candidate => path.basename(candidate) === "AGENTS.md")) {
    const count = fs.readFileSync(file, "utf8").replace(/\n$/, "").split("\n").length;
    if (count > 100) addFailure("Agent entrypoint budget", `${file}: ${count} líneas; máximo 100`);
  }
});

runCheck("Source ownership", () => {
  const forbiddenPrefixes = [".agents/", ".claude/", ".harness/", "engineering/corporate/"];
  for (const file of files) {
    if (forbiddenPrefixes.some((prefix) => file.startsWith(prefix))) {
      addFailure("Source ownership", `${file} es una copia consumidora dentro de la fuente`);
    }
  }
});

runCheck("Distributable file safety", () => {
  const roots = ["policies", "skills", "templates/project"];
  const pending = roots.map((root) => path.resolve(root));

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const candidate = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        addFailure(
          "Distributable file safety",
          `${path.relative(repositoryRoot, candidate)} es un symbolic link`,
        );
      } else if (entry.isDirectory()) {
        pending.push(candidate);
      } else if (!entry.isFile()) {
        addFailure(
          "Distributable file safety",
          `${path.relative(repositoryRoot, candidate)} no es un archivo regular`,
        );
      }
    }
  }
});

runCheck("Text hygiene", () => {
  const textExtensions = new Set([".js", ".json", ".md", ".mjs", ".sh", ".yaml", ".yml"]);
  const textFiles = files.filter(
    (file) => textExtensions.has(path.extname(file)) || path.basename(file) === "VERSION",
  );

  for (const file of textFiles) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      if (/[ \t]+$/.test(line)) {
        addFailure("Text hygiene", `${file}:${index + 1} tiene whitespace al final`);
      }
    });

    if (content.length > 0 && !content.endsWith("\n")) {
      addFailure("Text hygiene", `${file} no termina con newline`);
    }
  }
});

runCheck("Version change", () => {
  const changedFilesPath = process.env.VALIDATION_CHANGED_FILES_PATH?.trim();
  if (!changedFilesPath || !fs.existsSync(changedFilesPath)) {
    console.log("  Version change omitido: ejecución manual o primer push.");
    return;
  }

  const changedFiles = fs
    .readFileSync(changedFilesPath, "utf8")
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);

  if (changedFiles.length === 0) {
    console.log("  Version change omitido: ejecución manual o primer push.");
    return;
  }

  const changesDistributedContent = changedFiles.some(
    (file) =>
      file.startsWith("policies/") ||
      /^skills\/[^/]+\//.test(file) ||
      file.startsWith("checks/") ||
      file.startsWith("schemas/") ||
      file.startsWith("templates/") ||
      /^tooling\/harness-[^/]+\.mjs$/.test(file) ||
      file === "templates/project/AGENTS.md" ||
      file.startsWith("templates/project/engineering/corporate/"),
  );

  if (changesDistributedContent && !changedFiles.includes("VERSION")) {
    addFailure("Version change", "cambió contenido distribuible sin actualizar VERSION");
  }
});

if (failures.length > 0) {
  console.error("\nFramework validation failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("\nFramework validation passed.");
