import { describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  collectSchemaData,
  compareSchemaData,
  formatSchemaDataDrift,
  normalizeRouteFilter
} from "./collect";
import type { SchemaDataFile } from "./report";

const makeTempDir = async (): Promise<string> =>
  fs.mkdtemp(path.join(os.tmpdir(), "schema-sentry-collect-"));

const writeFile = async (
  rootDir: string,
  relativePath: string,
  content: string
): Promise<void> => {
  const fullPath = path.join(rootDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf8");
};

describe("collectSchemaData", () => {
  it("collects JSON-LD blocks from html files and maps file paths to routes", async () => {
    const rootDir = await makeTempDir();
    await writeFile(
      rootDir,
      "index.html",
      [
        "<html><body>",
        '<script type="application/ld+json">',
        '{"@context":"https://schema.org","@type":"Organization","name":"Acme"}',
        "</script>",
        "</body></html>"
      ].join("\n")
    );
    await writeFile(
      rootDir,
      "blog/index.html",
      [
        "<html><body>",
        '<script type="application/ld+json">',
        '[{"@context":"https://schema.org","@type":"WebPage","name":"Blog","url":"https://acme.com/blog"}]',
        "</script>",
        "</body></html>"
      ].join("\n")
    );

    const result = await collectSchemaData({ rootDir });

    expect(result.stats.htmlFiles).toBe(2);
    expect(result.stats.routes).toBe(2);
    expect(result.stats.blocks).toBe(2);
    expect(result.stats.invalidBlocks).toBe(0);
    expect(result.requestedRoutes).toEqual([]);
    expect(result.missingRoutes).toEqual([]);
    expect(result.data.routes["/"]?.[0]?.["@type"]).toBe("Organization");
    expect(result.data.routes["/blog"]?.[0]?.["@type"]).toBe("WebPage");
  });

  it("expands @graph nodes and reports invalid blocks as warnings", async () => {
    const rootDir = await makeTempDir();
    await writeFile(
      rootDir,
      "products.html",
      [
        "<html><body>",
        '<script type="application/ld+json">',
        '{"@context":"https://schema.org","@graph":[{"@context":"https://schema.org","@type":"Organization","name":"Acme"},{"@context":"https://schema.org","@type":"WebPage","name":"Products","url":"https://acme.com/products"}]}',
        "</script>",
        '<script type="application/ld+json">{invalid json}</script>',
        "</body></html>"
      ].join("\n")
    );

    const result = await collectSchemaData({ rootDir });

    expect(result.stats.blocks).toBe(2);
    expect(result.stats.invalidBlocks).toBe(1);
    expect(result.warnings).toHaveLength(1);
    expect(result.data.routes["/products"]?.map((node) => node["@type"])).toEqual([
      "Organization",
      "WebPage"
    ]);
  });

  it("supports route filtering and reports missing requested routes", async () => {
    const rootDir = await makeTempDir();
    await writeFile(
      rootDir,
      "index.html",
      [
        "<html><body>",
        '<script type="application/ld+json">',
        '{"@context":"https://schema.org","@type":"Organization","name":"Acme"}',
        "</script>",
        "</body></html>"
      ].join("\n")
    );
    await writeFile(
      rootDir,
      "blog/index.html",
      [
        "<html><body>",
        '<script type="application/ld+json">',
        '{"@context":"https://schema.org","@type":"WebPage","name":"Blog","url":"https://acme.com/blog"}',
        "</script>",
        "</body></html>"
      ].join("\n")
    );

    const result = await collectSchemaData({
      rootDir,
      routes: ["/", "/missing"]
    });

    expect(result.stats.routes).toBe(1);
    expect(result.stats.blocks).toBe(1);
    expect(Object.keys(result.data.routes)).toEqual(["/"]);
    expect(result.requestedRoutes).toEqual(["/", "/missing"]);
    expect(result.missingRoutes).toEqual(["/missing"]);
  });
});

describe("compareSchemaData", () => {
  it("detects added, removed, and changed routes", () => {
    const existing: SchemaDataFile = {
      routes: {
        "/": [
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Acme"
          }
        ],
        "/legacy": [
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Legacy",
            url: "https://acme.com/legacy"
          }
        ]
      }
    };

    const collected: SchemaDataFile = {
      routes: {
        "/": [
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Acme Inc"
          }
        ],
        "/new": [
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "New",
            url: "https://acme.com/new"
          }
        ]
      }
    };

    const drift = compareSchemaData(existing, collected);
    expect(drift.hasChanges).toBe(true);
    expect(drift.addedRoutes).toEqual(["/new"]);
    expect(drift.removedRoutes).toEqual(["/legacy"]);
    expect(drift.changedRoutes).toEqual(["/"]);
    expect(drift.changedRouteDetails[0]?.route).toBe("/");
    const formatted = formatSchemaDataDrift(drift);
    expect(formatted).toContain("Schema data drift detected");
    expect(formatted).toContain("Changed route details:");
    expect(formatted).toContain("/ blocks 1->1");
  });
});

describe("normalizeRouteFilter", () => {
  it("normalizes comma-separated and repeated values", () => {
    const normalized = normalizeRouteFilter(["/blog,/faq", "/blog", "/", ""]);
    expect(normalized).toEqual(["/", "/blog", "/faq"]);
  });
});
