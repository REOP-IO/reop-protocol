#!/usr/bin/env node
/** Structural checks on vocabularies/*.json: unique keys, labels present, closed enums match the schema. */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const versions = JSON.parse(readFileSync(join(root, 'versions.json'), 'utf8'));
const current = versions.versions.find((v) => v.version === versions.current);
const schema = JSON.parse(readFileSync(join(root, current.schema), 'utf8'));
const dir = join(root, 'vocabularies');

const enumOf = (def) => schema.$defs[def]?.enum ?? null;
const SCHEMA_ENUMS = {
  amenities: enumOf('AmenityKey'),
  views: enumOf('View'),
  orientations: enumOf('Orientation'),
  projectTypes: enumOf('ProjectType'),
  projectStatusStates: enumOf('ProjectState'),
  amenityCosts: enumOf('AmenityCost'),
  unitStatuses: enumOf('UnitStatus'),
  unitAvailability: enumOf('Availability'),
  mediaTypes: enumOf('MediaType'),
};

let problems = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const vocab = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  const name = file.replace(/\.json$/, '');
  const say = (msg) => { problems += 1; console.log(`${file}: ${msg}`); };
  if (vocab.name !== name) say(`name ${vocab.name} does not match file name`);
  if (vocab.protocolVersion !== versions.current) say(`protocolVersion ${vocab.protocolVersion} is not ${versions.current}`);
  if (!Array.isArray(vocab.items) || vocab.items.length === 0) { say('no items'); continue; }
  const keys = vocab.items.map((i) => i.key);
  const dup = keys.find((k, i) => keys.indexOf(k) !== i);
  if (dup) say(`duplicate key ${dup}`);
  for (const item of vocab.items) {
    if (!item.key) say('item without key');
    if (!item.labels || !item.labels.en) say(`item ${item.key} has no English label`);
  }
  const expected = SCHEMA_ENUMS[name];
  if (expected) {
    const missing = expected.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !expected.includes(k));
    if (missing.length) say(`schema enum values missing from vocabulary: ${missing.join(', ')}`);
    if (extra.length) say(`vocabulary keys not in the schema enum: ${extra.join(', ')}`);
  }
}
console.log(problems ? `${problems} problem(s)` : 'vocabularies ok');
process.exit(problems ? 1 : 0);
