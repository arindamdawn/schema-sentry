import { describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  performRealityCheck,
  formatRealityReport,
  type RealityCheckReport
} from "./reality";

// Helper to strip ANSI codes for testing
const stripAnsi = (str: string): string => {
  return str.replace(/\u001b\[[0-9;]*m/g, "");
};

const makeTempDir = async (): Promise<string> =>
  fs.mkdtemp(path.join(os.tmpdir(), "schema-sentry-reality-"));

const writeFile = async (
  rootDir: string,
  relativePath: string,
  content: string
): Promise<void> => {
  const fullPath = path.join(rootDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf8");
};

describe("performRealityCheck", () => {
  it("performs reality check without errors", async () => {
    const tempDir = await makeTempDir();

    // Create a simple test scenario
    await fs.mkdir(path.join(tempDir, "app"), { recursive: true });
    await fs.mkdir(path.join(tempDir, ".next/server/app"), { recursive: true });

    await writeFile(
      tempDir,
      "app/page.tsx",
      'export default function Page() { return <div>Test</div>; }'
    );

    await writeFile(
      tempDir,
      ".next/server/app/index.html",
      '<!DOCTYPE html><html><body></body></html>'
    );

    const report = await performRealityCheck({
      manifest: { routes: {} },
      builtOutputDir: path.join(tempDir, ".next/server/app"),
      sourceDir: tempDir
    });

    // Should complete without throwing
    expect(report).toBeDefined();
    expect(report.routes).toBeDefined();
    expect(report.summary).toBeDefined();
  });
});

describe("formatRealityReport", () => {
  it("shows success for valid report", () => {
    const report: RealityCheckReport = {
      ok: true,
      summary: {
        routes: 5,
        errors: 0,
        warnings: 0,
        score: 100,
        validRoutes: 5,
        missingInHtml: 0,
        missingInSource: 0,
        missingFromManifest: 0,
        typeMismatches: 0
      },
      routes: []
    };

    const output = stripAnsi(formatRealityReport(report));
    expect(output).toContain("Schema Reality Check");
    expect(output).toContain("100/100");
  });

  it("shows failures for invalid report", () => {
    const report: RealityCheckReport = {
      ok: false,
      summary: {
        routes: 5,
        errors: 3,
        warnings: 1,
        score: 40,
        validRoutes: 2,
        missingInHtml: 1,
        missingInSource: 1,
        missingFromManifest: 1,
        typeMismatches: 0
      },
      routes: [
        {
          route: "/blog",
          status: "missing_in_source",
          sourceHasComponent: false,
          htmlHasSchema: false,
          expectedTypes: ["BlogPosting"],
          foundTypes: [],
          issues: [
            {
              path: 'routes["/blog"]',
              message: "Manifest expects schema but source file has no <Schema> component",
              severity: "error",
              ruleId: "reality.missing_source_component"
            }
          ],
          score: 0
        }
      ]
    };

    const output = stripAnsi(formatRealityReport(report));
    expect(output).toContain("Schema Reality Check");
    expect(output).toContain("40/100");
    expect(output).toContain("/blog");
  });
});
