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
  const allRoutes = coverageEnabled
    ? new Set<string>([
        ...Object.keys(manifestRoutes),
        ...Object.keys(dataRoutes)
      ])
    : new Set<string>(Object.keys(dataRoutes));

  const routes = Array.from(allRoutes).sort().map((route) => {
    const expectedTypes = coverageEnabled ? manifestRoutes[route] ?? [] : [];
    const nodes = dataRoutes[route] ?? [];
    const foundTypes = nodes
      .map((node) => node["@type"])
      .filter((type): type is SchemaTypeName => typeof type === "string");

    const validation = validateSchema(nodes, options);
    const issues: ValidationIssue[] = [...validation.issues];

    if (coverageEnabled) {
      if (expectedTypes.length > 0) {
        if (nodes.length === 0) {
          issues.push({
            path: `routes["${route}"]`,
            message: "No schema blocks found for route",
            severity: "error",
            ruleId: "coverage.missing_route"
          });
        }

        for (const expectedType of expectedTypes) {
          if (!foundTypes.includes(expectedType)) {
            issues.push({
              path: `routes["${route}"].types`,
              message: `Missing expected schema type '${expectedType}'`,
              severity: "error",
              ruleId: "coverage.missing_type"
            });
          }
        }
      }

      if (!manifestRoutes[route] && nodes.length > 0) {
        issues.push({
          path: `routes["${route}"]`,
          message: "Route has schema but is missing from manifest",
          severity: "warn",
          ruleId: "coverage.unlisted_route"
        });
      }
    }

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
      score: summaryScore
    },
    routes
  };
};
