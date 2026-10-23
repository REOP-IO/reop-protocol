#!/usr/bin/env bash
# Attach the release artefacts of a version to its GitHub Release so a developer can download
# the contract without browsing the tree. Idempotent (--clobber).
#
#   tools/release-assets.sh v1.4.0
#
# Uploads: reop.schema.json, reop-<v>.yaml, reop-<v>-examples.zip, reop-<v>-vocabularies.zip,
# versions.json. Requires the gh CLI authenticated for REOP-IO/reop-protocol and `zip`.
set -euo pipefail

TAG="${1:?usage: tools/release-assets.sh v<version>}"
VERSION="${TAG#v}"
REPO="REOP-IO/reop-protocol"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cd "$ROOT"
test -f "schema/$VERSION/reop.schema.json" || { echo "no schema for $VERSION"; exit 1; }
test -f "specifications/reop-$VERSION.yaml" || { echo "no OpenAPI for $VERSION"; exit 1; }
test -d "examples/$VERSION" || { echo "no examples for $VERSION"; exit 1; }

cp "schema/$VERSION/reop.schema.json" "$WORK/reop.schema.json"
cp "specifications/reop-$VERSION.yaml" "$WORK/reop-$VERSION.yaml"
cp versions.json "$WORK/versions.json"
( cd examples && zip -qr "$WORK/reop-$VERSION-examples.zip" "$VERSION" )
( cd vocabularies && zip -qr "$WORK/reop-$VERSION-vocabularies.zip" . )
( cd "$WORK" && sha256sum reop.schema.json "reop-$VERSION.yaml" versions.json "reop-$VERSION-examples.zip" "reop-$VERSION-vocabularies.zip" > "SHA256SUMS-$VERSION.txt" )

gh release upload "$TAG" --repo "$REPO" --clobber \
  "$WORK/reop.schema.json" "$WORK/reop-$VERSION.yaml" "$WORK/versions.json" \
  "$WORK/reop-$VERSION-examples.zip" "$WORK/reop-$VERSION-vocabularies.zip" "$WORK/SHA256SUMS-$VERSION.txt"
gh release view "$TAG" --repo "$REPO" --json assets --jq '.assets[] | "\(.name)\t\(.size)"'
