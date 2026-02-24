<div align="center">
  <img src="docs/assets/schema-sentry-banner.png" alt="Schema Sentry Banner" width="100%" />

# Schema Sentry 🛡️

**Adding JSON-LD manually is exhausting. Schema Sentry makes it effortless—ensuring your content gets discovered by search engines AND AI assistants like ChatGPT, Claude, and Perplexity.**
  
  [Getting Started](#-install) • [Documentation](docs/) • [Examples](examples/)
</div>


Schema Sentry provides a type-safe SDK and CLI for generating, validating, and auditing JSON-LD structured data with deterministic output. Designed for predictable diffs, CI-grade enforcement, and maximum discoverability across both traditional search engines (Google, Bing) and AI-powered systems (ChatGPT, Claude, Perplexity).

**Current release:** `v0.11.0`

## 🚀 5-Minute Quick Start

```bash
# 1. Install
pnpm add @schemasentry/next @schemasentry/core
pnpm add -D @schemasentry/cli

# 2. Initialize
pnpm schemasentry init

# 3. Add to your page
# Copy-paste the code from: pnpm schemasentry scaffold

# 4. Build & Validate
next build
pnpm schemasentry validate
```

## 😫 Before vs After

| | **Before Schema Sentry** | **After Schema Sentry** |
|---|---|---|
| **Writing JSON-LD** | ❌ Manual, error-prone, tedious | ✅ Type-safe builders with autocomplete |
| **Keeping in sync** | ❌ Schema breaks when content changes | ✅ Auto-validated in CI on every PR |
| **SEO results** | ❌ Missing rich snippets | ✅ Eligible for rich results |
| **AI discovery** | ❌ AI can't cite your content | ✅ ChatGPT, Claude can recommend you |

## ✨ Features

- 🔒 **Type-safe JSON-LD builders** for 15+ schema types (Organization, Article, Product, FAQPage, HowTo, VideoObject, ImageObject, Event, Review, and more)
- 🎯 **Deterministic JSON-LD output** for clean, reviewable version control diffs
- ⚛️ **App Router `<Schema />` component** for seamless Next.js integration
- 🧭 **Manifest-driven schema coverage** ensures every route has proper structured data
- 🔍 **CLI validation** with clear, actionable errors for CI/CD pipelines
- 📊 **Schema audit** — Analyze site health, detect missing/incomplete schema
- 📥 **Automated data collection** — `collect` command scans built apps to auto-generate schema data files
- 🧪 **CLI commands** — `init`, `validate`, `audit`, `collect`, `scaffold` for complete workflows
- ✅ **Reality Check validation** — `validate` checks actual built HTML output, not just JSON files (zero false positives!)
- 👻 **Ghost route detection** — `audit` finds routes in manifest without Schema components in source code
- 🏗️ **Schema scaffolding** — `scaffold` shows copy-paste component code with full examples from URL patterns (/blog/* → BlogPosting, /products/* → Product)
- 📄 **HTML Reports** — Generate shareable reports with `--format html --output <path>`
- 🗣️ **PR Annotations** — GitHub Actions annotations with `--annotations github`
- 📴 **Zero network calls** in OSS mode (privacy-first, offline-friendly)
- 🤖 **AI-ready output** optimized for LLM consumption, citations, and AI agent recommendations
- 📦 **VS Code extension** — Schema preview panel, snippets, inline decorations while editing
- 🤖 **GitHub Bot** — Automated PR schema reviews with `schemasentry bot`
- ✨ **AI suggestions** — `schemasentry suggest` recommends schema types (BYOK providers)
- 🤖 **MCP Server** — Use Schema Sentry from Claude Desktop, Cursor, and other AI assistants

## ⚙️ How It Works

Schema Sentry fits into your development workflow in 3 simple steps:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. DEFINE      │────▶│  2. VALIDATE    │────▶│  3. DEPLOY      │
│                 │     │                 │     │                 │
│  Add Schema     │     │  CI checks      │     │  Content live   │
│  component to   │     │  actual HTML    │     │  with perfect   │
│  your pages     │     │  output         │     │  structured data│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**The magic:** Unlike other tools that validate JSON config files (which can give false positives), Schema Sentry validates your **actual built HTML** to ensure schema is truly rendered.

## 🧠 Why Structured Data Matters

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

## 📈 Real-World Impact

Structured data isn't just a "nice-to-have"—it directly impacts your visibility:

- **30% higher CTR** - Product pages with Product schema see 30% higher click-through rates in Google
- **Featured snippets** - Articles with proper Article schema are 3x more likely to get featured
- **AI citations** - ChatGPT, Claude, and Perplexity use structured data to cite sources—without it, they can't recommend your content
- **Voice search** - Smart assistants rely on structured data to answer voice queries

> **"AI is eating the web."** ChatGPT, Claude, Perplexity, and AI agents now drive significant traffic. Structured data is how AI understands and recommends your content.

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@schemasentry/core`](https://www.npmjs.com/package/@schemasentry/core) | [![npm](https://img.shields.io/npm/v/@schemasentry/core.svg)](https://www.npmjs.com/package/@schemasentry/core) | Typed builders and validation primitives |
| [`@schemasentry/next`](https://www.npmjs.com/package/@schemasentry/next) | [![npm](https://img.shields.io/npm/v/@schemasentry/next.svg)](https://www.npmjs.com/package/@schemasentry/next) | App Router `<Schema />` component |
| [`@schemasentry/cli`](https://www.npmjs.com/package/@schemasentry/cli) | [![npm](https://img.shields.io/npm/v/@schemasentry/cli.svg)](https://www.npmjs.com/package/@schemasentry/cli) | CI validation and report output |
| [`@schemasentry/mcp`](https://www.npmjs.com/package/@schemasentry/mcp) | [![npm](https://img.shields.io/npm/v/@schemasentry/mcp.svg)](https://www.npmjs.com/package/@schemasentry/mcp) | MCP server for AI tools (Claude, Cursor) |
| [`schema-sentry-vscode`](https://marketplace.visualstudio.com/items?itemName=schemasentry.schema-sentry-vscode) | VSIX | VS Code extension with preview, snippets, decorations |

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

### Important: Understanding the Workflow

Schema Sentry validates **reality, not just configuration files**. The CLI checks your **actual built HTML output** to ensure schema is properly rendered. This eliminates false positives that plague other tools.

**The Correct Workflow:**

1. **`init`** → Create starter manifest and data files
2. **`scaffold`** → See what code you need to add to your pages
3. **Add Schema components** → Copy-paste code into your page.tsx files
4. **`next build`** → Build your Next.js app
5. **`validate`** → Validate actual HTML output (catches missing schema!)
6. **`audit`** → Check for ghost routes and health issues

---

**Quick start**

1. Generate starter files:

```bash
pnpm schemasentry init
```

2. See what schema you need to add:

```bash
pnpm schemasentry scaffold --root ./app
```

3. Copy-paste the generated code into your page.tsx files

4. Build your Next.js app:

```bash
next build
```

5. **Validate reality** (checks actual HTML, not just config files):

```bash
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --root ./.next/server/app
```

6. Audit for ghost routes and issues:

```bash
pnpm schemasentry audit \
  --manifest ./schema-sentry.manifest.json \
  --root ./app
```

**All commands**

```bash
# AI suggestions (BYOK)
pnpm schemasentry suggest --provider openai
pnpm schemasentry suggest --provider openai --model gpt-4o
pnpm schemasentry suggest --provider nvidia --api-key $NVIDIA_API_KEY
pnpm schemasentry suggest --format json --output ./schema-sentry.suggestions.json
pnpm schemasentry suggest --write --force

# Initialize starter files
pnpm schemasentry init
pnpm schemasentry init --scan

# See what schema code to add (shows copy-paste examples)
pnpm schemasentry scaffold --root ./app
pnpm schemasentry scaffold --root ./app --write

# Validate ACTUAL HTML OUTPUT (catches missing schema!)
# Option 1: Without manifest - auto-discovers schema from source code
pnpm schemasentry validate

# Option 2: With manifest - validates against manifest expectations
pnpm schemasentry validate --manifest ./schema-sentry.manifest.json

# Build and validate in one step
pnpm schemasentry validate --manifest ./schema-sentry.manifest.json --build
pnpm schemasentry validate --manifest ./schema-sentry.manifest.json --root ./.next/server/app
pnpm schemasentry validate --manifest ./schema-sentry.manifest.json --root ./out

# Validate with rulesets (google rich results / ai-citation)
pnpm schemasentry validate --rules google
pnpm schemasentry validate --rules ai-citation
pnpm schemasentry validate --rules google,ai-citation

# Output formats (table default, tree, json, html)
pnpm schemasentry validate --format table
pnpm schemasentry validate --format tree
pnpm schemasentry validate --format json
pnpm schemasentry validate --format html --output ./report.html

# Audit for ghost routes (routes in manifest but no Schema component)
pnpm schemasentry audit --manifest ./schema-sentry.manifest.json --root ./app
pnpm schemasentry audit --manifest ./schema-sentry.manifest.json --root ./app --scan
# Optional legacy coverage checks (requires schema data file)
pnpm schemasentry audit --manifest ./schema-sentry.manifest.json --data ./schema-sentry.data.json --root ./app

# Collect schema from built HTML
pnpm schemasentry collect --root ./out --output ./schema-sentry.data.json
pnpm schemasentry collect --root ./.next/server/app --check --data ./schema-sentry.data.json

# Generate reports
pnpm schemasentry validate \
  --manifest ./schema-sentry.manifest.json \
  --root ./.next/server/app \
  --format html \
  --output ./report.html

pnpm schemasentry audit \
  --manifest ./schema-sentry.manifest.json \
  --root ./app \
  --format html \
  --output ./audit-report.html

# Interactive mode (prompts + watch)
pnpm schemasentry dev
pnpm schemasentry dev --action validate --once
```

The CLI emits table output by default for better readability. Use `--format json` for machine-readable output or `--format html --output <path>` for shareable reports.
Use `--annotations github` in GitHub Actions to emit PR annotations.
Use `--rules google` or `--rules ai-citation` to validate for specific optimization targets.
Recommended field checks run as warnings by default. Disable them with `--no-recommended`.
See `docs/ci.md` for complete CI workflow examples.
See `docs/suggest.md` for AI suggestion usage and provider setup.
See `docs/dev.md` for interactive mode usage.

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
| `schema-sentry.data.json` | Contains the **actual schema data** (legacy) | **DEPRECATED**: Use `schemasentry validate` instead, which checks actual HTML |

**Why validate against HTML instead of JSON files?**

Other tools validate JSON config files, which gives you **false positives**. You can have perfect JSON files but your pages still lack schema markup! Schema Sentry v0.6.0+ validates your **actual built HTML output**, ensuring your schema is truly rendered.

**v0.10.0+ - Manifest-less Validation (Easiest):**
```bash
# ✅ No manifest required! Auto-discovers schema from source code
schemasentry validate
# or with automatic build:
schemasentry validate --build
```

**With Manifest (v0.6.0+):**
```bash
# ✅ Validates actual built HTML against manifest - NO FALSE POSITIVES!
schemasentry validate --manifest manifest.json
# or run build automatically first:
schemasentry validate --manifest manifest.json --build
```

When `--root` is omitted, `validate` auto-detects built output (`./.next/server/app`, then `./out`, then `./.next/server/pages`). Without a manifest, Schema Sentry automatically scans your source files to discover expected schema types from `<Schema>` components. Use `schemasentry init` to generate starter files. Use `schemasentry scaffold` to see what code to add. Use `schemasentry validate` (or `--build`) to verify your schema is actually rendered.

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

Run the end-to-end workflow demo (`init -> collect -> validate`):

```bash
pnpm --filter schema-sentry-example-next-app schema:e2e
```

## ✅ Compatibility

- Next.js App Router (Next.js 13.4+)
- React 18+
- Node.js 18+

## 🤖 MCP Server

Use Schema Sentry directly from Claude Desktop, Cursor, or any MCP-compatible AI assistant.

### Install

```bash
# Install the MCP package
pnpm add -D @schemasentry/mcp

# Or use directly via npx (no install needed)
npx @schemasentry/mcp
```

### Setup

#### Claude Desktop

Add to your MCP configuration file (`~/Library/Application Support/Claude/mcp_settings.json` on Mac or `%APPDATA%\Claude\mcp_settings.json` on Windows):

```json
{
  "mcpServers": {
    "schema-sentry": {
      "command": "npx",
      "args": ["@schemasentry/mcp"]
    }
  }
}
```

Or with custom options:

```json
{
  "mcpServers": {
    "schema-sentry": {
      "command": "npx",
      "args": ["-y", "@schemasentry/mcp"],
      "env": {
        "SCHEMA_SENTRY_ROOT": "/path/to/your/nextjs/app"
      }
    }
  }
}
```

#### Cursor

1. Open Cursor Settings (Cmd+,)
2. Go to **MCP** tab
3. Click **Add new server**
4. Enter: `npx @schemasentry/mcp`
5. Click **Add Server**

#### Zed Editor

Add to your Zed settings (`~/.zed/settings.json`):

```json
{
  "mcp": {
    "schema-sentry": {
      "command": "npx",
      "args": ["@schemasentry/mcp"]
    }
  }
}
```

#### Other MCP Clients

Any MCP-compatible client can use:

```bash
npx @schemasentry/mcp
```

The server uses stdio transport by default.

### Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `schemasentry_validate` | Validate schema against built HTML output | Check if all routes have proper schema |
| `schemasentry_audit` | Analyze schema health, detect ghost routes | Find routes in manifest without Schema components |
| `schemasentry_collect` | Collect JSON-LD from built HTML | Extract all schema from .next/server/app |
| `schemasentry_scaffold` | Generate schema code for pages | Add schema to pages that are missing it |
| `schemasentry_scan` | Scan source files for Schema usage | Find which pages use @schemasentry/next |
| `schemasentry_suggest` | **AI-powered schema suggestions** | Generate contextualized schema using OpenAI, Anthropic, etc. |

### Tool Parameters

**schemasentry_validate:**
```json
{
  "manifest": "schema-sentry.manifest.json",
  "root": "./.next/server/app",
  "appDir": "./app",
  "format": "json"
}
```

**schemasentry_audit:**
```json
{
  "manifest": "schema-sentry.manifest.json",
  "root": ".",
  "appDir": "./app",
  "sourceScan": true
}
```

**schemasentry_collect:**
```json
{
  "root": "./.next/server/app",
  "routes": ["/", "/blog"]
}
```

**schemasentry_scaffold:**
```json
{
  "root": "./app",
  "routes": ["/blog", "/products"]
}
```

**schemasentry_scan:**
```json
{
  "root": ".",
  "appDir": "./app"
}
```

**schemasentry_suggest:**
```json
{
  "routes": ["/", "/blog", "/products"],
  "provider": "openai",
  "apiKey": "sk-...",
  "model": "gpt-4o"
}
```

Or let it auto-scan your routes:
```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-..."
}
```

### Available Resources

| Resource | Description |
|----------|-------------|
| `schema://health` | Current schema validation status |
| `schema://manifest` | Contents of schema-sentry.manifest.json |

### Example Conversations

```
You: "Validate my site's schema"
Claude: [calls schemasentry_validate]
→ Returns: { ok: true, summary: { routes: 10, score: 95, errors: 0 } }

You: "Which pages are missing schema?"
Claude: [calls schemasentry_scan]
→ Returns: [{ route: "/about", hasSchemaUsage: false }, ...]

You: "Generate schema for my blog pages"
Claude: [calls schemasentry_scaffold]
→ Returns: [{ route: "/blog/[slug]", suggestedTypes: ["BlogPosting"], ... }]

You: "Audit for ghost routes"
Claude: [calls schemasentry_audit]
→ Returns: { ghostRoutes: ["/about"], sourceScan: {...}, report: {...} }

You: "Show me my manifest"
Claude: [reads schema://manifest]
→ Returns: { "routes": { "/": ["Organization"], "/blog": ["Article"] } }
```

### Quick IDE Prompts

| Task | Prompt |
|------|--------|
| Find missing schema | "Which pages are missing schema?" |
| Analyze routes | "What schema types should I add to my site?" |
| Add to specific page | "Add BlogPosting schema to my /blog/[slug] page" |
| Validate after changes | "Validate my site schema" |

### Programmatic Usage

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";

const server = spawn("npx", ["@schemasentry/mcp"], {
  stdio: ["pipe", "pipe", "pipe"]
});
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SCHEMA_SENTRY_ROOT` | Project root directory | Current working directory |
| `SCHEMA_SENTRY_MANIFEST` | Path to manifest | schema-sentry.manifest.json |

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
