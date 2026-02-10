# Schema Sentry

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
- 🚀 **Scaffold schema** — Auto-generate schema for pages without it (v0.2.0)
- 🤖 **AI suggestions** — Smart schema recommendations (v0.3.0)
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

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --data ./schema-sentry.data.json
```

The CLI emits JSON by default and exits non-zero on errors.

## ✅ Supported Schema Types (V1)

- Organization
- Person
- Place
- WebSite
- WebPage
- Article
- BlogPosting
- Product
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
