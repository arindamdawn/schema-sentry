# @schemasentry/cli

## 0.2.0

### Minor Changes

- 8fa2007: Release v0.2.0: Developer experience and schema completeness

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

### Patch Changes

- Updated dependencies [8fa2007]
  - @schemasentry/core@0.2.0

## 0.1.0

### Minor Changes

- 8bcfbf5: Initial release v0.1.0

  ### @schemasentry/core

  - Typed schema builders for Organization, Person, Place, WebSite, WebPage, Article, BlogPosting, Product, FAQPage, HowTo, and BreadcrumbList
  - Deterministic JSON-LD output with stable key ordering
  - Validation engine with required field checks and error reporting
  - BreadcrumbList validation for position and URL requirements

  ### @schemasentry/next

  - React `<Schema />` component for Next.js App Router
  - Automatic script tag generation with proper JSON-LD formatting
  - Full re-export of @schemasentry/core builders

  ### @schemasentry/cli

  - `validate` command for manifest-driven schema coverage checks
  - JSON output format for CI integration
  - Support for manifest and data file validation
  - Exit codes for CI automation (0 = success, 1 = failure)

  ### Infrastructure

  - Monorepo setup with pnpm workspaces
  - TypeScript with strict mode enabled
  - Vitest for testing
  - Changesets for versioning and publishing
  - GitHub Actions for CI/CD

### Patch Changes

- Updated dependencies [8bcfbf5]
  - @schemasentry/core@0.1.0
