import type { ReactNode } from "react";

export const metadata = {
  title: "Schema Sentry Example",
  description: "Minimal Next.js App Router example for Schema Sentry"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
