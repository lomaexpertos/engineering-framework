#!/usr/bin/env bash
set -euo pipefail
consumer=$(git -C "${1:-.}" rev-parse --show-toplevel)
if (($#)); then shift; fi
temporary=$(mktemp -d -t engineering-harness-bootstrap.XXXXXXXX)
trap 'rm -rf -- "$temporary"' EXIT
git init -q "$temporary/source"
git -C "$temporary/source" remote add origin https://github.com/lomaexpertos/engineering-framework.git
git -C "$temporary/source" fetch --depth 1 origin main
sha=$(git -C "$temporary/source" rev-parse --verify FETCH_HEAD)
git -C "$temporary/source" checkout -q --detach "$sha"
HARNESS_CONSUMER_ROOT=$consumer bash "$temporary/source/templates/project/.harness/update.sh" --ref "$sha" "$@"
