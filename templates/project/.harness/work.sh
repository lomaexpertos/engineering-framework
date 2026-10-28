#!/usr/bin/env bash
set -euo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
image="engineering-harness-work:$(git -C "$root" hash-object "$root/.harness/core/runtime/Dockerfile")"
docker build -q -t "$image" "$root/.harness/core/runtime" >/dev/null
mounts=(--mount "type=bind,src=$root,dst=/consumer")
if [[ -f $root/.git ]]; then
  git_dir=$(git -C "$root" rev-parse --absolute-git-dir)
  common_dir=$(git -C "$root" rev-parse --path-format=absolute --git-common-dir)
  mounts+=(--mount "type=bind,src=$git_dir,dst=$git_dir,readonly")
  if [[ $common_dir != "$git_dir" ]]; then mounts+=(--mount "type=bind,src=$common_dir,dst=$common_dir,readonly"); fi
fi
docker run --rm --network none --user "$(id -u):$(id -g)" "${mounts[@]}" "$image" node /runtime/tooling/harness-work.mjs --root /consumer "$@"
