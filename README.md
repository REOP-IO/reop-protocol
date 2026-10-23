# REOP (Real Estate Open Protocol)

[![Release](https://img.shields.io/github/v/release/REOP-IO/reop-protocol?label=release)](https://github.com/REOP-IO/reop-protocol/releases/latest)
[![Validate](https://github.com/REOP-IO/reop-protocol/actions/workflows/validate.yml/badge.svg)](https://github.com/REOP-IO/reop-protocol/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The official repository of the Real Estate Open Protocol (REOP): an open, vendor-neutral standard for structuring, exchanging and updating new-development (off-plan / pre-sale) real estate data, from developer systems to marketplaces, AI agents and digital platforms.

**Current version: 1.4.0**, released 2026-10-22 ([release notes](https://github.com/REOP-IO/reop-protocol/releases/tag/v1.4.0)). Machine-readable index: [`versions.json`](versions.json). Website: [reop.io](https://reop.io). Reference API: [api.reop.io/api-docs](https://api.reop.io/api-docs/).

## Start here

| You want to | Read |
|---|---|
| Know exactly what a valid document looks like (the contract) | [`schema/1.4.0/reop.schema.json`](schema/1.4.0/reop.schema.json), also published at `https://reop.io/schema/1.4.0/reop.schema.json` |
| Browse the model and the reference endpoints as an API reference | [`specifications/reop-1.4.0.yaml`](specifications/reop-1.4.0.yaml) (OpenAPI 3.1, generated from the schema), rendered at [api.reop.io/api-docs](https://api.reop.io/api-docs/) |
| Copy a document and adapt it | [`examples/1.4.0/`](examples/1.4.0) (minimal, full project, full catalog, inventory update; what each shows: [`examples/1.4.0/README.md`](examples/1.4.0/README.md)) |
| Use the controlled values (amenities, statuses, media roles, room conventions, …) | [`vocabularies/`](vocabularies) |
| Upgrade a 1.3.0 producer or consumer | [`migrations/1.3.0-to-1.4.0.md`](migrations/1.3.0-to-1.4.0.md) |
| See what changed and when | [`CHANGELOG.md`](CHANGELOG.md) |
| Validate your own documents | `npm ci && node tools/validate.mjs path/to/document.json` |
| Propose a change | [`CONTRIBUTING.md`](CONTRIBUTING.md) and GitHub Issues |

## Versions

| Version | Status | Released | Schema | OpenAPI | Examples | Notes |
|---|---|---|---|---|---|---|
| **1.4.0** | **current** | 2026-10-22 | [`schema/1.4.0/reop.schema.json`](schema/1.4.0/reop.schema.json) | [`specifications/reop-1.4.0.yaml`](specifications/reop-1.4.0.yaml) | [`examples/1.4.0/`](examples/1.4.0) | [Release](https://github.com/REOP-IO/reop-protocol/releases/tag/v1.4.0), [migration from 1.3.0](migrations/1.3.0-to-1.4.0.md) |
| 1.3.0 | supported | 2026-04-17 | [`specifications/reop-v1.3.0-schema.json`](specifications/reop-v1.3.0-schema.json) | [`specifications/reop-1.3.0.yaml`](specifications/reop-1.3.0.yaml) | [`examples/1.3.0/`](examples/1.3.0) | frozen; the YAML is authoritative (known schema drift recorded in the changelog) |
| 1.2.0 | deprecated | 2025-12-17 | [`specifications/reop-v1.2.0-schema.json`](specifications/reop-v1.2.0-schema.json) | [`specifications/reop-1.2.0.yaml`](specifications/reop-1.2.0.yaml) | [`examples/1.2.0/`](examples/1.2.0) | frozen |
| 1.1.0 | deprecated | 2025-12-04 | none | [`specifications/reop-v1.1.0.yaml`](specifications/reop-v1.1.0.yaml) | [`examples/1.1.0/`](examples/1.1.0) | frozen |

New documents MUST declare the current version. A reader of the current version accepts every supported and deprecated version of the same major through the published migration rules (see [Versioning policy](#versioning-policy)). `versions.json` is the machine-readable form of this table.

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
| [`examples/1.4.0/`](examples/1.4.0) | Minimal document, minimal catalog, full project document, full catalog, inventory update, and must-fail cases under `invalid/` |
| [`migrations/1.3.0-to-1.4.0.md`](migrations/1.3.0-to-1.4.0.md) | Upgrade rules, consumer and producer checklists |
| [`CHANGELOG.md`](CHANGELOG.md) | Release history |
| [`versions.json`](versions.json) | Index of every release with its schema, examples, release page and status |
| `specifications/reop-1.3.0.yaml`, `reop-v1.3.0-schema.json`, older | Previous releases, frozen |
| [`tools/`](tools) | `validate.mjs`, `build-openapi.mjs`, `build-vocabularies.mjs`, `check-vocabularies.mjs`, `release-assets.sh`, `github-meta.sh` |

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

The reference implementation (the REOP marketplace, `https://api.reop.io/v1`) serves `GET /projects/{id}/reop` (a `ProjectDocument`), accepts documents on `PUT /projects/{id}` and inventory deltas on `POST /projects/{id}/inventory/updates`, and announces its supported versions on `GET /meta/reop-manifest`. Every served document carries the `X-REOP-Version` header. The marketplace is one implementation of the protocol; the protocol does not depend on it.

## Versioning policy

- Semantic Versioning. A **minor** release only adds optional members, loosens constraints or deprecates; a **major** release may remove or rename.
- Every document declares `protocol.version`. Consumers accept any document of the same major: lower minors through the published upgrade rules, higher minors by preserving and ignoring unknown members.
- Deprecated members carry `deprecated: true` and `x-replacedBy` in the schema and stay valid until the next major.
- Each release ships: a canonical JSON Schema, a generated OpenAPI document, vocabularies, validated examples, a changelog entry, a migration guide from the previous version, an entry in `versions.json`, a Git tag `v<version>` and a GitHub Release with the schema and OpenAPI attached. The published schema URL (`https://reop.io/schema/<version>/reop.schema.json`) never changes once released.

## Rooms and bedrooms

`specs.rooms` (the habitable-room count a local listing prints, living room included where the market counts it) and `specs.bedrooms` (separate sleeping rooms) are independent facts. Store what the source states; never derive one from the other for storage. Market conventions: [`vocabularies/roomCountConventions.json`](vocabularies/roomCountConventions.json).

## Community

REOP is an open protocol. Proposals and questions go to GitHub Issues and Discussions (see [CONTRIBUTING.md](CONTRIBUTING.md)). Website: [reop.io](https://reop.io). Commercial inquiries: `info@reop.io`.

License: MIT.
