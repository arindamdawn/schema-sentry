import { describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  scaffoldSchema,
  formatScaffoldPreview,
  applyScaffold,
  type ScaffoldOptions
} from "./scaffold";

const makeTempDir = async (): Promise<string> =>
  fs.mkdtemp(path.join(os.tmpdir(), "schema-sentry-scaffold-"));

const writeFile = async (
  rootDir: string,
  relativePath: string,
  content: string
): Promise<void> => {
  const fullPath = path.join(rootDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf8");
};

describe("scaffoldSchema", () => {
  it("identifies routes needing schema", async () => {
    const tempDir = await makeTempDir();
    
    await writeFile(
      tempDir,
      "app/blog/page.tsx",
      "export default function Page() { return <div>Blog</div>; }"
    );
    await writeFile(
      tempDir,
      "schema-sentry.manifest.json",
      JSON.stringify({ routes: {} })
    );
    await writeFile(
      tempDir,
      "schema-sentry.data.json",
      JSON.stringify({ routes: {} })
    );

    const options: ScaffoldOptions = {
      manifestPath: path.join(tempDir, "schema-sentry.manifest.json"),
      dataPath: path.join(tempDir, "schema-sentry.data.json"),
      rootDir: tempDir,
      dryRun: true,
      force: false
    };

    const result = await scaffoldSchema(options);

    expect(result.routesToScaffold.length).toBeGreaterThan(0);
    expect(result.wouldUpdate).toBe(true);
  });

  it("skips routes that already have schema", async () => {
    const tempDir = await makeTempDir();
    
    await writeFile(
      tempDir,
      "app/page.tsx",
      "export default function Page() { return <div>Home</div>; }"
    );
    await writeFile(
      tempDir,
      "schema-sentry.manifest.json",
      JSON.stringify({ routes: { "/": ["Organization"] } })
    );
    await writeFile(
      tempDir,
      "schema-sentry.data.json",
      JSON.stringify({
        routes: {
          "/": [{ "@context": "https://schema.org", "@type": "Organization", name: "Acme" }]
        }
      })
    );

    const options: ScaffoldOptions = {
      manifestPath: path.join(tempDir, "schema-sentry.manifest.json"),
      dataPath: path.join(tempDir, "schema-sentry.data.json"),
      rootDir: tempDir,
      dryRun: true,
      force: false
    };

    const result = await scaffoldSchema(options);

    expect(result.routesToScaffold).not.toContain("/");
  });

  it("generates appropriate schema stubs based on route patterns", async () => {
    const tempDir = await makeTempDir();
    
    await writeFile(
      tempDir,
      "app/blog/[slug]/page.tsx",
      "export default function Page() { return <div>Post</div>; }"
    );
    await writeFile(
      tempDir,
      "schema-sentry.manifest.json",
      JSON.stringify({ routes: {} })
    );
    await writeFile(
      tempDir,
      "schema-sentry.data.json",
      JSON.stringify({ routes: {} })
    );

    const options: ScaffoldOptions = {
      manifestPath: path.join(tempDir, "schema-sentry.manifest.json"),
      dataPath: path.join(tempDir, "schema-sentry.data.json"),
      rootDir: tempDir,
      dryRun: true,
      force: false
    };

    const result = await scaffoldSchema(options);

    const hasBlogRoute = result.routesToScaffold.some((r) => r.includes("/blog/"));
    if (hasBlogRoute) {
      const blogRoute = result.routesToScaffold.find((r) => r.includes("/blog/"));
      const schemas = result.generatedSchemas.get(blogRoute!);
      expect(schemas?.some((s) => s["@type"] === "BlogPosting")).toBe(true);
    }
  });
});

describe("formatScaffoldPreview", () => {
  it("shows message when no routes need scaffolding", () => {
    const result = {
      routesToScaffold: [] as string[],
      generatedSchemas: new Map(),
      manifestUpdates: {},
      wouldUpdate: false
    };

    const output = formatScaffoldPreview(result);
    expect(output).toContain("No routes need schema generation");
  });

  it("lists routes and their detected schema types", () => {
    const result = {
      routesToScaffold: ["/blog/post-1", "/products/123"],
      generatedSchemas: new Map([
        ["/blog/post-1", [{ "@type": "BlogPosting" } as any]],
        ["/products/123", [{ "@type": "Product" } as any]]
      ]),
      manifestUpdates: {
        "/blog/post-1": ["BlogPosting" as const],
        "/products/123": ["Product" as const]
      },
      wouldUpdate: true
    };

    const output = formatScaffoldPreview(result);
    expect(output).toContain("/blog/post-1");
    expect(output).toContain("/products/123");
    expect(output).toContain("BlogPosting");
    expect(output).toContain("Product");
  });
});

describe("applyScaffold", () => {
  it("writes scaffolded data to files", async () => {
    const tempDir = await makeTempDir();
    
    await writeFile(
      tempDir,
      "schema-sentry.manifest.json",
      JSON.stringify({ routes: {} })
    );
    await writeFile(
      tempDir,
      "schema-sentry.data.json",
      JSON.stringify({ routes: {} })
    );

    const result = {
      routesToScaffold: ["/blog/post-1"],
      generatedSchemas: new Map([
        ["/blog/post-1", [{ "@context": "https://schema.org" as const, "@type": "BlogPosting" as const, headline: "Title" }]]
      ]),
      manifestUpdates: { "/blog/post-1": ["BlogPosting" as const] },
      wouldUpdate: true
    };

    const options: ScaffoldOptions = {
      manifestPath: path.join(tempDir, "schema-sentry.manifest.json"),
      dataPath: path.join(tempDir, "schema-sentry.data.json"),
      rootDir: tempDir,
      dryRun: false,
      force: false
    };

    await applyScaffold(result, options);

    const manifestRaw = await fs.readFile(
      path.join(tempDir, "schema-sentry.manifest.json"),
      "utf8"
    );
    const dataRaw = await fs.readFile(
      path.join(tempDir, "schema-sentry.data.json"),
      "utf8"
    );

    const manifest = JSON.parse(manifestRaw);
    const data = JSON.parse(dataRaw);

    expect(manifest.routes).toHaveProperty("/blog/post-1");
    expect(data.routes).toHaveProperty("/blog/post-1");
  });
});
