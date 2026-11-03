#!/usr/bin/env bash
set -euo pipefail
if [[ $# -eq 1 && ($1 == --help || $1 == -h) ]]; then
  cat <<'HELP'
Usage: bash .harness/update.sh [--ref REF] [--check] [--allow-major] [--repair] [--recover]
Default source: public harness repository, ref main. A branch/tag/full SHA can be selected.
--check previews without updating the consumer. --allow-major accepts a reviewed migration.
--repair accepts reviewed managed-file divergence; it does not grant ownership of local files.
--recover restores this updater's interrupted transaction when subsequent edits permit it.
Inspect live workers, local changes and locks first; never delete unknown locks to force progress.
Guide: .harness/README.md. Updates preserve project extensions and personal profiles.
HELP
  exit 0
fi
wrapper_directory=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
# shellcheck source=templates/project/.harness/environment.sh
source "$wrapper_directory/environment.sh"
harness_require_tools bash git mktemp rm || exit 2
harness_require_node || exit 2
root=${HARNESS_CONSUMER_ROOT:-$(cd -- "$wrapper_directory/.." && pwd -P)}
root=$(git -C "$root" rev-parse --show-toplevel)
ref=main
args=()
ref_seen=false
while (($#)); do
  case "$1" in
    --ref)
      if [[ $ref_seen == true ]]; then
        printf '%s\n' 'Duplicate --ref' >&2
        exit 2
      fi
      ref_seen=true
      [[ $# -ge 2 ]] || {
        echo 'missing --ref value' >&2
        exit 2
      }
      ref=$2
      shift 2
      ;;
    --check | --allow-major | --recover | --repair)
      for previous in "${args[@]}"; do
        if [[ $previous == "$1" ]]; then
          printf 'Duplicate option: %s\n' "$1" >&2
          exit 2
        fi
      done
      args+=("$1")
      shift
      ;;
    *)
      echo "unknown option: $1" >&2
      exit 2
      ;;
  esac
done
[[ $ref != -* && $ref != *:* && $ref != *..* ]] || {
  echo 'unsafe source reference' >&2
  exit 2
}
temporary=$(mktemp -d -t engineering-harness-update.XXXXXXXX)
trap 'rm -rf -- "$temporary"' EXIT
git init -q "$temporary/source"
git -C "$temporary/source" remote add origin https://github.com/lomaexpertos/engineering-framework.git
git -C "$temporary/source" fetch --depth 1 origin "$ref"
sha=$(git -C "$temporary/source" rev-parse --verify FETCH_HEAD)
git -C "$temporary/source" checkout -q --detach "$sha"
(
  cd -- "$temporary/source"
  node tooling/validate-framework.mjs
  GITHUB_REPOSITORY=lomaexpertos/engineering-framework GITHUB_SHA=$sha \
    node tooling/sync-consumer.mjs "${args[@]}" "$root"
)
