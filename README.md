# Schema Sentry

[![CI](https://github.com/arindamdawn/schema-sentry/actions/workflows/ci.yml/badge.svg)](https://github.com/arindamdawn/schema-sentry/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@schemasentry%2Fcore.svg)](https://www.npmjs.com/package/@schemasentry/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Type-safe structured data for Next.js App Router, enforced in CI.**

Schema Sentry provides a small SDK + CLI for generating and validating JSON-LD with deterministic output. Built for maintainability, predictable diffs, and CI-grade enforcement.

## ✨ Features

- 🔒 **Type-safe builders** for 11 common schema types
- 🎯 **Deterministic JSON-LD** for clean diffs and stable CI
- ⚛️ **App Router component** `<Schema />` for seamless Next.js integration
- 📊 **Manifest-driven coverage** ensures every route has schema
- 🔍 **CLI validation** with clear, actionable errors
- 🚀 **Zero network calls** - works offline in OSS mode

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@schemasentry/core`](https://www.npmjs.com/package/@schemasentry/core) | [![npm](https://img.shields.io/npm/v/@schemasentry/core.svg)](https://www.npmjs.com/package/@schemasentry/core) | Typed builders + validation primitives |
| [`@schemasentry/next`](https://www.npmjs.com/package/@schemasentry/next) | [![npm](https://img.shields.io/npm/v/@schemasentry/next.svg)](https://www.npmjs.com/package/@schemasentry/next) | App Router `<Schema />` component |
| [`@schemasentry/cli`](https://www.npmjs.com/package/@schemasentry/cli) | [![npm](https://img.shields.io/npm/v/@schemasentry/cli.svg)](https://www.npmjs.com/package/@schemasentry/cli) | CI validation and report output |

## 🚀 Quick Start

### Installation

```bash
# Using pnpm (recommended)
pnpm add @schemasentry/next @schemasentry/core
pnpm add -D @schemasentry/cli

# Using npm
npm install @schemasentry/next @schemasentry/core
npm install -D @schemasentry/cli

# Using yarn
yarn add @schemasentry/next @schemasentry/core
yarn add -D @schemasentry/cli
```

### Basic Usage

```tsx
// app/blog/[slug]/page.tsx
import { Schema, Article, Organization } from "@schemasentry/next";

export default function BlogPost() {
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

  return (
    <>
      <Schema data={[org, article]} />
      <article>
        <h1>{article.headline}</h1>
        {/* Your content */}
      </article>
    </>
  );
}
```

### CLI Validation

Create a manifest file `schema-sentry.manifest.json`:

```json
{
  "routes": {
    "/": ["Organization", "WebSite"],
    "/blog/[slug]": ["Article"]
  }
}
```

Validate in CI:

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --data ./schema-sentry.data.json
```

## 📚 Supported Schema Types

### V1 (Available Now)
- **Organization** - Company or organization info
- **Person** - Individual person schema
- **Place** - Physical locations
- **WebSite** - Site-wide metadata
- **WebPage** - Individual page schema
- **Article** - Blog posts, news articles
- **BlogPosting** - Blog-specific content
- **Product** - E-commerce products
- **FAQPage** - Frequently asked questions
- **HowTo** - Step-by-step instructions
- **BreadcrumbList** - Navigation breadcrumbs

## 🎯 Why Schema Sentry?

Teams often add JSON-LD late, inconsistently, and without validation. That leads to:

- ❌ Missing or incomplete schema on key routes
- ❌ Hard-to-debug CI failures after content changes  
- ❌ Inconsistent JSON-LD output creating noisy diffs

Schema Sentry solves this by:
- ✅ Enforcing schema presence via manifest-driven CI checks
- ✅ Providing deterministic output for stable diffs
- ✅ Validating schema completeness before deployment
- ✅ Keeping a minimal, framework-aware SDK

## 🛣️ Roadmap

- ✅ **v0.1.0** - Core builders, validation, CLI (Released!)
- 🚧 **v0.2.0** - Init wizard, extended types, coverage checks
- 📅 **v0.3.0** - HTML reports, GitHub annotations, Product Hunt
- 📅 **v1.0.0** - Stable API, performance benchmarks

See [ROADMAP.md](ROADMAP.md) for detailed planning.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Quick start for contributors:**

```bash
pnpm install
pnpm build
pnpm test
```

## 📄 License

MIT © [Arindam Dawn](https://github.com/arindamdawn)

## 💬 Support

- 🐛 [Report bugs](https://github.com/arindamdawn/schema-sentry/issues/new?template=bug_report.md)
- ✨ [Request features](https://github.com/arindamdawn/schema-sentry/issues/new?template=feature_request.md)
- 💼 [Discussions](https://github.com/arindamdawn/schema-sentry/discussions)

---

**Made with ❤️ for the Next.js community**
