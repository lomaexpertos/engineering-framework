import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseProjects } from "./resolve-projects.mjs";
import { planConsumer, syncConsumer } from "./sync-consumer.mjs";

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const originalGitHubRepository = process.env.GITHUB_REPOSITORY;
const originalGitHubSha = process.env.GITHUB_SHA;

const testSourceSha = "0123456789abcdef0123456789abcdef01234567";
process.env.GITHUB_REPOSITORY = "lomaexpertos/engineering-framework";
process.env.GITHUB_SHA = testSourceSha;

function git(directory, ...args) {
  const result = spawnSync("git", args, { cwd: directory, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function init(directory) {
  fs.mkdirSync(directory, { recursive: true });
  git(directory, "init", "-b", "feature/framework");
  git(directory, "config", "user.name", "Framework test");
  git(directory, "config", "user.email", "framework-test@example.invalid");
  git(directory, "commit", "--allow-empty", "-m", "test baseline");
}

function commitFixture(directory) {
  git(directory, "add", "--all");
  git(directory, "commit", "--allow-empty", "-m", "test fixture");
}

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

function treeSnapshot(directory, includeModes = true) {
  const snapshot = new Map();

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(directory, absolute);
      if (entry.isDirectory()) {
        walk(absolute);
      } else if (entry.isFile()) {
        const mode = includeModes ? `${fs.statSync(absolute).mode & 0o777}:` : "";
        snapshot.set(relative, `${mode}${fs.readFileSync(absolute, "utf8")}`);
      } else if (entry.isSymbolicLink()) {
        snapshot.set(relative, `symlink:${fs.readlinkSync(absolute)}`);
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
  init(consumer);
  write(path.join(consumer, "AGENTS.md"), "# Project instructions\n\nKeep this local rule.\n");
  write(path.join(consumer, ".agents/skills/project-local/SKILL.md"), "local codex skill\n");
  write(path.join(consumer, ".claude/skills/project-local/SKILL.md"), "local claude skill\n");
  write(path.join(consumer, "engineering/docs/index.md"), "# Project docs\n");
  write(path.join(consumer, "engineering/specs/20260909_example/spec.md"), "# Spec\n");
  write(
    path.join(consumer, "engineering/quality-review/20260909_example/review.md"),
    "# Review\n",
  );

  write(path.join(consumer, "specifications/legacy.md"), "# Legacy specifications\n");
  write(path.join(consumer, "docs/business.md"), "# Existing business documentation\n");
  commitFixture(consumer);
  const beforePreview = treeSnapshot(consumer);
  const branchBefore = git(consumer, "branch", "--show-current");
  const headBefore = git(consumer, "rev-parse", "HEAD");
  const preview = planConsumer(consumer);
  assert.equal(preview.operation, "install");
  assert.ok(preview.added.includes("FRAMEWORK_VERSION"));
  assert.deepEqual(treeSnapshot(consumer), beforePreview);
  syncConsumer(consumer);
  assert.equal(git(consumer, "branch", "--show-current"), branchBefore);
  assert.equal(git(consumer, "rev-parse", "HEAD"), headBefore);
  assert.equal(git(consumer, "diff", "--cached", "--name-only"), "");
  assert.equal(fs.readFileSync(path.join(consumer, "specifications/legacy.md"), "utf8"), "# Legacy specifications\n");
  assert.equal(fs.readFileSync(path.join(consumer, "docs/business.md"), "utf8"), "# Existing business documentation\n");
  commitFixture(consumer);
  assert.equal(planConsumer(consumer).operation, "unchanged");
  const installedSnapshot = treeSnapshot(consumer);
  syncConsumer(consumer);
  assert.deepEqual(treeSnapshot(consumer), installedSnapshot);

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
    assert.deepEqual(
      treeSnapshot(path.join(consumer, ".agents/skills", skillName), false),
      treeSnapshot(path.join(frameworkRoot, "skills", skillName), false),
    );
  }
  assert.deepEqual(
    treeSnapshot(path.join(consumer, "engineering/corporate/policies"), false),
    treeSnapshot(path.join(frameworkRoot, "policies"), false),
  );
  assert.ok(fs.existsSync(path.join(consumer, ".agents/skills/project-local/SKILL.md")));
  assert.ok(fs.existsSync(path.join(consumer, ".claude/skills/project-local/SKILL.md")));
  assert.ok(fs.existsSync(path.join(consumer, "engineering/corporate/policies/README.md")));
  assert.equal(
    fs.readFileSync(path.join(consumer, "engineering/docs/index.md"), "utf8"),
    "# Project docs\n",
  );
  assert.equal(
    fs.readFileSync(path.join(consumer, "engineering/specs/20260909_example/spec.md"), "utf8"),
    "# Spec\n",
  );
  assert.equal(
    fs.readFileSync(
      path.join(consumer, "engineering/quality-review/20260909_example/review.md"),
      "utf8",
    ),
    "# Review\n",
  );
  assert.ok(!fs.existsSync(path.join(consumer, "engineering/architecture")));
  assert.ok(!fs.existsSync(path.join(consumer, "engineering/project")));
  assert.equal(
    fs.readFileSync(path.join(consumer, "FRAMEWORK_VERSION"), "utf8"),
    fs.readFileSync(path.join(frameworkRoot, "VERSION"), "utf8"),
  );

  const agents = fs.readFileSync(path.join(consumer, "AGENTS.md"), "utf8");
  assert.match(agents, /Keep this local rule/);
  assert.equal((agents.match(/<!-- engineering-framework:start -->/g) || []).length, 1);
  const templateAgents = fs.readFileSync(path.join(frameworkRoot, "templates/project/AGENTS.md"), "utf8");
  const routedPolicies = [...templateAgents.matchAll(/`(engineering\/corporate\/policies\/[^`]+\.md)`/g)];
  assert.ok(routedPolicies.length > 0);
  for (const [, policyPath] of routedPolicies) {
    assert.ok(fs.existsSync(path.join(consumer, policyPath)), policyPath);
    assert.ok(agents.includes(policyPath), policyPath);
  }

  const metadataPath = path.join(
    consumer,
    "engineering/corporate/metadata/installation.json",
  );
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  assert.deepEqual(metadata.managed_skills, expectedSkills);
  assert.equal(metadata.source_repository, "lomaexpertos/engineering-framework");
  assert.equal(metadata.source_commit, testSourceSha);

  const provenanceConsumer = path.join(testRoot, "provenance-consumer");
  const expectedSourceRepository = "lomaexpertos/engineering-framework";
  const expectedSourceCommit = "0123456789abcdef0123456789abcdef01234567";
  init(provenanceConsumer);
  process.env.GITHUB_REPOSITORY = expectedSourceRepository;
  process.env.GITHUB_SHA = expectedSourceCommit;
  syncConsumer(provenanceConsumer);
  const provenanceMetadata = JSON.parse(
    fs.readFileSync(
      path.join(provenanceConsumer, "engineering/corporate/metadata/installation.json"),
      "utf8",
    ),
  );
  assert.equal(provenanceMetadata.source_repository, expectedSourceRepository);
  assert.equal(provenanceMetadata.source_commit, expectedSourceCommit);
  process.env.GITHUB_REPOSITORY = "lomaexpertos/engineering-framework";
  process.env.GITHUB_SHA = testSourceSha;

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
  const retainedSkill = expectedSkills[0];
  const staleReferences = [".agents", ".claude"].map(
    (platform) => `${platform}/skills/${retainedSkill}/references/retired-reference.md`,
  );
  for (const relativePath of staleReferences) {
    write(path.join(consumer, relativePath), "retired corporate reference\n");
  }
  metadata.framework_version = "1.0.0";
  fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
  write(path.join(consumer, "FRAMEWORK_VERSION"), "1.0.0\n");
  commitFixture(consumer);
  const updatePlan = planConsumer(consumer);
  assert.equal(updatePlan.operation, "update");
  for (const relativePath of staleReferences) {
    assert.ok(updatePlan.removed.includes(relativePath));
  }
  syncConsumer(consumer);
  assert.ok(!fs.existsSync(path.join(consumer, ".agents/skills/obsolete-corporate-skill")));
  assert.ok(!fs.existsSync(path.join(consumer, ".claude/skills/obsolete-corporate-skill")));
  for (const relativePath of staleReferences) {
    assert.ok(!fs.existsSync(path.join(consumer, relativePath)));
  }
  for (const platform of [".agents", ".claude"]) {
    assert.ok(fs.existsSync(path.join(consumer, platform, "skills", retainedSkill, "SKILL.md")));
    assert.equal(
      fs.readFileSync(path.join(consumer, platform, "skills/project-local/SKILL.md"), "utf8"),
      platform === ".agents" ? "local codex skill\n" : "local claude skill\n",
    );
  }
  assert.equal(
    fs.readFileSync(path.join(consumer, "engineering/docs/index.md"), "utf8"),
    "# Project docs\n",
  );
  assert.equal(
    fs.readFileSync(path.join(consumer, "engineering/specs/20260909_example/spec.md"), "utf8"),
    "# Spec\n",
  );
  assert.equal(
    fs.readFileSync(
      path.join(consumer, "engineering/quality-review/20260909_example/review.md"),
      "utf8",
    ),
    "# Review\n",
  );
  assert.equal(
    (fs
      .readFileSync(path.join(consumer, "AGENTS.md"), "utf8")
      .match(/<!-- engineering-framework:start -->/g) || []).length,
    1,
  );

  const collisionConsumer = path.join(testRoot, "collision-consumer");
  init(collisionConsumer);
  write(
    path.join(collisionConsumer, ".agents/skills/add-observability/SKILL.md"),
    "project-owned collision\n",
  );
  assert.throws(() => syncConsumer(collisionConsumer), /colisiona/);

  const malformedAgentsConsumer = path.join(testRoot, "malformed-agents-consumer");
  init(malformedAgentsConsumer);
  write(
    path.join(malformedAgentsConsumer, "AGENTS.md"),
    "<!-- engineering-framework:start -->\nincomplete\n",
  );
  assert.throws(() => syncConsumer(malformedAgentsConsumer), /marcadores/);

  const duplicateMetadataConsumer = path.join(testRoot, "duplicate-metadata-consumer");
  init(duplicateMetadataConsumer);
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
  init(symlinkConsumer);
  fs.mkdirSync(symlinkTarget, { recursive: true });
  fs.symlinkSync(symlinkTarget, path.join(symlinkConsumer, ".agents"));
  assert.throws(() => syncConsumer(symlinkConsumer), /symbolic link/);
  assert.deepEqual(fs.readdirSync(symlinkTarget), []);

  function fixture(name, setup) {
    const directory = path.join(testRoot, name);
    init(directory);
    setup?.(directory);
    commitFixture(directory);
    return directory;
  }
  function rejectsWithoutWrites(directory, pattern) {
    const before = treeSnapshot(directory);
    assert.throws(() => planConsumer(directory), pattern);
    assert.throws(() => syncConsumer(directory), pattern);
    assert.deepEqual(treeSnapshot(directory), before);
  }
  for (const [name, content] of [
    ["duplicate-markers", "<!-- engineering-framework:start --><!-- engineering-framework:end --><!-- engineering-framework:start --><!-- engineering-framework:end -->"],
    ["reversed-markers", "<!-- engineering-framework:end --><!-- engineering-framework:start -->"],
    ["partial-markers", "<!-- engineering-framework:end -->"],
  ]) {
    rejectsWithoutWrites(fixture(name, (directory) => write(path.join(directory, "AGENTS.md"), content)), /marcadores/);
  }
  const directoryCollision = fixture("directory-collision", (directory) => {
    write(path.join(directory, "AGENTS.md/README.md"), "not a file\n");
  });
  rejectsWithoutWrites(directoryCollision, /EISDIR|directory/);
  const parentCollision = fixture("parent-collision", (directory) => write(path.join(directory, "engineering"), "file\n"));
  rejectsWithoutWrites(parentCollision, /not a directory/);
  const incomplete = fixture("incomplete", (directory) => write(path.join(directory, "FRAMEWORK_VERSION"), "1.0.0\n"));
  rejectsWithoutWrites(incomplete, /incompleta/);
  const unknownOwner = fixture("unknown-owner", (directory) => write(path.join(directory, "engineering/corporate/custom.md"), "project owned\n"));
  rejectsWithoutWrites(unknownOwner, /ownership/);
  for (const platform of [".agents", ".claude"]) {
    const directory = fixture(`collision-${platform.slice(1)}`, (directory) => {
      write(path.join(directory, platform, "skills/add-observability/SKILL.md"), "local\n");
    });
    rejectsWithoutWrites(directory, /colisiona/);
  }
  const dirtyConsumer = fixture("dirty");
  syncConsumer(dirtyConsumer);
  commitFixture(dirtyConsumer);
  const managedFile = path.join(dirtyConsumer, "engineering/corporate/README.md");
  const originalManaged = fs.readFileSync(managedFile);
  write(managedFile, "local edits\n");
  rejectsWithoutWrites(dirtyConsumer, /cambios locales/);
  git(dirtyConsumer, "add", "engineering/corporate/README.md");
  rejectsWithoutWrites(dirtyConsumer, /cambios locales/);
  write(managedFile, originalManaged);
  commitFixture(dirtyConsumer);
  const untrackedManaged = path.join(dirtyConsumer, "engineering/corporate/untracked.md");
  write(untrackedManaged, "must not remove\n");
  rejectsWithoutWrites(dirtyConsumer, /cambios locales/);
  fs.unlinkSync(untrackedManaged);
  write(path.join(dirtyConsumer, ".gitignore"), "engineering/corporate/ignored.md\n");
  write(path.join(dirtyConsumer, "engineering/corporate/ignored.md"), "ignored\n");
  rejectsWithoutWrites(dirtyConsumer, /cambios locales/);
  fs.unlinkSync(path.join(dirtyConsumer, "engineering/corporate/ignored.md"));
  write(path.join(dirtyConsumer, ".gitignore"), "engineering/corporate/\n");
  rejectsWithoutWrites(dirtyConsumer, /ignorados/);
  fs.unlinkSync(path.join(dirtyConsumer, ".gitignore"));

  for (const flag of ["assume-unchanged", "skip-worktree"]) {
    git(dirtyConsumer, "update-index", `--${flag}`, "engineering/corporate/README.md");
    rejectsWithoutWrites(dirtyConsumer, /skip-worktree|assume-unchanged/);
    git(dirtyConsumer, "update-index", `--no-${flag}`, "engineering/corporate/README.md");
  }

  write(path.join(dirtyConsumer, "application.txt"), "unrelated staged work\n");
  git(dirtyConsumer, "add", "application.txt");
  write(path.join(dirtyConsumer, "other.txt"), "untracked work\n");
  write(path.join(dirtyConsumer, ".agents/skills/local-new/SKILL.md"), "local untracked Skill\n");
  const indexBefore = fs.readFileSync(path.join(dirtyConsumer, ".git/index"));
  process.env.GITHUB_SHA = "1".repeat(40);
  assert.equal(planConsumer(dirtyConsumer).operation, "repair");
  syncConsumer(dirtyConsumer);
  assert.deepEqual(fs.readFileSync(path.join(dirtyConsumer, ".git/index")), indexBefore);
  assert.equal(fs.readFileSync(path.join(dirtyConsumer, "application.txt"), "utf8"), "unrelated staged work\n");
  assert.ok(fs.existsSync(path.join(dirtyConsumer, ".agents/skills/local-new/SKILL.md")));
  process.env.GITHUB_SHA = testSourceSha;

  const installed = fixture("metadata-cases");
  syncConsumer(installed);
  commitFixture(installed);
  const installedMetadataPath = path.join(installed, "engineering/corporate/metadata/installation.json");
  const validMetadata = JSON.parse(fs.readFileSync(installedMetadataPath, "utf8"));
  for (const [change, pattern] of [
    [{ schema_version: 7 }, /inconsistentes/],
    [{ framework_version: "0.0.1" }, /inconsistentes/],
    [{ source_repository: "other/framework" }, /otra fuente/],
    [{ source_commit: "short" }, /source_commit/],
    [{ managed_skills: ["../escape"] }, /managed_skills/],
    [{ managed_skills: ["example", "example"] }, /duplicados/],
  ]) {
    write(installedMetadataPath, `${JSON.stringify({ ...validMetadata, ...change })}\n`);
    rejectsWithoutWrites(installed, pattern);
  }
  write(installedMetadataPath, `${JSON.stringify({ ...validMetadata, framework_version: "99.0.0" })}\n`);
  write(path.join(installed, "FRAMEWORK_VERSION"), "99.0.0\n");
  rejectsWithoutWrites(installed, /downgrade/);
  // Compatibilidad con la metadata producida antes del canal asistido.
  write(installedMetadataPath, `${JSON.stringify({ ...validMetadata, source_repository: "engineering-framework", source_commit: null, framework_version: "0.9.0" })}\n`);
  write(path.join(installed, "FRAMEWORK_VERSION"), "0.9.0\n");
  commitFixture(installed);
  assert.equal(planConsumer(installed).major_update, true);
  syncConsumer(installed);
  commitFixture(installed);
  write(path.join(installed, "engineering/corporate/policies/README.md"), "committed obsolete copy\n");
  commitFixture(installed);
  assert.equal(planConsumer(installed).operation, "repair");
  syncConsumer(installed);

  const noProvenance = fixture("no-provenance");
  delete process.env.GITHUB_SHA;
  rejectsWithoutWrites(noProvenance, /GITHUB_SHA/);
  process.env.GITHUB_SHA = testSourceSha;
  process.env.GITHUB_REPOSITORY = "other/framework";
  rejectsWithoutWrites(noProvenance, /GITHUB_REPOSITORY/);
  process.env.GITHUB_REPOSITORY = "lomaexpertos/engineering-framework";

  const cli = spawnSync(process.execPath, [path.join(frameworkRoot, "tooling/sync-consumer.mjs"), "--check", noProvenance], { encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  assert.equal(JSON.parse(cli.stdout).operation, "install");
  assert.ok(!fs.existsSync(path.join(noProvenance, "FRAMEWORK_VERSION")));
  const cliInvalid = spawnSync(process.execPath, [path.join(frameworkRoot, "tooling/sync-consumer.mjs"), "--unknown", noProvenance], { encoding: "utf8" });
  assert.notEqual(cliInvalid.status, 0);
  const detached = fixture("detached");
  git(detached, "switch", "--detach");
  rejectsWithoutWrites(detached, /Git/);
  const worktreeBase = fixture("worktree-base");
  const linkedWorktree = path.join(testRoot, "linked-worktree");
  git(worktreeBase, "worktree", "add", "-b", "feature/linked", linkedWorktree);
  assert.ok(fs.statSync(path.join(linkedWorktree, ".git")).isFile());
  const worktreeHead = git(linkedWorktree, "rev-parse", "HEAD");
  syncConsumer(linkedWorktree);
  assert.equal(git(linkedWorktree, "branch", "--show-current"), "feature/linked");
  assert.equal(git(linkedWorktree, "rev-parse", "HEAD"), worktreeHead);
  assert.equal(git(linkedWorktree, "diff", "--cached", "--name-only"), "");
} finally {
  if (originalGitHubRepository === undefined) {
    delete process.env.GITHUB_REPOSITORY;
  } else {
    process.env.GITHUB_REPOSITORY = originalGitHubRepository;
  }
  if (originalGitHubSha === undefined) {
    delete process.env.GITHUB_SHA;
  } else {
    process.env.GITHUB_SHA = originalGitHubSha;
  }
  fs.rmSync(testRoot, { recursive: true, force: true });
}

console.log("Distribution tests passed.");
