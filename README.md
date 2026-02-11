# Schema Sentry 🛡️

[![CI](https://github.com/arindamdawn/schema-sentry/actions/workflows/ci.yml/badge.svg)](https://github.com/arindamdawn/schema-sentry/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@schemasentry%2Fcore.svg)](https://www.npmjs.com/package/@schemasentry/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Type-safe structured data for Next.js App Router—built for SEO and AI-powered discovery.**

Schema Sentry provides a small SDK and CLI for generating and validating JSON-LD with deterministic output. Designed for predictable diffs, CI-grade enforcement, and maximum discoverability across both traditional search engines and AI systems.

## ✨ Features

- 🔒 **Type-safe builders** for 11+ common schema types
- 🎯 **Deterministic JSON-LD** for clean, reviewable diffs
- ⚛️ **App Router `<Schema />` component** for seamless Next.js integration
- 🧭 **Manifest-driven coverage** ensures every route has schema
- 🔍 **CLI validation** with clear, actionable errors
- 📊 **Schema audit** — Analyze site health and detect missing schema (v0.2.0)
- 🧪 **CLI commands today** — `init`, `validate`, and `audit`
- 🛣️ **Next up (v0.3.0)** — HTML reports, PR annotations, and more schema types
- 📴 **Zero network calls** in OSS mode
- 🤖 **AI-ready output** optimized for LLM consumption and citations

## 🧠 Why Structured Data Matters for Both Traditional and AI Search

### The Problem

Modern content discovery happens through two channels:

1. **Traditional Search** (Google, Bing) - Rich snippets, knowledge panels, improved rankings
2. **AI-Powered Discovery** (ChatGPT, Claude, Perplexity, AI agents) - Contextual answers, citations, voice assistants

Teams often add JSON-LD late, inconsistently, or incorrectly. This leads to:

- ❌ Missing rich snippets in Google search results
- ❌ AI systems failing to understand and cite your content
- ❌ Hard-to-debug CI failures after content changes
- ❌ Inconsistent JSON-LD creating noisy diffs in version control

### The Solution

Schema Sentry enforces structured data in CI, ensuring your content is:

- ✅ **Machine-readable** for both search engines and AI systems
- ✅ **Deterministically generated** for clean, reviewable diffs
- ✅ **Validated automatically** before deployment
- ✅ **Complete across all routes** via manifest-driven checks

> **AI is eating the web.** ChatGPT, Claude, Perplexity, and AI agents now drive significant traffic. Structured data is how AI understands and recommends your content.

### Schema Sentry = Better SEO + AI Discovery

| Feature | Traditional SEO | AI/LLM Discovery |
|---------|----------------|------------------|
| Rich snippets | ✅ | ✅ Better citations |
| Knowledge panels | ✅ | ✅ Contextual answers |
| Voice search | ✅ | ✅ Voice assistant results |
| AI agent recommendations | ❌ | ✅ Direct inclusion |

By using Schema Sentry, you're not just optimizing for Google—you're making your content discoverable by the next generation of AI-powered search.

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@schemasentry/core`](https://www.npmjs.com/package/@schemasentry/core) | [![npm](https://img.shields.io/npm/v/@schemasentry/core.svg)](https://www.npmjs.com/package/@schemasentry/core) | Typed builders and validation primitives |
| [`@schemasentry/next`](https://www.npmjs.com/package/@schemasentry/next) | [![npm](https://img.shields.io/npm/v/@schemasentry/next.svg)](https://www.npmjs.com/package/@schemasentry/next) | App Router `<Schema />` component |
| [`@schemasentry/cli`](https://www.npmjs.com/package/@schemasentry/cli) | [![npm](https://img.shields.io/npm/v/@schemasentry/cli.svg)](https://www.npmjs.com/package/@schemasentry/cli) | CI validation and report output |

## 🚀 Install

```bash
# pnpm
pnpm add @schemasentry/next @schemasentry/core
pnpm add -D @schemasentry/cli

# npm
npm install @schemasentry/next @schemasentry/core
npm install -D @schemasentry/cli

# yarn
yarn add @schemasentry/next @schemasentry/core
yarn add -D @schemasentry/cli
```

## 🧩 App Router Usage

```tsx
import { Schema, Article, Organization } from "@schemasentry/next";

const org = Organization({
  name: "Acme Corp",
  url: "https://acme.com"
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

## 🗺️ Manifest and Coverage

```json
{
  "routes": {
    "/": ["Organization", "WebSite"],
    "/blog/[slug]": ["Article"]
  }
}
```

## 🧪 CLI

**Quick start**

1. Generate starter files:

```bash
pnpm schemasentry init
```

2. Optionally scan your app and add `WebPage` entries for discovered routes:

```bash
pnpm schemasentry init --scan
```

3. Validate coverage and rules:

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --data ./schema-sentry.data.json
```

4. Audit schema health:

```bash
pnpm schemasentry audit --data ./schema-sentry.data.json
pnpm schemasentry audit --data ./schema-sentry.data.json --manifest ./schema-sentry.manifest.json
```

5. Scan for missing routes:

```bash
pnpm schemasentry audit --data ./schema-sentry.data.json --scan
```

6. Generate an HTML report:

```bash
pnpm schemasentry audit \
  --data ./schema-sentry.data.json \
  --manifest ./schema-sentry.manifest.json \
  --format html \
  --output ./schema-sentry-report.html
```

**All commands**

```bash
pnpm schemasentry init

pnpm schemasentry init --scan

pnpm schemasentry audit \
  --data ./schema-sentry.data.json

pnpm schemasentry audit \
  --data ./schema-sentry.data.json \
  --manifest ./schema-sentry.manifest.json

pnpm schemasentry audit \
  --data ./schema-sentry.data.json \
  --scan

pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --data ./schema-sentry.data.json

pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --data ./schema-sentry.data.json \
  --format html \
  --output ./schema-sentry-validate-report.html

pnpm schemasentry audit \
  --data ./schema-sentry.data.json \
  --format html \
  --output ./schema-sentry-audit-report.html
```

The CLI emits JSON output by default and exits with code 1 on errors, making it perfect for CI/CD pipelines.
Use `--format html --output <path>` to generate a shareable report file.
Use `--annotations github` in GitHub Actions to emit PR annotations.
Recommended field checks run as warnings by default. Disable them with `--no-recommended`.
See `docs/ci.md` for complete CI workflow examples.

### Optional Config

Create `schema-sentry.config.json` to control defaults:

```json
{
  "recommended": false
}
```

CLI flags override config. Use `--config ./path/to/config.json` to point at a custom file.

### Understanding Manifest vs Data

| File | Purpose | How It Works |
|------|---------|---------------|
| `schema-sentry.manifest.json` | Defines **expected schema types** per route | You create this manually - tells Schema Sentry what each page should have |
| `schema-sentry.data.json` | Contains the **actual schema data** | You create this manually - mirrors your actual schema |

**Why two files?** The manifest ensures every route has the right schema type. The data file validates that your actual schema matches expectations.

Use `schemasentry init` to generate starter files. Add `--scan` to include all discovered routes as `WebPage` entries, and use `schemasentry audit --scan` to detect missing routes later.

## ✅ Supported Schema Types (V1)

- Organization
- Person
- Place
- LocalBusiness
- WebSite
- WebPage
- Article
- BlogPosting
- Product
- VideoObject
- ImageObject
- Event
- Review
- FAQPage
- HowTo
- BreadcrumbList

## 🧪 Example App

A minimal Next.js App Router example lives in `examples/next-app` and includes a manifest and data file. It targets Next.js 16.1.6 and React 19.1.1.

## ✅ Compatibility

- Next.js App Router (Next.js 13.4+)
- React 18+
- Node.js 18+

## 🛣️ Roadmap

See `ROADMAP.md` for planned milestones and future work.

## 🤝 Contributing

See `CONTRIBUTING.md` for workflow, scope guardrails, and expectations.

## 📄 License

MIT © Arindam Dawn

## 💬 Support

- Report bugs: https://github.com/arindamdawn/schema-sentry/issues/new?template=bug_report.md
- Request features: https://github.com/arindamdawn/schema-sentry/issues/new?template=feature_request.md
- Discussions: https://github.com/arindamdawn/schema-sentry/discussions

---

Made with ❤️ for the Next.js community
