# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

> **Schema Sentry helps your content get discovered by both traditional search engines AND AI-powered assistants (ChatGPT, Claude, Perplexity) through proper structured data.**

## [Unreleased]

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

[Unreleased]: https://github.com/arindamdawn/schema-sentry/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.2.0
[0.1.0]: https://github.com/arindamdawn/schema-sentry/releases/tag/v0.1.0
