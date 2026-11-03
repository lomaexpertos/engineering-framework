#!/usr/bin/env bash
# Shared preflight resolves an already prepared user cache without installing.
harness_sha256() {
  local digest
  if command -v sha256sum >/dev/null 2>&1; then
    digest=$(sha256sum -- "$1") || return 1
  elif command -v shasum >/dev/null 2>&1; then
    digest=$(shasum -a 256 "$1") || return 1
  else
    return 1
  fi
  printf '%s\n' "${digest%% *}"
}

harness_node_directory() {
  local platform architecture
  platform=$(uname -s) || return 1
  architecture=$(uname -m) || return 1
  case "$platform" in Linux) platform=linux ;; Darwin) platform=darwin ;; *) return 1 ;; esac
  case "$architecture" in x86_64 | amd64) architecture=x64 ;; arm64 | aarch64) architecture=arm64 ;; *) return 1 ;; esac
  [[ ${HOME:-} == /* && $HOME != *$'\n'* && $HOME != *$'\r'* ]] || return 1
  printf '%s\n' "$HOME/.engineering-harness/cache/node/24.18.0/$platform-$architecture"
}

harness_node_owned() {
  local metadata owner mode uid
  uid=$(id -u) || return 1
  metadata=$(stat -c '%u %a' -- "$1" 2>/dev/null) || metadata=$(stat -f '%u %Lp' "$1" 2>/dev/null) || return 1
  read -r owner mode <<<"$metadata"
  [[ $owner == "$uid" && $mode =~ ^[0-7]{3,4}$ ]] || return 1
  (((8#$mode & 022) == 0))
}

harness_safe_node_path() {
  local current=$HOME segment
  [[ ! -L $HOME ]] && harness_node_owned "$HOME" || return 1
  for segment in .engineering-harness cache node 24.18.0 "${1##*/}"; do
    current="$current/$segment"
    [[ ! -L $current ]] || return 1
    if [[ -e $current ]]; then [[ -d $current ]] && harness_node_owned "$current" || return 1; fi
  done
  for current in "$1/bin" "$1/bin/node" "$1/node.sha256"; do
    [[ ! -L $current ]] || return 1
    if [[ -e $current ]]; then harness_node_owned "$current" || return 1; fi
  done
}

harness_select_node() {
  local version directory expected actual
  if command -v node >/dev/null 2>&1; then
    version=$(node --version 2>/dev/null) || version=''
    [[ $version =~ ^v(22|24)\.[0-9]+\.[0-9]+$ ]] && return 0
  fi
  directory=$(harness_node_directory) || return 1
  harness_safe_node_path "$directory" || return 1
  [[ -f $directory/bin/node && -x $directory/bin/node && -f $directory/node.sha256 ]] || return 1
  IFS= read -r expected <"$directory/node.sha256" || return 1
  [[ $expected =~ ^[a-f0-9]{64}$ ]] || return 1
  actual=$(harness_sha256 "$directory/bin/node") || return 1
  [[ $actual == "$expected" ]] || return 1
  version=$("$directory/bin/node" --version 2>/dev/null) || return 1
  [[ $version == v24.18.0 ]] || return 1
  export PATH="$directory/bin:$PATH"
}

harness_require_tools() {
  local tool missing=0
  for tool in "$@"; do
    if [[ $tool == node ]]; then harness_select_node >/dev/null 2>&1 || true; fi
    if ! command -v "$tool" >/dev/null 2>&1; then
      printf 'Harness prerequisite missing: %s. Run bash .harness/setup.sh to prepare harness tools; base OS tools must be available.\n' "$tool" >&2
      missing=1
    fi
  done
  [[ $missing == 0 ]]
}

harness_require_node() {
  if harness_select_node; then return 0; fi
  local version=missing
  if command -v node >/dev/null 2>&1; then version=$(node --version 2>/dev/null) || version=unknown; fi
  printf 'Harness requires Node.js 22.x or 24.x; found %s. Run bash .harness/setup.sh to prepare a supported installation.\n' "$version" >&2
  return 2
}
