# @schemasentry/react

React components for Schema Sentry. Works with Next.js Pages Router and other React frameworks.

## Installation

```bash
pnpm add @schemasentry/react @schemasentry/core
```

## Usage

### Next.js Pages Router

In your `_document.js`:

```jsx
import { Html, Head, Main, NextScripts, Script } from "next/document";
import { Schema } from "@schemasentry/react";
import { Organization, WebSite } from "@schemasentry/core";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {/* Global schema on every page */}
        <Schema 
          data={[
            Organization({ name: "My Company", url: "https://example.com" }),
            WebSite({ name: "My Site", url: "https://example.com" })
          ]} 
        />
        <Main />
        <NextScripts />
      </body>
    </Html>
  );
}
```

In a specific page (e.g., `pages/about.js`):

```jsx
import { Schema } from "@schemasentry/react";
import { Organization, FAQPage } from "@schemasentry/core";

export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <Schema 
        data={FAQPage({
          questions: [
            { question: "What is your return policy?", answer: "30 days" },
            { question: "Do you ship internationally?", answer: "Yes, worldwide" }
          ]
        })} 
      />
    </div>
  );
}
```

### Other React Frameworks

Works with any React framework that supports SSR:

```jsx
import { Schema } from "@schemasentry/react";
import { Article } from "@schemasentry/core";

function ArticlePage({ title, content }) {
  return (
    <article>
      <Schema 
        data={Article({
          headline: title,
          author: { name: "John Doe" },
          datePublished: "2024-01-15",
          url: "https://example.com/article"
        })} 
      />
      <h1>{title}</h1>
      <p>{content}</p>
    </article>
  );
}
```

## API

### `<Schema />`

Renders a `<script type="application/ld+json">` tag with the schema data.

```tsx
import { Schema } from "@schemasentry/react";
import { Product } from "@schemasentry/core";

<Schema 
  data={Product({
    name: "Widget",
    description: "A great widget",
    url: "https://example.com/widget"
  })}
  id="product-schema"     // optional: adds id attribute
  nonce="abc123"         // optional: for CSP nonce
/>
```

## TypeScript

Full TypeScript support out of the box. All schema builders from `@schemasentry/core` are re-exported.
