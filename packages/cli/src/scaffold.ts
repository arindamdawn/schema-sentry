import { promises as fs } from "node:fs";
import path from "node:path";
import chalk from "chalk";
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

export type ComponentCodeExample = {
  route: string;
  filePath: string;
  code: string;
  imports: string[];
  builders: string[];
};

export const generateComponentCode = (
  route: string,
  types: SchemaTypeName[],
  siteUrl: string = "https://yoursite.com"
): ComponentCodeExample => {
  // Map route to likely file path
  const filePath = routeToFilePath(route);
  
  // Generate builder code for each type
  const builders: string[] = [];
  const imports = new Set<string>(["Schema"]);
  
  for (const type of types) {
    imports.add(type);
    const builderCode = generateBuilderCode(type, route, siteUrl);
    builders.push(builderCode);
  }
  
  // Generate full component code
  const code = `import { ${Array.from(imports).join(", ")} } from "@schemasentry/next";

${builders.join("\n\n")}

export default function Page() {
  return (
    <>
      <Schema data={[${types.join(", ").toLowerCase()}]} />
      {/* Your existing page content */}
    </>
  );
}`;

  return {
    route,
    filePath,
    code,
    imports: Array.from(imports),
    builders
  };
};

const routeToFilePath = (route: string): string => {
  if (route === "/") {
    return "app/page.tsx";
  }
  
  // Convert route to file path
  // /blog/[slug] -> app/blog/[slug]/page.tsx
  const segments = route.split("/").filter(Boolean);
  return `app/${segments.join("/")}/page.tsx`;
};

const generateBuilderCode = (
  type: SchemaTypeName,
  route: string,
  siteUrl: string
): string => {
  const normalizedRoute = route === "/" ? "" : route;
  const fullUrl = `${siteUrl}${normalizedRoute}`;
  const today = new Date().toISOString().split("T")[0];
  
  const varName = type.charAt(0).toLowerCase() + type.slice(1);
  
  switch (type) {
    case "BlogPosting":
      return `const ${varName} = BlogPosting({
  headline: "Blog Post Title",
  authorName: "Author Name",
  datePublished: "${today}",
  url: "${fullUrl}"
});`;
    
    case "Article":
      return `const ${varName} = Article({
  headline: "Article Headline",
  authorName: "Author Name",
  datePublished: "${today}",
  url: "${fullUrl}"
});`;
    
    case "Product":
      return `const ${varName} = Product({
  name: "Product Name",
  description: "Product description",
  url: "${fullUrl}"
});`;
    
    case "Organization":
      return `const ${varName} = Organization({
  name: "Organization Name",
  url: "${siteUrl}"
});`;
    
    case "WebSite":
      return `const ${varName} = WebSite({
  name: "Website Name",
  url: "${siteUrl}"
});`;
    
    case "WebPage":
      return `const ${varName} = WebPage({
  name: "Page Name",
  url: "${fullUrl}"
});`;
    
    case "FAQPage":
      return `const ${varName} = FAQPage({
  questions: [
    { question: "Question 1?", answer: "Answer 1" }
  ]
});`;
    
    case "HowTo":
      return `const ${varName} = HowTo({
  name: "How-To Title",
  steps: [
    { text: "Step 1 description" }
  ]
});`;
    
    case "Event":
      return `const ${varName} = Event({
  name: "Event Name",
  startDate: "${today}"
});`;
    
    default:
      return `const ${varName} = ${type}({
  name: "${type} Name"
});`;
  }
};

export const formatScaffoldPreview = (result: ScaffoldResult): string => {
  if (result.routesToScaffold.length === 0) {
    return "✅ No routes need schema generation. All routes have schema!";
  }

  const lines: string[] = [
    `📋 Found ${result.routesToScaffold.length} route(s) that need schema:\n`
  ];

  for (const route of result.routesToScaffold.slice(0, 5)) {
    const types = result.manifestUpdates[route] || [];
    const example = generateComponentCode(route, types);
    
    lines.push(chalk.cyan.bold(`📄 ${route}`));
    lines.push(chalk.gray(`   File: ${example.filePath}`));
    lines.push(chalk.gray(`   Types: ${types.join(", ") || "WebPage"}`));
    lines.push("");
    lines.push(chalk.yellow("   Add this code to your page:"));
    lines.push(chalk.gray("   ─────────────────────────────────────────"));
    lines.push(example.code.split("\n").map(l => "   " + l).join("\n"));
    lines.push(chalk.gray("   ─────────────────────────────────────────\n"));
  }

  if (result.routesToScaffold.length > 5) {
    lines.push(chalk.gray(`... and ${result.routesToScaffold.length - 5} more routes`));
  }

  lines.push(chalk.blue("\n💡 Next steps:"));
  lines.push("   1. Copy the code above into each route's page.tsx file");
  lines.push("   2. Customize the values (titles, names, URLs)");
  lines.push("   3. Run `next build` to build your app");
  lines.push("   4. Run `schemasentry validate` to verify\n");
  
  lines.push(chalk.gray("   Note: Use --write to also update the manifest and data JSON files"));

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
