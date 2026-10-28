#!/usr/bin/env bash
set -euo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
# shellcheck source=templates/project/.harness/environment.sh
source "$root/.harness/environment.sh"
harness_require_tools bash git || exit 2
harness_require_node || exit 2
exec node "$root/.harness/core/runtime/tooling/harness-work.mjs" --root "$root" "$@"
