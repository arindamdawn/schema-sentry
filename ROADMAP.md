# Roadmap

Last updated: 2026-02-10

## Current Status: v0.1.0 Ready for Release 🚀

MVP is complete and tested. All 17 tests passing. Ready to publish to npm.

See detailed release planning in `/notes/RELEASE_ROADMAP.md`.

## Phase 1 ✅ COMPLETE

**Released in v0.1.0**

- Core builders (Organization, Person, Article, BlogPosting, Product, FAQPage, HowTo, BreadcrumbList, etc.)
- Deterministic JSON-LD output with stable key ordering
- `<Schema />` React component for Next.js App Router
- Validation engine with required field checks
- CLI `validate` command with JSON output
- Manifest-driven route coverage
- Example Next.js app with working schema integration

## Phase 2 - ACTIVE DEVELOPMENT

**Target: v0.2.0**

- [ ] `schemasentry init` - Interactive setup wizard
- [ ] Extended schema types (Event, Review, LocalBusiness, VideoObject, ImageObject)
- [ ] Coverage validation - detect missing schemas per route
- [ ] Recommended field validation (beyond just required fields)
- [ ] CLI improvements: summary stats, timing, better error messages
- [ ] 20+ GitHub stars (community validation)

## Phase 3

**Target: v0.3.0**

- [ ] HTML report output with visual diffs
- [ ] GitHub Actions annotations for PR reviews
- [ ] Performance verification (200 routes validated in < 5s)
- [ ] Video tutorials and expanded documentation
- [ ] Product Hunt launch

## Phase 4

**Target: v1.0.0**

- Stable API contract
- Comprehensive test coverage
- Performance benchmarks
- Maintainer guide and contributor onboarding

## Post-v1.0 Ideas

- Framework adapters (Astro, Remix, SvelteKit)
- Schema Studio (visual editor)
- AI-powered schema suggestions
