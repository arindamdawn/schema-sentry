import { promises as fs } from "node:fs";
import path from "node:path";
import { stableStringify, type Manifest, type SchemaNode, type SchemaTypeName } from "@schemasentry/core";
import type { SchemaDataFile } from "./report";
import { generateManifestEntries, inferSchemaTypes, type PatternRule } from "./patterns";
import { scanRoutes } from "./routes";

export type ScaffoldOptions = {
  manifestPath: string;
  dataPath: string;
  rootDir: string;
  dryRun: boolean;
  force: boolean;
  customPatterns?: PatternRule[];
};

export type ScaffoldResult = {
  routesToScaffold: string[];
  generatedSchemas: Map<string, SchemaNode[]>;
  manifestUpdates: Record<string, SchemaTypeName[]>;
  wouldUpdate: boolean;
};

export type ScaffoldAction = {
  type: "create" | "update" | "skip";
  route: string;
  schemaTypes: SchemaTypeName[];
  schemaNodes: SchemaNode[];
};

export const scaffoldSchema = async (
  options: ScaffoldOptions
): Promise<ScaffoldResult> => {
  const manifest = await loadManifest(options.manifestPath);
  const data = await loadData(options.dataPath);
  const discoveredRoutes = await scanRoutes({ rootDir: options.rootDir });

  const routesNeedingSchema = discoveredRoutes.filter(
    (route) => !data.routes[route] || data.routes[route].length === 0
  );

  const inferredTypes = inferSchemaTypes(routesNeedingSchema, options.customPatterns);
  const manifestEntries = generateManifestEntries(
    routesNeedingSchema,
    options.customPatterns
  );

  const generatedSchemas = new Map<string, SchemaNode[]>();

  for (const [route, types] of inferredTypes) {
    const schemas = types.map((type) => generateSchemaStub(type, route));
    generatedSchemas.set(route, schemas);
  }

  const wouldUpdate = routesNeedingSchema.length > 0;

  return {
    routesToScaffold: routesNeedingSchema,
    generatedSchemas,
    manifestUpdates: manifestEntries,
    wouldUpdate
  };
};

const loadManifest = async (manifestPath: string): Promise<Manifest> => {
  try {
    const raw = await fs.readFile(manifestPath, "utf8");
    return JSON.parse(raw) as Manifest;
  } catch {
    return { routes: {} };
  }
};

const loadData = async (dataPath: string): Promise<SchemaDataFile> => {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    return JSON.parse(raw) as SchemaDataFile;
  } catch {
    return { routes: {} };
  }
};

const generateSchemaStub = (type: SchemaTypeName, route: string): SchemaNode => {
  const base: SchemaNode = {
    "@context": "https://schema.org",
    "@type": type
  };

  switch (type) {
    case "BlogPosting":
      return {
        ...base,
        headline: "Blog Post Title",
        author: {
          "@type": "Person",
          name: "Author Name"
        },
        datePublished: new Date().toISOString().split("T")[0],
        url: route
      };
    case "Product":
      return {
        ...base,
        name: "Product Name",
        description: "Product description",
        offers: {
          "@type": "Offer",
          price: "0.00",
          priceCurrency: "USD"
        }
      };
    case "FAQPage":
      return {
        ...base,
        mainEntity: []
      };
    case "HowTo":
      return {
        ...base,
        name: "How-To Title",
        step: []
      };
    case "Event":
      return {
        ...base,
        name: "Event Name",
        startDate: new Date().toISOString()
      };
    case "Organization":
      return {
        ...base,
        name: "Organization Name",
        url: route
      };
    case "WebSite":
      return {
        ...base,
        name: "Website Name",
        url: route
      };
    case "Article":
      return {
        ...base,
        headline: "Article Headline",
        author: {
          "@type": "Person",
          name: "Author Name"
        },
        datePublished: new Date().toISOString().split("T")[0]
      };
    default:
      return {
        ...base,
        name: `${type} Name`
      };
  }
};

export const formatScaffoldPreview = (result: ScaffoldResult): string => {
  if (result.routesToScaffold.length === 0) {
    return "No routes need schema generation.";
  }

  const lines: string[] = [
    `Routes to scaffold: ${result.routesToScaffold.length}`,
    ""
  ];

  for (const route of result.routesToScaffold) {
    const types = result.manifestUpdates[route] || [];
    lines.push(`  ${route}`);
    lines.push(`    Schema types: ${types.join(", ") || "None detected"}`);
  }

  return lines.join("\n");
};

export const applyScaffold = async (
  result: ScaffoldResult,
  options: ScaffoldOptions
): Promise<void> => {
  if (!result.wouldUpdate) {
    return;
  }

  const manifest = await loadManifest(options.manifestPath);
  const data = await loadData(options.dataPath);

  for (const [route, types] of Object.entries(result.manifestUpdates)) {
    if (!manifest.routes[route]) {
      manifest.routes[route] = types;
    }
  }

  for (const [route, schemas] of result.generatedSchemas) {
    if (!data.routes[route]) {
      data.routes[route] = schemas;
    }
  }

  await fs.mkdir(path.dirname(options.manifestPath), { recursive: true });
  await fs.mkdir(path.dirname(options.dataPath), { recursive: true });

  await fs.writeFile(
    options.manifestPath,
    stableStringify(manifest),
    "utf8"
  );
  await fs.writeFile(options.dataPath, stableStringify(data), "utf8");
};
