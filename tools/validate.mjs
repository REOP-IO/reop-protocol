#!/usr/bin/env node
/**
 * REOP validation tool.
 *
 *   node tools/validate.mjs                 validate every example of every version in versions.json
 *   node tools/validate.mjs <file.json>     validate one document (version taken from protocol.version)
 *   node tools/validate.mjs --version 1.4.0 <file.json>
 *
 * Exit code 1 on any failure. Draft 2020-12 schemas (1.4.0+) use Ajv2020; the frozen 1.2.0 / 1.3.0
 * draft-07 schemas use the default Ajv so they keep validating their own examples.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const versions = JSON.parse(readFileSync(join(root, 'versions.json'), 'utf8'));

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function compilerFor(schema) {
  const is2020 = typeof schema.$schema === 'string' && schema.$schema.includes('2020-12');
  const ajv = is2020
    ? new Ajv2020({ allErrors: true, strict: false, allowUnionTypes: true })
    : new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
  addFormats(ajv);
  ajv.addKeyword('x-replacedBy');
  ajv.addKeyword('x-applicable');
  ajv.addKeyword('x-deprecatedHere');
  return ajv.compile(schema);
}

function versionEntry(version) {
  const entry = versions.versions.find((v) => v.version === version);
  if (!entry) throw new Error(`Unknown version ${version}; known: ${versions.versions.map((v) => v.version).join(', ')}`);
  return entry;
}

const validators = new Map();
function validatorFor(version) {
  if (!validators.has(version)) {
    const entry = versionEntry(version);
    if (!entry.schema) throw new Error(`Version ${version} has no JSON schema to validate against`);
    validators.set(version, compilerFor(readJson(join(root, entry.schema))));
  }
  return validators.get(version);
}

function detectVersion(doc) {
  return doc && doc.protocol && typeof doc.protocol.version === 'string' ? doc.protocol.version : null;
}

/** Integrity rules the schema language cannot express (inventory links, unique ids). */
function semanticChecks(doc) {
  const problems = [];
  const projects = doc.projects ?? (doc.project ? [doc.project] : []);
  for (const project of projects) {
    const modelIds = new Set((project.unitModels ?? []).map((u) => u.id));
    const buildingIds = new Set((project.buildings ?? []).map((b) => b.id));
    const floorIds = new Set((project.buildings ?? []).flatMap((b) => (b.floors ?? []).map((f) => f.id).filter(Boolean)));
    const seen = new Set();
    for (const unit of project.inventory ?? []) {
      if (seen.has(unit.id)) problems.push(`project ${project.id}: duplicate inventory id ${unit.id}`);
      seen.add(unit.id);
      if (!modelIds.has(unit.links?.modelId)) problems.push(`project ${project.id}: unit ${unit.id} links.modelId ${unit.links?.modelId} is not a unitModels[].id`);
      if (unit.links?.buildingId && !buildingIds.has(unit.links.buildingId)) problems.push(`project ${project.id}: unit ${unit.id} links.buildingId ${unit.links.buildingId} is not a buildings[].id`);
      if (unit.links?.floorId && !floorIds.has(unit.links.floorId)) problems.push(`project ${project.id}: unit ${unit.id} links.floorId ${unit.links.floorId} is not a floors[].id`);
    }
    for (const [label, list] of [['unitModels', project.unitModels], ['buildings', project.buildings], ['interests', project.interests]]) {
      const ids = (list ?? []).map((x) => x.id).filter(Boolean);
      const dup = ids.find((id, i) => ids.indexOf(id) !== i);
      if (dup) problems.push(`project ${project.id}: duplicate ${label} id ${dup}`);
    }
  }
  if (Array.isArray(doc.developers) && Array.isArray(doc.projects)) {
    const devIds = new Set(doc.developers.map((d) => d.id));
    for (const project of doc.projects) {
      for (const id of project.developerIds ?? []) {
        if (!devIds.has(id)) problems.push(`project ${project.id}: developerIds ${id} is not a developers[].id`);
      }
    }
  }
  return problems;
}

function validateFile(path, forcedVersion) {
  const doc = readJson(path);
  const version = forcedVersion ?? detectVersion(doc);
  if (!version) return { ok: false, errors: ['no protocol.version in document and no --version given'] };
  const validate = validatorFor(version);
  const ok = validate(doc);
  const errors = ok ? [] : validate.errors.map((e) => `${e.instancePath || '/'} ${e.message}${e.params && e.params.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : ''}`);
  const semantic = version >= '1.4.0' ? semanticChecks(doc) : [];
  return { ok: ok && semantic.length === 0, version, errors: [...errors, ...semantic] };
}

/** Every example of every version; files under an `invalid/` folder are expected to FAIL. */
function listExamples() {
  const out = [];
  for (const entry of versions.versions) {
    if (!entry.schema || !entry.examples) continue;
    const dir = join(root, entry.examples);
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isFile() && name.endsWith('.json')) out.push({ path: p, version: entry.version, expectValid: true });
    }
    const invalidDir = join(dir, 'invalid');
    try {
      for (const name of readdirSync(invalidDir)) {
        const p = join(invalidDir, name);
        if (statSync(p).isFile() && name.endsWith('.json')) out.push({ path: p, version: entry.version, expectValid: false });
      }
    } catch {
      // no invalid/ folder for this version
    }
  }
  return out;
}

const args = process.argv.slice(2);
let forced = null;
const files = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--version') forced = args[++i];
  else files.push(args[i]);
}

let failed = 0;
const targets = files.length ? files.map((f) => ({ path: resolve(f), version: forced, expectValid: true })) : listExamples();
for (const t of targets) {
  const result = validateFile(t.path, t.version);
  const rel = t.path.replace(root, '').replace(/\\/g, '/');
  if (result.ok === t.expectValid) {
    console.log(`ok   ${rel} (${result.version})${t.expectValid ? '' : ' rejected as expected'}`);
  } else {
    failed += 1;
    console.log(`FAIL ${rel}${result.version ? ` (${result.version})` : ''}${t.expectValid ? '' : ' was accepted but must be rejected'}`);
    for (const e of result.errors) console.log(`     ${e}`);
  }
}
console.log(failed ? `\n${failed} file(s) failed` : `\nall ${targets.length} file(s) valid`);
process.exit(failed ? 1 : 0);
