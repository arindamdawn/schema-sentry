import Head from "next/head";
import { Schema, Organization, WebSite, BreadcrumbList } from "@schemasentry/next";

const org = Organization({
  name: "Acme Corp",
  url: "https://acme.com",
  logo: "https://acme.com/logo.png",
  description: "Building the future of web development",
  sameAs: [
    "https://twitter.com/acme",
    "https://linkedin.com/company/acme",
    "https://github.com/acme"
  ]
});

const website = WebSite({
  name: "Acme Corp",
  url: "https://acme.com",
  description: "Building the future of web development"
});

const breadcrumbs = BreadcrumbList({
  items: [
    { name: "Home", url: "https://acme.com" }
  ]
});

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Acme Corp - Building the Future</title>
        <meta name="description" content="We create amazing products that developers love." />
      </Head>
      <Schema data={[org, website, breadcrumbs]} />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        
        {/* Hero Section */}
        <section style={{
          textAlign: "center",
          padding: "4rem 0",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)",
          borderRadius: "1rem",
          marginBottom: "3rem"
        }}>
          <h1 style={{
            fontSize: "3rem",
            fontWeight: 800,
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Building the Future
          </h1>
          <p style={{ fontSize: "1.25rem", color: "#64748b", maxWidth: "600px", margin: "0 auto" }}>
            We create amazing products that developers love. Check out our blog, explore our products, and learn from our guides.
          </p>
        </section>

        {/* Features Grid */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem"
        }}>
          <Card
            title="📝 Blog"
            description="Read our latest articles about web development, AI, and more."
            href="/blog"
          />
          <Card
            title="🛍️ Products"
            description="Discover our premium tools built for developers."
            href="/products/premium-widget"
          />
          <Card
            title="❓ FAQ"
            description="Find answers to common questions about our products."
            href="/faq"
          />
          <Card
            title="📚 HowTo Guides"
            description="Step-by-step tutorials to help you get started."
            href="/howto/getting-started"
          />
        </section>

        {/* Stats Section */}
        <section style={{
          background: "white",
          borderRadius: "1rem",
          padding: "2rem",
          border: "1px solid #e5e5e5"
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Why Schema Sentry?</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem"
          }}>
            <Stat value="11+" label="Schema Types" />
            <Stat value="100%" label="Type Safety" />
            <Stat value="0ms" label="Runtime Overhead" />
            <Stat value="CI" label="Built-in Validation" />
          </div>
        </section>

      </div>
    </>
  );
}

function Card({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a href={href} style={{
      display: "block",
      background: "white",
      borderRadius: "1rem",
      padding: "1.5rem",
      border: "1px solid #e5e5e5",
      textDecoration: "none",
      color: "inherit",
      transition: "all 0.2s"
    }}>
      <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>{title}</h3>
      <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>{description}</p>
    </a>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#6366f1" }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "0.875rem" }}>{label}</div>
    </div>
  );
}
