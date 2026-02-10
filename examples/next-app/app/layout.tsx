import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Schema Sentry Demo",
  description: "A comprehensive demo of Schema Sentry - type-safe structured data for Next.js",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: "#fafafa",
        color: "#1a1a1a"
      }}>
        <nav style={{
          background: "white",
          borderBottom: "1px solid #e5e5e5",
          padding: "1rem 2rem",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Link href="/" style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#1a1a1a",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.375rem",
                fontSize: "0.875rem"
              }}>SS</span>
              Schema Sentry Demo
            </Link>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <NavLink href="/">Home</NavLink>
              <NavLink href="/blog">Blog</NavLink>
              <NavLink href="/products/premium-widget">Product</NavLink>
              <NavLink href="/faq">FAQ</NavLink>
              <NavLink href="/howto/getting-started">HowTo</NavLink>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer style={{
          background: "white",
          borderTop: "1px solid #e5e5e5",
          padding: "2rem",
          marginTop: "4rem",
          textAlign: "center",
          color: "#666"
        }}>
          <p>Built with <a href="https://github.com/arindamdawn/schema-sentry" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1" }}>Schema Sentry</a> - Type-safe structured data for Next.js</p>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{
      color: "#666",
      textDecoration: "none",
      fontSize: "0.9375rem",
      fontWeight: 500,
      transition: "color 0.2s"
    }}>
      {children}
    </Link>
  );
}
