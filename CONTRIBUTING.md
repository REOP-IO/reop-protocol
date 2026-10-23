# Contributing to the REOP protocol

Thank you for your interest in the Real Estate Open Protocol. As an open standard its value comes from industry input; its usefulness comes from stability. Both matter.

## Principles

- **Stability first.** Within a major version every change is backward compatible: new members are optional, constraints only loosen, nothing is removed or renamed. Removals happen only in a major release and only after a deprecation period.
- **One canonical contract per version**: `schema/<version>/reop.schema.json`. The OpenAPI document is generated from it (`npm run build:openapi`); never edit the generated YAML by hand.
- **Vocabularies over hard-coded enums** where values grow (amenities, interests, document roles, experience types and providers, payment phases). Closed enums stay closed (project types, states, costs, unit statuses, media types, views, orientations).
- **Evidence.** A proposal names the real-world data problem it solves (a market, a document type, an integration) and shows an example document.

## How to propose a change

1. Open a GitHub **Issue** (or a Discussion for an open question) using the "Protocol proposal" shape: problem, proposed members or vocabulary values, example document, affected consumers, compatibility (additive / deprecation / major).
2. Discuss until maintainers and contributors agree on the concept.
3. Open a pull request against `main` that changes, as one unit:
   - the current schema (or, for a new version, a new `schema/<version>/` folder),
   - the generated OpenAPI document (`npm run build:openapi`),
   - vocabularies if values were added,
   - examples (and a must-fail case under `examples/<version>/invalid/` when a constraint was added),
   - `CHANGELOG.md`, and `migrations/` for a new version,
   - `versions.json` for a new version.
4. CI must be green: `npm run validate`, `node tools/build-openapi.mjs --check`, `node tools/check-vocabularies.mjs`.

## Releasing a version

1. Create `schema/<version>/reop.schema.json` (copy the previous one, apply the changes, bump `$id` and `protocol.version` const).
2. Add `specifications/openapi-<version>.template.yaml` and generate `specifications/reop-<version>.yaml`.
3. Regenerate vocabularies with the new `protocolVersion`; add examples under `examples/<version>/`.
4. Write `migrations/<previous>-to-<version>.md` (upgrade rules, consumer and producer checklists) and the changelog entry.
5. Add the version to `versions.json` (`status: current`, previous becomes `supported`).
6. Tag `v<version>-rc.N` while implementations test it; tag `v<version>` and publish a GitHub Release when it is final; set `released` in `versions.json`.
7. Publish: `tools/release-assets.sh v<version>` attaches the schema, OpenAPI, examples and vocabularies to the Release; `tools/github-meta.sh` updates the repository description ("Current version: …") and topics; update `REOP-IO/.github/profile/README.md` (org profile) and the website: in `REOP-IO/reop-site` run `npm run sync -- v<version>` (publishes `https://reop.io/schema/<version>/…`, the vocabularies and the api-docs OpenAPI), refresh the copy, `npm run check`, tag `site-v<version>-1`, deploy. The REOP app vendors the tag with `npm run reop:vendor -- v<version>` (`docs/REOP-RELEASE-RUNBOOK.md` in `REOP-IO/reop-app`). The published schema URL of a released version never changes.

## Scope

Residential new developments (for sale and investment), their developers, buildings, unit types, units and availability. Commercial real estate and rentals are candidates for a future major version; proposals are welcome in Issues.
