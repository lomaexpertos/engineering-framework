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
} finally {
  fs.rmSync(testRoot, { recursive: true, force: true });
}

console.log("Distribution tests passed.");
