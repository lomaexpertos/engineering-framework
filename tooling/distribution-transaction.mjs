import fs from "node:fs";
import path from "node:path";

const runtime = ".harness_work/runtime";
const journalPath = `${runtime}/update.json`;
const lockPath = `${runtime}/update.lock`;
function snapshot(file) {
  const stat = fs.lstatSync(file, { throwIfNoEntry: false });
  if (!stat) return null;
  if (!stat.isFile()) throw new Error(`transaction destination is not a regular file: ${file}`);
  return { content: fs.readFileSync(file).toString("base64"), mode: stat.mode & 0o111 ? 0o755 : 0o644 };
}
function equal(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function allowed(file) {
  return typeof file === "string" && !file.split("/").some((part) => !part || part === "." || part === "..") &&
    (["AGENTS.md", "CLAUDE.md", "FRAMEWORK_VERSION", ".harness/README.md", ".harness/update.sh", ".harness/check.sh", ".harness/work.sh", ".harness/environment.sh"].includes(file) ||
      file.startsWith(".harness/core/") || file.startsWith("engineering/corporate/") || /^\.(agents|claude)\/skills\/[a-z0-9-]+\//.test(file));
}
function put(root, file, value) {
  const target = path.join(root, file);
  if (value === null) { fs.rmSync(target, { force: true }); return; }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.harness-update-tmp`;
  const descriptor = fs.openSync(temporary, "wx", value.mode);
  try {
    fs.writeFileSync(descriptor, Buffer.from(value.content, "base64"));
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
  fs.renameSync(temporary, target);
  const parent = fs.openSync(path.dirname(target), "r");
  try { fs.fsyncSync(parent); } finally { fs.closeSync(parent); }
}
function assertNoWorkers(root, assertSafePath) {
  const relative = ".harness_work/initiatives";
  assertSafePath(root, relative);
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error("symbolic link en iniciativas");
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    const stateFile = `${relative}/${name}/state.json`;
    assertSafePath(root, stateFile);
    const target = path.join(root, stateFile);
    if (!fs.existsSync(target)) continue;
    const state = JSON.parse(fs.readFileSync(target, "utf8"));
    if (!Array.isArray(state.active_tasks) || state.active_tasks.length) throw new Error(`trabajadores activos o estado desconocido: ${name}`);
  }
}
export function applyTransaction(root, plan, desired, { assertSafePath, failAfter, expected } = {}) {
  const changed = [...plan.removed, ...plan.added, ...plan.updated];
  if (!changed.length) return;
  assertSafePath(root, runtime);
  assertSafePath(root, journalPath);
  assertSafePath(root, lockPath);
  assertSafePath(root, `${runtime}/work.lock`);
  if (fs.existsSync(path.join(root, `${runtime}/work.lock`))) throw new Error("lifecycle work lock activo; no actualizar durante una mutación");
  if (fs.existsSync(path.join(root, journalPath))) throw new Error("update interrumpido: ejecutar --recover antes de continuar");
  fs.mkdirSync(path.join(root, runtime), { recursive: true });
  try { fs.mkdirSync(path.join(root, lockPath)); } catch { throw new Error("update lock activo; comprobar su propietario antes de recuperar"); }
  try {
    if (fs.existsSync(path.join(root, `${runtime}/work.lock`))) throw new Error("lifecycle work lock activo; no actualizar durante una mutación");
    assertNoWorkers(root, assertSafePath);
    const entries = changed.map((file) => {
      assertSafePath(root, file);
      assertSafePath(root, `${file}.harness-update-tmp`);
      if (fs.existsSync(path.join(root, `${file}.harness-update-tmp`))) throw new Error(`staging preexistente: ${file}`);
      const value = desired.get(file);
      const before = snapshot(path.join(root, file));
      const observed = expected.get(file);
      const planned = observed ? { content: observed.content.toString("base64"), mode: observed.mode } : null;
      if (!equal(before, planned)) throw new Error(`edición concurrente desde preflight: ${file}`);
      return { file, before, after: value ? { content: value.content.toString("base64"), mode: value.mode } : null };
    });
    const journal = { schema_version: 1, operation: "update", entries };
    assertSafePath(root, `${journalPath}.harness-update-tmp`);
    put(root, journalPath, { content: Buffer.from(`${JSON.stringify(journal)}\n`).toString("base64"), mode: 0o600 });
    let count = 0;
    for (const entry of entries) {
      assertSafePath(root, entry.file);
      if (!equal(snapshot(path.join(root, entry.file)), entry.before)) throw new Error(`edición concurrente: ${entry.file}`);
      put(root, entry.file, entry.after);
      if (++count === failAfter) throw new Error("simulated interrupted update");
    }
    for (const entry of entries) {
      if (!equal(snapshot(path.join(root, entry.file)), entry.after)) throw new Error(`verificación final falló: ${entry.file}`);
    }
    fs.unlinkSync(path.join(root, journalPath));
  } finally { fs.rmdirSync(path.join(root, lockPath)); }
}
export function recoverTransaction(root, assertSafePath) {
  assertSafePath(root, journalPath);
  assertSafePath(root, lockPath);
  assertSafePath(root, `${runtime}/work.lock`);
  if (fs.existsSync(path.join(root, `${runtime}/work.lock`))) throw new Error("lifecycle work lock activo");
  if (fs.existsSync(path.join(root, lockPath))) throw new Error("update lock activo; no se rompe automáticamente un lock de propietario desconocido");
  if (!fs.existsSync(path.join(root, journalPath))) {
    assertNoWorkers(root, assertSafePath);
    const prepared = `${journalPath}.harness-update-tmp`;
    assertSafePath(root, prepared);
    if (!fs.existsSync(path.join(root, prepared)) || !fs.lstatSync(path.join(root, prepared)).isFile()) throw new Error("no existe journal recuperable");
    fs.unlinkSync(path.join(root, prepared));
    return { operation: "recovered-preparation", restored: 0 };
  }
  const journal = JSON.parse(fs.readFileSync(path.join(root, journalPath), "utf8"));
  if (journal.schema_version !== 1 || journal.operation !== "update" || !Array.isArray(journal.entries)) throw new Error("journal inválido");
  if (new Set(journal.entries.map((entry) => entry.file)).size !== journal.entries.length) throw new Error("journal con destinos duplicados");
  for (const entry of journal.entries) {
    if (!allowed(entry.file)) throw new Error("journal contiene destino inseguro");
    assertSafePath(root, entry.file);
    for (const value of [entry.before, entry.after]) {
      if (value !== null && (!value || typeof value.content !== "string" || ![0o644, 0o755].includes(value.mode))) throw new Error("snapshot inválido");
    }
    const current = snapshot(path.join(root, entry.file));
    if (!equal(current, entry.before) && !equal(current, entry.after)) throw new Error(`recuperación bloqueada por edición posterior: ${entry.file}`);
  }
  fs.mkdirSync(path.join(root, lockPath));
  try {
    if (fs.existsSync(path.join(root, `${runtime}/work.lock`))) throw new Error("lifecycle work lock activo");
    assertNoWorkers(root, assertSafePath);
    for (const entry of [...journal.entries].reverse()) {
      assertSafePath(root, entry.file);
      const current = snapshot(path.join(root, entry.file));
      if (!equal(current, entry.before) && !equal(current, entry.after)) throw new Error(`edición concurrente: ${entry.file}`);
      assertSafePath(root, `${entry.file}.harness-update-tmp`);
      const temporary = path.join(root, `${entry.file}.harness-update-tmp`);
      if (fs.existsSync(temporary)) {
        if (!fs.lstatSync(temporary).isFile()) throw new Error("staging de recuperación inseguro");
        fs.unlinkSync(temporary);
      }
      put(root, entry.file, entry.before);
    }
    fs.unlinkSync(path.join(root, journalPath));
    const directories = new Set(journal.entries.flatMap((entry) => {
      const parents = [];
      for (let directory = path.dirname(entry.file); directory !== "."; directory = path.dirname(directory)) parents.push(directory);
      return parents;
    }));
    for (const directory of [...directories].sort((a, b) => b.length - a.length)) {
      const target = path.join(root, directory);
      assertSafePath(root, directory);
      if (fs.existsSync(target) && !fs.readdirSync(target).length) fs.rmdirSync(target);
    }
  } finally { fs.rmdirSync(path.join(root, lockPath)); }
  return { operation: "recovered", restored: journal.entries.length };
}
