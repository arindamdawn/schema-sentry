import { describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  resolveBuildOutputCandidates,
  resolveExistingBuildOutputDir
} from "./validate";

const makeTempDir = async (): Promise<string> =>
  fs.mkdtemp(path.join(os.tmpdir(), "schema-sentry-validate-"));

describe("resolveBuildOutputCandidates", () => {
  it("returns explicit root when provided", () => {
    const cwd = "/repo";
    const candidates = resolveBuildOutputCandidates(cwd, "./custom-build");
    expect(candidates).toEqual([path.resolve(cwd, "./custom-build")]);
  });

  it("returns default candidates in preferred order", () => {
    const cwd = "/repo";
    const candidates = resolveBuildOutputCandidates(cwd);
    expect(candidates).toEqual([
      path.resolve(cwd, ".next/server/app"),
      path.resolve(cwd, "out"),
      path.resolve(cwd, ".next/server/pages")
    ]);
  });
});

describe("resolveExistingBuildOutputDir", () => {
  it("returns the first existing candidate", async () => {
    const tempDir = await makeTempDir();
    const nextAppDir = path.join(tempDir, ".next/server/app");
    const outDir = path.join(tempDir, "out");

    await fs.mkdir(outDir, { recursive: true });

    const found = await resolveExistingBuildOutputDir([
      nextAppDir,
      outDir
    ]);

    expect(found).toBe(outDir);
  });

  it("returns undefined when no candidate exists", async () => {
    const tempDir = await makeTempDir();
    const found = await resolveExistingBuildOutputDir([
      path.join(tempDir, ".next/server/app"),
      path.join(tempDir, "out")
    ]);
    expect(found).toBeUndefined();
  });
});
