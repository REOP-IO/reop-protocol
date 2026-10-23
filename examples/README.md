# Examples

One folder per protocol version. **Use [`1.4.0/`](1.4.0) for new work**; the older folders are frozen with their versions and exist so consumers can test their upgrade paths.

| Folder | Version | Status | Contents |
|---|---|---|---|
| [`1.4.0/`](1.4.0) | 1.4.0 | current | minimal document, minimal catalog, full project document, full catalog, inventory update, must-fail cases ([details](1.4.0/README.md)) |
| [`1.3.0/`](1.3.0) | 1.3.0 | supported | `catalog-full.json` |
| [`1.2.0/`](1.2.0) | 1.2.0 | deprecated | `catalog-min.json`, `catalog-full.json` |
| [`1.1.0/`](1.1.0) | 1.1.0 | deprecated | `project-min.json` (nested shape, no JSON Schema) |

Every example (except `invalid/` cases, which must be rejected) validates against its version's schema in CI: `npm run validate`. To validate your own file: `node tools/validate.mjs path/to/document.json` (the version is read from `protocol.version`).
