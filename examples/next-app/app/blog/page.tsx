import { Schema, WebSite, BreadcrumbList } from "@schemasentry/next";
import Link from "next/link";

const website = WebSite({
  name: "Acme Corp Blog",
  url: "https://acme.com/blog",
  description: "Latest articles about web development, AI, and more"
});

const breadcrumbs = BreadcrumbList({
  items: [
    { name: "Home", url: "https://acme.com" },
    { name: "Blog", url: "https://acme.com/blog" }
  ]
});

const posts = [
  {
    slug: "getting-started-with-nextjs",
    title: "Getting Started with Next.js App Router",
    excerpt: "Learn how to build modern React applications with the new App Router architecture.",
    author: "Jane Doe",
    date: "2026-02-10",
    readTime: "5 min read"
  },
  {
    slug: "structured-data-seo-ai",
    title: "Structured Data for SEO and AI Discovery",
    excerpt: "How JSON-LD helps both search engines and AI assistants understand your content.",
    author: "John Smith",
    date: "2026-02-08",
    readTime: "8 min read"
  },
  {
    slug: "typescript-best-practices",
    title: "TypeScript Best Practices for 2026",
    excerpt: "Level up your TypeScript skills with these advanced patterns and techniques.",
    author: "Jane Doe",
    date: "2026-02-05",
    readTime: "12 min read"
  }
];

export default function BlogPage() {
  return (
    <>
      <Schema data={[website, breadcrumbs]} />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        
        <header style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Blog</h1>
          <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
            Latest articles about web development, AI, and more
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {posts.map((post) => (
            <article key={post.slug} style={{
              background: "white",
              borderRadius: "1rem",
              padding: "2rem",
              border: "1px solid #e5e5e5",
              transition: "all 0.2s"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
                fontSize: "0.875rem",
                color: "#64748b"
              }}>
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h2 style={{ margin: "0 0 0.75rem 0" }}>
                <Link href={`/blog/${post.slug}`} style={{
                  color: "#1a1a1a",
                  textDecoration: "none",
                  fontSize: "1.5rem",
                  fontWeight: 600
                }}>
                  {post.title}
                </Link>
              </h2>
              <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: "1rem" }}>
                {post.excerpt}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6366f1", fontWeight: 500, fontSize: "0.875rem" }}>
                  By {post.author}
                </span>
                <Link href={`/blog/${post.slug}`} style={{
                  color: "#6366f1",
                  textDecoration: "none",
                  fontWeight: 500
                }}>
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </>
  );
}
