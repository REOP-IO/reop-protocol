# REOP (Real Estate Open Protocol)

The official repository of the Real Estate Open Protocol (REOP): an open, vendor-neutral standard for structuring, exchanging and updating new-development (off-plan / pre-sale) real estate data, from developer systems to marketplaces, AI agents and digital platforms.

Current version: **1.4.0** (release candidate). Machine-readable index: [`versions.json`](versions.json).

## What REOP describes

`Developer` -> `Project` -> `Building` -> `Floor` -> `UnitModel` (a unit type) -> `Unit` (a specific apartment in the inventory)

- **Decoupled inventory**: a project can be published with its unit types alone; specific units with their availability follow when the developer's systems supply them.
- **Multilingual by design**: every human text is a `LocalizedString` map (`{ "en": "...", "he": "..." }`).
- **Media as objects**: images, videos, floor plans, documents and 3D / virtual-tour experiences share one shape, vendor neutral.
- **Inventory synchronisation**: an `InventoryUpdate` document carries unit status and price changes from ERP / CRM systems.
- **Evolvable**: `protocol.version` on every document, deprecations instead of removals in minor releases, `extensions` for vendor data, unknown members preserved.

## Documents

| Document | Use | Schema definition |
|---|---|---|
| `RealEstateCatalog` | A feed: many developers and projects linked by ids | `#/$defs/RealEstateCatalog` |
| `ProjectDocument` | One project with its developer: what an API exchanges per project | `#/$defs/ProjectDocument` |
| `InventoryUpdate` | A partial, idempotent delta of unit availability | `#/$defs/InventoryUpdate` |

## Files

| Path | What |
|---|---|
| [`schema/1.4.0/reop.schema.json`](schema/1.4.0/reop.schema.json) | **The contract**: canonical JSON Schema (draft 2020-12) with every object definition |
| [`specifications/reop-1.4.0.yaml`](specifications/reop-1.4.0.yaml) | OpenAPI 3.1 document generated from the schema (reference endpoints, Redoc rendering) |
| [`vocabularies/`](vocabularies) | Controlled values with labels: amenities, interests, views, orientations, unit statuses, availability, media types, document roles, experience types and providers, payment phases, room-count conventions |
| [`examples/1.4.0/`](examples/1.4.0) | Full catalog, project document, minimal document, inventory update, and must-fail cases under `invalid/` |
| [`migrations/1.3.0-to-1.4.0.md`](migrations/1.3.0-to-1.4.0.md) | Upgrade rules, consumer and producer checklists |
| [`CHANGELOG.md`](CHANGELOG.md) | Release history |
| [`versions.json`](versions.json) | Index of every release with its schema, examples and status |
| `specifications/reop-1.3.0.yaml`, `reop-v1.3.0-schema.json`, older | Previous releases, frozen |

## Quick start

A minimal `ProjectDocument`:

```json
{
  "protocol": { "name": "REOP", "version": "1.4.0" },
  "project": {
    "id": "prj_rothschild_collection",
    "name": { "en": "The Rothschild Collection", "he": "אוסף רוטשילד" },
    "status": { "state": "underConstruction" },
    "location": { "city": { "en": "Tel Aviv-Yafo" }, "countryCode": "IL" }
  },
  "developer": { "id": "dev_tlv_urban_01", "name": { "en": "Tel Aviv Urban Heights" } }
}
```

Validate your documents:

```bash
npm ci
node tools/validate.mjs path/to/document.json
```

The reference implementation serves `GET /v1/projects/{id}/reop` (a `ProjectDocument`), accepts documents on `PUT /v1/projects/{id}` and inventory deltas on `POST /v1/projects/{id}/inventory/updates`, and announces its supported versions on `GET /v1/meta/reop-manifest`. Every served document carries the `X-REOP-Version` header.

## Versioning policy

- Semantic Versioning. A **minor** release only adds optional members, loosens constraints or deprecates; a **major** release may remove or rename.
- Every document declares `protocol.version`. Consumers accept any document of the same major: lower minors through the published upgrade rules, higher minors by preserving and ignoring unknown members.
- Deprecated members carry `deprecated: true` and `x-replacedBy` in the schema and stay valid until the next major.
- Each release ships: a canonical JSON Schema, a generated OpenAPI document, vocabularies, validated examples, a changelog entry, a migration guide from the previous version and an entry in `versions.json`.

## Rooms and bedrooms

`specs.rooms` (the habitable-room count a local listing prints, living room included where the market counts it) and `specs.bedrooms` (separate sleeping rooms) are independent facts. Store what the source states; never derive one from the other for storage. Market conventions: [`vocabularies/roomCountConventions.json`](vocabularies/roomCountConventions.json).

## Community

REOP is an open protocol. Proposals and questions go to GitHub Issues (see [CONTRIBUTING.md](CONTRIBUTING.md)). Specification pages and news: [reop.io](https://reop.io). Commercial inquiries: `info@reop.io`.

License: MIT.
