# REOP 1.4.0 examples

All files validate against [`schema/1.4.0/reop.schema.json`](../../schema/1.4.0/reop.schema.json) (`npm run validate`), except the files under `invalid/`, which the validator must reject. The same fictional project (The Rothschild Collection, Tel Aviv-Yafo, developer Tel Aviv Urban Heights) is used throughout so the documents can be compared.

| File | Document | Shows |
|---|---|---|
| [`project-min.json`](project-min.json) | `ProjectDocument` | The smallest valid single-project document: `protocol`, a project with id, localized name, status and location, and its developer. Start here. |
| [`catalog-min.json`](catalog-min.json) | `RealEstateCatalog` | The smallest valid feed: one developer and one project linked by `developerIds` / `projectIds`. |
| [`project-document.json`](project-document.json) | `ProjectDocument` | The full 1.4.0 model on one project: `protocol` with `generator` and `defaultLocale`; status dates; marketing with `priceRange`, a `MediaAsset` gallery (image and video with `previewUrl`), one `logo` plus credited `logos[]`, `floorPlans[]` (site plan, typical floor, unit plans with `format` and `previewUrl`), `experiences[]` (virtual tour, 3D model), `documents[]` with roles; buildings with floors, architect and green certifications; unit models with `specs.rooms` **and** `specs.bedrooms`, `features`, galleries, floor plans and `availability`; inventory units with `onHold` / `booked` statuses, timestamps, `reservation`, `externalIds`; payment plan with titled installments; amenities (vocabulary keys and one custom amenity with `label`); interests with coordinates; legal; `extensions`. |
| [`catalog-full.json`](catalog-full.json) | `RealEstateCatalog` | The same project as a feed entry next to its developer (`developers[]` / `projects[]`). |
| [`inventory-update.json`](inventory-update.json) | `InventoryUpdate` | A partial, idempotent availability delta: a unit booked with a CRM reference, a price change, and a unit created on the fly from `links.modelId` + `unitNumber`. |

## `invalid/` (must fail)

| File | Rule it breaks |
|---|---|
| `wrong-protocol-version.json` | `protocol.version` must be `1.4.0` for this schema |
| `catalog-and-project-mixed.json` | a document is either a catalog (`developers[]` / `projects[]`) or a project document (`project` / `developer`), never both |
| `coordinates-without-country.json` | `location.countryCode` is required when `coordinates` are given |
| `currency-not-iso.json` | `Money.currency` must be an ISO 4217 code |
| `custom-amenity-without-label.json` | an amenity key outside `vocabularies/amenities.json` must carry a localized `label` |
| `logo-wrong-shape.json` | `marketing.logo` is an `ImageAsset` (`{ url, alt? }`), not the 1.3.0 `{ square, landscape }` pair |
| `rooms-not-half-step.json` | `specs.rooms` is counted in half steps (3, 3.5, 4 …) |
| `inventory-status-outside-enum.json` | `inventory[].status` is one of the closed `unitStatuses` values |
| `inventory-dangling-model.json` | `inventory[].links.modelId` must reference an existing `unitModels[].id` (semantic check in `tools/validate.mjs`) |
