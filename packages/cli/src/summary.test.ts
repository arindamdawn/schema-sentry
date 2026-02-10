import { describe, expect, it } from "vitest";
import { formatDuration, formatSummaryLine } from "./summary";

describe("formatDuration", () => {
  it("formats milliseconds under a second", () => {
    expect(formatDuration(42)).toBe("42ms");
  });

  it("formats seconds with one decimal under 10s", () => {
    expect(formatDuration(1500)).toBe("1.5s");
  });

  it("formats seconds with no decimal for large values", () => {
    expect(formatDuration(12000)).toBe("12s");
  });
});

describe("formatSummaryLine", () => {
  it("includes coverage details when provided", () => {
    const line = formatSummaryLine("validate", {
      routes: 2,
      errors: 1,
      warnings: 2,
      score: 90,
      durationMs: 350,
      coverage: {
        missingRoutes: 1,
        missingTypes: 2,
        unlistedRoutes: 0
      }
    });

    expect(line).toContain("validate |");
    expect(line).toContain("Coverage: missing_routes=1");
  });
});
