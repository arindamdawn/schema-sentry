import { describe, expect, it } from "vitest";
import { buildAuditReport } from "./audit";
import { SCHEMA_CONTEXT, stableStringify, type Manifest } from "@schemasentry/core";
import type { SchemaDataFile } from "./report";

describe("buildAuditReport", () => {
  it("skips coverage checks when no manifest is provided", () => {
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

    const report = buildAuditReport(data);
    expect(report.routes[0]?.issues.some((issue) => issue.ruleId.startsWith("coverage.")))
      .toBe(false);
  });

  it("includes coverage checks when manifest is provided", () => {
    const manifest: Manifest = {
      routes: {
        "/": ["Organization", "WebSite"]
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

    const report = buildAuditReport(data, { manifest });
    expect(report.routes[0]?.issues.some((issue) => issue.ruleId === "coverage.missing_type"))
      .toBe(true);
  });

  it("respects recommended field settings", () => {
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

    const report = buildAuditReport(data, { recommended: false });
    expect(report.routes[0]?.issues.length).toBe(0);
  });

  it("produces deterministic JSON output", () => {
    const dataA: SchemaDataFile = {
      routes: {
        "/b": [
          {
            "@context": SCHEMA_CONTEXT,
            "@type": "Organization",
            name: "Beta"
          }
        ],
        "/a": [
          {
            "@context": SCHEMA_CONTEXT,
            "@type": "Organization",
            name: "Alpha"
          }
        ]
      }
    };

    const dataB: SchemaDataFile = {
      routes: {
        "/a": [
          {
            "@context": SCHEMA_CONTEXT,
            "@type": "Organization",
            name: "Alpha"
          }
        ],
        "/b": [
          {
            "@context": SCHEMA_CONTEXT,
            "@type": "Organization",
            name: "Beta"
          }
        ]
      }
    };

    const reportA = buildAuditReport(dataA);
    const reportB = buildAuditReport(dataB);

    expect(stableStringify(reportA)).toEqual(stableStringify(reportB));
  });

  it("uses requiredRoutes when provided", () => {
    const data: SchemaDataFile = {
      routes: {}
    };

    const report = buildAuditReport(data, {
      requiredRoutes: ["/", "/blog"]
    });

    expect(report.summary.errors).toBeGreaterThan(0);
    expect(
      report.routes.find((route) => route.route === "/")?.issues.some(
        (issue) => issue.ruleId === "coverage.missing_route"
      )
    ).toBe(true);
  });
});
