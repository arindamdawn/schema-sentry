import { promises as fs } from "node:fs";
import path from "node:path";

export type SourceScanOptions = {
  rootDir: string;
  appDir?: string;
};

export type RouteSourceInfo = {
  route: string;
  filePath: string;
  hasSchemaImport: boolean;
  hasSchemaUsage: boolean;
  importedBuilders: string[];
};

export type SourceScanResult = {
  routes: RouteSourceInfo[];
  totalFiles: number;
  filesWithSchema: number;
  filesMissingSchema: number;
};

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  ".pnpm-store",
  ".next",
  "dist",
  "build",
  "out"
]);

const SCHEMA_IMPORT_PATTERN =
  /from\s+["']@schemasentry\/(?:next|core)["']/;
const BUILDER_IMPORT_PATTERN =
  /import\s*\{([^}]+)\}\s*from\s*["']@schemasentry\/(?:next|core)["']/g;
const BUILDER_NAME_PATTERN =
  /^(Organization|Person|Place|LocalBusiness|WebSite|WebPage|Article|BlogPosting|Product|VideoObject|ImageObject|Event|Review|FAQPage|HowTo|BreadcrumbList)$/;

export const scanSourceFiles = async (
  options: SourceScanOptions
): Promise<SourceScanResult> => {
  const appDir = path.resolve(options.rootDir, options.appDir ?? "app");
  const pageFiles = await findPageFiles(appDir);

  const routes: RouteSourceInfo[] = [];

  for (const filePath of pageFiles) {
    const route = filePathToRoute(appDir, filePath);
    if (!route) continue;

    const content = await fs.readFile(filePath, "utf8");
    const info = analyzeSourceFile(filePath, route, content);
    routes.push(info);
  }

  const filesWithSchema = routes.filter(
    (r) => r.hasSchemaImport && r.hasSchemaUsage
  ).length;

  return {
    routes,
    totalFiles: routes.length,
    filesWithSchema,
    filesMissingSchema: routes.length - filesWithSchema
  };
};

const findPageFiles = async (dir: string): Promise<string[]> => {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          files.push(...(await findPageFiles(fullPath)));
        }
      } else if (
        entry.isFile() &&
        (entry.name === "page.tsx" ||
          entry.name === "page.jsx" ||
          entry.name === "page.ts" ||
          entry.name === "page.js")
      ) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist or isn't readable
  }

  return files;
};

const filePathToRoute = (appDir: string, filePath: string): string | null => {
  const relative = path.relative(appDir, filePath).replace(/\\/g, "/");

  // Remove page.tsx/page.jsx extension
  const withoutExt = relative.replace(/\/page\.(tsx|jsx|ts|js)$/, "");

  if (withoutExt === "") {
    return "/";
  }

  // Convert [param] to [param] (keep as-is)
  return `/${withoutExt}`;
};

const analyzeSourceFile = (
  filePath: string,
  route: string,
  content: string
): RouteSourceInfo => {
  const hasSchemaImport = SCHEMA_IMPORT_PATTERN.test(content);
  const schemaAliases = new Set<string>();

  // Extract imported builder names
  const importedBuilders: string[] = [];
  const importMatches = Array.from(content.matchAll(BUILDER_IMPORT_PATTERN));
  for (const importMatch of importMatches) {
    if (!importMatch[1]) continue;
    const imports = importMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const imp of imports) {
      const normalized = imp.replace(/^type\s+/, "").trim();
      const [baseName, aliasName] = normalized
        .split(/\s+as\s+/)
        .map((part) => part.trim());

      if (baseName === "Schema") {
        schemaAliases.add(aliasName || "Schema");
      }

      if (BUILDER_NAME_PATTERN.test(baseName)) {
        importedBuilders.push(baseName);
      }
    }
  }

  const hasSchemaUsage = hasSchemaComponentUsage(content, schemaAliases);

  return {
    route,
    filePath,
    hasSchemaImport,
    hasSchemaUsage,
    importedBuilders
  };
};

const hasSchemaComponentUsage = (
  content: string,
  schemaAliases: Set<string>
): boolean => {
  const aliases = schemaAliases.size > 0 ? Array.from(schemaAliases) : ["Schema"];
  for (const alias of aliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`<${escaped}(?:\\s|>)`);
    if (pattern.test(content)) {
      return true;
    }
  }
  return false;
};

export const formatSourceScanSummary = (result: SourceScanResult): string => {
  const lines: string[] = [
    `📁 Source scan complete`,
    `   Total page files: ${result.totalFiles}`,
    `   ✅ With schema: ${result.filesWithSchema}`,
    `   ❌ Missing schema: ${result.filesMissingSchema}`
  ];

  if (result.filesMissingSchema > 0) {
    lines.push("");
    lines.push("Routes without Schema components:");
    for (const route of result.routes) {
      if (!route.hasSchemaImport || !route.hasSchemaUsage) {
        const issue = !route.hasSchemaImport
          ? "no @schemasentry import"
          : "no <Schema> usage";
        lines.push(`   ❌ ${route.route} (${issue})`);
      }
    }
  }

  return lines.join("\n");
};
