import { describe, expect, it } from "vitest";
import {
  Article,
  BlogPosting,
  BreadcrumbList,
  Event,
  LocalBusiness,
  Organization,
  Review,
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
        { name: "Blog", url: "https://acme.com/blog", useItemObject: true },
        { name: "Article", url: "https://acme.com/blog/article" }
      ]
    });

    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    const items = breadcrumb.itemListElement as Array<{ "@type": string; position: number; name: string; item: unknown }>;
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://acme.com"
    });
    expect(items[1].item).toEqual({
      "@id": "https://acme.com/blog",
      name: "Blog"
    });
    expect(items[2].position).toBe(3);
  });

  it("creates LocalBusiness with base fields", () => {
    const business = LocalBusiness({
      name: "Acme Coffee",
      address: "1 Market St, Springfield",
      url: "https://acme.com"
    });

    expect(business["@type"]).toBe("LocalBusiness");
    expect(business.name).toBe("Acme Coffee");
    expect(business.address).toBe("1 Market St, Springfield");
  });

  it("creates Event with optional location and organizer", () => {
    const event = Event({
      name: "Launch Party",
      startDate: "2026-02-15",
      locationName: "Acme HQ",
      locationAddress: "100 Main St, Springfield",
      locationUrl: "https://acme.com/locations/hq",
      organizerName: "Acme Corp",
      url: "https://acme.com/events/launch"
    });

    expect(event["@type"]).toBe("Event");
    expect(event.location).toEqual({
      "@type": "Place",
      name: "Acme HQ",
      address: "100 Main St, Springfield",
      url: "https://acme.com/locations/hq"
    });
    expect(event.organizer).toEqual({
      "@type": "Organization",
      name: "Acme Corp"
    });
  });

  it("creates Review with item, author, and rating", () => {
    const review = Review({
      itemName: "Acme Widget",
      authorName: "Jane Doe",
      ratingValue: 4.5,
      reviewBody: "Great build quality.",
      url: "https://acme.com/reviews/widget"
    });

    expect(review["@type"]).toBe("Review");
    expect(review.itemReviewed).toEqual({
      "@type": "Thing",
      name: "Acme Widget"
    });
    expect(review.author).toEqual({
      "@type": "Person",
      name: "Jane Doe"
    });
    expect(review.reviewRating).toEqual({
      "@type": "Rating",
      ratingValue: 4.5
    });
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

  it("validates BreadcrumbList list items for position and URL", () => {
    const node = {
      "@context": SCHEMA_CONTEXT,
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 0,
          item: "not-a-url"
        },
        {
          "@type": "ListItem",
          item: { "@id": "https://acme.com/blog" }
        }
      ]
    } as const;

    const result = validateSchema([node as any]);
    expect(result.issues.some((issue) => issue.ruleId === "schema.breadcrumb.position"))
      .toBe(true);
    expect(result.issues.some((issue) => issue.ruleId === "schema.breadcrumb.item.url"))
      .toBe(true);
  });

  it("validates Event requires startDate", () => {
    const node = {
      "@context": SCHEMA_CONTEXT,
      "@type": "Event",
      name: "Launch Party"
    } as const;

    const result = validateSchema([node as any]);
    expect(result.issues.some((issue) => issue.ruleId === "schema.required.startDate"))
      .toBe(true);
  });

  it("validates Review requires itemReviewed and reviewRating", () => {
    const node = {
      "@context": SCHEMA_CONTEXT,
      "@type": "Review",
      author: { "@type": "Person", name: "Jane Doe" }
    } as const;

    const result = validateSchema([node as any]);
    expect(result.issues.some((issue) => issue.ruleId === "schema.required.itemReviewed"))
      .toBe(true);
    expect(result.issues.some((issue) => issue.ruleId === "schema.required.reviewRating"))
      .toBe(true);
  });

  it("recognizes LocalBusiness and enforces required name", () => {
    const node = {
      "@context": SCHEMA_CONTEXT,
      "@type": "LocalBusiness"
    } as const;

    const result = validateSchema([node as any]);
    expect(result.issues.some((issue) => issue.ruleId === "schema.type")).toBe(false);
    expect(result.issues.some((issue) => issue.ruleId === "schema.required.name"))
      .toBe(true);
  });
});
