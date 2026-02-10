# Example App (Next.js App Router)

This is a minimal App Router example that uses Schema Sentry.

## Setup

From the repo root:

```bash
pnpm install
pnpm --filter schema-sentry-example-next-app dev
```

## Validate Schema

```bash
pnpm --filter schema-sentry-example-next-app schema:validate
```

Files used for validation:

- `schema-sentry.manifest.json`
- `schema-sentry.data.json`
