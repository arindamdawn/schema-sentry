# Roadmap

Last updated: 2026-02-12

## 🎉 Current Status

**v0.3.2 is live!** Published to npm and ready to use.

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

## ✅ Phase 3.2 (v0.3.2) — COMPLETE

**Focus:** Documentation and release readiness polish

- ✅ Package-level README files
- ✅ README presentation improvements
- ✅ Roadmap scope clarification for upcoming releases

## 🚦 Priority Queue (Highest Impact First)

1. `schemasentry collect` (remove manual data-file bottleneck)
2. `schemasentry suggest` (read-only AI recommendations)
3. `schemasentry scaffold` (safe write/update workflow)
4. Rulesets for rich results and AI citations
5. Plugin API for custom org rules
6. Framework adapters beyond Next.js (Astro/Remix/SvelteKit/Angular)

## 🧪 Phase 4 (v0.4.0) — Next Release

**Focus:** Friction removal in onboarding and CI

### v0.4.0 Scope (Highest Priority)

- [ ] `schemasentry collect` (read-only)
  - Collect JSON-LD per route by scanning/crawling app output
  - Generate deterministic `schema-sentry.data.json` output
  - Support `--output`, `--format json`, and `--root`
  - No file writes unless explicit output path is provided
- [ ] CI-safe diff mode
  - Compare collected data against existing data file
  - Exit non-zero on drift to catch stale schema data in PRs
- [ ] Docs + examples
  - End-to-end setup: `init` -> `collect` -> `validate`
  - CI example for data drift detection

### v0.4.0 Exit Criteria

- [ ] `schemasentry collect` shipped with tests
- [ ] Benchmark remains within current 200-route performance target
- [ ] `pnpm build`, `pnpm test`, and `pnpm typecheck` pass

## 🧪 Phase 4.1 (v0.5.0)

**Focus:** AI-assisted authoring (experimental, read-only)

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

## 🧪 Phase 4.2 (v0.6.0)

**Focus:** Scaffold automation and authoring workflow

- [ ] `schemasentry scaffold` — Generate schema for pages without it (write/update)
  - Auto-detect page type from content/URL patterns
  - Generate sensible defaults based on page analysis
  - Interactive prompts for customization
- [ ] Dry-run mode + diff preview before writes
- [ ] Rollback-safe write strategy for generated updates

## 🧪 Phase 4.3 (v0.7.0)

**Focus:** Validation depth and policy controls

- [ ] Rulesets
  - `--rules google` for rich-result-focused checks
  - `--rules ai-citation` for LLM/citation-focused checks
- [ ] Team policy controls
  - Rule severity overrides (error/warn/off)
  - Rule allowlist/denylist config

## 🧪 Phase 4.4 (v0.8.0)

**Focus:** Extensibility and ecosystem growth

- [ ] Plugin API for custom validators and internal rules
- [ ] Framework adapter interfaces in `@schemasentry/core`
- [ ] First non-Next.js adapter (Astro or Remix)

## 🚀 Phase 4.5 (v0.9.0)

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

- Visual schema editor
- Enterprise features (audit logs, team dashboards)

---

**Goal:** Make every Next.js site AI-ready and SEO-optimized through proper structured data.
