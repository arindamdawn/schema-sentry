import { describe, expect, it } from "vitest";
import { buildReport, type SchemaDataFile } from "./report";
import { SCHEMA_CONTEXT, type Manifest } from "@schemasentry/core";

describe("buildReport", () => {
  it("reports missing expected types", () => {
    const manifest: Manifest = {
      routes: {
        "/": ["Organization"],
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
        ],
        "/blog/[slug]": []
      }
    };

    const report = buildReport(manifest, data);
    const blogReport = report.routes.find((route) => route.route === "/blog/[slug]");

    expect(report.ok).toBe(false);
    expect(report.summary.errors).toBeGreaterThan(0);
    expect(blogReport?.issues.some((issue) => issue.ruleId === "coverage.missing_type")).toBe(true);
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

    const report = buildReport(manifest, data);
    expect(report.summary.warnings).toBeGreaterThan(0);
  });

  it("adds recommended field warnings by default", () => {
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
        ]
      }
    };

    const report = buildReport(manifest, data);
    expect(report.summary.warnings).toBeGreaterThan(0);
    expect(
      report.routes[0]?.issues.some(
        (issue) => issue.ruleId === "schema.recommended.url"
      )
    ).toBe(true);
  });

  it("can disable recommended field warnings", () => {
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
        ]
      }
    };

    const report = buildReport(manifest, data, { recommended: false });
    expect(report.summary.warnings).toBe(0);
    expect(report.routes[0]?.issues.length).toBe(0);
  });
});
