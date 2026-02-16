# Schema Sentry Next.js Pages Router Example

This example demonstrates how to use Schema Sentry with Next.js Pages Router.

## Pages Router vs App Router

The main difference between Pages Router and App Router is in the file structure:

- **Pages Router**: Uses `pages/` directory with files like `pages/index.tsx`, `pages/blog/[slug].tsx`
- **App Router**: Uses `app/` directory with files like `app/page.tsx`, `app/blog/[slug]/page.tsx`

Schema Sentry works with both routers using the same `<Schema />` component.

## Getting Started

```bash
# From the monorepo root
pnpm install

# Run the Pages Router example
cd examples/next-pages
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## Pages

This example includes the following pages with their respective schema types:

| Page | Schema Types |
|------|--------------|
| `/` | Organization, WebSite |
| `/blog` | WebSite |
| `/blog/[slug]` | Article |
| `/products/[id]` | Organization, Product |
| `/faq` | FAQPage, Organization |
| `/howto/[slug]` | HowTo, Organization |

## Using Schema Sentry in Pages Router

The `<Schema />` component is used the same way in both routers:

```tsx
import Head from "next/head";
import { Schema, Article, BreadcrumbList } from "@schemasentry/next";

const article = Article({
  headline: "My Post",
  authorName: "Jane Doe",
  datePublished: "2026-02-10",
  url: "https://example.com/blog/post"
});

const breadcrumbs = BreadcrumbList({
  items: [
    { name: "Home", url: "https://example.com" },
    { name: "Blog", url: "https://example.com/blog" }
  ]
});

export default function BlogPostPage() {
  return (
    <>
      <Head>
        <title>My Post - Example Blog</title>
        <meta name="description" content="A blog post about Schema Sentry" />
      </Head>
      <Schema data={[article, breadcrumbs]} />
      {/* Page content */}
    </>
  );
}
```

## CLI Commands

```bash
# Validate schema against manifest
pnpm schema:validate

# Collect schema data from build
pnpm schema:collect

# Check for drift between expected and actual
pnpm schema:drift
```

## License

MIT
