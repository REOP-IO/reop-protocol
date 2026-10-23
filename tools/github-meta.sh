#!/usr/bin/env bash
# Keep the GitHub repository metadata in step with versions.json (description names the current
# version; topics and homepage are constant). Idempotent; run after every release.
#
#   tools/github-meta.sh
#
# Requires the gh CLI with admin rights on REOP-IO/reop-protocol.
set -euo pipefail

REPO="REOP-IO/reop-protocol"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CURRENT="$(grep -m1 '"current"' "$ROOT/versions.json" | sed -E 's/.*"current": *"([^"]+)".*//')"
test -n "$CURRENT" || { echo "could not read current from versions.json"; exit 1; }

DESCRIPTION="The Real Estate Open Protocol (REOP): an open, vendor-neutral JSON standard for new-development real estate data, from developer systems to marketplaces and AI agents. Current version: $CURRENT."

gh repo edit "$REPO" \
  --description "$DESCRIPTION" \
  --homepage "https://reop.io" \
  --enable-discussions \
  --add-topic real-estate \
  --add-topic proptech \
  --add-topic open-standard \
  --add-topic json-schema \
  --add-topic openapi \
  --add-topic data-protocol \
  --add-topic new-development \
  --add-topic reop

gh api "repos/$REPO" --jq '{description, homepage, topics, has_discussions}'
