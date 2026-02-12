import { describe, expect, it } from "vitest";
import {
  DEFAULT_PATTERNS,
  matchRouteToPatterns,
  inferSchemaTypes,
  generateManifestEntries,
  type PatternRule
} from "./patterns";

describe("matchRouteToPatterns", () => {
  it("matches exact routes", () => {
    const result = matchRouteToPatterns("/", DEFAULT_PATTERNS);
    expect(result).toContain("WebSite");
  });

  it("matches wildcard patterns for blog posts", () => {
    const result = matchRouteToPatterns("/blog/my-post", DEFAULT_PATTERNS);
    expect(result).toContain("BlogPosting");
  });

  it("matches wildcard patterns for products", () => {
    const result = matchRouteToPatterns("/products/123", DEFAULT_PATTERNS);
    expect(result).toContain("Product");
  });

  it("matches FAQ page", () => {
    const result = matchRouteToPatterns("/faq", DEFAULT_PATTERNS);
    expect(result).toContain("FAQPage");
  });

  it("returns multiple matches in priority order", () => {
    const result = matchRouteToPatterns("/blog", DEFAULT_PATTERNS);
    expect(result).toContain("WebPage");
  });

  it("returns empty array for unknown routes", () => {
    const result = matchRouteToPatterns("/unknown/route", DEFAULT_PATTERNS);
    expect(result).toEqual([]);
  });

  it("uses custom patterns when provided", () => {
    const customPatterns: PatternRule[] = [
      { pattern: "/custom/*", schemaType: "Article", priority: 10 }
    ];
    const result = matchRouteToPatterns("/custom/page", customPatterns);
    expect(result).toContain("Article");
  });
});

describe("inferSchemaTypes", () => {
  it("infers types for multiple routes", () => {
    const routes = ["/", "/blog/post-1", "/products/123"];
    const result = inferSchemaTypes(routes);

    expect(result.get("/")).toContain("WebSite");
    expect(result.get("/blog/post-1")).toContain("BlogPosting");
    expect(result.get("/products/123")).toContain("Product");
  });

  it("skips routes that match no patterns", () => {
    const routes = ["/", "/unknown/route"];
    const result = inferSchemaTypes(routes);

    expect(result.has("/")).toBe(true);
    expect(result.has("/unknown/route")).toBe(false);
  });
});

describe("generateManifestEntries", () => {
  it("generates manifest entries for routes", () => {
    const routes = ["/blog/post-1", "/products/123", "/faq"];
    const entries = generateManifestEntries(routes);

    expect(entries).toHaveProperty("/blog/post-1");
    expect(entries).toHaveProperty("/products/123");
    expect(entries).toHaveProperty("/faq");

    expect(entries["/blog/post-1"]).toContain("BlogPosting");
    expect(entries["/products/123"]).toContain("Product");
    expect(entries["/faq"]).toContain("FAQPage");
  });

  it("returns empty object for no matching routes", () => {
    const routes = ["/unknown", "/another/unknown"];
    const entries = generateManifestEntries(routes);

    expect(Object.keys(entries)).toHaveLength(0);
  });
});
