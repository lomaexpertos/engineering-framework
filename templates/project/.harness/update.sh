#!/usr/bin/env bash
set -euo pipefail
root=${HARNESS_CONSUMER_ROOT:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)}
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
image="engineering-harness-update:$sha"
docker build --target validation -q -t "$image" "$temporary/source" >/dev/null
docker run --rm --network none "$image" node tooling/validate-framework.mjs
mounts=(--mount "type=bind,src=$root,dst=/consumer")
git_dir=$(git -C "$root" rev-parse --absolute-git-dir)
common_dir=$(git -C "$root" rev-parse --path-format=absolute --git-common-dir)
if [[ -f $root/.git ]]; then
  mounts+=(--mount "type=bind,src=$git_dir,dst=$git_dir,readonly")
  if [[ $common_dir != "$git_dir" ]]; then mounts+=(--mount "type=bind,src=$common_dir,dst=$common_dir,readonly"); fi
fi
docker run --rm --network none --user "$(id -u):$(id -g)" "${mounts[@]}" -e GITHUB_REPOSITORY=lomaexpertos/engineering-framework -e "GITHUB_SHA=$sha" "$image" node tooling/sync-consumer.mjs "${args[@]}" /consumer
