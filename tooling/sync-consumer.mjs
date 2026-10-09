import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const startMarker = "<!-- engineering-framework:start -->";
const endMarker = "<!-- engineering-framework:end -->";
const metadataFile = "engineering/corporate/metadata/installation.json";
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
  const versionPath = path.join(root, "FRAMEWORK_VERSION");
  const metadataPath = path.join(root, metadataFile);
  if (!fs.existsSync(versionPath) && !fs.existsSync(metadataPath)) {
    if (fs.existsSync(path.join(root, "engineering/corporate"))) {
      throw new Error("engineering/corporate existe sin metadata: resolver ownership antes de instalar");
    }
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

function prepareConsumer(consumerDirectory) {
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
  const previous = readInstallation(root);
  if (previous && versionOlder(version, previous.framework_version)) {
    throw new Error(`Refusing to downgrade from ${previous.framework_version} to ${version}`);
  }
  const skillEntries = fs.readdirSync(path.join(frameworkRoot, "skills"), { withFileTypes: true });
  if (skillEntries.some((entry) => entry.isSymbolicLink())) throw new Error("source Skills contain a symbolic link");
  const names = skillEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const previousNames = previous?.managed_skills || [];
  const desired = new Map();
  const put = (file, content) => desired.set(file, { content: Buffer.from(content), mode: 0o644 });
  for (const [file, value] of readTree(frameworkRoot, "policies")) desired.set(`engineering/corporate/${file}`, value);
  for (const name of names) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error(`nombre de Skill inseguro: ${name}`);
    if (!fs.existsSync(path.join(frameworkRoot, "skills", name, "SKILL.md"))) throw new Error(`Skill ${name} no contiene SKILL.md`);
    const source = readTree(frameworkRoot, `skills/${name}`);
    for (const platform of platformRoots) {
      const target = `${platform}/${name}`;
      assertSafePath(root, target);
      if (fs.existsSync(path.join(root, target)) && !previousNames.includes(name)) {
        throw new Error(`Skill local colisiona con Skill corporativa: ${target}`);
      }
      for (const [file, value] of source) desired.set(`${platform}/${file.slice(7)}`, value);
    }
  }
  put("AGENTS.md", agentsContent(root));
  put("FRAMEWORK_VERSION", `${version}\n`);
  put("engineering/corporate/README.md", fs.readFileSync(
    path.join(frameworkRoot, "templates/project/engineering/corporate/README.md"), "utf8",
  ).replaceAll("{{FRAMEWORK_VERSION}}", version));
  put(metadataFile, `${JSON.stringify({
    schema_version: 1, framework_version: version, source_repository: sourceRepository,
    source_commit: sourceCommit, managed_skills: names,
  }, null, 2)}\n`);

  for (const file of desired.keys()) {
    assertSafePath(root, file);
    if (fs.lstatSync(path.join(root, file), { throwIfNoEntry: false })?.isDirectory()) {
      throw new Error(`managed file destination is a directory: ${file}`);
    }
  }

  const scope = ["AGENTS.md", "FRAMEWORK_VERSION", "engineering/corporate",
    ...platformRoots.flatMap((platform) => [...new Set([...previousNames, ...names])].map((name) => `${platform}/${name}`))];
  const current = new Map();
  for (const relative of scope) {
    assertSafePath(root, relative);
    readTree(root, relative, current);
  }
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
  return { root, plan, desired, previousNames };
}

export function planConsumer(consumerDirectory) {
  return prepareConsumer(consumerDirectory).plan;
}

export function syncConsumer(consumerDirectory) {
  const { root, plan, desired, previousNames } = prepareConsumer(consumerDirectory);
  // Todo el preflight termina antes de la primera escritura; Git y la rama no se modifican.
  for (const file of plan.removed) fs.unlinkSync(path.join(root, file));
  for (const file of [...plan.added, ...plan.updated]) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, desired.get(file).content);
    fs.chmodSync(target, desired.get(file).mode);
  }
  function pruneEmpty(relative) {
    const target = path.join(root, relative);
    if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) return;
    for (const name of fs.readdirSync(target)) pruneEmpty(`${relative}/${name}`);
    if (!fs.readdirSync(target).length) fs.rmdirSync(target);
  }
  pruneEmpty("engineering/corporate");
  for (const platform of platformRoots) {
    for (const name of previousNames) pruneEmpty(`${platform}/${name}`);
  }
  console.log(`[sync] ${plan.operation}: ${plan.framework_version}, ${plan.skills.length} Skills, rama ${plan.branch}.`);
  return plan;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const check = args[0] === "--check";
  const target = args[check ? 1 : 0];
  if (!target || args.length !== (check ? 2 : 1) || (!check && target.startsWith("--"))) {
    console.error("usage: node tooling/sync-consumer.mjs [--check] <consumer-checkout>");
    process.exit(1);
  }
  try {
    const plan = check ? planConsumer(target) : syncConsumer(target);
    console.log(JSON.stringify(plan, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
