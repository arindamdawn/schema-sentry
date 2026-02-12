import { readFileSync } from "node:fs";
import path from "path";
import { stableStringify, type Manifest } from "@schemasentry/core";
import type { SchemaDataFile } from "../report";
import { ConfigError, loadConfig, resolveRecommended } from "../config";

export type OutputFormat = "json" | "html";
export type CollectOutputFormat = "json";
export type AnnotationsMode = "none" | "github";

export function resolveCliVersion(): string {
  try {
    const raw = readFileSync(new URL("../../package.json", import.meta.url), "utf8");
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export function resolveOutputFormat(value?: string): OutputFormat {
  const format = (value ?? "json").trim().toLowerCase();
  if (format === "json" || format === "html") {
    return format;
  }
  printCliError(
    "output.invalid_format",
    `Unsupported report format '${value ?? ""}'`,
    "Use --format json or --format html."
  );
  process.exit(1);
  return "json";
}

export function resolveCollectOutputFormat(value?: string): CollectOutputFormat {
  const format = (value ?? "json").trim().toLowerCase();
  if (format === "json") {
    return format;
  }
  printCliError(
    "output.invalid_format",
    `Unsupported collect output format '${value ?? ""}'`,
    "Use --format json."
  );
  process.exit(1);
  return "json";
}

export function resolveAnnotationsMode(value?: string): AnnotationsMode {
  const mode = (value ?? "none").trim().toLowerCase();
  if (mode === "none" || mode === "github") {
    return mode;
  }
  printCliError(
    "annotations.invalid_provider",
    `Unsupported annotations provider '${value ?? ""}'`,
    "Use --annotations none or --annotations github."
  );
  process.exit(1);
  return "none";
}

export async function resolveRecommendedOption(configPath?: string): Promise<boolean> {
  const override = getRecommendedOverride(process.argv);

  try {
    const config = await loadConfig({ configPath });
    return resolveRecommended(override, config);
  } catch (error) {
    if (error instanceof ConfigError) {
      printCliError(error.code, error.message, error.suggestion);
      process.exit(1);
      return true;
    }
    throw error;
  }
}

function getRecommendedOverride(argv: string[]): boolean | undefined {
  if (argv.includes("--recommended")) {
    return true;
  }
  if (argv.includes("--no-recommended")) {
    return false;
  }
  return undefined;
}

export function printCliError(
  code: string,
  message: string,
  suggestion?: string
): void {
  console.error(
    stableStringify({
      ok: false,
      errors: [
        {
          code,
          message,
          ...(suggestion !== undefined ? { suggestion } : {})
        }
      ]
    })
  );
}

export function isManifest(value: unknown): value is Manifest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const manifest = value as Manifest;
  if (!manifest.routes || typeof manifest.routes !== "object") {
    return false;
  }

  for (const entry of Object.values(manifest.routes)) {
    if (!Array.isArray(entry) || entry.some((item) => typeof item !== "string")) {
      return false;
    }
  }

  return true;
}

export function isSchemaData(value: unknown): value is SchemaDataFile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as SchemaDataFile;
  if (!data.routes || typeof data.routes !== "object") {
    return false;
  }

  for (const entry of Object.values(data.routes)) {
    if (!Array.isArray(entry)) {
      return false;
    }
  }

  return true;
}
