# @schemasentry/core

Type-safe schema builders and validation primitives for Schema Sentry.

## Install

```bash
pnpm add @schemasentry/core
npm install @schemasentry/core
```

## Features

- **Type-safe builders** for 13+ schema types
- **Deterministic JSON-LD** output
- **Validation engine** with required/recommended field checks
- **Zero runtime dependencies**

## Usage

```typescript
import { Article, Organization, validateSchema } from "@schemasentry/core";

const article = Article({
  headline: "My Article",
  authorName: "John Doe",
  datePublished: "2026-02-11",
  url: "https://example.com/blog/my-article"
});

const result = validateSchema([article]);
if (!result.ok) {
  console.log(result.issues);
}
```

## Supported Schema Types

- Organization, Person, Place, LocalBusiness
- WebSite, WebPage
- Article, BlogPosting
- Product
- FAQPage, HowTo
- BreadcrumbList
- Event, Review
- VideoObject, ImageObject

## Documentation

See [Schema Sentry Docs](https://github.com/arindamdawn/schema-sentry#readme)
