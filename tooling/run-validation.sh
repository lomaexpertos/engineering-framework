#!/usr/bin/env bash
set -euo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
# shellcheck source=/dev/null
source "$root/templates/project/.harness/environment.sh"
harness_require_tools node bash git || exit 2
harness_require_node || exit 2
with_lint=false
if [[ ${1:-} == --with-lint ]]; then
  with_lint=true
  shift
fi
if (($#)); then
  printf '%s\n' 'Usage: bash tooling/run-validation.sh [--with-lint]' >&2
  exit 2
fi
if [[ $with_lint == true ]]; then harness_require_tools shellcheck shfmt || exit 2; fi
cd -- "$root"
node tooling/validate-framework.mjs
if [[ $with_lint == true ]]; then node tooling/lint-source.mjs; fi
for suite in distribution publication harness-work harness-check harness-runner harness-profiles harness-pilot native-runtime agent-profiles agent-execution agent-integration agent-cli agent-discovery harness-usage guide-check agent-tracks proportional-delivery domain-documentation monorepo-guides deployment-contract secret-contract secret-scan assurance harness-setup setup-bootstrap setup-integration; do
  node "tooling/test-$suite.mjs"
done
