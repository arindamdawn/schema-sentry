import { promises as fs } from "node:fs";
import path from "node:path";
import { stableStringify, type JsonLdObject, type SchemaNode } from "@schemasentry/core";
import type { SchemaDataFile } from "./report";

export type CollectOptions = {
  rootDir: string;
};

export type CollectWarning = {
  file: string;
  message: string;
};

export type CollectStats = {
  htmlFiles: number;
  routes: number;
  blocks: number;
  invalidBlocks: number;
};

export type CollectResult = {
  data: SchemaDataFile;
  stats: CollectStats;
  warnings: CollectWarning[];
};

export type SchemaDataDrift = {
  hasChanges: boolean;
  addedRoutes: string[];
  removedRoutes: string[];
  changedRoutes: string[];
};

const IGNORED_DIRECTORIES = new Set([".git", "node_modules", ".pnpm-store"]);
const SCRIPT_TAG_REGEX = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const JSON_LD_TYPE_REGEX =
  /\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)/i;

export const collectSchemaData = async (
  options: CollectOptions
): Promise<CollectResult> => {
  const rootDir = path.resolve(options.rootDir);
  const htmlFiles = (await walkHtmlFiles(rootDir)).sort((a, b) => a.localeCompare(b));
  const routes: Record<string, SchemaNode[]> = {};
  const warnings: CollectWarning[] = [];
  let blockCount = 0;
  let invalidBlocks = 0;

  for (const filePath of htmlFiles) {
    const route = filePathToRoute(rootDir, filePath);
    if (!route) {
      continue;
    }

    const html = await fs.readFile(filePath, "utf8");
    const extracted = extractSchemaNodes(html, filePath);
    if (extracted.nodes.length > 0) {
      routes[route] = [...(routes[route] ?? []), ...extracted.nodes];
      blockCount += extracted.nodes.length;
    }
    invalidBlocks += extracted.invalidBlocks;
    warnings.push(...extracted.warnings);
  }

  return {
    data: {
      routes: sortRoutes(routes)
    },
    stats: {
      htmlFiles: htmlFiles.length,
      routes: Object.keys(routes).length,
      blocks: blockCount,
      invalidBlocks
    },
    warnings
  };
};

export const compareSchemaData = (
  existing: SchemaDataFile,
  collected: SchemaDataFile
): SchemaDataDrift => {
  const existingRoutes = existing.routes ?? {};
  const collectedRoutes = collected.routes ?? {};
  const existingKeys = Object.keys(existingRoutes);
  const collectedKeys = Object.keys(collectedRoutes);

  const addedRoutes = collectedKeys
    .filter((route) => !Object.prototype.hasOwnProperty.call(existingRoutes, route))
    .sort();
  const removedRoutes = existingKeys
    .filter((route) => !Object.prototype.hasOwnProperty.call(collectedRoutes, route))
    .sort();

  const changedRoutes = existingKeys
    .filter((route) => Object.prototype.hasOwnProperty.call(collectedRoutes, route))
    .filter(
      (route) =>
        stableStringify(existingRoutes[route] as unknown as JsonLdObject) !==
        stableStringify(collectedRoutes[route] as unknown as JsonLdObject)
    )
    .sort();

  return {
    hasChanges: addedRoutes.length > 0 || removedRoutes.length > 0 || changedRoutes.length > 0,
    addedRoutes,
    removedRoutes,
    changedRoutes
  };
};

export const formatSchemaDataDrift = (
  drift: SchemaDataDrift,
  maxRoutes = 5
): string => {
  if (!drift.hasChanges) {
    return "No schema data drift detected.";
  }

  const lines = [
    `Schema data drift detected: added_routes=${drift.addedRoutes.length} removed_routes=${drift.removedRoutes.length} changed_routes=${drift.changedRoutes.length}`
  ];

  if (drift.addedRoutes.length > 0) {
    lines.push(formatRoutePreview("Added routes", drift.addedRoutes, maxRoutes));
  }
  if (drift.removedRoutes.length > 0) {
    lines.push(formatRoutePreview("Removed routes", drift.removedRoutes, maxRoutes));
  }
  if (drift.changedRoutes.length > 0) {
    lines.push(formatRoutePreview("Changed routes", drift.changedRoutes, maxRoutes));
  }

  return lines.join("\n");
};

const formatRoutePreview = (
  label: string,
  routes: string[],
  maxRoutes: number
): string => {
  const preview = routes.slice(0, maxRoutes);
  const suffix =
    routes.length > maxRoutes ? ` (+${routes.length - maxRoutes} more)` : "";
  return `${label}: ${preview.join(", ")}${suffix}`;
};

const sortRoutes = (
  routes: Record<string, SchemaNode[]>
): Record<string, SchemaNode[]> =>
  Object.fromEntries(
    Object.entries(routes).sort(([a], [b]) => a.localeCompare(b))
  ) as Record<string, SchemaNode[]>;

const walkHtmlFiles = async (rootDir: string): Promise<string[]> => {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const resolved = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkHtmlFiles(resolved)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(resolved);
    }
  }

  return files;
};

const filePathToRoute = (rootDir: string, filePath: string): string | null => {
  const relative = path.relative(rootDir, filePath).replace(/\\/g, "/");
  if (relative === "index.html") {
    return "/";
  }

  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"/index.html".length)}`;
  }

  if (relative.endsWith(".html")) {
    return `/${relative.slice(0, -".html".length)}`;
  }

  return null;
};

const extractSchemaNodes = (
  html: string,
  filePath: string
): {
  nodes: SchemaNode[];
  invalidBlocks: number;
  warnings: CollectWarning[];
} => {
  const nodes: SchemaNode[] = [];
  const warnings: CollectWarning[] = [];
  let invalidBlocks = 0;
  let scriptIndex = 0;

  for (const match of html.matchAll(SCRIPT_TAG_REGEX)) {
    scriptIndex += 1;
    const attributes = match[1] ?? "";
    if (!JSON_LD_TYPE_REGEX.test(attributes)) {
      continue;
    }

    const scriptBody = (match[2] ?? "").trim();
    if (!scriptBody) {
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(scriptBody);
    } catch {
      invalidBlocks += 1;
      warnings.push({
        file: filePath,
        message: `Invalid JSON-LD block at script #${scriptIndex}`
      });
      continue;
    }

    const normalized = normalizeParsedBlock(parsed);
    nodes.push(...normalized);
  }

  return { nodes, invalidBlocks, warnings };
};

const normalizeParsedBlock = (value: unknown): SchemaNode[] => {
  if (Array.isArray(value)) {
    return value.filter(isJsonObject) as SchemaNode[];
  }

  if (!isJsonObject(value)) {
    return [];
  }

  const graph = value["@graph"];
  if (Array.isArray(graph)) {
    return graph.filter(isJsonObject) as SchemaNode[];
  }

  return [value as SchemaNode];
};

const isJsonObject = (value: unknown): value is JsonLdObject =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
