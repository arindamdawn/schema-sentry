import {
  validateSchema,
  type Manifest,
  type SchemaNode,
  type SchemaTypeName,
  type ValidationIssue,
  type ValidationOptions
} from "@schemasentry/core";
import type { Report } from "./report";
import type { SchemaDataFile } from "./report";
import { buildCoverageResult } from "./coverage";

export type AuditOptions = ValidationOptions & {
  manifest?: Manifest;
};

export const buildAuditReport = (
  data: SchemaDataFile,
  options: AuditOptions = {}
): Report => {
  const dataRoutes = data.routes ?? {};
  const manifestRoutes = options.manifest?.routes ?? {};
  const coverageEnabled = Boolean(options.manifest);
  const coverage = coverageEnabled
    ? buildCoverageResult(options.manifest as Manifest, data)
    : null;
  const allRoutes = coverageEnabled
    ? coverage?.allRoutes ?? []
    : Object.keys(dataRoutes).sort();

  const routes = allRoutes.map((route) => {
    const expectedTypes = coverageEnabled ? manifestRoutes[route] ?? [] : [];
    const nodes = dataRoutes[route] ?? [];
    const foundTypes = nodes
      .map((node) => node["@type"])
      .filter((type): type is SchemaTypeName => typeof type === "string");

    const validation = validateSchema(nodes, options);
    const issues: ValidationIssue[] = [
      ...validation.issues,
      ...(coverage?.issuesByRoute[route] ?? [])
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
      ...(coverageEnabled ? { coverage: coverage?.summary } : {})
    },
    routes
  };
};
