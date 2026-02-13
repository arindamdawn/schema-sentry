import { describe, expect, it } from "vitest";
import type { Manifest } from "@schemasentry/core";
import type { SchemaDataFile } from "../report";
import { resolveAuditCoverageInputs } from "./audit";

describe("resolveAuditCoverageInputs", () => {
  it("disables coverage checks when data is missing", () => {
    const manifest: Manifest = {
      routes: {
        "/": ["Organization"]
      }
    };

    const resolved = resolveAuditCoverageInputs({
      data: undefined,
      manifest,
      scannedRoutes: ["/"]
    });

    expect(resolved.dataLoaded).toBe(false);
    expect(resolved.manifestForCoverage).toBeUndefined();
    expect(resolved.requiredRoutesForCoverage).toBeUndefined();
  });

  it("enables coverage checks when data is loaded", () => {
    const manifest: Manifest = {
      routes: {
        "/": ["Organization"]
      }
    };
    const data: SchemaDataFile = { routes: { "/": [] } };

    const resolved = resolveAuditCoverageInputs({
      data,
      manifest,
      scannedRoutes: ["/", "/blog"]
    });

    expect(resolved.dataLoaded).toBe(true);
    expect(resolved.manifestForCoverage).toEqual(manifest);
    expect(resolved.requiredRoutesForCoverage).toEqual(["/", "/blog"]);
  });

  it("does not set requiredRoutesForCoverage when none are scanned", () => {
    const data: SchemaDataFile = { routes: { "/": [] } };

    const resolved = resolveAuditCoverageInputs({
      data,
      manifest: undefined,
      scannedRoutes: []
    });

    expect(resolved.dataLoaded).toBe(true);
    expect(resolved.requiredRoutesForCoverage).toBeUndefined();
  });
});
