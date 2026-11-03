import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "engineering-framework-publish-test-"));
const frameworkVersion = fs.readFileSync(path.join(frameworkRoot, "VERSION"), "utf8").trim();

function execute(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: frameworkRoot,
    encoding: "utf8",
    ...options,
  });

  return result;
}

function requireSuccess(command, args, options = {}) {
  const result = execute(command, args, options);
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
  return result;
}

function initializeRemote(remote, seed) {
  requireSuccess("git", ["init", "--bare", remote]);
  requireSuccess("git", ["init", seed]);
  requireSuccess("git", ["-C", seed, "config", "user.name", "Test User"]);
  requireSuccess("git", ["-C", seed, "config", "user.email", "test@example.com"]);
  fs.writeFileSync(path.join(seed, "README.md"), "# Consumer fixture\n");
  requireSuccess("git", ["-C", seed, "add", "README.md"]);
  requireSuccess("git", ["-C", seed, "commit", "-m", "chore: inicia consumidor"]);
  requireSuccess("git", ["-C", seed, "branch", "-M", "main"]);
  requireSuccess("git", ["-C", seed, "remote", "add", "origin", remote]);
  requireSuccess("git", ["-C", seed, "push", "-u", "origin", "main"]);
  requireSuccess("git", ["--git-dir", remote, "symbolic-ref", "HEAD", "refs/heads/main"]);
}

try {
  const remote = path.join(testRoot, "consumer.git");
  const seed = path.join(testRoot, "seed");
  const mockBin = path.join(testRoot, "bin");
  const projectsFile = path.join(testRoot, "projects.tsv");
  const ghLog = path.join(testRoot, "gh.log");
  const prState = path.join(testRoot, "pr-created");
  const summary = path.join(testRoot, "summary.md");
  const realGit = requireSuccess("sh", ["-c", "command -v git"]).stdout.trim();

  initializeRemote(remote, seed);
  fs.mkdirSync(mockBin, { recursive: true });
  fs.writeFileSync(projectsFile, "lomaexpertos/example\ttrue\n");

  const ghMock = `#!/usr/bin/env bash
set -euo pipefail
printf '%q ' "$@" >> "$MOCK_GH_LOG"
printf '\n' >> "$MOCK_GH_LOG"

case "\${1:-}:\${2:-}" in
  auth:setup-git)
    exit 0
    ;;
  api:*)
    if [[ "\${2:-}" == /users/* ]]; then
      echo 123456
    elif [[ "\${2:-}" == repos/* ]]; then
      printf 'main\tfalse\tfalse\ttrue\t%s\ttrue\ttrue\n' "$MOCK_ALLOW_AUTO_MERGE"
    else
      echo "unexpected gh api endpoint: \${2:-}" >&2
      exit 2
    fi
    ;;
  repo:clone)
    "$REAL_GIT" clone --branch main --single-branch "$MOCK_REMOTE" "$4"
    ;;
  pr:list)
    if [[ -f "$MOCK_PR_STATE" ]]; then
      printf '42\thttps://github.com/lomaexpertos/example/pull/42\n'
    fi
    ;;
  pr:create)
    : > "$MOCK_PR_STATE"
    echo 'https://github.com/lomaexpertos/example/pull/42'
    ;;
  pr:view)
    echo 42
    ;;
  pr:edit)
    exit 0
    ;;
  pr:merge)
    if [[ "$MOCK_FAIL_MERGE" == "true" ]]; then
      exit 7
    fi
    exit 0
    ;;
  *)
    echo "unexpected gh invocation: $*" >&2
    exit 2
    ;;
esac
`;
  const ghPath = path.join(mockBin, "gh");
  fs.writeFileSync(ghPath, ghMock, { mode: 0o755 });

  const baseEnvironment = {
    ...process.env,
    PATH: `${mockBin}:${process.env.PATH}`,
    GH_TOKEN: "test-installation-token",
    ENGINEERING_FRAMEWORK_APP_SLUG: "engineering-framework-bot",
    ENGINEERING_FRAMEWORK_PROJECTS_FILE: projectsFile,
    ENGINEERING_FRAMEWORK_ROOT: frameworkRoot,
    GITHUB_REPOSITORY: "lomaexpertos/engineering-framework",
    GITHUB_SHA: "0123456789abcdef0123456789abcdef01234567",
    GITHUB_STEP_SUMMARY: summary,
    RUNNER_TEMP: testRoot,
    MOCK_GH_LOG: ghLog,
    MOCK_PR_STATE: prState,
    MOCK_REMOTE: remote,
    REAL_GIT: realGit,
  };

  const failedPreflight = execute("bash", ["tooling/publish-projects.sh"], {
    env: {
      ...baseEnvironment,
      MOCK_ALLOW_AUTO_MERGE: "false",
      MOCK_FAIL_MERGE: "false",
    },
  });
  assert.notEqual(failedPreflight.status, 0);
  assert.match(failedPreflight.stderr + failedPreflight.stdout, /auto-merge is disabled/);
  const absentBranch = execute("git", [
    "--git-dir",
    remote,
    "show-ref",
    "--verify",
    `refs/heads/engineering-framework/update-v${frameworkVersion}`,
  ]);
  assert.notEqual(absentBranch.status, 0, "preflight failure must not create a branch");

  const failedMerge = execute("bash", ["tooling/publish-projects.sh"], {
    env: {
      ...baseEnvironment,
      MOCK_ALLOW_AUTO_MERGE: "true",
      MOCK_FAIL_MERGE: "true",
    },
  });
  assert.notEqual(failedMerge.status, 0);
  assert.match(
    failedMerge.stdout + failedMerge.stderr,
    /enable-auto-merge|Unexpected command failure/,
  );

  const branch = `refs/heads/engineering-framework/update-v${frameworkVersion}`;
  requireSuccess("git", ["--git-dir", remote, "show-ref", "--verify", branch]);
  const installation = JSON.parse(
    requireSuccess("git", [
      "--git-dir",
      remote,
      "show",
      `${branch}:.harness/core/manifest.json`,
    ]).stdout,
  );
  assert.equal(installation.framework_version, frameworkVersion);
  assert.equal(installation.source_repository, "lomaexpertos/engineering-framework");
  assert.equal(installation.source_commit, baseEnvironment.GITHUB_SHA);
  requireSuccess("git", [
    "--git-dir",
    remote,
    "cat-file",
    "-e",
    `${branch}:.agents/skills/implement-ui-change/SKILL.md`,
  ]);
  requireSuccess("git", [
    "--git-dir",
    remote,
    "cat-file",
    "-e",
    `${branch}:.claude/skills/implement-ui-change/SKILL.md`,
  ]);

  const failedMergeLog = fs.readFileSync(ghLog, "utf8");
  assert.match(failedMergeLog, /pr create/);
  assert.match(failedMergeLog, /pr merge/);
  assert.match(failedMergeLog, /--match-head-commit/);

  const retryPublication = execute("bash", ["tooling/publish-projects.sh"], {
    env: {
      ...baseEnvironment,
      MOCK_ALLOW_AUTO_MERGE: "true",
      MOCK_FAIL_MERGE: "false",
    },
  });
  assert.equal(
    retryPublication.status,
    0,
    `retry publication failed\n${retryPublication.stdout}\n${retryPublication.stderr}`,
  );
  const retryLog = fs.readFileSync(ghLog, "utf8");
  assert.match(retryLog, /pr edit/);

  const summaryContent = fs.readFileSync(summary, "utf8");
  assert.match(summaryContent, /Preflight.*passed|preflight.*passed/i);
  assert.match(summaryContent, /failed/);
  assert.match(summaryContent, /auto-merge-enabled/);
  assert.match(summaryContent, /pull\/42/);
} finally {
  fs.rmSync(testRoot, { recursive: true, force: true });
}

console.log("Publication orchestration tests passed.");
