import Head from "next/head";
import { useState } from "react";
import { Schema, FAQPage as FAQPageBuilder, BreadcrumbList, Organization } from "@schemasentry/next";

const org = Organization({
  name: "Acme Corp",
  url: "https://acme.com"
});

const faq = FAQPageBuilder({
  questions: [
    {
      question: "What is Schema Sentry?",
      answer: "Schema Sentry is a type-safe library for generating and validating JSON-LD structured data for Next.js applications. It helps ensure your content is properly formatted for both traditional SEO and AI-powered discovery."
    },
    {
      question: "How does it help with SEO?",
      answer: "Schema Sentry generates properly formatted JSON-LD that search engines like Google use to create rich snippets, knowledge panels, and improve your search rankings. It validates schema before deployment to catch issues early."
    },
    {
      question: "Why is structured data important for AI?",
      answer: "AI systems like ChatGPT, Claude, and Perplexity use structured data to understand and cite your content. Proper schema makes it easier for AI to recommend your pages in responses and voice assistants."
    },
    {
      question: "What schema types are supported?",
      answer: "Schema Sentry supports 11+ common types including Organization, Person, Article, BlogPosting, Product, FAQPage, HowTo, BreadcrumbList, and more. Check our roadmap for upcoming types."
    },
    {
      question: "Is it compatible with Next.js Pages Router?",
      answer: "Yes! Schema Sentry works with both Next.js App Router and Pages Router. The Schema component can be used in any Next.js page."
    },
    {
      question: "Can I use it in CI/CD pipelines?",
      answer: "Absolutely. The CLI validate command checks your schema coverage and validity, making it perfect for GitHub Actions and other CI systems. It exits with non-zero codes on errors."
    },
    {
      question: "How much does it cost?",
      answer: "Schema Sentry is open source and free to use under the MIT license. Paid enterprise features may be added in the future."
    }
  ]
});

const breadcrumbs = BreadcrumbList({
  items: [
    { name: "Home", url: "https://acme.com" },
    { name: "FAQ", url: "https://acme.com/faq" }
  ]
});

const faqs = [
  {
    question: "What is Schema Sentry?",
    answer: "Schema Sentry is a type-safe library for generating and validating JSON-LD structured data for Next.js applications. It helps ensure your content is properly formatted for both traditional SEO and AI-powered discovery."
  },
  {
    question: "How does it help with SEO?",
    answer: "Schema Sentry generates properly formatted JSON-LD that search engines like Google use to create rich snippets, knowledge panels, and improve your search rankings. It validates schema before deployment to catch issues early."
  },
  {
    question: "Why is structured data important for AI?",
    answer: "AI systems like ChatGPT, Claude, and Perplexity use structured data to understand and cite your content. Proper schema makes it easier for AI to recommend your pages in responses and voice assistants."
  },
  {
    question: "What schema types are supported?",
    answer: "Schema Sentry supports 11+ common types including Organization, Person, Article, BlogPosting, Product, FAQPage, HowTo, BreadcrumbList, and more. Check our roadmap for upcoming types."
  },
  {
    question: "Is it compatible with Next.js Pages Router?",
    answer: "Yes! Schema Sentry works with both Next.js App Router and Pages Router. The Schema component can be used in any Next.js page."
  },
  {
    question: "Can I use it in CI/CD pipelines?",
    answer: "Absolutely. The CLI validate command checks your schema coverage and validity, making it perfect for GitHub Actions and other CI systems. It exits with non-zero codes on errors."
  },
  {
    question: "How much does it cost?",
    answer: "Schema Sentry is open source and free to use under the MIT license. Paid enterprise features may be added in the future."
  }
];

export default function FAQPageComponent() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <Head>
        <title>FAQ - Acme Corp</title>
        <meta name="description" content="Frequently asked questions about Schema Sentry and our products" />
      </Head>
      <Schema data={[org, faq, breadcrumbs]} />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        
        <header style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
            Everything you need to know about Schema Sentry
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqs.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        <section style={{
          marginTop: "4rem",
          padding: "2rem",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)",
          borderRadius: "1rem",
          textAlign: "center"
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Still have questions?</h2>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
            Can&apos;t find the answer you&apos;re looking for? Please reach out to our support team.
          </p>
          <a href="https://github.com/arindamdawn/schema-sentry/issues" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block",
            background: "#6366f1",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: 500
          }}>
            Ask on GitHub Discussions
          </a>
        </section>

      </div>
    </>
  );
}

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e5e5",
      borderRadius: "0.75rem",
      overflow: "hidden"
    }}>
      <button
        onClick={onClick}
        style={{
          width: "100%",
          padding: "1.25rem 1.5rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left",
          fontSize: "1rem",
          fontWeight: 500,
          color: "#1a1a1a"
        }}
      >
        <span>{question}</span>
        <span style={{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          color: "#6366f1"
        }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{
          padding: "0 1.5rem 1.5rem",
          color: "#64748b",
          lineHeight: 1.7,
          borderTop: "1px solid #f3f4f6"
        }}>
          {answer}
        </div>
      )}
    </div>
  );
}
