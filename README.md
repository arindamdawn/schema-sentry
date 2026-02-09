# Schema Sentry

Type-safe structured data for Next.js App Router, enforced in CI.

Schema Sentry provides a small SDK + CLI for generating and validating JSON-LD with deterministic output. It is built for maintainability, predictable diffs, and CI-grade enforcement while keeping scope sustainable for a solo maintainer.

## Why Schema Sentry

Teams often add JSON-LD late, inconsistently, and without validation. That leads to:

- Missing or incomplete schema on key routes
- Hard-to-debug CI failures after content changes
- Inconsistent JSON-LD output that creates noisy diffs

Schema Sentry solves this by enforcing schema in CI, providing deterministic output, and keeping a minimal, framework-aware SDK.

## Features

- **Typed builders** for common schema types
- **Deterministic JSON-LD output** for clean diffs and stable CI
- **App Router `<Schema />` component** for Next.js
- **Manifest-driven coverage** to ensure routes have schema
- **CLI validation** with clear errors and machine-readable output
- **Zero network calls** in OSS mode

## Package Layout

- `@schemasentry/core` — typed builders + validation primitives
- `@schemasentry/next` — App Router `<Schema />` component
- `@schemasentry/cli` — CI validation and report output

## Install

```bash
pnpm add @schemasentry/next @schemasentry/core
pnpm add -D @schemasentry/cli
```

## App Router Usage

```tsx
import { Schema, Article, Organization } from "@schemasentry/next";

const org = Organization({
  name: "Acme Corp",
  url: "https://acme.com",
  logo: "https://acme.com/logo.png"
});

const article = Article({
  headline: "Launch Update",
  authorName: "Jane Doe",
  datePublished: "2026-02-09",
  url: "https://acme.com/blog/launch"
});

export default function Page() {
  return (
    <>
      <Schema data={[org, article]} />
      <main>...</main>
    </>
  );
}
```

## Manifest & Coverage

A manifest maps routes to expected schema blocks and powers coverage checks.

```json
{
  "routes": {
    "/": ["Organization", "WebSite"],
    "/blog/[slug]": ["Article"]
  }
}
```

## CLI

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --data ./schema-sentry.data.json
```

The CLI emits JSON by default and exits non-zero on errors. HTML output is planned.

See `schema-sentry.manifest.example.json` and `schema-sentry.data.example.json` for sample inputs.

## Scope (V1)

Schema Sentry focuses on **Next.js App Router only**. Framework-agnostic support is on the roadmap but requires contributor-led PRs.

Standard response for out-of-scope requests:

> That's a great idea. The focus right now is perfecting the App Router experience. I've noted it on the roadmap. PRs are welcome!

## Roadmap Highlights

- **MVP (v0.1.0):** builders, deterministic output, App Router `<Schema />`, CLI JSON report
- **v0.2.0:** coverage checks, recommended field validation, completeness scoring
- **v0.3.0:** HTML reports, example app, docs expansion
- **v1.0.0:** stable API and CLI contract, performance verification

See `ROADMAP.md` for milestones and `/notes/RELEASE_ROADMAP.md` for release planning (local).

## Contributing

See `CONTRIBUTING.md` for workflow, scope guardrails, and expectations.

## License

MIT © Schema Sentry
