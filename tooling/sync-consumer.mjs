import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { applyTransaction, recoverTransaction } from "./distribution-transaction.mjs";
import { buildSkillAdapters } from "./harness-profiles.mjs";
import { validateManifest } from "./harness-manifest.mjs";

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const startMarker = "<!-- engineering-framework:start -->";
const endMarker = "<!-- engineering-framework:end -->";
const metadataFile = ".harness/core/manifest.json";
const platformRoots = [".agents/skills", ".claude/skills"];
const semver = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

function git(root, args, input) {
  const result = spawnSync("git", args, {
    cwd: root, encoding: "utf8", input,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Git: ${result.error?.message || result.stderr.trim()}`);
  }
  return result.stdout;
}

function assertSafePath(root, relative) {
  let current = root;
  for (const segment of relative.split("/")) {
    current = path.join(current, segment);
    const stat = fs.lstatSync(current, { throwIfNoEntry: false });
    if (!stat) break;
    if (stat.isSymbolicLink()) throw new Error(`managed path contains a symbolic link: ${current}`);
    if (current !== path.join(root, relative) && !stat.isDirectory()) {
      throw new Error(`managed path parent is not a directory: ${current}`);
    }
  }
}

function readTree(root, prefix, files = new Map()) {
  const target = path.join(root, prefix);
  const stat = fs.lstatSync(target, { throwIfNoEntry: false });
  if (!stat) return files;
  if (stat.isSymbolicLink() || (!stat.isFile() && !stat.isDirectory())) {
    throw new Error(`unsafe file or symbolic link: ${target}`);
  }
  if (stat.isFile()) {
    // Git conserva el bit ejecutable, no permisos dependientes del umask del checkout.
    files.set(prefix, { content: fs.readFileSync(target), mode: stat.mode & 0o111 ? 0o755 : 0o644 });
  } else {
    for (const name of fs.readdirSync(target).sort()) readTree(root, `${prefix}/${name}`, files);
  }
  return files;
}

function versionOlder(candidate, installed) {
  const left = candidate.split(".").map(BigInt);
  const right = installed.split(".").map(BigInt);
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] < right[index];
  }
  return false;
}

function readInstallation(root) {
  const manifest = path.join(root, metadataFile);
  if (fs.existsSync(manifest)) {
    const metadata = JSON.parse(fs.readFileSync(manifest, "utf8"));
    try { validateManifest(metadata); }
    catch (error) { throw new Error(`metadata inválida o path/hash inseguro: ${error.message}`); }
    return metadata;
  }
  assertSafePath(root, "engineering/corporate/metadata/installation.json");
  const versionPath = path.join(root, "FRAMEWORK_VERSION");
  const metadataPath = path.join(root, "engineering/corporate/metadata/installation.json");
  if (!fs.existsSync(versionPath) && !fs.existsSync(metadataPath)) {
    if (fs.existsSync(path.join(root, "engineering/corporate"))) {
      throw new Error("engineering/corporate existe sin metadata: resolver ownership antes de instalar");
    }
    if (fs.existsSync(path.join(root, ".harness/core"))) throw new Error(".harness/core existe sin manifest: resolver ownership");
    return null;
  }
  if (!fs.existsSync(versionPath) || !fs.existsSync(metadataPath)) {
    throw new Error("instalación incompleta: faltan FRAMEWORK_VERSION o installation.json");
  }
  const installedVersion = fs.readFileSync(versionPath, "utf8").trim();
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  if (metadata.schema_version !== 1 || !semver.test(installedVersion) ||
      metadata.framework_version !== installedVersion) {
    throw new Error("metadata y FRAMEWORK_VERSION inválidos o inconsistentes");
  }
  if (!["engineering-framework", "lomaexpertos/engineering-framework"].includes(metadata.source_repository)) {
    throw new Error("metadata pertenece a otra fuente; resolver ownership antes de actualizar");
  }
  if (metadata.source_commit !== null && !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(metadata.source_commit || "")) {
    throw new Error("metadata contiene source_commit inválido");
  }
  if (!Array.isArray(metadata.managed_skills) ||
      metadata.managed_skills.some((name) => typeof name !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(name))) {
    throw new Error(`${metadataPath} no contiene managed_skills válido`);
  }
  if (new Set(metadata.managed_skills).size !== metadata.managed_skills.length) {
    throw new Error(`${metadataPath} contiene managed_skills duplicados`);
  }
  return metadata;
}

function agentsContent(root) {
  const template = fs.readFileSync(path.join(frameworkRoot, "templates/project/AGENTS.md"), "utf8");
  const start = template.indexOf(startMarker);
  const end = template.indexOf(endMarker);
  if (start < 0 || end < start) throw new Error("plantilla AGENTS.md inválida");
  const block = template.slice(start, end + endMarker.length);
  const target = path.join(root, "AGENTS.md");
  if (!fs.existsSync(target)) return template;
  const current = fs.readFileSync(target, "utf8");
  const starts = current.split(startMarker).length - 1;
  const ends = current.split(endMarker).length - 1;
  if (!starts && !ends) {
    return `${current}${current && !current.endsWith("\n") ? "\n" : ""}${current ? "\n" : ""}${block}\n`;
  }
  if (starts !== 1 || ends !== 1 || current.indexOf(endMarker) < current.indexOf(startMarker)) {
    throw new Error(`${target} contiene marcadores corporativos incompletos, duplicados o fuera de orden`);
  }
  return `${current.slice(0, current.indexOf(startMarker))}${block}${current.slice(current.indexOf(endMarker) + endMarker.length)}`;
}

function claudeContent(root) {
  assertSafePath(root, "CLAUDE.md");
  const target = path.join(root, "CLAUDE.md");
  if (!fs.existsSync(target)) return "@AGENTS.md\n";
  const current = fs.readFileSync(target, "utf8");
  const visible = current.replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, "");
  if (/^@(?:\.\/)?AGENTS\.md\s*$/m.test(visible)) return current;
  return `${current}${current && !current.endsWith("\n") ? "\n" : ""}${current ? "\n" : ""}@AGENTS.md\n`;
}

function prepareConsumer(consumerDirectory, options = {}) {
  const root = fs.realpathSync(path.resolve(consumerDirectory));
  if (root === frameworkRoot || root === path.parse(root).root ||
      frameworkRoot.startsWith(`${root}${path.sep}`) || root.startsWith(`${frameworkRoot}${path.sep}`)) {
    throw new Error("consumer path is not safe; source and destination must be separate");
  }
  if (fs.realpathSync(git(root, ["rev-parse", "--show-toplevel"]).trim()) !== root) {
    throw new Error("consumer path must be the Git repository root");
  }
  const branch = git(root, ["symbolic-ref", "--quiet", "--short", "HEAD"]).trim();
  const version = fs.readFileSync(path.join(frameworkRoot, "VERSION"), "utf8").trim();
  if (!semver.test(version)) throw new Error(`VERSION no contiene SemVer válido: ${version}`);
  const sourceRepository = process.env.GITHUB_REPOSITORY?.trim();
  const sourceCommit = process.env.GITHUB_SHA?.trim();
  if (sourceRepository !== "lomaexpertos/engineering-framework" || !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(sourceCommit || "")) {
    throw new Error("definir GITHUB_REPOSITORY=lomaexpertos/engineering-framework y GITHUB_SHA completo del snapshot fuente");
  }
  for (const relative of ["AGENTS.md", "FRAMEWORK_VERSION", metadataFile, ...platformRoots]) assertSafePath(root, relative);
  assertSafePath(root, ".harness_work/runtime/update.json");
  if (fs.existsSync(path.join(root, ".harness_work/runtime/update.json"))) throw new Error("update interrumpido: ejecutar --recover antes de continuar");
  const previous = readInstallation(root);
  if (previous?.schema_version !== 2) {
    for (const file of [".harness/core", ".harness/README.md", ".harness/update.sh", ".harness/check.sh", ".harness/work.sh"]) {
      assertSafePath(root, file);
      if (fs.existsSync(path.join(root, file))) throw new Error(`destino de ownership desconocido: ${file}`);
    }
  }
  if (previous && versionOlder(version, previous.framework_version)) {
    throw new Error(`Refusing to downgrade from ${previous.framework_version} to ${version}`);
  }
  const skillEntries = fs.readdirSync(path.join(frameworkRoot, "skills"), { withFileTypes: true });
  if (skillEntries.some((entry) => entry.isSymbolicLink())) throw new Error("source Skills contain a symbolic link");
  const selection = buildSkillAdapters(frameworkRoot, root);
  const names = [...selection.skills, ...selection.localSkills].sort();
  const previousNames = previous?.managed_skills || [];
  const desired = new Map();
  const put = (file, content) => desired.set(file, { content: Buffer.from(content), mode: 0o644 });
  for (const directory of ["policies", "skills", "checks", "schemas", "templates"]) {
    for (const [file, value] of readTree(frameworkRoot, directory)) desired.set(`.harness/core/${file}`, value);
  }
  for (const [file, value] of readTree(frameworkRoot, "tooling")) {
    if (/^tooling\/harness-[^/]+\.mjs$/.test(file)) desired.set(`.harness/core/runtime/${file}`, value);
  }
  put(".harness/core/runtime/Dockerfile", "FROM node:22.19.0-alpine3.22@sha256:d2166de198f26e17e5a442f537754dd616ab069c47cc57b889310a717e0abbf9\nRUN apk add --no-cache bash=5.2.37-r0 git=2.49.1-r0\nWORKDIR /runtime\nCOPY . .\nUSER node\n");
  for (const [file, value] of readTree(frameworkRoot, "templates/project/.harness")) {
    desired.set(file.replace("templates/project/", ""), value);
  }
  for (const name of names) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error(`nombre de Skill inseguro: ${name}`);
    for (const platform of platformRoots) {
      const target = `${platform}/${name}`;
      assertSafePath(root, target);
      if (fs.existsSync(path.join(root, target)) && !previousNames.includes(name)) {
        throw new Error(`Skill local colisiona con Skill corporativa: ${target}`);
      }
    }
  }
  for (const [file, value] of selection.files) desired.set(file, value);
  put("AGENTS.md", agentsContent(root));
  if (desired.get("AGENTS.md").content.toString().trimEnd().split("\n").length > 100) {
    throw new Error("AGENTS.md resultante supera 100 líneas; reconciliar instrucciones locales antes de escribir");
  }
  put("CLAUDE.md", claudeContent(root));
  put(".harness/core/README.md", "# Harness core\n\nContenido administrado; no editar como fuente.\n\n- [Policies](policies/README.md)\n- [Skills](skills/README.md)\n- [Checks](checks/README.md)\n");
  const hashes = Object.fromEntries([...desired].filter(([file]) => !["AGENTS.md", "CLAUDE.md"].includes(file)).map(([file, value]) => [file, createHash("sha256").update(value.content).digest("hex")]));
  put(metadataFile, `${JSON.stringify({
    schema_version: 2, framework_version: version, source_repository: sourceRepository,
    source_commit: sourceCommit, managed_skills: names, files: hashes,
    corporate_skills: selection.skills, local_skills: selection.localSkills, profiles: selection.profiles,
  }, null, 2)}\n`);

  for (const file of desired.keys()) {
    assertSafePath(root, file);
    if (fs.lstatSync(path.join(root, file), { throwIfNoEntry: false })?.isDirectory()) {
      throw new Error(`managed file destination is a directory: ${file}`);
    }
  }

  const scope = ["AGENTS.md", ...(desired.has("CLAUDE.md") ? ["CLAUDE.md"] : []), ".harness/core", ".harness/README.md", ".harness/update.sh", ".harness/check.sh", ".harness/work.sh", ...(previous?.schema_version === 1 ? ["FRAMEWORK_VERSION", "engineering/corporate"] : []),
    ...platformRoots.flatMap((platform) => [...new Set([...previousNames, ...names])].map((name) => `${platform}/${name}`))];
  const current = new Map();
  for (const relative of scope) {
    assertSafePath(root, relative);
    readTree(root, relative, current);
  }
  const validatePreviousIntegrity = () => { if (previous?.schema_version === 2) {
    for (const [file, value] of current) {
      if (["AGENTS.md", "CLAUDE.md", metadataFile].includes(file)) continue;
      if (!Object.hasOwn(previous.files, file)) throw new Error(`archivo sin ownership en manifest: ${file}`);
      const hash = createHash("sha256").update(value.content).digest("hex");
      if (hash !== previous.files[file] && !options.repair) throw new Error(`integridad divergente: ${file}; revisar y solicitar --repair explícito`);
    }
    for (const file of Object.keys(previous.files)) {
      if (!current.has(file) && !options.repair) throw new Error(`archivo administrado faltante: ${file}; revisar y solicitar --repair explícito`);
    }
  } };
  const dirty = git(root, ["status", "--porcelain=v1", "--untracked-files=all", "--", ...scope]);
  const ignored = git(root, ["ls-files", "--others", "--ignored", "--exclude-standard", "--", ...scope]);
  if (dirty || ignored) throw new Error(`cambios locales en rutas administradas; conservar o resolver antes de sincronizar:\n${dirty}${ignored}`);
  const hidden = git(root, ["ls-files", "-v", "-z", "--", ...scope]).split("\0")
    .filter((entry) => entry && (entry[0] === "S" || /[a-z]/.test(entry[0])));
  if (hidden.length) throw new Error(`rutas administradas con skip-worktree o assume-unchanged: ${hidden.join(", ")}`);
  // Una regla ignore también puede ocultar destinos que aún no existen.
  const ignoredDestinations = spawnSync("git", ["check-ignore", "--no-index", "-z", "--stdin"], {
    cwd: root, encoding: "utf8", input: `${[...desired.keys()].join("\0")}\0`,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  });
  if (ignoredDestinations.error || ![0, 1].includes(ignoredDestinations.status)) throw new Error(`no se pudo verificar ignore: ${ignoredDestinations.stderr}`);
  if (ignoredDestinations.stdout) throw new Error(`destinos administrados ignorados por Git: ${ignoredDestinations.stdout.split("\0").filter(Boolean).join(", ")}`);
  validatePreviousIntegrity();
  const added = [];
  const updated = [];
  const removed = [...current.keys()].filter((file) => !desired.has(file)).sort();
  for (const [file, value] of desired) {
    if (!current.has(file)) added.push(file);
    else if (!current.get(file).content.equals(value.content) || current.get(file).mode !== value.mode) updated.push(file);
  }
  const changed = added.length + updated.length + removed.length > 0;
  const plan = {
    operation: !previous ? "install" : !changed ? "unchanged" : previous.framework_version === version ? "repair" : "update",
    consumer: root, branch, previous_version: previous?.framework_version || null,
    framework_version: version, source_repository: sourceRepository, source_commit: sourceCommit,
    major_update: Boolean(previous && BigInt(version.split(".")[0]) > BigInt(previous.framework_version.split(".")[0])),
    skills: names, added: added.sort(), updated: updated.sort(), removed,
  };
  return { root, plan, desired, previousNames, current };
}

export function planConsumer(consumerDirectory, options = {}) {
  return prepareConsumer(consumerDirectory, options).plan;
}

export function syncConsumer(consumerDirectory, options = {}) {
  const { root, plan, desired, current } = prepareConsumer(consumerDirectory, options);
  // Todo el preflight termina antes de la primera escritura; Git y la rama no se modifican.
  if (plan.major_update && !options.allowMajor) throw new Error("MAJOR requiere --allow-major y revisión de migración explícita");
  applyTransaction(root, plan, desired, { ...options, assertSafePath, expected: current });
  // Empty directories are not Git artifacts. Avoid an unlocked recursive cleanup
  // that could traverse a path replaced after preflight or outside this operation.
  console.log(`[sync] ${plan.operation}: ${plan.framework_version}, ${plan.skills.length} Skills, rama ${plan.branch}.`);
  return plan;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const recover = args.includes("--recover");
  const target = args.find((arg) => !arg.startsWith("--"));
  if (!target || args.filter((arg) => !arg.startsWith("--")).length !== 1 || (check && recover) || args.some((arg) => arg.startsWith("--") && !["--check", "--recover", "--allow-major", "--repair"].includes(arg))) {
    console.error("usage: node tooling/sync-consumer.mjs [--check|--recover] [--allow-major] <consumer-checkout>");
    process.exit(1);
  }
  try {
    const options = { allowMajor: args.includes("--allow-major"), repair: args.includes("--repair") };
    const plan = recover ? recoverTransaction(fs.realpathSync(target), assertSafePath) : check ? planConsumer(target, options) : syncConsumer(target, options);
    console.log(JSON.stringify(plan, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
