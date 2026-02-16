import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Schema, Article, BreadcrumbList } from "@schemasentry/next";

const article = Article({
  headline: "Getting Started with Next.js App Router",
  authorName: "Jane Doe",
  datePublished: "2026-02-10",
  dateModified: "2026-02-10",
  url: "https://acme.com/blog/getting-started-with-nextjs",
  description: "Learn how to build modern React applications with the new App Router architecture.",
  image: "https://acme.com/images/nextjs-guide.jpg"
});

const breadcrumbs = BreadcrumbList({
  items: [
    { name: "Home", url: "https://acme.com" },
    { name: "Blog", url: "https://acme.com/blog" },
    { name: "Getting Started with Next.js", url: "https://acme.com/blog/getting-started-with-nextjs" }
  ]
});

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <>
      <Head>
        <title>Getting Started with Next.js - Acme Corp Blog</title>
        <meta name="description" content="Learn how to build modern React applications with the new App Router architecture." />
      </Head>
      <Schema data={[article, breadcrumbs]} />
      <article style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        
        {/* Breadcrumb */}
        <nav style={{ marginBottom: "2rem", fontSize: "0.875rem" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 0.5rem", color: "#ccc" }}>/</span>
          <Link href="/blog" style={{ color: "#64748b", textDecoration: "none" }}>Blog</Link>
          <span style={{ margin: "0 0.5rem", color: "#ccc" }}>/</span>
          <span style={{ color: "#1a1a1a" }}>Getting Started</span>
        </nav>

        {/* Article Header */}
        <header style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", lineHeight: 1.2 }}>
            Getting Started with Next.js App Router
          </h1>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            color: "#64748b",
            fontSize: "0.9375rem"
          }}>
            <span>By <strong style={{ color: "#1a1a1a" }}>Jane Doe</strong></span>
            <span>•</span>
            <span>February 10, 2026</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </header>

        {/* Article Content */}
        <div style={{ 
          fontSize: "1.125rem", 
          lineHeight: 1.8, 
          color: "#374151",
          fontFamily: "Georgia, serif"
        }}>
          <p style={{ marginBottom: "1.5rem" }}>
            The Next.js App Router is a revolutionary way to build React applications. It introduces a new model for routing, data fetching, and caching that simplifies the developer experience while improving performance.
          </p>

          <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginTop: "2.5rem", marginBottom: "1rem", fontFamily: "sans-serif" }}>
            Why App Router?
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            The App Router offers several advantages over the traditional Pages Router:
          </p>
          <ul style={{ marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>Server Components by default</li>
            <li style={{ marginBottom: "0.5rem" }}>Streaming SSR</li>
            <li style={{ marginBottom: "0.5rem" }}>Built-in data fetching with async/await</li>
            <li style={{ marginBottom: "0.5rem" }}>Granular caching control</li>
          </ul>

          <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginTop: "2.5rem", marginBottom: "1rem", fontFamily: "sans-serif" }}>
            Getting Started
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            To create a new Next.js application with the App Router, simply run:
          </p>

          <pre style={{
            background: "#1e293b",
            color: "#e2e8f0",
            padding: "1rem 1.25rem",
            borderRadius: "0.5rem",
            overflow: "auto",
            fontSize: "0.875rem",
            marginBottom: "1.5rem"
          }}>
{`npx create-next-app@latest my-app
# Select "Yes" for App Router`}
          </pre>

          <p style={{ marginBottom: "1.5rem" }}>
            That&apos;s it! You now have a fully functional Next.js application with the App Router architecture.
          </p>

          <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginTop: "2.5rem", marginBottom: "1rem", fontFamily: "sans-serif" }}>
            Conclusion
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            The App Router represents the future of Next.js development. Start migrating your projects today to take advantage of these powerful new features.
          </p>

          {/* Tags */}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
            {["Next.js", "React", "App Router", "Tutorial"].map((tag) => (
              <span key={tag} style={{
                background: "#f3f4f6",
                color: "#4b5563",
                padding: "0.375rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.8125rem",
                fontWeight: 500
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

      </article>
    </>
  );
}
