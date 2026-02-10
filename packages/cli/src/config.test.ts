import { describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import {
  DEFAULT_CONFIG_PATH,
  loadConfig,
  resolveRecommended
} from "./config";

const makeTempDir = async (): Promise<string> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "schema-sentry-config-"));
  return dir;
};

describe("loadConfig", () => {
  it("returns null when default config is missing", async () => {
    const cwd = await makeTempDir();
    const config = await loadConfig({ cwd });
    expect(config).toBeNull();
  });

  it("loads a valid config file", async () => {
    const cwd = await makeTempDir();
    const filePath = path.join(cwd, DEFAULT_CONFIG_PATH);
    await fs.writeFile(filePath, JSON.stringify({ recommended: false }), "utf8");

    const config = await loadConfig({ cwd });
    expect(config).toEqual({ recommended: false });
  });

  it("throws when explicit config path is missing", async () => {
    const cwd = await makeTempDir();
    const filePath = path.join(cwd, "missing.json");

    await expect(loadConfig({ cwd, configPath: filePath })).rejects.toMatchObject({
      code: "config.not_found"
    });
  });

  it("throws for invalid JSON", async () => {
    const cwd = await makeTempDir();
    const filePath = path.join(cwd, DEFAULT_CONFIG_PATH);
    await fs.writeFile(filePath, "{", "utf8");

    await expect(loadConfig({ cwd })).rejects.toMatchObject({
      code: "config.invalid_json"
    });
  });
});

describe("resolveRecommended", () => {
  it("prefers CLI override when provided", () => {
    const config = { recommended: false };
    expect(resolveRecommended(true, config)).toBe(true);
  });

  it("falls back to config value when no override", () => {
    const config = { recommended: false };
    expect(resolveRecommended(undefined, config)).toBe(false);
  });

  it("defaults to true when nothing is set", () => {
    expect(resolveRecommended(undefined, null)).toBe(true);
  });
});
