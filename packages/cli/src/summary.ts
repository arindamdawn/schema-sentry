import type { CoverageSummary } from "./coverage";

export type SummaryStats = {
  routes: number;
  errors: number;
  warnings: number;
  score: number;
  durationMs: number;
  coverage?: CoverageSummary;
};

export const formatDuration = (durationMs: number): string => {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return "0ms";
  }

  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  const seconds = durationMs / 1000;
  return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
};

export const formatSummaryLine = (label: string, stats: SummaryStats): string => {
  const parts = [
    `Routes: ${stats.routes}`,
    `Errors: ${stats.errors}`,
    `Warnings: ${stats.warnings}`,
    `Score: ${stats.score}`,
    `Duration: ${formatDuration(stats.durationMs)}`
  ];

  if (stats.coverage) {
    parts.push(
      `Coverage: missing_routes=${stats.coverage.missingRoutes} missing_types=${stats.coverage.missingTypes} unlisted_routes=${stats.coverage.unlistedRoutes}`
    );
  }

  return `${label} | ${parts.join(" | ")}`;
};
