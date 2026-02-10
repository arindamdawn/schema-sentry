import {
  stableStringify,
  validateSchema,
  type Manifest,
  type SchemaNode,
  type SchemaTypeName,
  type ValidationOptions,
  type ValidationIssue
} from "@schemasentry/core";
import { buildCoverageResult, type CoverageSummary } from "./coverage";

export type SchemaDataFile = {
  routes: Record<string, SchemaNode[]>;
};

export type RouteReport = {
  route: string;
  ok: boolean;
  score: number;
  issues: ValidationIssue[];
  expectedTypes: SchemaTypeName[];
  foundTypes: SchemaTypeName[];
};

export type ReportSummary = {
  routes: number;
  errors: number;
  warnings: number;
  score: number;
  coverage?: CoverageSummary;
};

export type Report = {
  ok: boolean;
  summary: ReportSummary;
  routes: RouteReport[];
};

export type ReportOptions = ValidationOptions;

export const buildReport = (
  manifest: Manifest,
  data: SchemaDataFile,
  options: ReportOptions = {}
): Report => {
  const manifestRoutes = manifest.routes ?? {};
  const dataRoutes = data.routes ?? {};
  const coverage = buildCoverageResult(manifest, data);

  const routes = coverage.allRoutes.map((route) => {
    const expectedTypes = manifestRoutes[route] ?? [];
    const nodes = dataRoutes[route] ?? [];
    const foundTypes = nodes
      .map((node) => node["@type"])
      .filter((type): type is SchemaTypeName => typeof type === "string");

    const validation = validateSchema(nodes, options);
    const issues: ValidationIssue[] = [
      ...validation.issues,
      ...(coverage.issuesByRoute[route] ?? [])
    ];

    const errorCount = issues.filter((issue) => issue.severity === "error")
      .length;
    const warnCount = issues.filter((issue) => issue.severity === "warn").length;
    const score = Math.max(0, validation.score - errorCount * 5 - warnCount * 2);

    return {
      route,
      ok: errorCount === 0,
      score,
      issues,
      expectedTypes,
      foundTypes
    };
  });

  const summaryErrors = routes.reduce(
    (count, route) => count + route.issues.filter((i) => i.severity === "error").length,
    0
  );
  const summaryWarnings = routes.reduce(
    (count, route) => count + route.issues.filter((i) => i.severity === "warn").length,
    0
  );
  const summaryScore =
    routes.length === 0
      ? 0
      : Math.round(
          routes.reduce((total, route) => total + route.score, 0) / routes.length
        );

  return {
    ok: summaryErrors === 0,
    summary: {
      routes: routes.length,
      errors: summaryErrors,
      warnings: summaryWarnings,
      score: summaryScore,
      coverage: coverage.summary
    },
    routes
  };
};

export const formatReport = (report: Report): string =>
  stableStringify(report);
