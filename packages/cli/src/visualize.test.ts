import { describe, it, expect } from "vitest";
import { formatRealityReportTable, formatRealityReportTree } from "./visualize.js";
import type { RealityCheckReport } from "./reality";

describe("visualize", () => {
  const mockReport: RealityCheckReport = {
    ok: false,
    summary: {
      routes: 3,
      errors: 2,
      warnings: 1,
      score: 75,
      validRoutes: 1,
      missingInHtml: 0,
      missingInSource: 1,
      missingFromManifest: 0,
      typeMismatches: 0
    },
    routes: [
      {
        route: "/",
        status: "valid",
        sourceHasComponent: true,
        htmlHasSchema: true,
        expectedTypes: ["Organization", "WebSite"],
        foundTypes: ["Organization", "WebSite"],
        issues: [],
        score: 100
      },
      {
        route: "/blog/article-1",
        status: "missing_in_source",
        sourceHasComponent: false,
        htmlHasSchema: false,
        expectedTypes: ["Article"],
        foundTypes: [],
        issues: [
          {
            path: 'routes["/blog/article-1"]',
            message: "Manifest expects schema but source file has no <Schema> component",
            severity: "error",
            ruleId: "reality.missing_source_component"
          }
        ],
        score: 90
      },
      {
        route: "/products/phone",
        status: "valid",
        sourceHasComponent: true,
        htmlHasSchema: true,
        expectedTypes: ["Product"],
        foundTypes: ["Product"],
        issues: [
          {
            path: "nodes[0].offers.price",
            message: "price in offers required for Product rich results",
            severity: "warn",
            ruleId: "google.product.price"
          }
        ],
        score: 98
      }
    ]
  };

  describe("formatRealityReportTable", () => {
    it("formats report as table", () => {
      const output = formatRealityReportTable(mockReport);
      expect(output).toContain("Route");
      expect(output).toContain("Status");
      expect(output).toContain("Types");
      expect(output).toContain("Issues");
    });

    it("includes route information", () => {
      const output = formatRealityReportTable(mockReport);
      expect(output).toContain("/");
      expect(output).toContain("/blog/article-1");
      expect(output).toContain("/products/phone");
    });

    it("includes status icons", () => {
      const output = formatRealityReportTable(mockReport);
      expect(output).toContain("✓");
      expect(output).toContain("✗");
    });

    it("includes ruleset results when provided", () => {
      const rulesetResults = new Map([
        ["/", { errors: 0, warnings: 0 }],
        ["/blog/article-1", { errors: 0, warnings: 0 }],
        ["/products/phone", { errors: 1, warnings: 0 }]
      ]);
      const output = formatRealityReportTable(mockReport, rulesetResults);
      expect(output).toContain("1E");
    });
  });

  describe("formatRealityReportTree", () => {
    it("formats report as tree", () => {
      const output = formatRealityReportTree(mockReport);
      expect(output).toContain("Schema Sentry");
      expect(output).toContain("/");
      expect(output).toContain("/blog/article-1");
      expect(output).toContain("/products/phone");
    });

    it("includes schema types in tree", () => {
      const output = formatRealityReportTree(mockReport);
      expect(output).toContain("Organization");
      expect(output).toContain("WebSite");
      expect(output).toContain("Product");
    });

    it("includes issue messages in tree", () => {
      const output = formatRealityReportTree(mockReport);
      expect(output).toContain("Manifest expects schema");
    });

    it("includes ruleset results when provided", () => {
      const rulesetResults = new Map([
        ["/", { errors: 0, warnings: 0 }],
        ["/blog/article-1", { errors: 0, warnings: 0 }],
        ["/products/phone", { errors: 2, warnings: 1 }]
      ]);
      const output = formatRealityReportTree(mockReport, rulesetResults);
      expect(output).toContain("Rules:");
      expect(output).toContain("2 errors");
    });
  });
});
