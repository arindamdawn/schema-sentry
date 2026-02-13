---
"@schemasentry/cli": patch
---

## Improvements to audit and validate commands

### Added
- `validate --build` to run a build command before reality-check validation.
- `validate --build-command <command>` to override the build command used with `--build`.

### Changed
- `validate` now auto-detects built output when `--root` is omitted (`.next/server/app`, `out`, `.next/server/pages`).
- `audit` now skips legacy coverage checks when no schema data file is loaded, preventing false positives from empty-data assumptions.
- Source scanning now detects aliased `Schema` component usage (for example `Schema as JsonLdSchema`) to reduce ghost-route false positives.
- Updated docs and CI examples to use reality-check validation (`--root` / auto-detect) instead of deprecated `validate --data` flows.
- Refined `v0.7.0` roadmap scope to an MVP focused on VS Code extension and CLI visualization.

### Fixed
- Improved warning message in audit when no data file is loaded with helpful documentation link.
- Added clearer comments in `resolveExistingBuildOutputDir` for better code maintainability.
