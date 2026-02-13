import { describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { scanSourceFiles, formatSourceScanSummary } from "./source";

const makeTempDir = async (): Promise<string> =>
  fs.mkdtemp(path.join(os.tmpdir(), "schema-sentry-source-"));

const writeFile = async (
  rootDir: string,
  relativePath: string,
  content: string
): Promise<void> => {
  const fullPath = path.join(rootDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf8");
};

describe("scanSourceFiles", () => {
  it("detects Schema component usage", async () => {
    const tempDir = await makeTempDir();

    await writeFile(
      tempDir,
      "app/page.tsx",
      `
import { Schema, Organization } from "@schemasentry/next";

const org = Organization({ name: "Test" });

export default function Page() {
  return <Schema data={[org]} />;
}
`
    );

    const result = await scanSourceFiles({ rootDir: tempDir });

    expect(result.totalFiles).toBe(1);
    expect(result.filesWithSchema).toBe(1);
    expect(result.routes[0].hasSchemaImport).toBe(true);
    expect(result.routes[0].hasSchemaUsage).toBe(true);
    expect(result.routes[0].importedBuilders).toContain("Organization");
  });

  it("detects missing Schema components", async () => {
    const tempDir = await makeTempDir();

    await writeFile(
      tempDir,
      "app/blog/page.tsx",
      `
export default function Page() {
  return <div>No schema here</div>;
}
`
    );

    const result = await scanSourceFiles({ rootDir: tempDir });

    expect(result.totalFiles).toBe(1);
    expect(result.filesWithSchema).toBe(0);
    expect(result.routes[0].hasSchemaImport).toBe(false);
    expect(result.routes[0].hasSchemaUsage).toBe(false);
  });

  it("detects imports without usage", async () => {
    const tempDir = await makeTempDir();

    await writeFile(
      tempDir,
      "app/products/page.tsx",
      `
import { Schema, Product } from "@schemasentry/next";

export default function Page() {
  // Forgot to use Schema component!
  return <div>Product page</div>;
}
`
    );

    const result = await scanSourceFiles({ rootDir: tempDir });

    expect(result.routes[0].hasSchemaImport).toBe(true);
    expect(result.routes[0].hasSchemaUsage).toBe(false);
  });

  it("detects aliased Schema component usage", async () => {
    const tempDir = await makeTempDir();

    await writeFile(
      tempDir,
      "app/faq/page.tsx",
      `
import { Schema as JsonLdSchema, FAQPage } from "@schemasentry/next";

const faq = FAQPage({ mainEntity: [] });

export default function Page() {
  return <JsonLdSchema data={[faq]} />;
}
`
    );

    const result = await scanSourceFiles({ rootDir: tempDir });

    expect(result.totalFiles).toBe(1);
    expect(result.filesWithSchema).toBe(1);
    expect(result.routes[0].hasSchemaImport).toBe(true);
    expect(result.routes[0].hasSchemaUsage).toBe(true);
    expect(result.routes[0].importedBuilders).toContain("FAQPage");
  });

  it("handles empty app directory", async () => {
    const tempDir = await makeTempDir();
    await fs.mkdir(path.join(tempDir, "app"), { recursive: true });

    const result = await scanSourceFiles({ rootDir: tempDir });

    expect(result.totalFiles).toBe(0);
    expect(result.filesWithSchema).toBe(0);
  });
});

describe("formatSourceScanSummary", () => {
  it("shows all clear when no issues", () => {
    const result = {
      routes: [],
      totalFiles: 5,
      filesWithSchema: 5,
      filesMissingSchema: 0
    };

    const output = formatSourceScanSummary(result);
    expect(output).toContain("Source scan complete");
    expect(output).toContain("5");
  });

  it("lists routes missing schema", () => {
    const result = {
      routes: [
        {
          route: "/blog",
          filePath: "/app/blog/page.tsx",
          hasSchemaImport: false,
          hasSchemaUsage: false,
          importedBuilders: []
        },
        {
          route: "/",
          filePath: "/app/page.tsx",
          hasSchemaImport: true,
          hasSchemaUsage: true,
          importedBuilders: ["Organization"]
        }
      ],
      totalFiles: 2,
      filesWithSchema: 1,
      filesMissingSchema: 1
    };

    const output = formatSourceScanSummary(result);
    expect(output).toContain("Routes without Schema components");
    expect(output).toContain("/blog");
    expect(output).toContain("no @schemasentry import");
  });
});
