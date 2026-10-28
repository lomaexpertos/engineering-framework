#!/usr/bin/env bash
set -euo pipefail
wrapper_directory=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
# shellcheck source=templates/project/.harness/environment.sh
source "$wrapper_directory/environment.sh"
harness_require_tools bash git mktemp rm || exit 2
harness_require_node || exit 2
root=${HARNESS_CONSUMER_ROOT:-$(cd -- "$wrapper_directory/.." && pwd -P)}
root=$(git -C "$root" rev-parse --show-toplevel)
ref=main
args=()
while (($#)); do
  case "$1" in
    --ref)
      [[ $# -ge 2 ]] || {
        echo 'missing --ref value' >&2
        exit 2
      }
      ref=$2
      shift 2
      ;;
    --check | --allow-major | --recover | --repair)
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
