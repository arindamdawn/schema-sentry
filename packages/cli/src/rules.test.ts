import { describe, it, expect } from "vitest";
import { runRuleset, runMultipleRulesets, parseRulesetNames } from "./rules.js";
import type { SchemaNode } from "@schemasentry/core";

describe("rulesets", () => {
  describe("parseRulesetNames", () => {
    it("parses single ruleset", () => {
      expect(parseRulesetNames("google")).toEqual(["google"]);
    });

    it("parses multiple rulesets", () => {
      expect(parseRulesetNames("google,ai-citation")).toEqual(["google", "ai-citation"]);
    });

    it("ignores invalid rulesets", () => {
      expect(parseRulesetNames("google,invalid")).toEqual(["google"]);
    });

    it("handles empty string", () => {
      expect(parseRulesetNames("")).toEqual([]);
    });
  });

  describe("google ruleset", () => {
    it("reports missing image for Article", () => {
      const nodes: SchemaNode[] = [{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Test Article",
        author: { "@type": "Person", name: "John" },
        datePublished: "2024-01-01",
        url: "https://example.com/article"
      }];
      
      const result = runRuleset("google", nodes);
      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.issues.some(i => i.ruleId === "google.article.image")).toBe(true);
    });

    it("passes when all Google requirements met", () => {
      const nodes: SchemaNode[] = [{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Test Article",
        author: { "@type": "Person", name: "John" },
        datePublished: "2024-01-01",
        url: "https://example.com/article",
        image: "https://example.com/image.jpg"
      }];
      
      const result = runRuleset("google", nodes);
      expect(result.issues.filter(i => i.ruleId.startsWith("google.article"))).toHaveLength(0);
    });

    it("reports missing telephone for LocalBusiness", () => {
      const nodes: SchemaNode[] = [{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Test Business",
        address: "123 Main St"
      }];
      
      const result = runRuleset("google", nodes);
      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.issues.some(i => i.ruleId === "google.localbusiness.telephone")).toBe(true);
    });

    it("reports missing offers for Product", () => {
      const nodes: SchemaNode[] = [{
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Test Product",
        description: "A test product",
        url: "https://example.com/product"
      }];
      
      const result = runRuleset("google", nodes);
      expect(result.issues.some(i => i.ruleId === "google.product.offers")).toBe(true);
    });
  });

  describe("ai-citation ruleset", () => {
    it("reports missing author for Article", () => {
      const nodes: SchemaNode[] = [{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Test Article",
        datePublished: "2024-01-01",
        url: "https://example.com/article"
      }];
      
      const result = runRuleset("ai-citation", nodes);
      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.issues.some(i => i.ruleId === "ai.article.author")).toBe(true);
    });

    it("reports missing datePublished for Article", () => {
      const nodes: SchemaNode[] = [{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Test Article",
        author: { "@type": "Person", name: "John" },
        url: "https://example.com/article"
      }];
      
      const result = runRuleset("ai-citation", nodes);
      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.issues.some(i => i.ruleId === "ai.article.datepublished")).toBe(true);
    });

    it("passes when all AI citation requirements met", () => {
      const nodes: SchemaNode[] = [{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Test Article",
        author: { "@type": "Person", name: "John" },
        datePublished: "2024-01-01",
        url: "https://example.com/article",
        description: "A test article"
      }];
      
      const result = runRuleset("ai-citation", nodes);
      expect(result.issues.filter(i => i.ruleId.startsWith("ai.article"))).toHaveLength(0);
    });
  });

  describe("runMultipleRulesets", () => {
    it("combines results from multiple rulesets", () => {
      const nodes: SchemaNode[] = [{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Test Article",
        url: "https://example.com/article"
      }];
      
      const result = runMultipleRulesets(["google", "ai-citation"], nodes);
      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.issues.some(i => i.ruleId.startsWith("google."))).toBe(true);
      expect(result.issues.some(i => i.ruleId.startsWith("ai."))).toBe(true);
    });
  });
});
