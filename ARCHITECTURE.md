# Architecture

Schema Sentry is organized as a small, layered monorepo to keep responsibilities clear and dependencies minimal.

## Packages

- `@schemasentry/core`
  - Pure, framework-agnostic builders and validation primitives
  - No runtime dependencies

- `@schemasentry/next`
  - App Router `<Schema />` component
  - Depends only on `@schemasentry/core`
  - React and Next.js are peer dependencies

- `@schemasentry/cli`
  - CLI for CI validation and reporting
  - Depends on `@schemasentry/core`

## Dependency Rules

- `core` must remain framework-agnostic
- `next` must not import anything from `cli`
- `cli` must not import from `next`

## Determinism

`core` exports `stableStringify` to ensure consistent JSON-LD output for clean diffs and predictable CI behavior.
