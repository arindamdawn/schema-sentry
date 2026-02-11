# @schemasentry/next

Next.js App Router `<Schema />` component for Schema Sentry.

## Install

```bash
pnpm add @schemasentry/next @schemasentry/core
npm install @schemasentry/next @schemasentry/core
```

## Usage

```tsx
import { Schema, Article, Organization } from "@schemasentry/next";

export default function BlogPost() {
  const org = Organization({
    name: "Acme Corp",
    url: "https://acme.com"
  });

  const article = Article({
    headline: "My Article",
    authorName: "John Doe",
    datePublished: "2026-02-11",
    url: "https://acme.com/blog/my-article"
  });

  return (
    <>
      <Schema data={[org, article]} />
      <main>
        <h1>{article.headline}</h1>
        ...
      </main>
    </>
  );
}
```

## Features

- **Zero client-side JS** - Renders as static JSON-LD
- **Type-safe** - Full TypeScript support
- **Deterministic** - Clean, reviewable diffs
- **Next.js App Router** - Built for Next.js 13+

## Documentation

See [Schema Sentry Docs](https://github.com/arindamdawn/schema-sentry#readme)
