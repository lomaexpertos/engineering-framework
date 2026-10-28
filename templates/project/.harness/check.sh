#!/usr/bin/env bash
set -euo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
if [[ "$root" == *','* ]]; then
  printf '%s\n' 'Repository path contains a comma unsupported by Docker bind mounts.' >&2
  exit 2
fi
command -v timeout >/dev/null || {
  printf '%s\n' 'The shared host utility timeout is required.' >&2
  exit 2
}
arguments=("$@")
selection=()
while (($#)); do
  case "$1" in
    --scope)
      [[ $# -ge 2 && -n "$2" && "$2" != --* ]] || {
        printf '%s\n' '--scope requires a value' >&2
        exit 2
      }
      selection=(--scope "$2")
      shift 2
      ;;
    --json) shift ;;
    *)
      printf 'Unknown option: %s\n' "$1" >&2
      exit 2
      ;;
  esac
done
image=$(docker build -q "$root/.harness/core/runtime")
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
docker run --rm --network none --user "$(id -u):$(id -g)" \
  --mount "type=bind,src=$root,dst=/consumer,readonly" "$image" \
  node /runtime/tooling/harness-runner-plan.mjs plan --root /consumer "${selection[@]}" >"$temporary/plan"
: >"$temporary/ledger"
exec 3<"$temporary/plan"
IFS= read -r -d '' config_sha <&3
while IFS= read -r -d '' check_id <&3; do
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
docker run --rm --network none --user "$(id -u):$(id -g)" \
  --mount "type=bind,src=$root,dst=/consumer,readonly" \
  --mount "type=bind,src=$temporary,dst=/results" "$image" \
  node /runtime/tooling/harness-runner-plan.mjs results --root /consumer "${selection[@]}" \
  --config-sha "$config_sha" \
  --ledger /results/ledger --destination /results/results.json
docker run --rm --network none --user "$(id -u):$(id -g)" \
  --mount "type=bind,src=$root,dst=/consumer,readonly" \
  --mount "type=bind,src=$temporary,dst=/results,readonly" "$image" \
  node /runtime/tooling/harness-check.mjs --root /consumer --results /results/results.json "${arguments[@]}"
