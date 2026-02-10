# Architecture

Schema Sentry is a small, layered monorepo that keeps responsibilities clear and dependencies minimal.

## Packages

`@schemasentry/core` provides framework-agnostic builders and validation primitives. It has no runtime dependencies.

`@schemasentry/next` provides the App Router `<Schema />` component. It depends only on `@schemasentry/core` and uses React and Next.js as peer dependencies.

`@schemasentry/cli` provides CI validation and reporting. It depends only on `@schemasentry/core`.

## Dependency Rules

- `core` must remain framework-agnostic
- `next` must not import from `cli`
- `cli` must not import from `next`

## Determinism

`core` exports `stableStringify` to ensure consistent JSON-LD output for clean diffs and predictable CI behavior.
