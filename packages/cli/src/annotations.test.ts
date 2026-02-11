import { describe, expect, it } from "vitest";
import { buildGitHubAnnotationLines } from "./annotations";
import type { Report } from "./report";

const reportWithIssues: Report = {
  ok: false,
  summary: {
    routes: 1,
    errors: 1,
    warnings: 1,
    score: 80
  },
  routes: [
    {
      route: "/blog/[slug]",
      ok: false,
      score: 80,
      expectedTypes: ["Article"],
      foundTypes: ["Organization"],
      issues: [
        {
          path: "nodes[0].headline",
          message: "Missing required field 'headline'",
          severity: "error",
          ruleId: "schema.required.headline"
        },
        {
          path: "nodes[0].description",
          message: "Recommended field 'description' is missing",
          severity: "warn",
          ruleId: "schema.recommended.description"
        }
      ]
    }
  ]
};

describe("buildGitHubAnnotationLines", () => {
  it("formats errors and warnings as GitHub commands", () => {
    const lines = buildGitHubAnnotationLines(reportWithIssues, "validate");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("::error");
    expect(lines[1]).toContain("::warning");
    expect(lines[0]).toContain("Schema Sentry validate");
    expect(lines[0]).toContain("[/blog/[slug]] schema.required.headline");
  });

  it("escapes command characters in annotation output", () => {
    const lines = buildGitHubAnnotationLines(
      {
        ...reportWithIssues,
        routes: [
          {
            ...reportWithIssues.routes[0],
            issues: [
              {
                path: "nodes[0].description",
                message: "bad%line\nnext,part:colon",
                severity: "warn",
                ruleId: "schema.recommended.description"
              }
            ]
          }
        ]
      },
      "audit,pr:review"
    );

    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("audit%2Cpr%3Areview");
    expect(lines[0]).toContain("bad%25line%0Anext,part:colon");
  });
});
