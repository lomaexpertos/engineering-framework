#!/usr/bin/env bash

set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${ENGINEERING_FRAMEWORK_APP_SLUG:?ENGINEERING_FRAMEWORK_APP_SLUG is required}"
: "${ENGINEERING_FRAMEWORK_PROJECTS_FILE:?ENGINEERING_FRAMEWORK_PROJECTS_FILE is required}"
: "${ENGINEERING_FRAMEWORK_ROOT:?ENGINEERING_FRAMEWORK_ROOT is required}"

framework_version="$(tr -d '[:space:]' < "$ENGINEERING_FRAMEWORK_ROOT/VERSION")"
branch_name="engineering-framework/update-v${framework_version}"
work_root="$(mktemp -d "${RUNNER_TEMP:-/tmp}/engineering-framework-publish.XXXXXX")"

cleanup() {
  rm -rf -- "$work_root"
}
trap cleanup EXIT

bot_user="${ENGINEERING_FRAMEWORK_APP_SLUG}[bot]"
bot_user_id="$(gh api "/users/${bot_user}" --jq .id)"
bot_email="${bot_user_id}+${bot_user}@users.noreply.github.com"

gh auth setup-git

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

publish_repository() {
  local repository="$1"
  local auto_merge="$2"
  local repository_name="${repository##*/}"
  local checkout="$work_root/$repository_name"
  local previous_version=""
  local remote_branch_exists="false"
  local pull_request_number

  echo "Publishing Engineering Framework ${framework_version} to ${repository}."
  gh repo clone "$repository" "$checkout" -- --branch main --single-branch

  if git -C "$checkout" ls-remote --exit-code --heads origin "$branch_name" >/dev/null 2>&1; then
    remote_branch_exists="true"
    git -C "$checkout" fetch origin "$branch_name:refs/remotes/origin/$branch_name"
  fi

  if [[ -f "$checkout/FRAMEWORK_VERSION" ]]; then
    previous_version="$(tr -d '[:space:]' < "$checkout/FRAMEWORK_VERSION")"
  fi

  if [[ -n "$previous_version" ]]; then
    if ! is_semver "$previous_version"; then
      echo "Invalid installed FRAMEWORK_VERSION in ${repository}: ${previous_version}" >&2
      return 1
    fi
    if version_is_older_than "$framework_version" "$previous_version"; then
      echo "Refusing to downgrade ${repository} from ${previous_version} to ${framework_version}." >&2
      return 1
    fi
  fi

  git -C "$checkout" checkout -B "$branch_name" origin/main
  node "$ENGINEERING_FRAMEWORK_ROOT/tooling/sync-consumer.mjs" "$checkout"

  git -C "$checkout" config user.name "$bot_user"
  git -C "$checkout" config user.email "$bot_email"
  git -C "$checkout" add -- \
    AGENTS.md \
    FRAMEWORK_VERSION \
    engineering/corporate \
    .agents/skills \
    .claude/skills

  if git -C "$checkout" diff --cached --quiet; then
    echo "${repository} already contains Engineering Framework ${framework_version}."
    return 0
  fi

  git -C "$checkout" commit \
    -m "chore(engineering): actualiza framework a ${framework_version}" \
    -m "- Sincroniza Policies corporativas bajo engineering/corporate
- Instala el mismo catálogo de Skills para Codex y Claude Code
- Actualiza versión y routing corporativo administrado"

  if [[ "$remote_branch_exists" == "true" ]]; then
    git -C "$checkout" push --force-with-lease --set-upstream origin "$branch_name"
  else
    git -C "$checkout" push --set-upstream origin "$branch_name"
  fi

  pull_request_number="$(
    gh pr list \
      --repo "$repository" \
      --base main \
      --head "$branch_name" \
      --state open \
      --json number \
      --jq '.[0].number // empty'
  )"

  if [[ -z "$pull_request_number" ]]; then
    gh pr create \
      --repo "$repository" \
      --base main \
      --head "$branch_name" \
      --title "chore(engineering): actualiza framework a ${framework_version}" \
      --body "Actualización automática de Engineering Framework ${framework_version}.

- Policies corporativas en \`engineering/corporate/\`.
- Skills idénticas en \`.agents/skills/\` y \`.claude/skills/\`.
- Fuente: \`${GITHUB_REPOSITORY}@${GITHUB_SHA}\`.

Este contenido es administrado por \`${bot_user}\`."

    pull_request_number="$(
      gh pr list \
        --repo "$repository" \
        --base main \
        --head "$branch_name" \
        --state open \
        --json number \
        --jq '.[0].number // empty'
    )"
  fi

  if [[ -z "$pull_request_number" ]]; then
    echo "Could not resolve Pull Request for ${repository}." >&2
    return 1
  fi

  if [[ "$auto_merge" == "true" ]]; then
    if [[ -n "$previous_version" ]] &&
       (( 10#${framework_version%%.*} > 10#${previous_version%%.*} )); then
      echo "PR #${pull_request_number} requires manual merge because this is a MAJOR update."
    else
      gh pr merge "$pull_request_number" \
        --repo "$repository" \
        --auto \
        --squash \
        --delete-branch
    fi
  else
    echo "PR #${pull_request_number} remains open because auto_merge is disabled."
  fi
}

while IFS=$'\t' read -r repository auto_merge; do
  [[ -z "$repository" ]] && continue
  publish_repository "$repository" "$auto_merge"
done < "$ENGINEERING_FRAMEWORK_PROJECTS_FILE"
