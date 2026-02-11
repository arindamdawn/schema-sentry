# Roadmap

Last updated: 2026-02-11

## 🎉 Current Status

**v0.3.0 is live!** Published to npm and ready to use.

📦 **Install:** `pnpm add @schemasentry/next @schemasentry/core @schemasentry/cli`

---

## ✅ Phase 1 (v0.1.0) — COMPLETE

- ✅ Core builders for 11+ schema types
- ✅ Deterministic JSON-LD output
- ✅ `<Schema />` component for Next.js App Router
- ✅ Validation engine with required field checks
- ✅ CLI `validate` command
- ✅ Manifest-driven route coverage
- ✅ GitHub Actions CI/CD

## ✅ Phase 2 (v0.2.0) — COMPLETE

**Focus:** Developer experience and schema completeness

- ✅ `schemasentry init` — Interactive setup wizard
- ✅ `schemasentry audit` — Analyze existing pages and report schema health (read-only)
  - Scan routes from manifest and/or filesystem
  - Report missing/partial schema per page
  - Health score for entire site
  - JSON output + human summary
- ✅ Coverage validation (missing schema per route)
- ✅ Recommended field validation (advisory, configurable)
- ✅ Additional schema types (Event, Review, LocalBusiness)
- ✅ CLI improvements (summary stats, timing, better errors)

## ✅ Phase 3 (v0.3.0) — COMPLETE

**Focus:** CI reporting and audit visibility

### Released

- ✅ HTML report output (`--format html --output <path>`)
- ✅ GitHub Actions annotations (`--annotations github`)
- ✅ Additional schema types (VideoObject, ImageObject)
- ✅ Performance verification (200 routes < 5s)
- ✅ CI documentation + examples

## 🚀 Phase 3.1 (v0.3.1) — Next Release

**Focus:** Publishing fix

- [ ] Release workflow improvements
- [ ] NPM unpublish before republish

### Exit Criteria

- [ ] Release workflow passes
- [ ] Packages published to npm

## 🧪 Phase 4 (v0.4.0)

**Focus:** AI-assisted authoring (experimental)

- [ ] `schemasentry suggest` — AI-powered schema recommendations
  - Analyze page content and suggest best schema types
  - Recommend additional fields based on context
  - Integration with LLM APIs for smart suggestions
- [ ] `schemasentry scaffold` — Generate schema for pages without it (write/update)
  - Auto-detect page type from content/URL patterns
  - Generate sensible defaults based on page analysis
  - Interactive prompts for customization
- [ ] Video tutorials and expanded docs
- [ ] **Product Hunt launch** 🚀

## 🏁 Phase 5 (v1.0.0)

**Focus:** Stability and trust

- [ ] Stable API contract
- [ ] Comprehensive test coverage (>80%)
- [ ] Performance benchmarks
- [ ] Maintainer guide
- [ ] Contributor onboarding docs

## 💡 Post-v1.0 Ideas

- Framework adapters (Astro, Remix, SvelteKit, Angular) — **contributor-led**
- Visual schema editor
- AI-assisted schema suggestions
- Enterprise features (audit logs, team dashboards)

---

**Goal:** Make every Next.js site AI-ready and SEO-optimized through proper structured data.
