#!/usr/bin/env bash

set -Eeuo pipefail

required_environment=(
  GH_TOKEN
  ENGINEERING_FRAMEWORK_APP_SLUG
  ENGINEERING_FRAMEWORK_PROJECTS_FILE
  ENGINEERING_FRAMEWORK_ROOT
  GITHUB_REPOSITORY
  GITHUB_SHA
)

for variable_name in "${required_environment[@]}"; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "::error title=Missing environment::${variable_name} is required by tooling/publish-projects.sh."
    exit 1
  fi
done

if [[ ! -r "$ENGINEERING_FRAMEWORK_PROJECTS_FILE" ]]; then
  echo "::error title=Unreadable registry::Cannot read ${ENGINEERING_FRAMEWORK_PROJECTS_FILE}."
  exit 1
fi

framework_version="$(tr -d '[:space:]' < "$ENGINEERING_FRAMEWORK_ROOT/VERSION")"
branch_name="engineering-framework/update-v${framework_version}"
work_root="$(mktemp -d "${RUNNER_TEMP:-/tmp}/engineering-framework-publish.XXXXXX")"
summary_file="${GITHUB_STEP_SUMMARY:-$work_root/publication-summary.md}"
current_repository="initialization"
current_stage="startup"
group_open="false"

cleanup() {
  rm -rf -- "$work_root"
}
trap cleanup EXIT

timestamp() {
  date -u '+%Y-%m-%dT%H:%M:%SZ'
}

log() {
  printf '[%s] [%s] [%s] %s\n' "$(timestamp)" "$current_repository" "$current_stage" "$*"
}

escape_workflow_message() {
  local message="$1"
  message="${message//'%'/'%25'}"
  message="${message//$'\r'/'%0D'}"
  message="${message//$'\n'/'%0A'}"
  printf '%s' "$message"
}

append_result() {
  local repository="$1"
  local stage="$2"
  local status="$3"
  local detail="$4"
  detail="${detail//|/\\|}"
  printf '| `%s` | %s | %s | %s |\n' "$repository" "$stage" "$status" "$detail" >> "$summary_file"
}

start_group() {
  local title="$1"
  echo "::group::${title}"
  group_open="true"
}

end_group() {
  if [[ "$group_open" == "true" ]]; then
    echo "::endgroup::"
    group_open="false"
  fi
}

fail() {
  local message="$1"
  local escaped
  escaped="$(escape_workflow_message "$message")"
  echo "::error title=Engineering Framework publication::${escaped}"
  log "ERROR: ${message}" >&2
  append_result "$current_repository" "$current_stage" "failed" "$message"
  end_group
  exit 1
}

on_error() {
  local exit_code="$?"
  local line="$1"
  local command="$2"
  local message="Unexpected command failure at line ${line} (exit ${exit_code}) during ${current_stage}: ${command}"

  trap - ERR
  echo "::error title=Unexpected publication failure::$(escape_workflow_message "$message")"
  log "$message" >&2
  append_result "$current_repository" "$current_stage" "failed" "Unexpected command failure at line ${line}; inspect step logs."
  end_group
  exit "$exit_code"
}

is_semver() {
  [[ "$1" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]
}

version_is_older_than() {
  local candidate="$1"
  local installed="$2"
  local candidate_major candidate_minor candidate_patch
  local installed_major installed_minor installed_patch

  IFS=. read -r candidate_major candidate_minor candidate_patch <<< "$candidate"
  IFS=. read -r installed_major installed_minor installed_patch <<< "$installed"

  if (( candidate_major != installed_major )); then
    (( candidate_major < installed_major ))
    return
  fi
  if (( candidate_minor != installed_minor )); then
    (( candidate_minor < installed_minor ))
    return
  fi
  (( candidate_patch < installed_patch ))
}

if ! is_semver "$framework_version"; then
  echo "::error title=Invalid framework version::VERSION must contain SemVer X.Y.Z; found ${framework_version}."
  exit 1
fi
if [[ ! "$GITHUB_REPOSITORY" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
  echo "::error title=Invalid source repository::GITHUB_REPOSITORY has an unsupported format."
  exit 1
fi
if [[ ! "$GITHUB_SHA" =~ ^([0-9a-fA-F]{40}|[0-9a-fA-F]{64})$ ]]; then
  echo "::error title=Invalid source SHA::GITHUB_SHA is not a complete Git object ID."
  exit 1
fi

repositories=()
auto_merge_values=()
while IFS=$'\t' read -r repository auto_merge extra; do
  [[ -z "$repository" ]] && continue
  if [[ -n "${extra:-}" ]] || [[ ! "$repository" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
    echo "::error title=Invalid resolved registry::Invalid row for ${repository:-<empty>}."
    exit 1
  fi
  if [[ "$auto_merge" != "true" && "$auto_merge" != "false" ]]; then
    echo "::error title=Invalid resolved registry::auto_merge for ${repository} must be true or false."
    exit 1
  fi
  repositories+=("$repository")
  auto_merge_values+=("$auto_merge")
done < "$ENGINEERING_FRAMEWORK_PROJECTS_FILE"

{
  echo "## Consumer results"
  echo
  echo "| Repository | Stage | Status | Detail |"
  echo "|---|---|---|---|"
} >> "$summary_file"

current_stage="authenticate"
start_group "Authenticate GitHub App bot"
log "Validating bot identity for app slug ${ENGINEERING_FRAMEWORK_APP_SLUG}."
if ! bot_user_id="$(gh api "/users/${ENGINEERING_FRAMEWORK_APP_SLUG}[bot]" --jq .id)"; then
  fail "The installation token could not resolve the GitHub App bot identity."
fi
if [[ ! "$bot_user_id" =~ ^[0-9]+$ ]]; then
  fail "GitHub returned an invalid bot user ID."
fi

bot_user="${ENGINEERING_FRAMEWORK_APP_SLUG}[bot]"
bot_email="${bot_user_id}+${bot_user}@users.noreply.github.com"
log "Resolved bot identity ${bot_user}; configuring authenticated Git transport."
if ! gh auth setup-git; then
  fail "GitHub CLI could not configure Git authentication for the installation token."
fi
end_group

preflight_repository() {
  local repository="$1"
  local auto_merge="$2"
  local metadata
  local default_branch archived disabled allow_squash allow_auto_merge delete_branch push_permission

  current_stage="preflight"
  log "Reading repository metadata and effective token permissions."
  if ! metadata="$(
    gh api "repos/${repository}" \
      --jq '[.default_branch, (.archived | tostring), (.disabled | tostring), (.allow_squash_merge | tostring), (.allow_auto_merge | tostring), (.delete_branch_on_merge | tostring), (.permissions.push | tostring)] | @tsv'
  )"; then
    fail "Cannot access ${repository}; verify that the GitHub App is installed on this repository."
  fi

  IFS=$'\t' read -r \
    default_branch archived disabled allow_squash allow_auto_merge delete_branch push_permission \
    <<< "$metadata"

  log "Metadata: default=${default_branch:-<none>}, archived=${archived:-unknown}, disabled=${disabled:-unknown}, push=${push_permission:-unknown}, squash=${allow_squash:-unknown}, auto_merge=${allow_auto_merge:-unknown}, delete_branch=${delete_branch:-unknown}."

  [[ "$default_branch" == "main" ]] ||
    fail "${repository} must use main as its default branch; found ${default_branch:-<none>}."
  [[ "$archived" == "false" ]] || fail "${repository} is archived."
  [[ "$disabled" == "false" ]] || fail "${repository} is disabled."
  [[ "$push_permission" == "true" ]] ||
    fail "The GitHub App token does not have push permission on ${repository}."

  if [[ "$auto_merge" == "true" ]]; then
    [[ "$allow_squash" == "true" ]] ||
      fail "${repository} has auto_merge enabled in projects.yml but does not allow squash merge."
    [[ "$allow_auto_merge" == "true" ]] ||
      fail "${repository} has auto_merge enabled in projects.yml but repository auto-merge is disabled."
    [[ "$delete_branch" == "true" ]] ||
      fail "${repository} must enable automatic head-branch deletion for deferred auto-merge."
  fi

  append_result "$repository" "preflight" "passed" "Access, main branch and merge settings validated."
  log "Preflight passed without external mutations."
}

run_isolated() {
  local operation="$1"
  local repository="$2"
  local auto_merge="$3"

  (
    set -Eeuo pipefail
    current_repository="$repository"
    current_stage="$operation"
    group_open="false"
    trap 'on_error "$LINENO" "$BASH_COMMAND"' ERR
    start_group "${operation}: ${repository}"
    "$operation" "$repository" "$auto_merge"
    end_group
  )
}

preflight_failures=0
for index in "${!repositories[@]}"; do
  set +e
  run_isolated preflight_repository "${repositories[$index]}" "${auto_merge_values[$index]}"
  operation_status="$?"
  set -e
  if (( operation_status != 0 )); then
    ((preflight_failures += 1))
  fi
done

if (( preflight_failures != 0 )); then
  current_repository="registry"
  current_stage="preflight"
  echo "::error title=Publication preflight failed::${preflight_failures} consumer repository preflight(s) failed. No consumer branch was modified."
  log "Preflight failed for ${preflight_failures} consumer(s); publication was aborted before clone, commit or push." >&2
  exit 1
fi

publish_repository() {
  local repository="$1"
  local auto_merge="$2"
  local repository_name="${repository##*/}"
  local checkout="$work_root/$repository_name"
  local pr_body_file="$work_root/${repository_name}-pull-request.md"
  local previous_version=""
  local remote_branch_exists="false"
  local remote_branch_record=""
  local remote_branch_sha=""
  local pull_request_record=""
  local pull_request_number=""
  local pull_request_url=""
  local head_sha=""
  local is_major_update="false"
  local pr_title="chore(engineering): actualiza framework a ${framework_version}"

  current_stage="clone"
  log "Cloning ${repository} from main into an isolated temporary directory."
  gh repo clone "$repository" "$checkout" -- --branch main --single-branch

  current_stage="inspect-version"
  if remote_branch_record="$(
    git -C "$checkout" ls-remote --exit-code --heads origin "refs/heads/${branch_name}" 2>/dev/null
  )"; then
    remote_branch_exists="true"
    remote_branch_sha="${remote_branch_record%%$'\t'*}"
    [[ "$remote_branch_sha" =~ ^([0-9a-fA-F]{40}|[0-9a-fA-F]{64})$ ]] ||
      fail "Remote update branch for ${repository} returned an invalid object ID."
    log "Existing update branch detected; fetching it for force-with-lease protection."
    git -C "$checkout" fetch origin "$branch_name:refs/remotes/origin/$branch_name"
  else
    log "No existing update branch found; this publication will create it."
  fi

  if [[ -f "$checkout/FRAMEWORK_VERSION" ]]; then
    previous_version="$(tr -d '[:space:]' < "$checkout/FRAMEWORK_VERSION")"
    log "Installed framework version: ${previous_version:-<empty>}."
  else
    log "No installed FRAMEWORK_VERSION found; treating this as a first installation."
  fi

  if [[ -n "$previous_version" ]]; then
    is_semver "$previous_version" ||
      fail "Invalid installed FRAMEWORK_VERSION in ${repository}: ${previous_version}."
    if version_is_older_than "$framework_version" "$previous_version"; then
      fail "Refusing to downgrade ${repository} from ${previous_version} to ${framework_version}."
    fi
    if (( 10#${framework_version%%.*} > 10#${previous_version%%.*} )); then
      is_major_update="true"
    fi
  fi

  current_stage="synchronize"
  log "Resetting the deterministic update branch from origin/main."
  git -C "$checkout" checkout -B "$branch_name" origin/main
  log "Synchronizing corporate Policies, metadata, AGENTS routing and both Skill catalogs."
  node "$ENGINEERING_FRAMEWORK_ROOT/tooling/sync-consumer.mjs" "$checkout"

  current_stage="commit"
  git -C "$checkout" config user.name "$bot_user"
  git -C "$checkout" config user.email "$bot_email"
  git -C "$checkout" add -- \
    AGENTS.md \
    FRAMEWORK_VERSION \
    engineering/corporate \
    .agents/skills \
    .claude/skills

  if git -C "$checkout" diff --cached --quiet; then
    log "No managed-file changes detected; ${repository} already matches ${framework_version}."
    append_result "$repository" "publication" "unchanged" "Already synchronized with ${framework_version}; no branch or PR changed."
    return 0
  fi

  log "Managed diff contains $(git -C "$checkout" diff --cached --name-only | wc -l | tr -d '[:space:]') files."
  git -C "$checkout" commit \
    -m "chore(engineering): actualiza framework a ${framework_version}" \
    -m "- Sincroniza Policies corporativas bajo engineering/corporate
- Instala el mismo catálogo de Skills para Codex y Claude Code
- Actualiza versión y routing corporativo administrado"
  head_sha="$(git -C "$checkout" rev-parse HEAD)"
  log "Created consumer commit ${head_sha}."

  current_stage="push"
  if [[ "$remote_branch_exists" == "true" ]]; then
    log "Updating existing bot branch with force-with-lease against ${remote_branch_sha}."
    git -C "$checkout" push \
      --force-with-lease="refs/heads/${branch_name}:${remote_branch_sha}" \
      --set-upstream \
      origin \
      "$branch_name"
  else
    log "Pushing new bot branch."
    git -C "$checkout" push --set-upstream origin "$branch_name"
  fi

  current_stage="pull-request"
  {
    echo "Actualización automática de Engineering Framework ${framework_version}."
    echo
    echo "- Policies corporativas en \`engineering/corporate/\`."
    echo "- Skills idénticas en \`.agents/skills/\` y \`.claude/skills/\`."
    echo "- Fuente inmutable: \`${GITHUB_REPOSITORY}@${GITHUB_SHA}\`."
    echo "- Commit consumidor: \`${head_sha}\`."
    echo
    echo "Este contenido es administrado por \`${bot_user}\`."
  } > "$pr_body_file"

  pull_request_record="$(
    gh pr list \
      --repo "$repository" \
      --base main \
      --head "$branch_name" \
      --state open \
      --limit 1 \
      --json number,url \
      --jq '.[0] | select(. != null) | [.number, .url] | @tsv'
  )"

  if [[ -n "$pull_request_record" ]]; then
    IFS=$'\t' read -r pull_request_number pull_request_url <<< "$pull_request_record"
    log "Reusing PR #${pull_request_number}; refreshing its title and provenance."
    gh pr edit "$pull_request_number" \
      --repo "$repository" \
      --title "$pr_title" \
      --body-file "$pr_body_file"
  else
    log "Creating a new Pull Request from ${branch_name} to main."
    pull_request_url="$(
      gh pr create \
        --repo "$repository" \
        --base main \
        --head "$branch_name" \
        --title "$pr_title" \
        --body-file "$pr_body_file"
    )"
    pull_request_number="$(
      gh pr view "$pull_request_url" \
        --repo "$repository" \
        --json number \
        --jq .number
    )"
  fi

  [[ "$pull_request_number" =~ ^[0-9]+$ ]] ||
    fail "Could not resolve the Pull Request number for ${repository}."
  [[ "$pull_request_url" == https://github.com/* ]] ||
    fail "Could not resolve the Pull Request URL for ${repository}."
  log "Pull Request ready: ${pull_request_url}."

  current_stage="merge-policy"
  if [[ "$auto_merge" != "true" ]]; then
    log "auto_merge=false; leaving PR #${pull_request_number} open for manual handling."
    append_result "$repository" "publication" "pull-request-open" "[PR #${pull_request_number}](${pull_request_url}); auto_merge disabled."
    return 0
  fi
  if [[ "$is_major_update" == "true" ]]; then
    log "MAJOR update detected; leaving PR #${pull_request_number} open for mandatory manual review."
    append_result "$repository" "publication" "manual-major" "[PR #${pull_request_number}](${pull_request_url}); MAJOR update requires manual merge."
    return 0
  fi

  current_stage="enable-auto-merge"
  log "Enabling squash auto-merge for exact head commit ${head_sha}; required repository checks remain authoritative."
  gh pr merge "$pull_request_number" \
    --repo "$repository" \
    --auto \
    --squash \
    --delete-branch \
    --match-head-commit "$head_sha"
  append_result "$repository" "publication" "auto-merge-enabled" "[PR #${pull_request_number}](${pull_request_url}); exact head ${head_sha}."
  log "Auto-merge accepted for PR #${pull_request_number}."
}

for index in "${!repositories[@]}"; do
  set +e
  run_isolated publish_repository "${repositories[$index]}" "${auto_merge_values[$index]}"
  operation_status="$?"
  set -e
  if (( operation_status != 0 )); then
    current_repository="${repositories[$index]}"
    current_stage="publication"
    log "Stopping after the first mutation-phase failure; inspect the summary for repositories already processed." >&2
    exit "$operation_status"
  fi
done

current_repository="registry"
current_stage="complete"
log "Publication processing completed for ${#repositories[@]} consumer repository(ies)."
