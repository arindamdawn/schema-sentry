# Roadmap

Last updated: 2026-02-11

## 🎉 Current Status

**v0.3.1 is live!** Published to npm and ready to use.

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

## ✅ Phase 3.1 (v0.3.1) — COMPLETE

**Focus:** Publishing fix

- ✅ Release workflow improvements
- ✅ NPM unpublish before republish
- ✅ GitHub tag conflict handling during release

## 🧪 Phase 4 (v0.4.0) — Next Release

**Focus:** AI-assisted authoring (experimental, read-only first)

### Feasibility Assessment

- ⚠️ Current Phase 4 scope is too broad for a single release (new command surface + LLM integration + write/update behavior + launch assets).
- ✅ Feasible if broken into read-only recommendation first, then write/update automation.

### v0.4.0 Scope (Implementable)

- [ ] `schemasentry suggest` (read-only, experimental)
  - Analyze route content/manifest and suggest schema types + missing fields
  - Emit deterministic JSON output for CI review (`--format json` default)
  - No file writes in this phase
- [ ] Provider architecture for suggestions
  - Integrate Vercel AI SDK in `@schemasentry/cli` through an adapter layer
  - Support OpenAI, Anthropic, Gemini, and OpenRouter as configurable providers
  - Support `--provider` selection and provider-specific API key env vars
  - Graceful fallback/error model when provider is not configured
- [ ] Safety and observability
  - Explicit `--experimental` gate for AI-assisted command
  - Clear command/runtime docs for offline/OSS mode behavior
- [ ] Docs + examples
  - Usage docs for `suggest`
  - CI example showing read-only suggestion reports

### v0.4.0 Exit Criteria

- [ ] `schemasentry suggest` shipped with tests
- [ ] `pnpm build`, `pnpm test`, and `pnpm typecheck` pass
- [ ] Changelog + docs updated with experimental limitations

## 🧪 Phase 4.1 (v0.4.1)

**Focus:** Scaffold automation and authoring workflow

- [ ] `schemasentry scaffold` — Generate schema for pages without it (write/update)
  - Auto-detect page type from content/URL patterns
  - Generate sensible defaults based on page analysis
  - Interactive prompts for customization
- [ ] Dry-run mode + diff preview before writes
- [ ] Rollback-safe write strategy for generated updates

## 🚀 Phase 4.2 (v0.4.2)

**Focus:** Adoption assets and launch readiness

- [ ] Video tutorials and expanded docs
- [ ] Product messaging and launch checklist
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
