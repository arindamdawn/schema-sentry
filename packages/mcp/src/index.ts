#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  performRealityCheck,
  scanSourceFiles,
  collectSchemaData,
  buildAuditReport,
  scaffoldSchema,
  formatScaffoldPreview,
  generateSchemaSuggestions,
  getAvailableProviders,
  inferSchemaTypes
} from "@schemasentry/cli";

const server = new Server(
  {
    name: "schema-sentry-mcp",
    version: "0.11.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "schemasentry_validate",
        description: "Validate schema by checking built HTML output against manifest. Validates reality, not just config files.",
        inputSchema: {
          type: "object",
          properties: {
            manifest: {
              type: "string",
              description: "Path to manifest JSON (optional, defaults to schema-sentry.manifest.json)",
              default: "schema-sentry.manifest.json"
            },
            root: {
              type: "string",
              description: "Root directory containing built HTML output (auto-detected if omitted)"
            },
            appDir: {
              type: "string",
              description: "Path to Next.js app directory for source scanning",
              default: "./app"
            },
            format: {
              type: "string",
              description: "Output format",
              enum: ["json", "table", "tree"],
              default: "json"
            }
          },
        },
      },
      {
        name: "schemasentry_audit",
        description: "Analyze schema health and check for ghost routes (routes in manifest without Schema components)",
        inputSchema: {
          type: "object",
          properties: {
            manifest: {
              type: "string",
              description: "Path to manifest JSON (optional)",
              default: "schema-sentry.manifest.json"
            },
            root: {
              type: "string",
              description: "Project root for scanning",
              default: "."
            },
            appDir: {
              type: "string",
              description: "Path to Next.js app directory",
              default: "./app"
            },
            sourceScan: {
              type: "boolean",
              description: "Enable source file scanning for ghost route detection",
              default: true
            }
          },
        },
      },
      {
        name: "schemasentry_collect",
        description: "Collect JSON-LD blocks from built HTML output",
        inputSchema: {
          type: "object",
          properties: {
            root: {
              type: "string",
              description: "Root directory to scan for HTML files",
              default: "."
            },
            routes: {
              type: "array",
              items: { type: "string" },
              description: "Only collect specific routes"
            }
          },
        },
      },
      {
        name: "schemasentry_scaffold",
        description: "Generate schema code for pages without schema - shows copy-paste examples",
        inputSchema: {
          type: "object",
          properties: {
            root: {
              type: "string",
              description: "Root directory to scan for page files",
              default: "./app"
            },
            routes: {
              type: "array",
              items: { type: "string" },
              description: "Specific routes to scaffold (optional)"
            }
          },
        },
      },
      {
        name: "schemasentry_scan",
        description: "Scan source files to detect Schema component usage - returns routes with/without schema",
        inputSchema: {
          type: "object",
          properties: {
            root: {
              type: "string",
              description: "Project root directory",
              default: "."
            },
            appDir: {
              type: "string",
              description: "Path to Next.js app directory",
              default: "./app"
            }
          },
        },
      },
      {
        name: "schemasentry_suggest",
        description: "AI-powered schema suggestions - analyzes routes and generates contextualized schema recommendations using your own AI provider (OpenAI, Anthropic, Google, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            routes: {
              type: "array",
              items: { type: "string" },
              description: "Routes to analyze (optional - will scan app directory if not provided)"
            },
            provider: {
              type: "string",
              description: "AI provider: openai, anthropic, google, nvidia, or openrouter",
              enum: ["openai", "anthropic", "google", "nvidia", "openrouter"],
              default: "openai"
            },
            apiKey: {
              type: "string",
              description: "API key for the AI provider (or set via environment variable: OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)"
            },
            model: {
              type: "string",
              description: "Model to use (optional, provider-specific defaults)"
            }
          },
        },
      },
      {
        name: "schemasentry_install",
        description: "Install Schema Sentry packages (@schemasentry/next, @schemasentry/core, @schemasentry/cli) to your project",
        inputSchema: {
          type: "object",
          properties: {
            root: {
              type: "string",
              description: "Project root directory",
              default: "."
            },
            packageManager: {
              type: "string",
              description: "Package manager to use",
              enum: ["pnpm", "npm", "yarn"],
              default: "pnpm"
            },
            installCore: {
              type: "boolean",
              description: "Install @schemasentry/core (required for type-safe builders)",
              default: true
            },
            installNext: {
              type: "boolean",
              description: "Install @schemasentry/next (required for <Schema> component)",
              default: true
            },
            installCli: {
              type: "boolean",
              description: "Install @schemasentry/cli (required for validation)",
              default: true
            }
          },
        },
      },
    ],
  };
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "schema://health",
        name: "Schema Health",
        description: "Current schema validation status",
        mimeType: "application/json",
      },
      {
        uri: "schema://manifest",
        name: "Schema Manifest",
        description: "Current schema-sentry.manifest.json contents",
        mimeType: "application/json",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "schema://health") {
    try {
      const cwd = process.cwd();
      const manifestPath = resolve(cwd, "schema-sentry.manifest.json");
      const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({
              status: "ok",
              manifest: Object.keys(manifest.routes || {}).length,
              routes: Object.keys(manifest.routes || {})
            }, null, 2),
          },
        ],
      };
    } catch {
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({ status: "no-manifest" }, null, 2),
          },
        ],
      };
    }
  }

  if (uri === "schema://manifest") {
    try {
      const cwd = process.cwd();
      const manifestPath = resolve(cwd, "schema-sentry.manifest.json");
      const content = await readFile(manifestPath, "utf8");
      
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: content,
          },
        ],
      };
    } catch {
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({ error: "Manifest not found" }, null, 2),
          },
        ],
      };
    }
  }

  throw new Error(`Unknown resource: ${uri}`);
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const cwd = process.cwd();

  try {
    if (name === "schemasentry_validate") {
      const manifestPath = resolve(cwd, String(args.manifest) || "schema-sentry.manifest.json");
      const root = resolve(cwd, String(args.root) || ".");
      const appDir = resolve(cwd, String(args.appDir) || "./app");

      let manifest;
      try {
        manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      } catch {
        manifest = { routes: {} };
      }

      const report = await performRealityCheck({
        manifest,
        builtOutputDir: root,
        sourceDir: appDir,
        recommended: true
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(report, null, 2),
          },
        ],
      };
    }

    if (name === "schemasentry_audit") {
      const manifestPath = resolve(cwd, String(args.manifest) || "schema-sentry.manifest.json");
      const root = resolve(cwd, String(args.root) || ".");
      const appDir = resolve(cwd, String(args.appDir) || "./app");

      let manifest;
      try {
        manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      } catch {
        manifest = undefined;
      }

      const sourceScan = await scanSourceFiles({ rootDir: root, appDir });
      const data = await collectSchemaData({ rootDir: root });

      const report = buildAuditReport(data.data, {
        recommended: true,
        manifest
      });

      const ghostRoutes = manifest
        ? Object.keys(manifest.routes || {}).filter(
            (route) => !sourceScan.routes.find((r) => r.route === route)?.hasSchemaUsage
          )
        : [];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ report, ghostRoutes, sourceScan }, null, 2),
          },
        ],
      };
    }

    if (name === "schemasentry_collect") {
      const root = resolve(cwd, String(args.root) || ".");
      const routes = Array.isArray(args.routes) ? args.routes as string[] : undefined;
      const collected = await collectSchemaData({ 
        rootDir: root,
        routes
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(collected, null, 2),
          },
        ],
      };
    }

    if (name === "schemasentry_scaffold") {
      const root = resolve(cwd, String(args.root) || "./app");
      const appDir = resolve(cwd, String(args.appDir) || "./app");
      
      const sourceScan = await scanSourceFiles({ rootDir: root, appDir });
      
      const routesWithoutSchema = sourceScan.routes.filter(r => !r.hasSchemaUsage);
      
      const scaffoldOutput = routesWithoutSchema.map(r => ({
        route: r.route,
        filePath: r.filePath,
        suggestedTypes: [] as string[],
        message: "Route has no Schema component. Add one from @schemasentry/next"
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(scaffoldOutput, null, 2),
          },
        ],
      };
    }

    if (name === "schemasentry_scan") {
      const root = resolve(cwd, String(args.root) || ".");
      const appDir = resolve(cwd, String(args.appDir) || "./app");
      
      const sourceScan = await scanSourceFiles({ rootDir: root, appDir });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(sourceScan, null, 2),
          },
        ],
      };
    }

    if (name === "schemasentry_suggest") {
      const root = resolve(cwd, String(args.root) || ".");
      
      // Check if packages are installed
      const packageCheck = await checkAndInstallPackages(root);
      if (!packageCheck.installed) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                error: "Schema Sentry not installed",
                message: packageCheck.message,
                installCommand: "pnpm add @schemasentry/next @schemasentry/core @schemasentry/cli",
                suggestion: "First, install Schema Sentry packages using schemasentry_install tool, or run: pnpm add @schemasentry/next @schemasentry/core @schemasentry/cli"
              }, null, 2),
            },
          ],
        };
      }
      
      let routes = args.routes as string[] | undefined;
      
      if (!routes || routes.length === 0) {
        const appDir = resolve(cwd, String(args.appDir) || "./app");
        const sourceScan = await scanSourceFiles({ rootDir: root, appDir });
        routes = sourceScan.routes.map(r => r.route);
      }

      const provider = String(args.provider) as "openai" | "anthropic" | "google" | "nvidia" | "openrouter" || "openai";
      
      // Check if user has an API key available (from env or parameter)
      const availableProviders = getAvailableProviders();
      const hasApiKey = args.apiKey || availableProviders.find(p => p.provider === provider)?.hasKey;
      
      let result;
      if (!hasApiKey) {
        // Fallback to pattern-based suggestions (no AI needed!)
        const inferred = inferSchemaTypes(routes);
        const suggestions = Array.from(inferred.entries()).map(([route, types]) => {
          const schemaType = types[0] || "WebPage";
          return {
            route,
            suggestedType: schemaType,
            requiredFields: getRequiredFields(schemaType),
            recommendations: ["Use @schemasentry/next to add schema to this page"],
            codeExample: generateCodeExample(route, schemaType),
            filePath: routeToFilePath(route)
          };
        });
        result = {
          ok: true,
          provider: "pattern-based",
          model: "inferred from URL patterns",
          suggestions,
          note: "No AI API key found. Used pattern-based inference. Set OPENAI_API_KEY or ANTHROPIC_API_KEY for AI-powered suggestions.",
          forIDE: "Pass these suggestions to your LLM to fill in actual values from your page content"
        };
      } else {
        result = await generateSchemaSuggestions(routes, {
          provider,
          model: args.model ? String(args.model) : undefined,
          apiKey: args.apiKey ? String(args.apiKey) : undefined
        });
        
        // Add code examples to AI suggestions too
        if (result.suggestions) {
          (result as any).suggestions = result.suggestions.map((s: any) => ({
            ...s,
            requiredFields: s.missingFields || getRequiredFields(s.suggestedType),
            codeExample: generateCodeExample(s.route, s.suggestedType),
            filePath: routeToFilePath(s.route)
          }));
          (result as any).forIDE = "Pass these suggestions to your LLM to fill in actual values from your page content";
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === "schemasentry_install") {
      const root = resolve(cwd, String(args.root) || ".");
      const packageManager = String(args.packageManager) || "pnpm";
      
      const installCore = args.installCore !== false;
      const installNext = args.installNext !== false;
      const installCli = args.installCli !== false;
      
      const packages: string[] = [];
      if (installCore) packages.push("@schemasentry/core");
      if (installNext) packages.push("@schemasentry/next");
      if (installCli) packages.push("@schemasentry/cli");
      
      const installCmd = packageManager === "yarn" 
        ? `yarn add ${packages.join(" ")}`
        : packageManager === "npm"
          ? `npm install ${packages.join(" ")}`
          : `pnpm add ${packages.join(" ")}`;
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              message: `Run the following command in your project directory:\n\n${installCmd}`,
              command: installCmd,
              packages: packages,
              root: root,
              note: "This will install the Schema Sentry packages to your project. After installation, you can use other MCP tools to add and validate schema."
            }, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);

// Helper functions for IDE-friendly output

function getRequiredFields(schemaType: string): string[] {
  const fields: Record<string, string[]> = {
    Organization: ["name", "url"],
    WebSite: ["name", "url"],
    WebPage: ["name"],
    Article: ["headline", "url", "datePublished"],
    BlogPosting: ["headline", "url", "datePublished", "author"],
    Product: ["name", "offers", "price"],
    VideoObject: ["name", "description", "uploadDate"],
    ImageObject: ["name", "url"],
    Event: ["name", "startDate", "location"],
    Review: ["itemReviewed", "reviewRating", "author"],
    FAQPage: ["mainEntity"],
    HowTo: ["name", "step"],
    Person: ["name"],
    Place: ["name"],
    LocalBusiness: ["name", "address", "telephone"],
    BreadcrumbList: ["itemListElement"]
  };
  return fields[schemaType] || ["name", "url"];
}

function routeToFilePath(route: string): string {
  if (route === "/") return "app/page.tsx";
  if (route === "/404") return "app/not-found.tsx";
  
  // Convert route to file path
  const segments = route.split("/").filter(Boolean);
  if (segments.length === 0) return "app/page.tsx";
  
  const lastSegment = segments[segments.length - 1];
  if (lastSegment.includes("[")) {
    // Dynamic route: /blog/[slug] -> app/blog/[slug]/page.tsx
    return `app/${segments.join("/")}/page.tsx`;
  }
  
  return `app/${segments.join("/")}/page.tsx`;
}

function generateCodeExample(route: string, schemaType: string): string {
  const filePath = routeToFilePath(route);
  
  return `// Add to ${filePath}
import { Schema, ${schemaType} } from "@schemasentry/next";

<Schema data={${schemaType}({
  // TODO: Fill in actual values from your page content
  name: "Your Value Here",
  // Required: ${getRequiredFields(schemaType).join(", ")}
})} />`;
}

async function checkAndInstallPackages(rootDir: string): Promise<{ installed: boolean; message: string }> {
  const { existsSync } = await import("node:fs");
  const { readFile } = await import("node:fs/promises");
  
  const packageJsonPath = resolve(rootDir, "package.json");
  
  if (!existsSync(packageJsonPath)) {
    return { 
      installed: false, 
      message: "No package.json found. Please initialize a Node.js project first." 
    };
  }
  
  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const hasNext = deps["@schemasentry/next"];
    const hasCore = deps["@schemasentry/core"];
    const hasCli = deps["@schemasentry/cli"];
    
    if (!hasNext || !hasCore) {
      return {
        installed: false,
        message: "Schema Sentry packages not found. Run: pnpm add @schemasentry/next @schemasentry/core @schemasentry/cli"
      };
    }
    
    return { installed: true, message: "" };
  } catch {
    return { 
      installed: false, 
      message: "Could not read package.json" 
    };
  }
}
