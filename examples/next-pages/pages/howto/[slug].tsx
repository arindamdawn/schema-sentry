import Head from "next/head";
import { useRouter } from "next/router";
import { Schema, HowTo, BreadcrumbList, Organization } from "@schemasentry/next";

const org = Organization({
  name: "Acme Corp",
  url: "https://acme.com"
});

const howto = HowTo({
  name: "Getting Started with Schema Sentry",
  steps: [
    {
      name: "Install the packages",
      text: "Install Schema Sentry packages using your preferred package manager. You'll need the core package and the Next.js integration."
    },
    {
      name: "Import and use components",
      text: "Import the Schema component and any builders you need from @schemasentry/next. Create schema objects and pass them to the Schema component."
    },
    {
      name: "Run the dev server",
      text: "Start your Next.js development server. The Schema component will automatically inject the JSON-LD into your page's head."
    },
    {
      name: "Validate in CI",
      text: "Add the Schema Sentry CLI to your CI pipeline to catch issues before deployment. Configure the manifest file to define expected schema per route."
    },
    {
      name: "Deploy with confidence",
      text: "Deploy your site knowing that all pages have proper structured data. Monitor your CI pipeline for any validation failures."
    }
  ]
});

const breadcrumbs = BreadcrumbList({
  items: [
    { name: "Home", url: "https://acme.com" },
    { name: "HowTo", url: "https://acme.com/howto/getting-started" }
  ]
});

export default function HowToPage() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <>
      <Head>
        <title>Getting Started with Schema Sentry - Acme Corp</title>
        <meta name="description" content="Learn how to add type-safe structured data to your Next.js app in 5 simple steps" />
      </Head>
      <Schema data={[org, howto, breadcrumbs]} />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        
        <header style={{ marginBottom: "3rem" }}>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
            color: "white",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            marginBottom: "1rem"
          }}>
            STEP-BY-STEP GUIDE
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Getting Started with Schema Sentry
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
            Learn how to add type-safe structured data to your Next.js app in 5 simple steps
          </p>
        </header>

        <div style={{ position: "relative" }}>
          {/* Timeline Line */}
          <div style={{
            position: "absolute",
            left: "1.25rem",
            top: 0,
            bottom: 0,
            width: "2px",
            background: "linear-gradient(to bottom, #6366f1, #8b5cf6)"
          }} />

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingLeft: "2.5rem" }}>
            {[
              { step: 1, title: "Install the packages", time: "2 minutes", desc: "Add Schema Sentry to your project dependencies" },
              { step: 2, title: "Import and use components", time: "5 minutes", desc: "Create schema objects and render them with the Schema component" },
              { step: 3, title: "Run the dev server", time: "1 minute", desc: "See your structured data in action" },
              { step: 4, title: "Validate in CI", time: "10 minutes", desc: "Set up automated validation in your deployment pipeline" },
              { step: 5, title: "Deploy with confidence", time: "varies", desc: "Ship your site knowing schema is correct" }
            ].map((item, index) => (
              <div key={item.step} style={{ position: "relative" }}>
                {/* Timeline Dot */}
                <div style={{
                  position: "absolute",
                  left: "-2rem",
                  top: "0.25rem",
                  width: "1.5rem",
                  height: "1.5rem",
                  background: index === 0 ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" : "white",
                  border: "3px solid #6366f1",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: index === 0 ? "white" : "#6366f1",
                  fontSize: "0.75rem",
                  fontWeight: 700
                }}>
                  {index === 0 ? "✓" : item.step}
                </div>

                <div style={{
                  background: index === 0 ? "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)" : "white",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  border: index === 0 ? "1px solid #6366f1" : "1px solid #e5e5e5"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>{item.title}</h3>
                    <span style={{
                      background: "#f3f4f6",
                      color: "#64748b",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem"
                    }}>
                      ⏱️ {item.time}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>{item.desc}</p>
                  
                  {index === 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <pre style={{
                        background: "#1e293b",
                        color: "#e2e8f0",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        overflow: "auto",
                        fontSize: "0.8125rem",
                        margin: 0
                      }}>
{`pnpm add @schemasentry/next @schemasentry/core
pnpm add -D @schemasentry/cli`}
                      </pre>
                    </div>
                  )}
                  
                  {index === 1 && (
                    <div style={{ marginTop: "1rem" }}>
                      <pre style={{
                        background: "#1e293b",
                        color: "#e2e8f0",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        overflow: "auto",
                        fontSize: "0.8125rem",
                        margin: 0
                      }}>
{`import { Schema, Article } from "@schemasentry/next";

const article = Article({
  headline: "My Post",
  authorName: "Jane",
  datePublished: "2026-02-10",
  url: "https://example.com/blog/post"
});

export default function Page() {
  return <Schema data={article} />;
}`}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <section style={{
          marginTop: "4rem",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          borderRadius: "1rem",
          padding: "3rem",
          textAlign: "center",
          color: "white"
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.75rem" }}>
            Ready to get started?
          </h2>
          <p style={{ opacity: 0.9, marginBottom: "1.5rem", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
            Add type-safe structured data to your Next.js app in minutes. Join thousands of developers already using Schema Sentry.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <a href="https://github.com/arindamdawn/schema-sentry" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-block",
              background: "white",
              color: "#6366f1",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: 600
            }}>
              View on GitHub
            </a>
            <a href="https://www.npmjs.com/package/@schemasentry/core" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.3)"
            }}>
              npm install
            </a>
          </div>
        </section>

      </div>
    </>
  );
}
