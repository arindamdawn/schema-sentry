# Roadmap

Last updated: 2026-02-12

## 🎉 Current Status

**v0.6.0 is live!** Published to npm and ready to use.

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

## ✅ Phase 4 (v0.4.0) — COMPLETE

**Focus:** Friction removal in onboarding and CI

### Released

- ✅ `schemasentry collect` (read-only)
  - Collect JSON-LD per route by scanning/crawling app output
  - Generate deterministic `schema-sentry.data.json` output
  - Support `--output`, `--format json`, `--root`, and route filtering (`--routes`)
  - No file writes unless explicit output path is provided
- ✅ CI-safe diff mode
  - Compare collected data against existing data file
  - Exit non-zero on drift to catch stale schema data in PRs
- ✅ Docs + examples
  - End-to-end setup: `init` -> `collect` -> `validate`
  - CI example for data drift detection

## 🚦 Priority Queue (Highest Impact First)

1. Pattern-based auto-detection (infer schema types from route conventions)
2. `schemasentry scaffold` (safe write/update workflow with dry-run default) — **TOP PRIORITY for v0.5.0**
3. Rulesets for rich results and AI citations
4. VS Code extension (schema preview while editing)
5. GitHub bot for PR comments (CI automation)
6. Pages Router support (extend beyond App Router)
7. Schema testing framework (assertions for schema correctness)
8. `schemasentry suggest` (read-only AI recommendations)
9. Plugin API for custom org rules
10. Framework adapters beyond Next.js (Astro/Remix/SvelteKit/Angular)

## ✅ Phase 4.1 (v0.5.0) — COMPLETE

**Focus:** Core authoring workflow and adoption

### Released

- ✅ `schemasentry scaffold` — Generate schema for pages without it (write/update)
  - Use auto-detected page types as defaults
  - `--dry-run` as default behavior with explicit diff preview
  - `--write` gate for file updates
  - Rollback-safe write strategy for generated updates
- ✅ Pattern-based auto-detection
  - Infer schema types from URL patterns (e.g., `/blog/*` → BlogPosting, `/products/*` → Product)
  - Auto-generate manifest entries based on route conventions
  - Configurable pattern rules in schema-sentry.config.json
- ✅ Docs + examples
  - End-to-end setup: `collect` -> `auto-detect` -> `scaffold` -> `validate`
  - CI guidance for dry-run schema generation checks

### v0.5.0 Exit Criteria

- ✅ Auto-detection + scaffold shipped with tests
- ✅ `pnpm build`, `pnpm test`, and `pnpm typecheck` pass
- ✅ Changelog + docs updated with usage and safety notes

## ✅ Phase 4.2 (v0.6.0) — COMPLETE

**Focus:** Zero false positives - validate reality, not just configuration

### v0.6.0 Released

**⚠️ BREAKING CHANGES** - Critical fixes to eliminate false positives:

- ✅ **Reality Check validation** - `validate` command now checks built HTML output
  - Validates actual rendered JSON-LD in built HTML files
  - Cross-references source code, manifest, and HTML output
  - Eliminates false positives from JSON-only validation
  - Requires `--root` pointing to built output directory
  
- ✅ **Ghost route detection** - `audit` command finds phantom routes
  - Detects routes in manifest that lack Schema components in source
  - Reports routes with Schema imports but no actual usage
  - Identifies pages that exist but have no schema configuration
  
- ✅ **Enhanced scaffolding** - Shows copy-paste component code
  - Generates full TypeScript/React code examples
  - Shows exact imports and component structure needed
  - Maps routes to correct file paths automatically
  - Colorized output with syntax highlighting via chalk
  
- ✅ **Source code scanning** - New `src/source.ts` module
  - AST-lite detection of Schema component imports and usage
  - Maps page files to routes automatically
  - Reports coverage gaps between source and manifest
  
- ✅ **Beautiful CLI output** - Colored, emoji-enhanced reporting
  - Green/red/yellow status indicators
  - Clear error messages with actionable suggestions
  - Summary statistics with visual hierarchy
  - Progress indicators during long operations

### Migration Guide

**Before (v0.5.0 - false positives):**
```bash
schemasentry validate --manifest ./manifest.json --data ./data.json
```

**After (v0.6.0 - reality check):**
```bash
next build  # Must build first!
schemasentry validate --manifest ./manifest.json --root ./.next/server/app
```

## 🧪 Phase 4.3 (v0.7.0) — Next Release

**Focus:** Editor and visualization developer experience

### v0.7.0 Scope

- [ ] VS Code extension
  - Schema preview panel while editing components
  - Inline decorations showing schema types on hover
  - Snippets for common schema types
  - Quick actions to generate schema stubs
- [ ] CLI schema visualization
  - Tree output showing schema hierarchy with nesting
  - Table output with columns: Route, Schema Types, Blocks, Status
  - Diagram output for entity relationships
  - `--format tree`, `--format table`, `--format diagram` flags

## 🧪 Phase 4.3 (v0.7.0)

**Focus:** CI automation and broader Next.js coverage

### v0.7.0 Scope

- [ ] GitHub bot for PR comments
  - Automated schema review on pull requests
  - Inline comments for schema issues
  - `/schemasentry` command for on-demand checks
- [ ] Pages Router support
  - Add `@schemasentry/react` package for Pages Router compatibility
  - Support `pages/` directory schema injection
  - Unified CLI works across both routers
- [ ] Schema testing framework
  - Write assertions like "all articles must have author"
  - Test schema correctness in CI pipelines
  - Custom rule definitions for team policies

## 🧪 Phase 4.4 (v0.8.0)

**Focus:** Rulesets and AI assistance

### v0.8.0 Scope

- [ ] Rulesets
  - `--rules google` for rich-result-focused checks
  - `--rules ai-citation` for LLM/citation-focused checks
- [ ] Team policy controls
  - Rule severity overrides (error/warn/off)
  - Rule allowlist/denylist config
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

## 🧪 Phase 4.5 (v0.9.0)

**Focus:** Extensibility and ecosystem growth

### v0.9.0 Scope

- [ ] Plugin API for custom validators and internal rules
- [ ] Framework adapter interfaces in `@schemasentry/core`
- [ ] First non-Next.js adapter (Astro or Remix)
- [ ] CMS integrations (contributor-friendly)
  - Sanity.io plugin
  - Contentful integration patterns
  - Strapi integration patterns

## 🚀 Phase 4.6 (v0.9.5)

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

- Visual schema editor (drag-and-drop schema builder)
- Enterprise features (audit logs, team dashboards, SSO)
- GraphQL schema awareness (infer types from GraphQL schema)
- i18n/multi-language schema support
- Schema.org deprecation alerts and migration guides
- Advanced AI recommendations (generate full schema from page content)

---

**Goal:** Make every Next.js site AI-ready and SEO-optimized through proper structured data.
