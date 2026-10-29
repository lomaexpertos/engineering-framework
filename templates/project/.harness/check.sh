#!/usr/bin/env bash
set -euo pipefail
if [[ $# -eq 1 && ($1 == --help || $1 == -h) ]]; then
  cat <<'HELP'
Usage: bash .harness/check.sh [--scope NAME] [--json]
Built-in scopes: context, documentation, installation, work, extensions, security, deployment, secrets.
Project scopes/runners: .harness/project/config.json.
Built-ins use native Node; security needs Gitleaks and encrypted dotenv needs SOPS.
Declared application checks use Docker and GNU timeout.
Guide: .harness/core/checks/repository-compliance/operations.md
Exit: 0 passed, 1 violations, 2 configuration/execution error.
HELP
  exit 0
fi
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
# shellcheck source=templates/project/.harness/environment.sh
source "$root/.harness/environment.sh"
harness_require_tools bash git mktemp rm cat basename || exit 2
harness_require_node || exit 2
arguments=("$@")
selection=()
json_seen=false
while (($#)); do
  case "$1" in
    --scope)
      if ((${#selection[@]})); then
        printf '%s\n' 'Duplicate --scope' >&2
        exit 2
      fi
      [[ $# -ge 2 && -n "$2" && "$2" != --* ]] || {
        printf '%s\n' '--scope requires a value' >&2
        exit 2
      }
      selection=(--scope "$2")
      shift 2
      ;;
    --json)
      if [[ $json_seen == true ]]; then
        printf '%s\n' 'Duplicate --json' >&2
        exit 2
      fi
      json_seen=true
      shift
      ;;
    *)
      printf 'Unknown option: %s\n' "$1" >&2
      exit 2
      ;;
  esac
done
temporary=$(mktemp -d -t harness-check.XXXXXXXX)
operation=$(basename -- "$temporary")
active_name=''
cleanup_container() {
  if [[ -n "$active_name" ]] && [[ "$(docker inspect --format '{{ index .Config.Labels "harness.check-operation" }}' "$active_name" 2>/dev/null || true)" == "$operation" ]]; then
    docker rm -f "$active_name" >/dev/null 2>&1 || true
  fi
  active_name=''
}
cleanup() {
  cleanup_container
  rm -rf -- "$temporary"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
node "$root/.harness/core/runtime/tooling/harness-runner-plan.mjs" plan --root "$root" "${selection[@]}" >"$temporary/plan"
: >"$temporary/ledger"
exec 3<"$temporary/plan"
IFS= read -r -d '' config_sha <&3
while IFS= read -r -d '' check_id <&3; do
  if [[ -z ${runner_ready:-} ]]; then
    harness_require_tools docker timeout id || exit 2
    if [[ $(timeout --version 2>/dev/null) != *'GNU coreutils'* ]]; then
      printf '%s\n' 'Harness project checks require GNU timeout. Install GNU coreutils before retrying.' >&2
      exit 2
    fi
    if [[ $root == *','* ]]; then
      printf '%s\n' 'Repository path contains a comma unsupported by Docker bind mounts.' >&2
      exit 2
    fi
    runner_ready=1
  fi
  IFS= read -r -d '' runner_image <&3
  IFS= read -r -d '' duration <&3
  IFS= read -r -d '' count <&3
  argv=()
  for ((index = 0; index < count; index++)); do
    IFS= read -r -d '' argument <&3
    argv+=("$argument")
  done
  active_name="$operation-$check_id"
  printf 'Running check %s in %s\n' "$check_id" "$runner_image" >&2
  result=0
  timeout --signal=TERM --kill-after=10 "$duration" \
    docker run --rm --name "$active_name" --label "harness.check-operation=$operation" \
    --network none --user "$(id -u):$(id -g)" \
    --mount "type=bind,src=$root,dst=/workspace,readonly" --workdir /workspace \
    --entrypoint "${argv[0]}" "$runner_image" "${argv[@]:1}" >"$temporary/$check_id.log" 2>&1 || result=$?
  cleanup_container
  cat -- "$temporary/$check_id.log" >&2
  printf '%s\0%s\0' "$check_id" "$result" >>"$temporary/ledger"
done
exec 3<&-
node "$root/.harness/core/runtime/tooling/harness-runner-plan.mjs" results --root "$root" "${selection[@]}" \
  --config-sha "$config_sha" \
  --ledger "$temporary/ledger" --destination "$temporary/results.json"
node "$root/.harness/core/runtime/tooling/harness-check.mjs" --root "$root" --results "$temporary/results.json" "${arguments[@]}"
