#!/usr/bin/env node
/**
 * Builds specifications/reop-<version>.yaml from the canonical JSON Schema and the OpenAPI
 * template (info + paths). The YAML is a generated artefact committed for Redoc and for
 * consumers who prefer OpenAPI; the JSON Schema is the single source of truth.
 *
 *   node tools/build-openapi.mjs            rewrite the YAML for the current version
 *   node tools/build-openapi.mjs --check    exit 1 when the committed YAML is out of date
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const versions = JSON.parse(readFileSync(join(root, 'versions.json'), 'utf8'));
const current = versions.versions.find((v) => v.version === versions.current);
const schema = JSON.parse(readFileSync(join(root, current.schema), 'utf8'));
const template = YAML.parse(readFileSync(join(root, 'specifications', `openapi-${current.version}.template.yaml`), 'utf8'));

/** Rewrite `#/$defs/X` references to OpenAPI component references and drop keywords OpenAPI tools dislike. */
function convert(node) {
  if (Array.isArray(node)) return node.map(convert);
  if (node && typeof node === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') {
        out.$ref = value.replace('#/$defs/', '#/components/schemas/');
      } else if (key === '$schema' || key === '$id') {
        continue;
      } else {
        out[key] = convert(value);
      }
    }
    return out;
  }
  return node;
}

const components = convert(schema.$defs);
const doc = {
  openapi: '3.1.0',
  info: { ...template.info, version: current.version },
  ...(template.servers ? { servers: template.servers } : {}),
  ...(template.tags ? { tags: template.tags } : {}),
  paths: template.paths ?? {},
  components: { ...(template.components ?? {}), schemas: components },
};
const header = `# GENERATED FILE - do not edit by hand.\n# Source: ${current.schema} (canonical JSON Schema) + specifications/openapi-${current.version}.template.yaml\n# Rebuild: npm run build:openapi\n`;
const yaml = header + YAML.stringify(doc, { lineWidth: 0 });
const target = join(root, current.openapi);

if (process.argv.includes('--check')) {
  const existing = readFileSync(target, 'utf8');
  if (existing !== yaml) {
    console.error(`${current.openapi} is out of date; run npm run build:openapi`);
    process.exit(1);
  }
  console.log(`${current.openapi} is up to date`);
} else {
  writeFileSync(target, yaml);
  console.log(`wrote ${current.openapi} (${Object.keys(components).length} schemas)`);
}
