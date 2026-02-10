import { describe, expect, it } from "vitest";
import { buildCoverageResult } from "./coverage";
import { SCHEMA_CONTEXT, type Manifest } from "@schemasentry/core";
import type { SchemaDataFile } from "./coverage";

describe("buildCoverageResult", () => {
  it("reports missing routes and types", () => {
    const manifest: Manifest = {
      routes: {
        "/": ["Organization", "WebSite"],
        "/blog/[slug]": ["Article"]
      }
    };

    const data: SchemaDataFile = {
      routes: {
        "/": [
          {
            "@context": SCHEMA_CONTEXT,
            "@type": "Organization",
            name: "Acme"
          }
        ]
      }
    };

    const result = buildCoverageResult(manifest, data);
    expect(result.summary.missingRoutes).toBe(1);
    expect(result.summary.missingTypes).toBe(2);
    expect(result.issuesByRoute["/"]?.some((issue) => issue.ruleId === "coverage.missing_type"))
      .toBe(true);
    expect(
      result.issuesByRoute["/blog/[slug]"]?.some(
        (issue) => issue.ruleId === "coverage.missing_route"
      )
    ).toBe(true);
  });

  it("warns on unlisted routes", () => {
    const manifest: Manifest = {
      routes: {
        "/": ["Organization"]
      }
    };

    const data: SchemaDataFile = {
      routes: {
        "/": [
          {
            "@context": SCHEMA_CONTEXT,
            "@type": "Organization",
            name: "Acme"
          }
        ],
        "/extra": [
          {
            "@context": SCHEMA_CONTEXT,
            "@type": "WebPage",
            name: "Extra",
            url: "https://acme.com/extra"
          }
        ]
      }
    };

    const result = buildCoverageResult(manifest, data);
    expect(result.summary.unlistedRoutes).toBe(1);
    expect(
      result.issuesByRoute["/extra"]?.some(
        (issue) => issue.ruleId === "coverage.unlisted_route"
      )
    ).toBe(true);
  });
});
