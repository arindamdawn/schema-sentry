# @schemasentry/cli

## 0.6.1

### Patch Changes

- c3ffa5f: ## Improvements to audit and validate commands

  ### Added

  - `validate --build` to run a build command before reality-check validation.
  - `validate --build-command <command>` to override the build command used with `--build`.

  ### Changed

  - `validate` now auto-detects built output when `--root` is omitted (`.next/server/app`, `out`, `.next/server/pages`).
  - `audit` now skips legacy coverage checks when no schema data file is loaded, preventing false positives from empty-data assumptions.
  - Source scanning now detects aliased `Schema` component usage (for example `Schema as JsonLdSchema`) to reduce ghost-route false positives.
  - Updated docs and CI examples to use reality-check validation (`--root` / auto-detect) instead of deprecated `validate --data` flows.
  - Refined `v0.7.0` roadmap scope to focus on:
    - Rulesets: `--rules google` and `--rules ai-citation` for validation
    - CLI visualization: `--format table` (default) and `--format tree`
  - Deferred VS Code extension to `v0.9.0`.

  ### Fixed

  - Improved warning message in audit when no data file is loaded with helpful documentation link.
  - Added clearer comments in `resolveExistingBuildOutputDir` for better code maintainability.

## 0.3.0

### Minor Changes

- ## v0.3.0 - CI Reporting and Audit Visibility

  ### Added

  - **HTML Report Output**: Generate shareable HTML reports with `--format html --output <path>`
  - **GitHub Actions Annotations**: Emit PR annotations with `--annotations github` for errors and warnings
  - **Multiple Output Formats**: Support for JSON and HTML output formats
  - **Output File Support**: Write reports to file with `-o, --output <path>`
  - **VideoObject Schema Type**: New builder for video content
  - **ImageObject Schema Type**: New builder for image content
  - **Performance Benchmark Test**: Validates 200 routes in under 5 seconds

  ### Improved

  - **CI Integration**: Better support for automated validation pipelines
  - **Documentation**: Comprehensive CI guide with examples

  ### Changed

  - **Default Format**: JSON remains default for machine readability
  - **Annotation Mode**: Disabled by default, enable with `--annotations github`

### Patch Changes

- Updated dependencies
  - @schemasentry/core@0.3.0

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
