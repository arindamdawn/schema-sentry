import { describe, expect, it } from "vitest";
import { buildAuditReport } from "./audit";
import { SCHEMA_CONTEXT, type Manifest } from "@schemasentry/core";
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
});
