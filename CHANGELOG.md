# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

> **Schema Sentry helps your content get discovered by both traditional search engines AND AI-powered assistants (ChatGPT, Claude, Perplexity) through proper structured data.**

## [Unreleased]

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

[Unreleased]: https://github.com/arindamdawn/schema-sentry/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.4.0
[0.3.2]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.3.2
[0.3.1]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.3.1
[0.3.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.3.0
[0.2.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.2.0
[0.1.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.1.0
