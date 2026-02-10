import { describe, expect, it } from "vitest";
import {
  Article,
  BlogPosting,
  BreadcrumbList,
  Organization,
  SCHEMA_CONTEXT,
  stableStringify,
  validateSchema
} from "./index";

describe("stableStringify", () => {
  it("produces stable output regardless of key order", () => {
    const a = { b: 1, a: 2, nested: { d: 4, c: 3 } };
    const b = { nested: { c: 3, d: 4 }, a: 2, b: 1 };

    expect(stableStringify(a)).toEqual(stableStringify(b));
  });
});

describe("builders", () => {
  it("adds @context and @type", () => {
    const org = Organization({ name: "Acme" });
    expect(org["@context"]).toBe(SCHEMA_CONTEXT);
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("Acme");
  });

  it("sets @id when provided", () => {
    const org = Organization({ id: "https://acme.com/#org", name: "Acme" });
    expect(org["@id"]).toBe("https://acme.com/#org");
  });

  it("wraps Article authorName as Person", () => {
    const article = Article({
      headline: "Launch",
      authorName: "Jane Doe",
      datePublished: "2026-02-09",
      url: "https://acme.com/blog/launch"
    });

    expect(article.author).toEqual({
      "@type": "Person",
      name: "Jane Doe"
    });
    expect((article as { authorName?: string }).authorName).toBeUndefined();
  });

  it("wraps BlogPosting authorName as Person", () => {
    const post = BlogPosting({
      headline: "Update",
      authorName: "Jane Doe",
      datePublished: "2026-02-09",
      url: "https://acme.com/blog/update"
    });

    expect(post.author).toEqual({
      "@type": "Person",
      name: "Jane Doe"
    });
  });

  it("creates BreadcrumbList with ListItem elements", () => {
    const breadcrumb = BreadcrumbList({
      items: [
        { name: "Home", url: "https://acme.com" },
        { name: "Blog", url: "https://acme.com/blog" },
        { name: "Article", url: "https://acme.com/blog/article" }
      ]
    });

    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://acme.com"
    });
    expect(breadcrumb.itemListElement[2].position).toBe(3);
  });
});

describe("validateSchema", () => {
  it("fails when no schema blocks are provided", () => {
    const result = validateSchema([]);
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.ruleId).toBe("schema.empty");
  });

  it("reports missing required fields", () => {
    const node = {
      "@context": SCHEMA_CONTEXT,
      "@type": "WebSite",
      name: "Acme"
    } as const;

    const result = validateSchema([node]);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.ruleId === "schema.required.url"))
      .toBe(true);
  });

  it("reports invalid context and type", () => {
    const node = {
      "@context": "https://example.com",
      "@type": "Unknown",
      name: "Acme"
    } as const;

    const result = validateSchema([node as any]);
    expect(result.issues.some((issue) => issue.ruleId === "schema.context")).toBe(
      true
    );
    expect(result.issues.some((issue) => issue.ruleId === "schema.type")).toBe(
      true
    );
  });

  it("validates author presence for Article", () => {
    const node = {
      "@context": SCHEMA_CONTEXT,
      "@type": "Article",
      headline: "Hello",
      datePublished: "2026-02-09",
      url: "https://acme.com/blog/hello"
    } as const;

    const result = validateSchema([node as any]);
    expect(result.issues.some((issue) => issue.ruleId === "schema.required.author"))
      .toBe(true);
  });

  it("reduces score as errors increase", () => {
    const node = {
      "@context": SCHEMA_CONTEXT,
      "@type": "WebSite",
      name: ""
    } as const;

    const result = validateSchema([node as any]);
    expect(result.score).toBeLessThan(100);
  });

  it("validates BreadcrumbList requires itemListElement", () => {
    const node = {
      "@context": SCHEMA_CONTEXT,
      "@type": "BreadcrumbList"
    } as const;

    const result = validateSchema([node as any]);
    expect(result.issues.some((issue) => issue.ruleId === "schema.required.itemListElement"))
      .toBe(true);
  });
});
