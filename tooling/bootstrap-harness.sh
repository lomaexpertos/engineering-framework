#!/usr/bin/env bash
set -euo pipefail
# A standalone bootstrap has no shared helper until the snapshot is downloaded.
for tool in bash git node mktemp rm dirname; do
  command -v "$tool" >/dev/null 2>&1 || {
    printf 'Harness bootstrap prerequisite missing: %s. Install it explicitly before retrying.\n' "$tool" >&2
    exit 2
  }
done
node_version=$(node --version 2>/dev/null) || {
  printf '%s\n' 'Harness bootstrap could not determine Node.js version; supported majors are 22 and 24.' >&2
  exit 2
}
if [[ ! $node_version =~ ^v(22|24)\.[0-9]+\.[0-9]+$ ]]; then
  printf 'Harness bootstrap requires Node.js 22.x or 24.x; found %s. Select a supported installation before retrying.\n' "$node_version" >&2
  exit 2
fi
consumer_path=.
if (($#)) && [[ $1 != --* ]]; then
  consumer_path=$1
  shift
fi
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
consumer=$(git -C "$consumer_path" rev-parse --show-toplevel)
temporary=$(mktemp -d -t engineering-harness-bootstrap.XXXXXXXX)
trap 'rm -rf -- "$temporary"' EXIT
git init -q "$temporary/source"
git -C "$temporary/source" remote add origin https://github.com/lomaexpertos/engineering-framework.git
git -C "$temporary/source" fetch --depth 1 origin "$ref"
sha=$(git -C "$temporary/source" rev-parse --verify FETCH_HEAD)
git -C "$temporary/source" checkout -q --detach "$sha"
if [[ ! -f $temporary/source/templates/project/.harness/environment.sh ]]; then
  printf '%s\n' 'Downloaded snapshot lacks the native harness environment helper. Use a published revision supporting native execution.' >&2
  exit 2
fi
# shellcheck source=templates/project/.harness/environment.sh
source "$temporary/source/templates/project/.harness/environment.sh"
harness_require_tools bash git mktemp rm || exit 2
harness_require_node || exit 2
HARNESS_CONSUMER_ROOT=$consumer bash "$temporary/source/templates/project/.harness/update.sh" --ref "$sha" "${args[@]}"
