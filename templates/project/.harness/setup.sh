#!/usr/bin/env bash
set -euo pipefail
mode=--install
json=false
while (($#)); do
  case "$1" in
    --help | -h)
      cat <<'HELP'
Usage: bash .harness/setup.sh [--check] [--json]
Prepare Node (when missing), Gitleaks and SOPS in a private versioned user cache.
--check diagnoses without downloading, creating directories or changing profiles.
Base prerequisites: Bash, Git; download requires curl, tar and SHA256 utility.
Checks and wrappers resolve prepared tools automatically; no manual PATH changes.
HELP
      exit 0
      ;;
    --check)
      [[ $mode != --check ]] || exit 2
      mode=--check
      ;;
    --json)
      [[ $json == false ]] || exit 2
      json=true
      ;;
    *)
      printf '%s\n' 'Unknown setup option; use --help.' >&2
      exit 2
      ;;
  esac
  shift
done
location=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
# shellcheck source=templates/project/.harness/environment.sh
source "$location/environment.sh"
if [[ -f $location/core/runtime/tooling/harness-setup.mjs ]]; then
  runtime="$location/core/runtime/tooling/harness-setup.mjs"
else
  runtime="$location/../../../tooling/harness-setup.mjs"
fi
harness_require_tools bash git || exit 2
bootstrap_node() (
  umask 077
  local directory parent temporary='' locked=false archive artifact expected actual
  harness_require_tools curl tar mkdir mktemp rm mv chmod uname rmdir stat id || exit 2
  directory=$(harness_node_directory) || {
    printf '%s\n' 'Node setup supports Linux/macOS x64/arm64 and an absolute HOME.' >&2
    exit 2
  }
  harness_safe_node_path "$directory" || {
    printf '%s\n' 'Unsafe Node cache path; symbolic links are not allowed.' >&2
    exit 2
  }
  parent=${directory%/*}
  mkdir -p -- "$parent"
  cleanup() {
    if [[ -n $temporary ]]; then rm -rf -- "$temporary"; fi
    if [[ $locked == true ]]; then rmdir -- "$directory.lock"; fi
  }
  trap cleanup EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  mkdir -- "$directory.lock" 2>/dev/null || {
    printf '%s\n' 'Node setup is locked; inspect its owner before retrying.' >&2
    exit 2
  }
  locked=true
  # Existing unknown/corrupt content is retained for inspection, never replaced.
  [[ ! -e $directory ]] || {
    printf '%s\n' 'Node cache exists but is unusable; inspect it before retrying.' >&2
    exit 2
  }
  case "${directory##*/}" in
    linux-x64) expected=783130984963db7ba9cbd01089eaf2c2efb055c7c1693c943174b967b3050cb8 ;;
    linux-arm64) expected=6b4484c2190274175df9aa8f28e2d758a819cb1c1fe6ab481e2f95b463ab8508 ;;
    darwin-x64) expected=dfd0dbd3e721503434df7b7205e719f61b3a3a31b2bcf9729b8b91fea240f080 ;;
    darwin-arm64) expected=e1a97e14c99c803e96c7339403282ea05a499c32f8d83defe9ef5ec66f979ed1 ;;
  esac
  artifact="node-v24.18.0-${directory##*/}"
  temporary=$(mktemp -d "$parent/.node-setup.XXXXXXXX")
  archive="$temporary/download.tar.gz"
  printf '%s\n' 'Preparing Node.js 24.18.0 for harness infrastructure in the user cache.' >&2
  curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' --max-time 180 --output "$archive" "https://nodejs.org/dist/v24.18.0/$artifact.tar.gz"
  actual=$(harness_sha256 "$archive") || {
    printf '%s\n' 'A SHA256 utility (sha256sum or shasum) is required.' >&2
    exit 2
  }
  [[ $actual == "$expected" ]] || {
    printf '%s\n' 'Node archive checksum mismatch; no executable was installed.' >&2
    exit 2
  }
  mkdir -- "$temporary/bin"
  tar -xzOf "$archive" "$artifact/bin/node" >"$temporary/bin/node"
  chmod 755 "$temporary/bin/node"
  harness_sha256 "$temporary/bin/node" >"$temporary/node.sha256"
  [[ $("$temporary/bin/node" --version) == v24.18.0 ]] || {
    printf '%s\n' 'Downloaded Node executable could not run on this OS.' >&2
    exit 2
  }
  rm -- "$archive"
  mv -- "$temporary" "$directory"
  temporary=''
)
if ! harness_select_node; then
  if [[ $mode == --check ]]; then
    if [[ $json == true ]]; then
      printf '%s\n' '{"schema_version":1,"ok":false,"message":"Compatible Node unavailable; run setup without --check."}'
    else
      harness_require_node
    fi
    exit 2
  fi
  bootstrap_node
  harness_require_node || exit 2
fi
arguments=("$mode")
if [[ $json == true ]]; then arguments+=(--json); fi
exec node "$runtime" "${arguments[@]}"
