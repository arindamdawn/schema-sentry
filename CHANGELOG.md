# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

> **Schema Sentry helps your content get discovered by both traditional search engines AND AI-powered assistants (ChatGPT, Claude, Perplexity) through proper structured data.**

## [0.9.3] - 2026-02-20

### Added

- **AI-Powered Schema Suggestions** (`schemasentry suggest`)
  - Analyze routes and get AI recommendations for schema types
  - Uses BYOK (Bring Your Own Key) - users provide their own API keys
  - Supports 5 providers: OpenAI, Anthropic, Google Gemini, NVIDIA NIM, OpenRouter
  - Auto-detects provider from available API keys
  - Model selection via `--model` flag or `*_MODEL` env vars
  - `--write` flag to apply suggestions to manifest
  - JSON and table output formats
- **API Key via CLI** - Pass API key directly with `--api-key` flag

### Changed

- Next.js Pages Router example is now included

## [0.9.2] - 2026-02-16

### Maintenance

- Version bump to 0.9.2 across all packages
- Updated package versions for consistency

## [0.9.1] - 2026-02-16

### Added

- **GitHub Actions CI Integration** - Schema Sentry Bot now runs automatically on PRs
  - New `schema-bot` job in CI workflow
  - Validates schema and posts results as PR comments
  - Runs on every pull request
- **VS Code Extension** - Improvements and bug fixes
  - Fixed snippets to match library API
  - Fixed schema detection to scan entire file
  - Added LICENSE file

## [0.9.0] - 2026-02-16

### Added

- **VS Code Extension** (`schema-sentry-vscode`)
  - Schema preview panel - view detected schema types while editing
  - Code snippets for all schema types (type `schema-` in .tsx files)
  - Inline decorations showing schema types in gutter
  - Commands: Preview Schema, Add Schema Type, Validate File
  - Status bar integration for quick access
- Fixed snippet generation to match library API (`<Schema data={...}>` with helper functions)
- Fixed schema detection to scan entire file instead of just selection

## [0.8.0] - 2026-02-13

### Added

- **GitHub Bot** (`schemasentry bot`)
  - Post validation results directly to PRs via GitHub API
  - Works in GitHub Actions with `--event pull_request`
  - Responds to `/schemasentry` command in PR comments
- **Pages Router Support** (`@schemasentry/react`)
  - New package for Next.js Pages Router and other React frameworks
  - Use in `_document.js` or individual pages
- **Schema Testing Framework** (`schemasentry test`)
  - Define assertions in `schema-sentry.test.json`
  - Supports: exists, not_exists, equals, contains, matches
  - Filter by schema type
- **Team Policy Controls**
  - Rule severity overrides (error/warn/off)
  - Rule allowlist/denylist in config

### Changed

- Added `@schemasentry/react` package to workspace

## [0.7.0] - 2026-02-13

### Added

- **Rulesets** - Validate schema against specific optimization targets
  - `--rules google` - Google rich-result focused checks (Product, Article, LocalBusiness, Event, FAQ, HowTo, Review, VideoObject)
  - `--rules ai-citation` - AI/LLM citation focused checks (author, datePublished, description, entity relationships)
  - Supports comma-separated: `--rules google,ai-citation`
- **CLI Visualization** - New output formats for better readability
  - `--format table` - Table output with Route, Status, Types, Issues columns (now default)
  - `--format tree` - Hierarchical tree view showing schema structure and issues
- `validate --build` to run a build command before reality-check validation.
- `validate --build-command <command>` to override the build command used with `--build`.

### Changed

- `validate` now uses `--format table` by default (previously json)
- `validate` now auto-detects built output when `--root` is omitted (`.next/server/app`, `out`, `.next/server/pages`).
- `audit` now skips legacy coverage checks when no schema data file is loaded, preventing false positives from empty-data assumptions.
- Source scanning now detects aliased `Schema` component usage (for example `Schema as JsonLdSchema`) to reduce ghost-route false positives.
- Updated docs and CI examples to use reality-check validation (`--root` / auto-detect) instead of deprecated `validate --data` flows.

## [0.6.0] - 2026-02-12

### ⚠️ BREAKING CHANGES

- **Reality Check validation**: The `validate` command now validates built HTML output instead of JSON data files. This eliminates false positives but requires building your app first.
  - **Migration**: Change from `schemasentry validate --manifest x --data y` to `schemasentry validate --manifest x --root ./.next/server/app`
  - The `--data` flag is no longer required for validate (deprecated)

### Added

- **Reality Check validation system** (`src/reality.ts`)
  - Validates actual rendered JSON-LD in built HTML files
  - Cross-references manifest, source code, and HTML output
  - Reports "ghost routes" - routes in manifest without Schema components
  - Reports "missing in HTML" - routes with components but not built
  - Reports type mismatches between manifest and actual HTML

- **Source code scanning** (`src/source.ts`)
  - Detects Schema component imports and usage in TSX/JSX files
  - Maps page files to routes automatically
  - Identifies routes missing Schema components

- **Enhanced scaffold command**
  - Shows full copy-paste component code examples
  - Generates proper imports and builder code
  - Maps routes to correct file paths
  - Colorized output with chalk

- **Enhanced audit command**
  - Detects ghost routes (manifest entries without Schema components)
  - Reports source code coverage statistics
  - Shows which files have/don't have schema

- **Beautiful CLI output**
  - Added chalk dependency for colored output
  - Emoji-enhanced status indicators
  - Clear visual hierarchy in reports
  - Green/red/yellow status colors

### Changed

- **validate command**: Complete rewrite to perform reality checks
  - Now requires `--root` pointing to built HTML directory
  - Validates actual HTML instead of JSON files
  - No more false positives!
  - Still supports `--format html` and `--annotations github`

- **scaffold command**: Enhanced output
  - Shows actual component code to copy-paste
  - Better visual formatting
  - Clear next steps guidance

- **audit command**: Added source scanning
  - Checks for ghost routes
  - Reports source file analysis
  - Enhanced summary output

### Deprecated

- `schema-sentry.data.json` file usage is now deprecated for validation
  - Use `schemasentry validate --root <built-output>` instead
  - `collect` command still uses data files for drift detection
  - `scaffold` command still updates data files for backward compatibility

### Fixed

- **Critical**: Eliminated false positives in validation
  - Old behavior: Validated JSON files against each other (could pass without actual schema)
  - New behavior: Validates actual HTML output (only passes if schema is truly rendered)

## [0.5.0] - 2026-02-12

### Added
- `schemasentry scaffold` - New command to generate schema stubs for pages without schema
  - Pattern-based auto-detection infers schema types from URL conventions (/blog/* → BlogPosting, /products/* → Product)
  - Dry-run mode by default with `--write` flag to apply changes
  - Rollback-safe file updates with `--force` to skip confirmation
  - Type-specific schema stubs: BlogPosting, Product, FAQPage, HowTo, Event, Article, Organization, WebSite
- Pattern-based auto-detection module with 15+ default URL patterns
- Configurable pattern rules support in schema-sentry.config.json

### Changed
- Updated README with scaffold command documentation and examples
- Updated ROADMAP to mark v0.5.0 complete

## [0.4.0] - 2026-02-12

### Added
- `schemasentry collect` - New command to collect JSON-LD from built app and generate deterministic schema data file
- `--output` flag for custom output path
- `--format json` support for structured output
- `--root` flag for custom project root directory
- End-to-end example script demonstrating `init` → `collect` → `validate` workflow

### Changed
- CLI now reads collected data from `schema-sentry.data.json` when available
- Improved data file handling for CI workflows with `--check` flag for drift detection

## [0.3.2] - 2026-02-11

### Added
- README files for npm packages (@schemasentry/core, @schemasentry/cli, @schemasentry/next)
- Banner image for project README

### Changed
- README layout with centered banner and navigation links
- ROADMAP updated with v0.4.0 detailed scope

## [0.3.1] - 2026-02-11

### Fixed
- Release workflow to unpublish existing npm packages before publishing
- GitHub tag handling to delete existing tags before creating releases

## [0.3.0] - 2026-02-11

### Added
- HTML report output with `--format html --output <path>`
- GitHub Actions annotations with `--annotations github` for PR reviews
- VideoObject schema type for video content
- ImageObject schema type for image content
- Performance benchmark test (200 routes < 5s)
- CI integration documentation

### Changed
- Multiple output formats supported (JSON, HTML)
- Default output format remains JSON for machine readability

## [0.2.0] - 2026-02-10

### Added
- `schemasentry init` - Interactive setup wizard
- `schemasentry audit` - Read-only schema health analysis with health scores
- Coverage validation - Report missing schema per route
- Recommended field validation - Advisory checks (configurable)
- New schema types: Event, Review, LocalBusiness

### Improved
- CLI summary stats and timing
- Better error messages with suggestions
- JSON output for CI/CD integration

## [0.1.0] - 2026-02-10

### Added

- Initial OSS release
- `@schemasentry/core` — typed builders + validation primitives
- `@schemasentry/next` — App Router `<Schema />` component
- `@schemasentry/cli` — CI validation and report output
- Deterministic JSON-LD output for clean diffs
- Manifest-driven route coverage system
- CLI validation with machine-readable JSON output
- Support for 11 schema types (Organization, Person, Article, BlogPosting, Product, FAQPage, HowTo, BreadcrumbList, etc.)
- Example Next.js App Router application
- Full CI/CD with GitHub Actions and automated npm publishing
- MIT license, contributing guidelines, code of conduct, and security policy

### Why This Matters

- **SEO:** Rich snippets, knowledge panels, improved rankings
- **AI Discovery:** ChatGPT, Claude, Perplexity, and AI agents can better understand and recommend your content
- **Developer Experience:** Type-safe builders prevent mistakes
- **CI/CD:** Automated validation catches issues before deployment

[Unreleased]: https://github.com/arindamdawn/schema-sentry/compare/v0.9.2...HEAD
[0.9.2]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.9.2
[0.9.1]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.9.1
[0.9.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.9.0
[0.8.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.8.0
[0.7.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.7.0
[0.5.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.5.0
[0.4.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.4.0
[0.3.2]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.3.2
[0.3.1]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.3.1
[0.3.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.3.0
[0.2.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.2.0
[0.1.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.1.0
