# REOP protocol changelog

Newest first. One section per release. Semantic Versioning: a minor release only adds optional members, loosens constraints or deprecates; a major release may remove or rename. The machine-readable index is `versions.json`.

## 1.4.0 (unreleased, release candidate)

Consolidation release. Every 1.3.0 structure, enum and name is retained; the changes below are additions, loosenings and deprecations. Migration guide: `migrations/1.3.0-to-1.4.0.md`.

### Documents and versioning
- New `ProjectDocument { protocol, project, developer?, developers? }`: the single-project document an API exchanges. `RealEstateCatalog` is unchanged and remains the feed format.
- New `InventoryUpdate { protocol, projectId, updates[] }`: a partial, idempotent delta of unit availability for ERP / CRM synchronisation.
- `protocol.version` is now required on every document. `protocol.generator` (free text naming the producer) and `protocol.defaultLocale` added; `protocol.domain` deprecated in favour of `generator`.
- `extensions` object allowed on every entity for vendor data; unknown properties MUST be preserved by intermediaries.
- One canonical JSON Schema per version (`schema/<version>/reop.schema.json`, draft 2020-12); the OpenAPI document is generated from it. `versions.json` indexes releases; `vocabularies/*.json` publish the controlled values with labels.

### Shared objects
- New `MediaAsset` (url, type, mimeType, fileName, title, alt, caption, width, height, sizeBytes, previewUrl, role), `FileAsset` (+ format), `ImageAsset`. The 1.3.0 gallery item `{ type, url }` is a valid `MediaAsset`.
- New `Experience` (type, provider, url, embed, previewUrl, floors[], providerData) for virtual tours, dollhouses, 3D models, 360 video, AR. Vendor neutral; `3destate` and `matterport` listed as known providers.
- New `PriceRange { min, max }`, `UnitSpecs`, `UnitFeatures`, `GreenCertification`, `Reservation`, `UnitLinks`.
- `Money.currency` accepts any ISO 4217 code (was ILS / USD / EUR).
- `SocialInfo` adds `telegram` and allows additional networks as `name: url`.
- `Location`: `countryCode` required when `coordinates` are given.

### Marketing
- `marketing.logo` is an `ImageAsset` (`{ url, alt? }`). The 1.3.0 `{ square, landscape }` pair is deprecated (upgrade: `url = square`, else `landscape`).
- Project `marketing.logos[]`: credited logos (developer, partner, architect, bank) with `title` and `role`.
- `marketing.gallery[]` items are `MediaAsset`s; unit models and buildings may carry galleries (multiple images per unit type).
- New `marketing.floorPlans[]` (`FileAsset` with `previewUrl`, `format`, `title`, `role`) on project, building, floor and unit model. `layoutImage` and `blueprint` deprecated.
- New `marketing.experiences[]` on project, building and unit model; new `marketing.documents[]` with roles (brochure, priceList, specification, legal). `brochurePdf` kept.
- New `marketing.priceRange` on project and unit model.
- Marketing members are now declared per entity (`DeveloperMarketing`, `ProjectMarketing`, `BuildingMarketing`, `FloorMarketing`, `UnitModelMarketing`, `UnitMarketing`); members that do not apply to an entity are deprecated there (for example `startingPrice` on a developer).

### Project, status, payment plan, legal, amenities, interests
- `status.startDate`, `status.completionDate` added.
- `paymentPlan.totalPrice` added; installments gain `id`, `title` (localized label), `amount`, `dueDate`, `milestone`, `description`. `phase` keeps its 1.3.0 meaning as a machine key; recommended keys in `vocabularies/paymentPhases.json`.
- Amenities: `name` remains the 1.3.0 key; a custom amenity (key outside the vocabulary) MUST carry `label`; `category` added.
- Interests: `id`, `coordinates`, `showOnMap`, `description` added; `type` is open with the 1.3.0 values as the recommended vocabulary.

### Unit models
- `specs.rooms` added: the advertised habitable-room count under the market's convention (see `vocabularies/roomCountConventions.json`). `specs.bedrooms` keeps its literal meaning. The two are independent facts; producers store what the source states and never derive one from the other.
- `specs.storageAreaSqm`, `specs.parkingSpaces`, `specs.totalAreaSqm` added.
- `features { orientation[], view, tags[] }` added at unit-model level (same object as inventory units).
- `availability` (`available | last_units | sold_out`) added with the derivation rule from inventory: only units with status `available` count.

### Buildings
- `floorsAboveGround`, `floorsBelowGround`, `yearConstructed`, `architect`, `architectureStyle`, `constructionMaterials[]`, `greenCertifications[]` added. `Floor.number` required (as the 1.3.0 YAML already stated).

### Inventory
- `status` adds `onHold` and `booked` (transitions documented in `vocabularies/unitStatuses.json`). Only `available` is buyer-available.
- `floorNumber`, `statusUpdatedAt`, `priceUpdatedAt`, `specs` and `features` overrides, `marketing` (unit media), `reservation { until, reference }`, `externalIds` added.
- Link integrity rules: `links.modelId` MUST reference a unit model; `buildingId` / `floorId` MUST reference existing ids when given; unit ids unique within a project.

### Repository
- `examples/` reorganised per version; 1.4.0 examples include must-fail cases under `examples/1.4.0/invalid/`.
- `tools/validate.mjs`, `tools/build-openapi.mjs`, `tools/build-vocabularies.mjs`, `tools/check-vocabularies.mjs`; GitHub Actions workflow validates every push and pull request.
- README and CONTRIBUTING rewritten for 1.4.0 and the versioning policy.

## 1.3.0 (2026-04-17)
- Extended language support: `LocalizedString` on every human text; 11 contact channels; 12 social networks; enums for amenities (82), interests (80), views (16), orientations (8).
- Known drift, left as published: the JSON Schema (`reop-v1.3.0-schema.json`) omits members the YAML defines (contact channels beyond whatsapp, social networks beyond linkedin, `gardenAreaSqm`, `Unit.startingPrice`, `Floor.number` required). The YAML is authoritative for 1.3.0.

## 1.2.0 (2025-12-17)
- Flattened architecture: `developers[]` and `projects[]` linked by `developerIds[]` / `projectIds[]` (many-to-many).

## 1.1.0 (2025-12-04)
- Nested hierarchy Developer > Project > Building > Floor > UnitModel > Unit; decoupled inventory (types vs units); multi-language; marketing and legal layers; standardized enums.
