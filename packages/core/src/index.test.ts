import { describe, expect, it } from "vitest";
import {
  Article,
  BlogPosting,
  Organization,
  SCHEMA_CONTEXT,
  stableStringify
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
});
