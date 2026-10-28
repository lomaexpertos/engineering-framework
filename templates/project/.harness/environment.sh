#!/usr/bin/env bash
# Shared preflight for harness infrastructure; never installs dependencies.
harness_require_tools() {
  local tool missing=0
  for tool in "$@"; do
    if ! command -v "$tool" >/dev/null 2>&1; then
      printf 'Harness prerequisite missing: %s. Install it explicitly before retrying.\n' "$tool" >&2
      missing=1
    fi
  done
  [[ $missing == 0 ]]
}

harness_require_node() {
  harness_require_tools node || return 2
  local version
  version=$(node --version 2>/dev/null) || {
    printf '%s\n' 'Harness could not determine Node.js version; supported majors are 22 and 24.' >&2
    return 2
  }
  if [[ ! $version =~ ^v(22|24)\.[0-9]+\.[0-9]+$ ]]; then
    printf 'Harness requires Node.js 22.x or 24.x; found %s. Select a supported installation before retrying.\n' "$version" >&2
    return 2
  fi
}
