import { Article, Organization, Schema } from "@schemasentry/next";

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
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Schema Sentry Example</h1>
        <p>This page renders JSON-LD via the Schema component.</p>
      </main>
    </>
  );
}
