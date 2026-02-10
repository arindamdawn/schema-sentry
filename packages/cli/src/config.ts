import { promises as fs } from "fs";
import path from "path";

export type SchemaSentryConfig = {
  recommended?: boolean;
};

export class ConfigError extends Error {
  code: string;
  suggestion?: string;

  constructor(code: string, message: string, suggestion?: string) {
    super(message);
    this.code = code;
    this.suggestion = suggestion;
  }
}

export const DEFAULT_CONFIG_PATH = "schema-sentry.config.json";

export const loadConfig = async (options: {
  configPath?: string;
  cwd?: string;
}): Promise<SchemaSentryConfig | null> => {
  const cwd = options.cwd ?? process.cwd();
  const explicit = Boolean(options.configPath);
  const resolvedPath = path.resolve(cwd, options.configPath ?? DEFAULT_CONFIG_PATH);
  const exists = await fileExists(resolvedPath);

  if (!exists) {
    if (explicit) {
      throw new ConfigError(
        "config.not_found",
        `Config not found at ${resolvedPath}`,
        "Provide a valid path or remove --config."
      );
    }
    return null;
  }

  let raw: string;
  try {
    raw = await fs.readFile(resolvedPath, "utf8");
  } catch (error) {
    throw new ConfigError(
      "config.read_failed",
      `Failed to read config at ${resolvedPath}`,
      "Check file permissions or re-create the config file."
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new ConfigError(
      "config.invalid_json",
      "Config is not valid JSON",
      "Check the JSON syntax or regenerate the file."
    );
  }

  if (!isConfig(parsed)) {
    throw new ConfigError(
      "config.invalid_shape",
      "Config must be a JSON object with optional boolean 'recommended'",
      "Example: { \"recommended\": false }"
    );
  }

  return parsed;
};

export const resolveRecommended = (
  cliOverride: boolean | undefined,
  config: SchemaSentryConfig | null
): boolean => cliOverride ?? config?.recommended ?? true;

const isConfig = (value: unknown): value is SchemaSentryConfig => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const config = value as SchemaSentryConfig;
  if (config.recommended !== undefined && typeof config.recommended !== "boolean") {
    return false;
  }

  return true;
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
