import { describe, expect, it } from "vitest";
import { renderHtmlReport } from "./html";
import type { Report } from "./report";

const sampleReport: Report = {
  ok: false,
  summary: {
    routes: 1,
    errors: 1,
    warnings: 1,
    score: 88,
    coverage: {
      missingRoutes: 0,
      missingTypes: 1,
      unlistedRoutes: 0
    }
  },
  routes: [
    {
      route: "/blog/<slug>",
      ok: false,
      score: 88,
      expectedTypes: ["Article"],
      foundTypes: ["Organization"],
      issues: [
        {
          path: 'routes["/blog/<slug>"]',
          message: "Missing expected schema type 'Article'",
          severity: "error",
          ruleId: "coverage.missing_type"
        },
        {
          path: "nodes[0].url",
          message: "Recommended field 'url' is missing",
          severity: "warn",
          ruleId: "schema.recommended.url"
        }
      ]
    }
  ]
};

describe("renderHtmlReport", () => {
  it("renders summary and route data", () => {
    const html = renderHtmlReport(sampleReport, {
      title: "Schema Sentry Audit Report",
      generatedAt: new Date("2026-02-11T00:00:00.000Z")
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Schema Sentry Audit Report");
    expect(html).toContain("<strong>Errors:</strong> 1");
    expect(html).toContain("/blog/&lt;slug&gt;");
    expect(html).toContain("coverage.missing_type");
    expect(html).toContain("schema.recommended.url");
  });

  it("escapes HTML-special characters", () => {
    const html = renderHtmlReport(
      {
        ...sampleReport,
        routes: [
          {
            ...sampleReport.routes[0],
            route: "<script>alert('x')</script>",
            issues: [
              {
                path: "nodes[0].name",
                message: "<b>unsafe</b>",
                severity: "error",
                ruleId: "schema.required.name"
              }
            ]
          }
        ]
      },
      {
        title: "<unsafe>",
        generatedAt: new Date("2026-02-11T00:00:00.000Z")
      }
    );

    expect(html).toContain("&lt;unsafe&gt;");
    expect(html).toContain("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
    expect(html).toContain("&lt;b&gt;unsafe&lt;/b&gt;");
    expect(html).not.toContain("<script>alert('x')</script>");
  });
});
