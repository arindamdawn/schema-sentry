# Example App (Next.js App Router)

A comprehensive demo of **Schema Sentry** showcasing multiple schema types, real-world patterns, and best practices for structured data in Next.js applications.

## 🚀 Live Demo Features

### Pages

| Route | Schema Types | Description |
|-------|-------------|-------------|
| `/` | Organization, WebSite, BreadcrumbList | Homepage with company info and navigation |
| `/blog` | WebSite, BreadcrumbList | Blog listing page |
| `/blog/[slug]` | Article, BreadcrumbList | Individual blog posts |
| `/products/[id]` | Organization, Product, BreadcrumbList | E-commerce product page with reviews |
| `/faq` | FAQPage, BreadcrumbList, Organization | Interactive FAQ with expandable items |
| `/howto/[slug]` | HowTo, BreadcrumbList | Step-by-step tutorial format |

### Schema Types Demonstrated

- ✅ **Organization** - Company/business information
- ✅ **WebSite** - Site-wide metadata
- ✅ **Article** - Blog posts and articles
- ✅ **Product** - E-commerce products with reviews
- ✅ **FAQPage** - Interactive FAQ sections
- ✅ **HowTo** - Step-by-step guides
- ✅ **BreadcrumbList** - Navigation breadcrumbs
- ✅ **Person** - Author information

## 🛠️ Development

### Quick Start

From the repo root:

```bash
# Install dependencies
pnpm install

# Run the demo app
pnpm --filter schema-sentry-example-next-app dev
```

The app will be available at `http://localhost:3000`

### Validate Schema

Run the CLI validation to check all routes have proper schema:

```bash
pnpm --filter schema-sentry-example-next-app schema:validate
```

Expected output:
```json
{
  "ok": true,
  "summary": {
    "routes": 5,
    "errors": 0,
    "warnings": 0,
    "score": 100,
    "coverage": {...}
  },
  "routes": [...]
}
```

### End-to-End Workflow (v0.4.0)

Run a complete `init -> collect -> validate` flow:

```bash
pnpm --filter schema-sentry-example-next-app schema:e2e
```

This script will:

1. Generate starter files with `schemasentry init` into a temp workspace
2. Build the Next.js app
3. Collect JSON-LD from `.next/server/app`
4. Build a manifest from collected schema types
5. Validate collected data against that manifest

Additional helpers:

```bash
pnpm --filter schema-sentry-example-next-app schema:collect
pnpm --filter schema-sentry-example-next-app schema:drift
```

## 📁 Project Structure

```
examples/next-app/
├── app/
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Homepage
│   ├── blog/
│   │   ├── page.tsx         # Blog listing
│   │   └── [slug]/page.tsx  # Blog post template
│   ├── products/
│   │   └── [id]/page.tsx   # Product page
│   ├── faq/page.tsx         # FAQ page
│   └── howto/
│       └── [slug]/page.tsx  # HowTo guide template
├── schema-sentry.manifest.json   # Route-to-schema mapping
└── schema-sentry.data.json       # Actual schema data
```

## 🔍 What to Look For

### 1. Type-Safe Builders

```tsx
import { Schema, Article, Organization } from "@schemasentry/next";

const article = Article({
  headline: "My Post",
  authorName: "Jane Doe",  // Automatically wrapped as Person
  datePublished: "2026-02-10",
  url: "https://example.com/blog/post"
});
```

### 2. Multiple Schemas Per Page

```tsx
<Schema data={[org, website, article, breadcrumbs]} />
```

### 3. Deterministic Output

Schema Sentry produces stable, sorted JSON-LD for clean diffs in version control.

### 4. CI Validation

The manifest + data files ensure every route has the required schema before deployment.

## 📚 Learn More

- **[Main README](../README.md)** - Full documentation
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute
- **[ROADMAP.md](../ROADMAP.md)** - Future plans

## 🐛 Issues & Support

- Report bugs: [GitHub Issues](https://github.com/arindamdawn/schema-sentry/issues)
- Ask questions: [GitHub Discussions](https://github.com/arindamdawn/schema-sentry/discussions)
- Read docs: [README](../README.md)

---

Built with ❤️ using [Schema Sentry](https://github.com/arindamdawn/schema-sentry)
