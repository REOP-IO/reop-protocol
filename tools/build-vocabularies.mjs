#!/usr/bin/env node
/**
 * Generates vocabularies/*.json.
 *
 *   node tools/build-vocabularies.mjs <path/to/dictionary.json>
 *
 * The dictionary (the REOP app's `backend/src/meta/dictionary.json`) supplies the bilingual labels
 * of the 1.3.0 enums (amenities, interests, views, orientations, project types, states, costs,
 * availability, currencies). The recommended lists introduced in 1.4.0 (media types, document
 * roles, experience types and providers, payment phases, unit statuses, room-count conventions)
 * are defined here. Every file carries `protocolVersion` and a `version` date.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const versions = JSON.parse(readFileSync(join(root, 'versions.json'), 'utf8'));
const PROTOCOL_VERSION = versions.current;
const dictionaryPath = process.argv[2];
if (!dictionaryPath) {
  console.error('usage: node tools/build-vocabularies.mjs <dictionary.json>');
  process.exit(2);
}
const dictionary = JSON.parse(readFileSync(resolve(dictionaryPath), 'utf8'));
const VERSION = dictionary.version ?? new Date().toISOString().slice(0, 10);
const outDir = join(root, 'vocabularies');
mkdirSync(outDir, { recursive: true });

function write(name, description, items, { closed = false, head = {} } = {}) {
  const body = { name, protocolVersion: PROTOCOL_VERSION, version: VERSION, description, closed, ...head, items };
  writeFileSync(join(outDir, `${name}.json`), `${JSON.stringify(body, null, 2)}\n`);
}
const fromDictionary = (list) => list.map(({ id, en, he, category }) => ({ key: id, labels: { en, he }, ...(category ? { category } : {}) }));
const simple = (rows) => rows.map(([key, en, he]) => ({ key, labels: he ? { en, he } : { en } }));

write('amenities', 'Amenity keys (AmenityEnum of 1.3.0, unchanged) with bilingual labels and a category. A custom amenity uses a key outside this list and carries a label in the document.', fromDictionary(dictionary.amenities));
write('interests', 'Point-of-interest types (InterestEnum of 1.3.0, unchanged). Recommended values; other types are allowed.', fromDictionary(dictionary.interests));
write('views', 'Unit view values (ViewEnum of 1.3.0, unchanged).', fromDictionary(dictionary.views), { closed: true });
write('orientations', 'Orientation values (OrientationEnum of 1.3.0, unchanged).', fromDictionary(dictionary.orientations), { closed: true });
write('projectTypes', 'Project types (1.3.0, unchanged).', fromDictionary(dictionary.projectTypes), { closed: true });
write('projectStatusStates', 'Project status states (1.3.0, unchanged).', fromDictionary(dictionary.projectStatusStates), { closed: true });
write('amenityCosts', 'Amenity cost kinds (1.3.0, unchanged).', fromDictionary(dictionary.amenityCosts), { closed: true });
write('unitAvailability', 'Availability summary of a unit type (new in 1.4.0). Derived from inventory when units exist: A = units with status available; sold_out when A = 0, last_units when A is at or below the operator threshold, available otherwise.', fromDictionary(dictionary.unitAvailability), { closed: true });
write('currencies', 'Example currency codes. Any ISO 4217 code is valid in 1.4.0.', fromDictionary(dictionary.currencies));

write(
  'unitStatuses',
  'Inventory unit statuses. 1.3.0 values: available, reserved, sold, notForSale. 1.4.0 adds onHold and booked. Only available is buyer-available.',
  [
    { key: 'available', labels: { en: 'Available', he: 'זמין' }, buyerAvailable: true, description: 'For sale now.' },
    { key: 'onHold', labels: { en: 'On hold', he: 'בהקפאה' }, buyerAvailable: false, description: 'Temporarily withheld by the developer.' },
    { key: 'reserved', labels: { en: 'Reserved', he: 'שמור' }, buyerAvailable: false, description: 'Held by a buyer, not yet contracted.' },
    { key: 'booked', labels: { en: 'Booked', he: 'מוזמן' }, buyerAvailable: false, description: 'Contract signed, not yet sold or registered.' },
    { key: 'sold', labels: { en: 'Sold', he: 'נמכר' }, buyerAvailable: false, description: 'Sold.' },
    { key: 'notForSale', labels: { en: 'Not for sale', he: 'לא למכירה' }, buyerAvailable: false, description: 'Not offered.' },
  ],
  {
    closed: true,
    head: {
      transitions: {
        available: ['onHold', 'reserved', 'notForSale'],
        onHold: ['available', 'reserved', 'notForSale'],
        reserved: ['available', 'onHold', 'booked', 'notForSale'],
        booked: ['sold', 'reserved', 'notForSale'],
        sold: [],
        notForSale: ['available'],
      },
    },
  },
);
write('mediaTypes', 'MediaAsset.type values.', simple([['image', 'Image', 'תמונה'], ['video', 'Video', 'וידאו'], ['document', 'Document', 'מסמך'], ['model3d', '3D model', 'מודל תלת-ממד'], ['other', 'Other', 'אחר']]), { closed: true });
write('documentRoles', 'Recommended MediaAsset.role values for gallery[], floorPlans[] and documents[]. Open.', simple([['hero', 'Hero image'], ['plan', 'Floor plan'], ['sitePlan', 'Site plan'], ['blueprint', 'Blueprint or CAD file'], ['brochure', 'Brochure'], ['priceList', 'Price list'], ['specification', 'Technical specification'], ['legal', 'Legal document'], ['other', 'Other']]));
write('experienceTypes', 'Recommended Experience.type values. Open.', simple([['virtualTour', 'Virtual tour'], ['dollhouse', 'Dollhouse'], ['model3d', '3D model'], ['video360', '360 video'], ['ar', 'Augmented reality'], ['walkthrough', 'Walkthrough video'], ['other', 'Other']]));
write('experienceProviders', 'Known Experience.provider keys. Open; any lower-case vendor key is valid.', [
  { key: '3destate', labels: { en: '3D Estate' }, website: 'https://3destate.com' },
  { key: 'matterport', labels: { en: 'Matterport' }, website: 'https://matterport.com' },
]);
write('paymentPhases', 'Recommended PaymentInstallment.phase keys. Open.', simple([['signing', 'On signing', 'בחתימה'], ['foundation', 'Foundation', 'יסודות'], ['shell_completion', 'Shell completion', 'סיום שלד'], ['finishing', 'Finishing works', 'עבודות גמר'], ['handover', 'Handover', 'מסירה']]));
write(
  'roomCountConventions',
  'How markets count rooms. Defines what UnitSpecs.rooms means for a given location.countryCode (always the number a local listing prints) and gives operators a default presentation convention. Informative.',
  [
    { key: 'IL', convention: 'rooms', labels: { en: 'Israel' }, description: 'Advertised rooms include the living room; half rooms (0.5) are common; a studio is advertised as one room or as a studio.' },
    { key: 'DE', convention: 'rooms', labels: { en: 'Germany' }, description: 'Zimmer counts living and sleeping rooms, half rooms for small rooms; kitchen and bathrooms excluded.' },
    { key: 'CH', convention: 'rooms', labels: { en: 'Switzerland' }, description: 'Zimmer as in Germany; half rooms for dining nooks or small rooms.' },
    { key: 'AT', convention: 'rooms', labels: { en: 'Austria' }, description: 'Zimmer counts living and sleeping rooms.' },
    { key: 'FR', convention: 'rooms', labels: { en: 'France' }, description: 'Pieces count living and sleeping rooms, kitchen and bathrooms excluded (T3 = two bedrooms plus a living room).' },
    { key: 'IT', convention: 'rooms', labels: { en: 'Italy' }, description: 'Locali count habitable rooms; a separate kitchen is often counted.' },
    { key: 'NL', convention: 'rooms', labels: { en: 'Netherlands' }, description: 'Kamers count living and sleeping rooms.' },
    { key: 'US', convention: 'bedrooms', labels: { en: 'United States' }, description: 'Listings state bedrooms and bathrooms (3 BR / 2 BA).' },
    { key: 'GB', convention: 'bedrooms', labels: { en: 'United Kingdom' }, description: 'Listings state bedrooms.' },
    { key: 'AE', convention: 'bedrooms', labels: { en: 'United Arab Emirates' }, description: 'Listings state bedrooms (studio, 1BR, 2BR).' },
    { key: 'ES', convention: 'bedrooms', labels: { en: 'Spain' }, description: 'Habitaciones usually means bedrooms on portals.' },
    { key: 'PT', convention: 'bedrooms', labels: { en: 'Portugal' }, description: 'The tipologia counts bedrooms (T2 = two bedrooms).' },
  ],
  { head: { defaultConvention: 'bedrooms' } },
);
console.log(`wrote vocabularies for ${PROTOCOL_VERSION} (dictionary ${VERSION})`);
