import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseProjects } from "./resolve-projects.mjs";
import { syncConsumer } from "./sync-consumer.mjs";

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function directoryNames(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function treeSnapshot(directory) {
  const snapshot = new Map();

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(directory, absolute);
      if (entry.isDirectory()) {
        walk(absolute);
      } else if (entry.isFile()) {
        snapshot.set(relative, fs.readFileSync(absolute, "utf8"));
      } else {
        throw new Error(`unexpected test entry: ${absolute}`);
      }
    }
  }

  walk(directory);
  return [...snapshot.entries()].sort(([left], [right]) => left.localeCompare(right));
}

assert.deepEqual(parseProjects("schema_version: 1\nprojects: []\n"), []);
assert.deepEqual(
  parseProjects(
    "schema_version: 1\nprojects:\n  - repository: lomaexpertos/erp\n    enabled: true\n    auto_merge: false\n",
    "lomaexpertos",
  ),
  [{ repository: "lomaexpertos/erp", enabled: true, auto_merge: false }],
);
assert.throws(
  () =>
    parseProjects(
      "schema_version: 1\nprojects:\n  - repository: other/erp\n    enabled: true\n    auto_merge: true\n",
      "lomaexpertos",
    ),
  /no pertenece/,
);

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "engineering-framework-sync-"));

try {
  const consumer = path.join(testRoot, "consumer");
  fs.mkdirSync(path.join(consumer, ".git"), { recursive: true });
  write(path.join(consumer, "AGENTS.md"), "# Project instructions\n\nKeep this local rule.\n");
  write(path.join(consumer, ".agents/skills/project-local/SKILL.md"), "local codex skill\n");
  write(path.join(consumer, ".claude/skills/project-local/SKILL.md"), "local claude skill\n");

  syncConsumer(consumer);

  const expectedSkills = directoryNames(path.join(frameworkRoot, "skills"));
  const codexSkills = directoryNames(path.join(consumer, ".agents/skills")).filter(
    (skill) => skill !== "project-local",
  );
  const claudeSkills = directoryNames(path.join(consumer, ".claude/skills")).filter(
    (skill) => skill !== "project-local",
  );

  assert.deepEqual(codexSkills, expectedSkills);
  assert.deepEqual(claudeSkills, expectedSkills);
  for (const skillName of expectedSkills) {
    assert.deepEqual(
      treeSnapshot(path.join(consumer, ".agents/skills", skillName)),
      treeSnapshot(path.join(consumer, ".claude/skills", skillName)),
    );
  }
  assert.ok(fs.existsSync(path.join(consumer, ".agents/skills/project-local/SKILL.md")));
  assert.ok(fs.existsSync(path.join(consumer, ".claude/skills/project-local/SKILL.md")));
  assert.ok(fs.existsSync(path.join(consumer, "engineering/corporate/policies/README.md")));
  assert.equal(
    fs.readFileSync(path.join(consumer, "FRAMEWORK_VERSION"), "utf8"),
    fs.readFileSync(path.join(frameworkRoot, "VERSION"), "utf8"),
  );

  const agents = fs.readFileSync(path.join(consumer, "AGENTS.md"), "utf8");
  assert.match(agents, /Keep this local rule/);
  assert.equal((agents.match(/<!-- engineering-framework:start -->/g) || []).length, 1);

  const metadataPath = path.join(
    consumer,
    "engineering/corporate/metadata/installation.json",
  );
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  assert.deepEqual(metadata.managed_skills, expectedSkills);
  assert.equal(metadata.source_commit, null);

  metadata.managed_skills.push("obsolete-corporate-skill");
  fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
  write(
    path.join(consumer, ".agents/skills/obsolete-corporate-skill/SKILL.md"),
    "obsolete\n",
  );
  write(
    path.join(consumer, ".claude/skills/obsolete-corporate-skill/SKILL.md"),
    "obsolete\n",
  );

  syncConsumer(consumer);
  assert.ok(!fs.existsSync(path.join(consumer, ".agents/skills/obsolete-corporate-skill")));
  assert.ok(!fs.existsSync(path.join(consumer, ".claude/skills/obsolete-corporate-skill")));
  assert.equal(
    (fs
      .readFileSync(path.join(consumer, "AGENTS.md"), "utf8")
      .match(/<!-- engineering-framework:start -->/g) || []).length,
    1,
  );

  const collisionConsumer = path.join(testRoot, "collision-consumer");
  fs.mkdirSync(path.join(collisionConsumer, ".git"), { recursive: true });
  write(
    path.join(collisionConsumer, ".agents/skills/add-observability/SKILL.md"),
    "project-owned collision\n",
  );
  assert.throws(() => syncConsumer(collisionConsumer), /colisiona/);

  const malformedAgentsConsumer = path.join(testRoot, "malformed-agents-consumer");
  fs.mkdirSync(path.join(malformedAgentsConsumer, ".git"), { recursive: true });
  write(
    path.join(malformedAgentsConsumer, "AGENTS.md"),
    "<!-- engineering-framework:start -->\nincomplete\n",
  );
  assert.throws(() => syncConsumer(malformedAgentsConsumer), /marcadores/);

  const duplicateMetadataConsumer = path.join(testRoot, "duplicate-metadata-consumer");
  fs.mkdirSync(path.join(duplicateMetadataConsumer, ".git"), { recursive: true });
  syncConsumer(duplicateMetadataConsumer);
  const duplicateMetadataPath = path.join(
    duplicateMetadataConsumer,
    "engineering/corporate/metadata/installation.json",
  );
  const duplicateMetadata = JSON.parse(fs.readFileSync(duplicateMetadataPath, "utf8"));
  duplicateMetadata.managed_skills.push(duplicateMetadata.managed_skills[0]);
  fs.writeFileSync(duplicateMetadataPath, `${JSON.stringify(duplicateMetadata, null, 2)}\n`);
  assert.throws(() => syncConsumer(duplicateMetadataConsumer), /duplicados/);

  const symlinkConsumer = path.join(testRoot, "symlink-consumer");
  const symlinkTarget = path.join(testRoot, "symlink-target");
  fs.mkdirSync(path.join(symlinkConsumer, ".git"), { recursive: true });
  fs.mkdirSync(symlinkTarget, { recursive: true });
  fs.symlinkSync(symlinkTarget, path.join(symlinkConsumer, ".agents"));
  assert.throws(() => syncConsumer(symlinkConsumer), /symbolic link/);
  assert.deepEqual(fs.readdirSync(symlinkTarget), []);
} finally {
  fs.rmSync(testRoot, { recursive: true, force: true });
}

console.log("Distribution tests passed.");
